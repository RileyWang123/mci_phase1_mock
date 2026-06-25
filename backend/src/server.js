import cors from "cors";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import multer from "multer";
import pg from "pg";
import { parseAssemblyVideoFile } from "./ai-parser.js";

const { Pool } = pg;

const PORT = Number(process.env.PORT || 4000);
const UPLOAD_DIR = process.env.UPLOAD_DIR || "/data/uploads";
const DATABASE_URL = process.env.DATABASE_URL || "postgres://mci:mci@localhost:5432/mci_phase1";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || "https://google-gemini.prod.ai-gateway.quantumblack.com/00e1965c-2aac-49de-a6cf-9ace08781d0b";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";
const GEMINI_MAX_INLINE_VIDEO_BYTES = Number(process.env.GEMINI_MAX_INLINE_VIDEO_BYTES || 20 * 1024 * 1024);

const INPUT_SOURCES = [
  "Historical MI",
  "Assembly Video",
  "MTM Database",
];

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const pool = new Pool({ connectionString: DATABASE_URL });

function decodeOriginalName(originalName = "") {
  const rawName = path.basename(originalName);
  const decoded = Buffer.from(rawName, "latin1").toString("utf8");
  return /[\u3400-\u9fff]/.test(decoded) ? decoded : rawName;
}

function sanitizeFileName(fileName) {
  return path
    .basename(fileName)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim() || "uploaded-file";
}

function buildStoredName(originalName, id = crypto.randomUUID()) {
  return `${id}__${sanitizeFileName(originalName)}`;
}

async function initDatabase() {
  await pool.query(`
    create table if not exists input_files (
      id uuid primary key,
      source text not null,
      original_name text not null,
      stored_name text not null,
      mime_type text,
      size_bytes bigint not null,
      storage_path text not null,
      upload_status text not null default 'uploaded',
      sort_order int,
      created_at timestamptz not null default now()
    );
  `);
  await pool.query("alter table input_files add column if not exists sort_order int;");
  await pool.query("alter table input_files add column if not exists upload_batch_id uuid;");
  // Backfill: group any pre-existing Assembly Video uploads (no batch id) into one batch
  // so they show up in the queue and can be parsed without re-uploading.
  const orphaned = await pool.query(
    "select count(*)::int as n from input_files where source = 'Assembly Video' and upload_batch_id is null",
  );
  if (orphaned.rows[0].n > 0) {
    const legacyBatchId = crypto.randomUUID();
    await pool.query(
      "update input_files set upload_batch_id = $1 where source = 'Assembly Video' and upload_batch_id is null",
      [legacyBatchId],
    );
  }
  await pool.query("create index if not exists input_files_source_created_idx on input_files (source, created_at desc);");
  await pool.query(`
    create table if not exists parse_jobs (
      id uuid primary key,
      source_file_id uuid not null references input_files(id) on delete cascade,
      status text not null default 'pending',
      error text,
      created_at timestamptz not null default now(),
      started_at timestamptz,
      completed_at timestamptz
    );
  `);
  await pool.query("create index if not exists parse_jobs_created_idx on parse_jobs (created_at desc);");
  await pool.query(`
    create table if not exists parse_results (
      job_id uuid primary key references parse_jobs(id) on delete cascade,
      source_file_id uuid not null references input_files(id) on delete cascade,
      result_json jsonb not null,
      created_at timestamptz not null default now()
    );
  `);
  await pool.query(`
    create table if not exists batch_parse_jobs (
      id uuid primary key,
      status text not null default 'running',
      total_files int not null,
      completed_files int not null default 0,
      created_at timestamptz not null default now(),
      completed_at timestamptz
    );
  `);
  await pool.query(`
    create table if not exists batch_parse_job_files (
      batch_job_id uuid not null references batch_parse_jobs(id) on delete cascade,
      file_id uuid not null references input_files(id) on delete cascade,
      sort_order int not null,
      status text not null default 'pending',
      parse_job_id uuid,
      error text,
      result_json jsonb,
      primary key (batch_job_id, file_id)
    );
  `);
}

async function normalizeExistingUploads() {
  const result = await pool.query("select id, original_name, stored_name, storage_path from input_files;");

  for (const row of result.rows) {
    const decodedOriginalName = decodeOriginalName(row.original_name);
    const desiredStoredName = buildStoredName(decodedOriginalName, row.id);
    const desiredPath = path.join(UPLOAD_DIR, desiredStoredName);

    if (row.storage_path !== desiredPath && fs.existsSync(row.storage_path)) {
      fs.renameSync(row.storage_path, desiredPath);
    }

    if (row.original_name !== decodedOriginalName || row.stored_name !== desiredStoredName || row.storage_path !== desiredPath) {
      await pool.query(
        "update input_files set original_name = $1, stored_name = $2, storage_path = $3 where id = $4",
        [decodedOriginalName, desiredStoredName, desiredPath, row.id],
      );
    }
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, UPLOAD_DIR),
  filename: (_req, file, callback) => {
    const decodedOriginalName = decodeOriginalName(file.originalname);
    file.decodedOriginalName = decodedOriginalName;
    callback(null, buildStoredName(decodedOriginalName));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024,
  },
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

app.get("/api/input-files", async (_req, res, next) => {
  try {
    const result = await pool.query(`
      select id, source, original_name, stored_name, mime_type, size_bytes, upload_status, created_at
      from input_files
      order by created_at desc;
    `);
    res.json({ files: result.rows });
  } catch (error) {
    next(error);
  }
});

app.get("/api/input-files/status", async (_req, res, next) => {
  try {
    const result = await pool.query(`
      select distinct on (source)
        source, id, original_name, mime_type, size_bytes, upload_status, created_at
      from input_files
      order by source, created_at desc;
    `);
    const latestBySource = new Map(result.rows.map((row) => [row.source, row]));
    const sources = INPUT_SOURCES.map((source) => {
      const latest = latestBySource.get(source);
      return {
        source,
        status: latest ? "uploaded" : "missing",
        latestFile: latest || null,
      };
    });

    res.json({
      requiredSources: INPUT_SOURCES,
      uploadedCount: sources.filter((source) => source.status === "uploaded").length,
      sources,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/input-files/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "file is required" });
      return;
    }

    const id = crypto.randomUUID();
    const source = req.body.source || "Unknown";
    const originalName = req.file.decodedOriginalName || decodeOriginalName(req.file.originalname);
    const sortOrder = req.body.sort_order != null ? Number(req.body.sort_order) : null;
    const uploadBatchId = req.body.upload_batch_id || null;
    const values = [
      id,
      source,
      originalName,
      req.file.filename,
      req.file.mimetype,
      req.file.size,
      req.file.path,
      "uploaded",
      sortOrder,
      uploadBatchId,
    ];

    const result = await pool.query(
      `
        insert into input_files (
          id, source, original_name, stored_name, mime_type, size_bytes, storage_path, upload_status, sort_order, upload_batch_id
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        returning id, source, original_name, stored_name, mime_type, size_bytes, upload_status, sort_order, upload_batch_id, created_at;
      `,
      values,
    );

    res.status(201).json({ file: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

function serializeParseJob(row, result = null) {
  if (!row) return null;
  return {
    id: row.id,
    sourceFileId: row.source_file_id,
    status: row.status,
    error: row.error,
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    result,
  };
}

async function getLatestAssemblyVideo() {
  const result = await pool.query(
    `
      select id, source, original_name, stored_name, mime_type, size_bytes, storage_path, upload_status, created_at
      from input_files
      where source = $1
      order by created_at desc
      limit 1;
    `,
    ["Assembly Video"],
  );
  return result.rows[0] || null;
}

app.post("/api/input-files/parse", async (_req, res, next) => {
  const client = await pool.connect();
  const jobId = crypto.randomUUID();
  try {
    const sourceFile = await getLatestAssemblyVideo();
    if (!sourceFile) {
      res.status(404).json({ error: "Assembly Video upload is required before parsing" });
      return;
    }

    await client.query("begin");
    await client.query(
      `
        insert into parse_jobs (id, source_file_id, status, started_at)
        values ($1, $2, $3, now())
        returning *;
      `,
      [jobId, sourceFile.id, "running"],
    );
    await client.query("commit");

    try {
      const parsedResult = await parseAssemblyVideoFile({
        file: sourceFile,
        apiKey: GEMINI_API_KEY,
        baseUrl: GEMINI_BASE_URL,
        model: GEMINI_MODEL,
        maxInlineBytes: GEMINI_MAX_INLINE_VIDEO_BYTES,
      });
      const completedJobResult = await pool.query(
        `
          update parse_jobs
          set status = $1, completed_at = now(), error = null
          where id = $2
          returning *;
        `,
        ["completed", jobId],
      );
      await pool.query(
        `
          insert into parse_results (job_id, source_file_id, result_json)
          values ($1, $2, $3)
          on conflict (job_id) do update set result_json = excluded.result_json, created_at = now();
        `,
        [jobId, sourceFile.id, JSON.stringify(parsedResult)],
      );
      res.status(201).json({
        job: serializeParseJob(completedJobResult.rows[0], parsedResult),
        result: parsedResult,
      });
    } catch (error) {
      await pool.query(
        `
          update parse_jobs
          set status = $1, completed_at = now(), error = $2
          where id = $3;
        `,
        ["failed", error.message, jobId],
      );
      throw error;
    }
  } catch (error) {
    try {
      await client.query("rollback");
    } catch (_rollbackError) {
      // Ignore rollback errors after a committed job insert.
    }
    next(error);
  } finally {
    client.release();
  }
});

app.get("/api/input-files/parse/latest", async (_req, res, next) => {
  try {
    const result = await pool.query(`
      select
        parse_jobs.*,
        parse_results.result_json
      from parse_jobs
      left join parse_results on parse_results.job_id = parse_jobs.id
      order by parse_jobs.created_at desc
      limit 1;
    `);
    const row = result.rows[0];
    if (!row) {
      res.json({ job: null, result: null });
      return;
    }
    res.json({
      job: serializeParseJob(row, row.result_json || null),
      result: row.result_json || null,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/input-files/parse/:jobId", async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        select
          parse_jobs.*,
          parse_results.result_json
        from parse_jobs
        left join parse_results on parse_results.job_id = parse_jobs.id
        where parse_jobs.id = $1
        limit 1;
      `,
      [req.params.jobId],
    );
    const row = result.rows[0];
    if (!row) {
      res.status(404).json({ error: "parse job not found" });
      return;
    }
    res.json({
      job: serializeParseJob(row, row.result_json || null),
      result: row.result_json || null,
    });
  } catch (error) {
    next(error);
  }
});

async function runBatchParse(batchJobId, orderedFileIds) {
  for (let i = 0; i < orderedFileIds.length; i++) {
    const fileId = orderedFileIds[i];
    const jobId = crypto.randomUUID();
    try {
      await pool.query(
        "update batch_parse_job_files set status = $1 where batch_job_id = $2 and file_id = $3",
        ["running", batchJobId, fileId],
      );
      const fileResult = await pool.query(
        "select * from input_files where id = $1",
        [fileId],
      );
      const sourceFile = fileResult.rows[0];
      if (!sourceFile) throw new Error(`File ${fileId} not found`);

      await pool.query(
        "insert into parse_jobs (id, source_file_id, status, started_at) values ($1, $2, $3, now())",
        [jobId, fileId, "running"],
      );

      const parsedResult = await parseAssemblyVideoFile({
        file: sourceFile,
        apiKey: GEMINI_API_KEY,
        baseUrl: GEMINI_BASE_URL,
        model: GEMINI_MODEL,
        maxInlineBytes: GEMINI_MAX_INLINE_VIDEO_BYTES,
      });

      await pool.query(
        "update parse_jobs set status = $1, completed_at = now() where id = $2",
        ["completed", jobId],
      );
      await pool.query(
        "insert into parse_results (job_id, source_file_id, result_json) values ($1, $2, $3)",
        [jobId, fileId, JSON.stringify(parsedResult)],
      );
      await pool.query(
        "update batch_parse_job_files set status = $1, parse_job_id = $2, result_json = $3 where batch_job_id = $4 and file_id = $5",
        ["completed", jobId, JSON.stringify(parsedResult), batchJobId, fileId],
      );
    } catch (error) {
      await pool.query(
        "update parse_jobs set status = $1, completed_at = now(), error = $2 where id = $3",
        ["failed", error.message, jobId],
      ).catch(() => {});
      await pool.query(
        "update batch_parse_job_files set status = $1, error = $2 where batch_job_id = $3 and file_id = $4",
        ["failed", error.message, batchJobId, fileId],
      );
    }
    await pool.query(
      "update batch_parse_jobs set completed_files = completed_files + 1 where id = $1",
      [batchJobId],
    );
  }
  await pool.query(
    "update batch_parse_jobs set status = $1, completed_at = now() where id = $2",
    ["completed", batchJobId],
  );
}

app.get("/api/input-files/latest-batch", async (_req, res, next) => {
  try {
    // Find the most recent upload batch of Assembly Videos.
    const latest = await pool.query(
      `select upload_batch_id, max(created_at) as uploaded_at
       from input_files
       where source = 'Assembly Video' and upload_batch_id is not null
       group by upload_batch_id
       order by uploaded_at desc
       limit 1`,
    );
    if (!latest.rows[0]) {
      res.json({ batchId: null, uploadedAt: null, files: [] });
      return;
    }
    const batchId = latest.rows[0].upload_batch_id;
    const files = await pool.query(
      `select id, original_name, mime_type, size_bytes, sort_order, created_at
       from input_files
       where source = 'Assembly Video' and upload_batch_id = $1
       order by sort_order asc nulls last, created_at asc`,
      [batchId],
    );
    res.json({
      batchId,
      uploadedAt: latest.rows[0].uploaded_at,
      files: files.rows,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/input-files/parse-batch", async (req, res, next) => {
  try {
    let fileIds = req.body?.fileIds;
    const uploadBatchId = req.body?.uploadBatchId;
    // Priority: explicit fileIds > a named upload batch > all Assembly Videos in the DB.
    // Any of these lets the user re-parse without re-uploading.
    if ((!Array.isArray(fileIds) || fileIds.length === 0) && uploadBatchId) {
      const byBatch = await pool.query(
        `select id from input_files
         where source = $1 and upload_batch_id = $2
         order by sort_order asc nulls last, created_at asc`,
        ["Assembly Video", uploadBatchId],
      );
      fileIds = byBatch.rows.map((r) => r.id);
    }
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      const existing = await pool.query(
        `select id from input_files
         where source = $1
         order by sort_order asc nulls last, created_at asc`,
        ["Assembly Video"],
      );
      fileIds = existing.rows.map((r) => r.id);
    }
    if (fileIds.length === 0) {
      res.status(404).json({ error: "No Assembly Video files found to parse" });
      return;
    }
    const batchJobId = crypto.randomUUID();
    await pool.query(
      "insert into batch_parse_jobs (id, status, total_files) values ($1, $2, $3)",
      [batchJobId, "running", fileIds.length],
    );
    const insertRows = fileIds.map((fileId, i) => `('${batchJobId}', '${fileId}', ${i})`).join(", ");
    await pool.query(
      `insert into batch_parse_job_files (batch_job_id, file_id, sort_order) values ${insertRows}`,
    );
    runBatchParse(batchJobId, fileIds).catch((err) => {
      console.error("Batch parse error:", err);
      pool.query("update batch_parse_jobs set status = $1 where id = $2", ["failed", batchJobId]).catch(() => {});
    });
    res.status(202).json({ batchJobId });
  } catch (error) {
    next(error);
  }
});

app.get("/api/input-files/parse-batch/:batchJobId/status", async (req, res, next) => {
  try {
    const batchResult = await pool.query(
      "select * from batch_parse_jobs where id = $1",
      [req.params.batchJobId],
    );
    if (!batchResult.rows[0]) {
      res.status(404).json({ error: "batch job not found" });
      return;
    }
    const batch = batchResult.rows[0];
    const filesResult = await pool.query(
      `select bjf.file_id, bjf.sort_order, bjf.status, bjf.error, bjf.result_json,
              f.original_name, f.mime_type, f.size_bytes
       from batch_parse_job_files bjf
       join input_files f on f.id = bjf.file_id
       where bjf.batch_job_id = $1
       order by bjf.sort_order`,
      [req.params.batchJobId],
    );
    res.json({
      batchJobId: batch.id,
      status: batch.status,
      totalCount: batch.total_files,
      completedCount: batch.completed_files,
      files: filesResult.rows.map((r) => ({
        fileId: r.file_id,
        sortOrder: r.sort_order,
        originalName: r.original_name,
        status: r.status,
        error: r.error || null,
        result: r.result_json || null,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error.message || "Internal Server Error" });
});

await initDatabase();
await normalizeExistingUploads();

app.listen(PORT, () => {
  console.log(`MCI backend listening on ${PORT}`);
});
