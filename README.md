# MCI Phase 1 Mock Dashboard

This README records the current dashboard feature set, frontend module structure, and local backend setup so a new chat can quickly understand the project state.

## How To Open

- Open `index.html` directly in the browser.
- The UI can still run as a static mock.
- A local Docker backend has been added for input file upload/status persistence.
- Most non-upload edits are still stored in JavaScript memory during the browser session only. Refreshing the page resets those mock edits.

## Local Backend

The first backend slice supports Page 01 input file upload and upload status.

Start the backend and database:

```bash
docker compose up --build
```

To enable real video parsing through the Gemini gateway, configure the root `.env` file once:

```env
GEMINI_API_KEY=real_key_here
GEMINI_BASE_URL=https://google-gemini.prod.ai-gateway.quantumblack.com/00e1965c-2aac-49de-a6cf-9ace08781d0b
GEMINI_MODEL=gemini-2.0-flash
```

Then start Docker normally:

```bash
docker compose up --build
```

The real `.env` file is ignored by git. Use `.env.example` as the template if the local file is missing.

Services:

- API: `http://localhost:4000`
- Postgres: `localhost:55433`
- Uploaded files are stored in the Docker volume `mci_uploads`.
- Database data is stored in the Docker volume `mci_db_data`.

Current API:

- `GET /health`
- `GET /api/input-files`
- `GET /api/input-files/status`
- `POST /api/input-files/upload`
- `POST /api/input-files/parse`
- `GET /api/input-files/parse/latest`
- `GET /api/input-files/parse/:jobId`

Upload request shape:

```bash
curl -F "source=Assembly Video" -F "file=@sample.mp4" http://localhost:4000/api/input-files/upload
```

The frontend calls this backend from Page 01 when running locally. If the backend is offline, the static UI still loads and shows the mock state.

`Parse Uploaded Inputs` on Page 01 calls the parse API. The backend stores a parse job, calls the Gemini gateway, saves structured SOP JSON, and returns the result to the frontend. The frontend then maps the parsed workflows into Page 02 through Page 07 state.

## Current Flow

The active navigation flow has 7 pages:

1. `Input Upload`
2. `Process Steps` / `SOP Structure Review`
3. `Process Time`
4. `CT Calculation`
5. `Station`
6. `Layout`
7. `MI Output`

Historical pages such as `Human Input Gate` still exist in parts of `app.js`, but they are not active in the current `stageFlow`.

## Frontend Architecture

The frontend has completed the first low-risk refactor from one large `app.js` into page modules and shared components. It still uses plain JavaScript and global factory modules so the demo can run from `index.html` without a bundler.

Current module layout:

- `app.js`: mock data, shared state, stage orchestration, global helper wrappers, and compatibility glue.
- `src/pages/input-page.js`: Page 01 input upload canvas, upload binding, and upload panel.
- `src/pages/process-step-page.js`: Page 02 SOP structure review canvas, panel, and add-step form state.
- `src/pages/process-time-page.js`: Page 03 process time canvas and panel.
- `src/pages/ct-calculation-page.js`: Page 04 CT calculator canvas, panel, rows, and calculator bindings.
- `src/pages/station-page.js`: Page 05 station canvas, KPI view, station rows, station edit actions, and station panel.
- `src/pages/layout-page.js`: Page 06 U-shaped layout canvas, layout dimension rows, selection binding, and layout panel.
- `src/pages/mi-output-page.js`: Page 07 MI preview, CTQ / quality risk / image bindings, CSV export, and export panel.
- `src/components/ai-panel.js`: shared right-side AI / evidence panel renderer.
- `src/components/workflow-table.js`: shared SOP workflow table used by Page 02 and Page 03.
- `src/api/input-files-api.js`: Page 01 input file API client.
- `src/state/input-upload-state.js`: Page 01 upload status state mapper.

The current goal of this refactor is maintainability without changing the demo runtime model. A future phase could introduce a build tool or framework, but that has intentionally not been done yet.

## Page 01: Input Upload

**Objective:** Check whether raw source inputs are ready before AI process step generation.

**Input:**

- Historical MI
- Assembly Video
- MTM database or historical timing reference
- Mapping table
- Human rule list
- Volume / shift assumptions

**Output:**

- Input readiness status
- Source completeness checks
- Next AI output expectations

**Layout / Features:**

- Left process navigation and input source stack.
- Main intake board explaining that this page is only for input readiness.
- Right side panel explains which files are needed before SOP generation.

## Page 02: SOP Structure Review

**Objective:** Review and edit the AI-generated SOP workflow structure and detailed step descriptions before timing review.

**Input:**

- Assembly Video content
- AI-generated SOP workflows
- Part names / part areas
- Manual review corrections

**Output:**

- Confirmed SOP workflow list
- Editable detailed steps under each workflow
- Part assignment
- A/M automation tagging
- Confirmed structure for the Process Time page

**Layout / Features:**

- Full-width editable table under `Generated Step List`.
- Main table order is:
  - `SOP Workflow`
  - `Step`
  - `Automation`
  - `Step Description`
  - `Part`
  - `Actions`
- Large SOP workflow cell on the left groups detailed step rows.
- SOP workflow name and part are inline editable.
- Detailed `Step Description` uses a textarea for easier editing.
- `SOP Workflow` can be reordered from the left workflow cell using its drag handle.
- Dragging is separated from editing through a small drag handle in the `Step` column.
- Detailed steps can be reordered by drag-and-drop.
- Moved rows are highlighted.
- Automation column uses `A/M` selection.
- `A` steps are later grouped into one automation station.
- `Confirm` and `Delete` actions are available for detailed steps.
- `SOP Extraction Map` card was removed from the active visual focus.
- Time fields are intentionally not shown on this page.

## Page 03: Process Time

**Objective:** Review and edit theoretical PT and actual PT for each detailed step before CT calculation.

**Input:**

- Confirmed SOP workflows from Page 02
- Detailed step descriptions
- AI / MTM theoretical PT draft
- Manual actual PT adjustment

**Output:**

- Time-reviewed generated step list
- Theoretical PT per detailed step
- Actual PT per detailed step
- Total process-time basis for CT calculation

**Layout / Features:**

- Full-width `Generated Step List` table.
- Main table order is:
  - `SOP Workflow`
  - `Step`
  - `Automation`
  - `Step Description`
  - `Part`
  - `Theoretical PT (secs)`
  - `Actual PT (secs)`
  - `Actions`
- This page owns time editing.
- Page 02 owns structure review only.

## Page 04: CT Calculation

**Objective:** Provide a simple two-way calculator between target CT and total headcount.

**Input:**

- Total process time from reviewed detailed steps
- User-entered target CT
- User-entered total HC
- User-entered daily volume, shift / hours, and OEE

**Output:**

- Input CT -> calculated total HC
- Input HC -> calculated CT
- Input daily volume + shift / hours + OEE -> calculated target CT

**Calculation Logic:**

- `Actual PT = Theoretical PT + Human Adjustment Time`
- Total process time is summed from step-level actual PT.
- If user inputs target CT, total HC is calculated as:
  - `ceil(total process time / target CT)`
- If user inputs total HC, CT is calculated as:
  - `total process time / integer HC`
- If user inputs daily volume, shift / hours, and OEE, target CT is calculated as:
  - `shift count × hours per shift × 3600 × OEE / daily volume`
- HC is treated as an integer.

**Layout / Features:**

- CT page is split into two method sections.
- `Method 1` uses process time to calculate CT or HC.
- `Method 2` captures `Daily Volume`, `Shift / Hours`, and `OEE` to generate target CT.
- Removed old `CT Input Step List`.
- Removed allowance references from OEE / CT calculation text.
- Repeated titles were reduced.
- Yellow/input side is user-editable; green/result side is generated.

## Page 05: Station

**Objective:** Assign reviewed workflows and detailed steps into stations and show line balance efficiency.

**Input:**

- Reviewed SOP workflows and detailed steps
- Actual PT values
- Automation `A/M` tagging
- Target CT / HC result from CT page
- Manual station edits

**Output:**

- Editable station draft
- Automation station grouping
- Station-level HC
- Station-level quality risk
- Line Balance Efficiency summary

**Layout / Features:**

- Top summary includes `Line Balance Efficiency`.
- Station page can show multiple line balance scenarios on the same page.
- Current mock has two selectable plan cards:
  - `Plan A: Current Draft`
  - `Plan B: Balanced Alternative`
- Clicking a plan card switches the station table and expanded station details below.
- Right panel includes a `KPI Performance` button.
- `KPI Performance` switches the main Station view from station assignment table to per-station performance review bar charts.
- Main station-level KPI chart includes:
  - `HC`
  - `CT`
- `CT` KPI uses a bar with target marker comparison.
- Right panel shows line-level KPI for the selected plan:
  - `Line LBE`
  - `Total HC`
  - `Bottleneck CT`
  - `Line UPPH`
  - `Over Target Stations`
- Removed earlier KPI cards such as locked target CT, draft source, station count, and review / override.
- Station table header is:
  - `Station`
  - `Automation`
  - `Assigned steps`
  - `HC`
  - `Status / Trace`
- Global `+ Add Station` control.
- Global `Delete Station` control with station dropdown selection.
- `Status / Trace` is simplified to `Edit` and `Confirm`.
- Each station row can be expanded.
- Expanding a station directly shows detailed steps; there is no extra SOP Workflow drill-down layer.
- Detailed step rows include:
  - Step
  - Automation
  - Step Description
  - Part
  - Theoretical PT (secs)
  - Actual PT (secs)
- Automation steps are grouped into an `AUTO` station.
- Automation status is also shown at station row level.

## Page 06: Layout

**Objective:** Draw a simple U-shaped station layout based on confirmed station sequence and station dimensions.

**Input:**

- Station draft from the Station page
- Station width
- Station depth
- Operator side
- Automation grouping
- Quality risk carried from station review

**Output:**

- U-shaped layout sketch
- Editable station dimension table
- Station sequence visual

**Layout / Features:**

- Page title is simplified to `Layout`.
- `Material & Tooling Mapping` was replaced by layout design.
- Main view draws a U-shaped layout using SVG.
- Station blocks follow the confirmed station sequence.
- Station blocks are clickable.
- Clicking a station highlights it on the layout and updates the right panel with station details.
- Right panel station details include automation, size, operator side, HC, CT / target load, status, quality risk, and assigned SOP workflows.
- The U-shape includes left, bottom, and right-side station placement.
- Manual assembly stations show operator icons.
- Automation station is visually distinguished.
- A horizontal scroll container is used so the full layout can be viewed.
- Dimension table below allows editing:
  - Width
  - Depth
  - Operator side
- Default manual station size is `0.9m × 0.9m`.
- Side panel explains the selected station or overall U-shaped layout.

## Page 07: MI Output

**Objective:** Preview the final MI package output and export reviewed data.

**Input:**

- Reviewed SOP steps
- Station assignments
- Layout information
- Quality risk notes
- Uploaded station images

**Output:**

- MI package preview
- Station output cards
- Uploaded image references
- Exportable Excel/CSV-style data

**Layout / Features:**

- Each station output card has an `Upload Image` button.
- Uploaded image name and preview are shown in the station card.
- Each station output card shows a flat detailed step list, not SOP workflow groups.
- Step list columns are `Step`, `Step Description`, `Part Name`, and `Part Number`.
- Each station output card has a second `Quality Risk` table with 3 manually editable rows.
- Right panel includes `Export Excel`, limited to this page.
- Export includes station/package data currently available in the frontend state.

## Global UX / Interaction Notes

- The dashboard is designed as an interactive frontend mock.
- `Save Draft` and `Continue` guide the user through the process.
- From page 02 through page 06, draft saving is required before continuing.
- Right-side AI action buttons were simplified into a smoother continue flow.
- There are resize bars:
  - Sidebar/main horizontal resize bar.
  - Main preview/table vertical resize bar.
- The UI has a visual polish layer in `design-polish.css`.
- The polish layer improves contrast, spacing, card definition, hover states, and dashboard styling without changing the core HTML structure.

## Data / State Notes

Most dashboard edits still use in-memory JavaScript state. The state is initialized in `app.js` and passed into page modules through factory dependencies. This keeps cross-page data such as station plans available to Page 05, Page 06, and Page 07 without adding a frontend framework.

Important state areas include:

- `stageFlow`: active page sequence.
- `steps`: SOP workflow-level data.
- `sopMacroSteps`: detailed step data grouped by SOP workflow.
- `ctCalculatorState`: target CT and total HC calculator inputs.
- `stationDraft`: station assignment data.
- `expandedStations`: station expand/collapse state.
- `expandedStationWorkflows`: workflow expand/collapse state inside stations.
- `draftSavedByStage`: draft save state for continue gating.
- `microChangeStats`: added / deleted / moved step tracking.
- `microColumnFilters`: table filter state.
- Page modules receive these values through getter/setter callbacks rather than owning the source arrays directly.

## Important Files

- `index.html`: app shell, navigation, top bar, main regions, side panel, resize bars, action buttons.
- `app.js`: mock data, shared state, stage flow orchestration, and compatibility wrappers for page modules.
- `src/pages/`: page-specific rendering and interaction modules for Page 01 through Page 07.
- `src/components/`: shared UI components used across pages.
- `src/api/`: frontend API clients.
- `src/state/`: frontend state mappers.
- `backend/src/server.js`: local Express API for Page 01 input file upload/status persistence and parse job/result endpoints.
- `backend/src/ai-parser.js`: Gemini gateway adapter and parsed SOP JSON normalization.
- `styles.css`: base layout and component styling.
- `design-polish.css`: visual polish override layer.
- `tests/`: lightweight module and smoke tests.

## Tests

Run the current frontend smoke suite with:

```bash
node tests/ai-panel.test.js; node tests/input-files-api.test.js; node tests/input-intake-page.test.js; node tests/process-step-page.test.js; node tests/process-time-page.test.js; node tests/ct-calculation-page.test.js; node tests/station-page.test.js; node tests/layout-page.test.js; node tests/mi-output-page.test.js; node tests/mi-output-alignment.test.js; node tests/english-ui.test.js; node backend/tests/ai-parser.test.js
```

The tests use Node's `vm` module plus a small fake DOM. `tests/load-app-scripts.js` loads frontend scripts in the same order as `index.html`.

## Product Decisions Already Made

- The UI remains a static-compatible frontend mock, but a small local backend now supports Page 01 file upload/status persistence.
- SOP workflow editing and detailed step editing happen together on Page 02.
- Process Time is split from SOP Structure Review and owns all timing fields.
- Human review page was removed from active navigation.
- CT page is intentionally simple: CT <-> HC only.
- Station page owns line balance summary.
- Automation steps should be grouped together as one automation station.
- Layout page should show a visual U-shaped map, not only tables/cards.
- MI Output page owns image upload and Excel export.

## Known Limitations

- Most non-upload edits do not persist after browser refresh.
- Page 01 upload status persists through the local backend when Docker services are running.
- Upload image previews are local browser previews only.
- Export is frontend-generated and reflects current mock data only.
- Layout is a review sketch, not CAD-accurate.
- Some legacy stage definitions remain in `app.js` even though they are not active in navigation.

## Suggested Next Tasks

- Clean up unused legacy stage code after the current demo flow is stable.
- Add persistent local storage if the mock needs to survive refresh.
- Add more realistic Excel export formatting if needed for demo.
- Capture final screenshots for each step and insert them into the generated one-page PPT.
- Review all visible English labels before customer presentation.
