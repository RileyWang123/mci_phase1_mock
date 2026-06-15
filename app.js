const stages = {
  inputs: {
    title: "Input Upload",
    description:
      "Upload historical MI and assembly videos. AI checks completeness, video readability, step coverage, and gaps before parsing the new SOP.",
    twinTitle: "Input Intake Board",
    twinDescription: "This page only checks whether raw inputs are usable; the new SOP structure appears on the next page.",
    status: "Intake",
    sideTitle: "",
    sideDescription: "",
    stack: [],
    pressureTitle: "",
    pressure: [],
    artifactTitle: "Next AI Outputs",
    artifacts: [
      ["Input", "Ready"],
      ["SOP", "Next"],
      ["Steps", "Later"],
      ["MI", "Final"],
    ],
    output: "mi",
  },
  parse: {
    title: "Process Step Review",
    description:
      "Assembly videos are decomposed into ordered actions, part areas, tooling notes, and human review points.",
    twinTitle: "SOP Extraction Map",
    twinDescription: "AI decomposes the historical SOP into actions, part areas, notes, and review items.",
    status: "6 videos",
    sideTitle: "SOP Mining Stack",
    sideDescription: "Conversion flow from assembly videos to structured process data.",
    stack: [
      ["Video Parsing", "6 videos converted", "done"],
      ["Frame Anchors", "35 operation steps", "done"],
      ["Action Mining", "6 workflows", "active"],
      ["Tooling Notes", "review required", "done"],
      ["Missing Detail", "manual confirmation", "warn"],
    ],
    pressureTitle: "SOP Confidence",
    pressure: [
      ["OCR", "96%", ""],
      ["Step", "88%", ""],
      ["Note", "81%", ""],
      ["Img", "74%", "hot"],
    ],
    artifactTitle: "Parsed Artifacts",
    sideMode: "parsedArtifacts",
    parsedArtifacts: [
      ["Predicted SOP steps", "35", "Assembly actions from video transcript"],
      ["Frame anchors", "35", "Video operation moments and placeholders"],
      ["Tooling notes", "6", "Fixture / tool references from operation videos"],
      ["Human gaps", "Review", "Missing timing, fixture ID, or tolerance"],
    ],
    artifacts: [
      ["Steps", "18"],
      ["Images", "47"],
      ["Notes", "12"],
      ["Gaps", "12"],
    ],
    output: "mi",
  },
  steps: {
    title: "Process Time",
    description:
      "Review theoretical PT and actual PT for each detailed step before CT calculation.",
    twinTitle: "Process Time Review",
    twinDescription: "The generated step list from SOP Structure Review is enriched with theoretical PT and actual PT.",
    status: "PT review",
    sideTitle: "Process Time Summary",
    sideDescription: "Summary of detailed steps, PT matches, manual changes, and total process time.",
    stack: [
      ["SOP Steps", "18 exposed", "done"],
      ["Steps", "54 generated", "active"],
      ["Timing Readiness", "TBD", "warn"],
      ["SKU / Fixture Notes", "11 need check", "warn"],
      ["Total Process Time", "pending", "active"],
    ],
    pressureTitle: "Macro Step Time",
    pressure: [
      ["Extracted", "54", ""],
      ["Check", "24", "hot"],
      ["MTM", "TBD", "hot"],
      ["Total", "Pending", "calm"],
    ],
    sideMode: "stepTiming",
    artifacts: [],
    output: "balance",
  },
  human: {
    title: "Human Input Gate",
    description:
      "Step 04 captures the process inputs required before CT calculation. AI can proceed to CT and station layout after all five inputs are complete.",
    twinTitle: "Required Inputs Before CT",
    twinDescription: "Engineers fill in the process list, automation limits, prototype notes, CTQ marks, and station dimensions.",
    status: "3/5 ready",
    sideTitle: "Input Gate",
    sideDescription: "Human-input completeness before CT calculation.",
    stack: [
      ["Step list", "ready", "done"],
      ["Automation handling", "draft", "active"],
      ["Prototype notes", "missing", "warn"],
      ["CTQ for MI", "ready", "done"],
      ["Station size", "missing", "warn"],
    ],
    pressureTitle: "Input Gate",
    pressure: [
      ["Ready", "3/5", ""],
      ["Open", "2", "hot"],
      ["CTQ", "OK", "calm"],
      ["API3", "Hold", "hot"],
    ],
    sideMode: "humanGate",
    artifacts: [],
    output: "balance",
  },
  time: {
    title: "CT Calculation",
    description:
      "After human review, AI uses locked process time, volume, and shift assumptions to calculate target CT and proceed to station layout.",
    twinTitle: "Cycle Time Target",
    twinDescription: "Calculate target CT from human assumptions and AI-summed locked process time.",
    status: "58s target",
    sideTitle: "CT Calculation Stack",
    sideDescription: "Calculation from human-confirmed process time to CT target.",
    stack: [
      ["Human Gate", "5/5 ready", "done"],
      ["Locked PT", "354s total", "done"],
      ["Volume", "18,000/day", "done"],
      ["Shift Assumption", "2 shifts", "done"],
      ["Target CT", "58s", "active"],
    ],
    pressureTitle: "",
    pressure: [],
    sideMode: "ctCalc",
    artifacts: [],
    output: "balance",
  },
  station: {
    title: "Station Balancing Workspace",
    description:
      "Generate the initial station draft from the locked target CT. Review step assignment, CT load, and constraints requiring manual station adjustment.",
    twinTitle: "AI Station Draft",
    twinDescription: "Target CT = 58s comes from CT calculation; this page focuses on station assignment, balance checks, and manual confirmation.",
    status: "58s locked",
    sideTitle: "Station Balancing",
    sideDescription: "AI station draft and constraint checks.",
    stack: [
      ["Locked Target CT", "58s", "done"],
      ["Approved Steps", "10 macro / 30 micro", "done"],
      ["Station Draft", "7 stations", "active"],
      ["Balance Check", "1 over CT", "warn"],
      ["Manual Review", "station boundary", "warn"],
    ],
    pressureTitle: "Station Pressure",
    pressure: [
      ["ST01", "86%", ""],
      ["ST02", "97%", "hot"],
      ["ST03", "78%", ""],
      ["ST05", "61%", "calm"],
    ],
    artifactTitle: "Station Outputs",
    artifacts: [
      ["LB", "Chart"],
      ["HC", "7.0"],
      ["Layout", "v0.2"],
      ["WIP", "8"],
    ],
    sideMode: "stationBalance",
    output: "balance",
  },
  mapping: {
    title: "Station Layout",
    description:
      "Sketch a U-shaped line layout from the station draft, automation grouping, HC, and manually entered station dimensions.",
    twinTitle: "U-shaped Layout Draft",
    twinDescription: "Each station block uses Width / Depth inputs and follows the confirmed station sequence.",
    status: "Layout draft",
    sideTitle: "Layout Inputs",
    sideDescription: "Station dimensions, flow direction, automation grouping, and quality risks.",
    stack: [
      ["Flow Type", "U-shape", "active"],
      ["Station Size", "editable", "warn"],
      ["Automation", "A grouped", "done"],
      ["Operator Side", "manual input", "warn"],
      ["Quality Risk", "carried over", "done"],
    ],
    pressureTitle: "Layout Fit",
    pressure: [
      ["Flow", "U", ""],
      ["A/M", "OK", ""],
      ["Dims", "Draft", "hot"],
      ["Risk", "Open", ""],
    ],
    artifactTitle: "Layout Outputs",
    artifacts: [
      ["Sketch", "U-shape"],
      ["Dims", "Editable"],
      ["A station", "Auto"],
      ["Flow", "L → R"],
    ],
    output: "layout",
  },
  output: {
    title: "MI Package Output",
    description:
      "Final output includes MI, line balance chart, layout, and HC distribution, with all AI assumptions kept for audit.",
    twinTitle: "MI Package Preview",
    twinDescription: "AI consolidates MI, line balance, layout, and HC distribution for release.",
    status: "Draft",
    sideTitle: "Release Stack",
    sideDescription: "Output maturity of the final engineering package.",
    stack: [
      ["MI Draft", "82% ready", "active"],
      ["Line Balance", "chart ready", "done"],
      ["Layout", "v0.2 draft", "done"],
      ["HC Distribution", "7.0 HC", "done"],
      ["Blocked Items", "23 review", "warn"],
    ],
    pressureTitle: "Release Readiness",
    pressure: [
      ["MI", "82%", ""],
      ["LB", "91%", ""],
      ["Lay", "74%", "hot"],
      ["HC", "88%", ""],
    ],
    artifactTitle: "Release Artifacts",
    artifacts: [
      ["MI", "Draft"],
      ["LB", "Chart"],
      ["HC", "7.0"],
      ["Layout", "v0.2"],
    ],
    output: "mi",
  },
};

const stageFlow = ["inputs", "parse", "steps", "time", "station", "mapping", "output"];

const steps = [
  {
    id: "010",
    process: "Assemble Mic on Camera Board",
    detail: "Place the microphone on the camera board following the hinge-up Camera / Mic / CVF Board SOP image.",
    station: "Hinge UP _ Camera / Mic / CVF Board",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Manual assembly",
    material: "Mic, Camera Board",
    risk: "Low",
    status: "Verified",
    confidence: "88%",
    reason: "Pista SUB SOP slide 2 explicitly marks Step1 and provides an image anchor for the Camera / Mic / CVF Board operation.",
    missing: ["Confirm exact station name and standard time"],
    evidence: ["PPT slide 2", "Step1: Assemble Mic on Camera Board", "2 image anchors"],
  },
  {
    id: "020",
    process: "Assemble Camera on Camera Board",
    detail: "Assemble the camera module on the camera board before adhesive combination and FPC routing.",
    station: "Hinge UP _ Camera / Mic / CVF Board",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Manual assembly",
    material: "Camera module, Camera Board",
    risk: "Low",
    status: "Verified",
    confidence: "88%",
    reason: "Pista SUB SOP slide 2 explicitly marks Step2 next to the camera board image.",
    missing: ["Confirm exact station name and standard time"],
    evidence: ["PPT slide 2", "Step2: Assemble Camera on Camera Board", "2 image anchors"],
  },
  {
    id: "030",
    process: "Combine Camera and Mic by adhesive",
    detail: "Combine camera and microphone by adhesive; keep the white-line mark and Mic cable routing note from the PPT.",
    station: "Hinge UP _ Camera / Mic FPC routing",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Adhesive process",
    material: "Camera module, Mic cable",
    risk: "Medium",
    status: "Review",
    confidence: "82%",
    reason: "Slide 3 includes both the adhesive action and routing notes that should remain visible for engineering confirmation.",
    missing: ["Adhesive spec", "White-line alignment tolerance", "Mic cable routing acceptance criteria"],
    evidence: ["PPT slide 3", "Step3: Combine Camera and Mic by adhesive", "White line mark on Camera module"],
  },
  {
    id: "040",
    process: "Paste IRLED Graphite on A cover",
    detail: "Paste IRLED graphite on A cover. PPT separates FHD and OLED SKU with different thickness notes.",
    station: "Hinge UP _ IRLED Graphite",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Graphite placement",
    material: "IRLED Graphite, A cover",
    risk: "Medium",
    status: "Review",
    confidence: "79%",
    reason: "Slide 4 shows Step4 for FHD and OLED SKU variants, so SKU condition must be preserved in the extracted SOP.",
    missing: ["FHD/OLED thickness rule", "Graphite placement tolerance"],
    evidence: ["PPT slide 4", "Only FHD SKU", "Only OLED SKU", "Different thickness"],
  },
  {
    id: "050",
    process: "Paste Graphite on A cover",
    detail: "Paste graphite on A cover for the Hinge UP Graphite / THM pad flow. Follow numbered image sequence 1-4.",
    station: "Hinge UP _ Graphite / THM pad",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Manual paste",
    material: "Graphite, A cover",
    risk: "Medium",
    status: "Review",
    confidence: "80%",
    reason: "Slide 5 contains Step5 with four visual sequence anchors and an UMA SKU condition.",
    missing: ["UMA SKU applicability", "Graphite alignment criteria"],
    evidence: ["PPT slide 5", "Step5: paste Graphite on A cover", "Only UMA SKU"],
  },
  {
    id: "060",
    process: "Paste THM pad on Graphite or A cover",
    detail: "Paste THM pad with laser-line alignment. For UMA it is pasted on graphite; for DIS slide 6 says no graphite is needed.",
    station: "Hinge UP _ THM pad",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Manual paste",
    material: "THM pad, Graphite, A cover",
    risk: "High",
    status: "CTQ",
    confidence: "76%",
    reason: "Slides 5 and 6 both warn that PAD cannot exceed the laser area, making this a CTQ-style placement check.",
    missing: ["Laser area tolerance", "UMA/DIS branching rule", "Pad inspection method"],
    evidence: ["PPT slide 5", "PPT slide 6", "PAD can't exceed laser area", "Only DIS SKU"],
  },
  {
    id: "070",
    process: "Assemble BTM bezel on panel by CCD fixture",
    detail: "Assemble BTM bezel on panel using CCD fixture. PPT marks this as a fixture station.",
    station: "Hinge UP _ BTM Bezel",
    ct: "TBD",
    mtm: "TBD",
    tooling: "CCD fixture",
    material: "BTM Bezel, Panel",
    risk: "High",
    status: "Review",
    confidence: "78%",
    reason: "Slide 7 explicitly calls out fixture station and FHD SKU condition; fixture requirement must be carried forward.",
    missing: ["CCD fixture ID", "FHD SKU applicability", "Fixture cycle time"],
    evidence: ["PPT slide 7", "Step7: Assemble BTM bezel on panel by CCD fixture", "Only FHD SKU"],
  },
  {
    id: "080",
    process: "Paste BTM Bezel adhesive puller on panel",
    detail: "Remove BTM Bezel release paper before CCD fixture, then paste the adhesive puller on panel.",
    station: "Hinge UP _ BTM Bezel",
    ct: "TBD",
    mtm: "TBD",
    tooling: "CCD fixture",
    material: "BTM Bezel adhesive puller, Panel",
    risk: "Medium",
    status: "Review",
    confidence: "77%",
    reason: "Slide 7 includes Step8 and a release-paper prerequisite that should not be lost during extraction.",
    missing: ["Release-paper removal checkpoint", "Adhesive puller position tolerance"],
    evidence: ["PPT slide 7", "Step8: Pasted BTM Bezel adhesive puller on panel", "Remove release paper before CCD fixture"],
  },
  {
    id: "090",
    process: "Assemble EDP on CVF board",
    detail: "Assemble EDP on CVF board. PPT has FHD and OLED variants on separate slides.",
    station: "Hinge UP _ FHD/OLED EDP / Panel / CVF Board",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Manual connector assembly",
    material: "EDP, CVF Board",
    risk: "Medium",
    status: "Review",
    confidence: "80%",
    reason: "Slides 8 and 9 repeat Step9 for FHD and OLED flows, so SKU split should remain visible.",
    missing: ["FHD/OLED routing difference", "Connector inspection rule"],
    evidence: ["PPT slide 8", "PPT slide 9", "Step9: Assemble EDP on CVF board"],
  },
  {
    id: "100",
    process: "Assemble EDP on Panel",
    detail: "Assemble EDP on panel and keep acetate cloth / release-paper notes from the PPT.",
    station: "Hinge UP _ FHD/OLED EDP / Panel / CVF Board",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Manual connector assembly",
    material: "EDP, Panel",
    risk: "Medium",
    status: "Review",
    confidence: "79%",
    reason: "Slides 8 and 9 mark Step10 and include material handling notes that should become SOP notes.",
    missing: ["Acetate cloth placement rule", "Release-paper removal sequence"],
    evidence: ["PPT slide 8", "PPT slide 9", "Remove release paper and paste on panel"],
  },
  {
    id: "110",
    process: "Assemble PMIC",
    detail: "For OLED SKU, connect FPC and PMIC, paste acetate on CNT, paste PMIC on panel, then finish.",
    station: "Hinge UP _ OLED EDP / PMIC / TS FPC",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Manual paste / connect",
    material: "PMIC, FPC, CNT, Panel",
    risk: "High",
    status: "CTQ",
    confidence: "75%",
    reason: "Slide 10 has a multi-image sequence for OLED PMIC assembly and should be represented as a grouped step.",
    missing: ["OLED-only rule", "PMIC paste location tolerance", "CNT acetate criteria"],
    evidence: ["PPT slide 10", "Step10-1: Assemble PMIC", "Only OLED SKU"],
  },
  {
    id: "120",
    process: "Assemble TS FPC",
    detail: "For OLED SKU, connect FPC and PMIC, paste acetate on CNT, and complete the TS FPC sequence.",
    station: "Hinge UP _ OLED EDP / PMIC / TS FPC",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Manual paste / connect",
    material: "TS FPC, PMIC, CNT",
    risk: "High",
    status: "CTQ",
    confidence: "74%",
    reason: "Slides 10 and 11 split TS FPC into Step10-2 and Step10-3; UI should preserve these as sub-step style entries.",
    missing: ["OLED-only rule", "FPC connection inspection", "Acetate placement criteria"],
    evidence: ["PPT slide 10", "PPT slide 11", "Step10-2 / Step10-3: Assemble TS FPC"],
  },
  {
    id: "130",
    process: "Remove all Key-part and panel adhesive release paper",
    detail: "Remove all Key-part release paper and remove panel adhesive release paper before fixture placement.",
    station: "Hinge UP _ Remove release paper",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Manual prep",
    material: "Key-part, Panel adhesive",
    risk: "Medium",
    status: "Review",
    confidence: "83%",
    reason: "Slide 12 defines release-paper removal as a required preparation action before downstream fixture steps.",
    missing: ["Release-paper verification point", "Scrap handling rule"],
    evidence: ["PPT slide 12", "Step9: Removing all Key-part release paper", "Step10: Removing release paper of panel adhesive"],
  },
  {
    id: "140",
    process: "Put Panel and Key-part on CCD fixture",
    detail: "Put Panel and Key-part on CCD fixture. Fixture includes EDP holder fix and requires 4 pcs.",
    station: "Hinge UP _ EDP / Panel / CVF Board",
    ct: "TBD",
    mtm: "TBD",
    tooling: "CCD fixture, EDP holder",
    material: "Panel, Key-part, EDP holder",
    risk: "High",
    status: "Review",
    confidence: "77%",
    reason: "Slide 13 emphasizes fixture requirement and EDP holder; this should be a fixture-controlled SOP step.",
    missing: ["Fixture ID", "4 pcs fixture capacity meaning", "EDP holder confirmation"],
    evidence: ["PPT slide 13", "Step11: Putting Panel and Key-part on CCD fixture", "fixture is required"],
  },
  {
    id: "150",
    process: "Route Camera / Mic / CVF into cover",
    detail: "Step12-1 paste camera into cover, Step12-2 put Mic into cover by press fixture, Step12-3 paste CVF board on cover.",
    station: "Hinge UP _ routing",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Press fixture",
    material: "Camera, Mic, CVF board, Cover",
    risk: "High",
    status: "Review",
    confidence: "76%",
    reason: "Slide 14 contains Step12 with three sub-steps and fixture requirements; grouping preserves the real PPT structure.",
    missing: ["Press fixture ID", "Sub-step order confirmation", "Camera/Mic/CVF placement tolerances"],
    evidence: ["PPT slide 14", "Step12-1 / Step12-2 / Step12-3", "fixture is required"],
  },
  {
    id: "160",
    process: "Assemble and pressurize Panel into A Cover",
    detail: "Assemble panel into A cover, ensure hook x4 assembles into cover, then pressurize panel by fixture.",
    station: "Hinge UP _ Panel / A cover",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Press fixture",
    material: "Panel, A cover",
    risk: "High",
    status: "CTQ",
    confidence: "74%",
    reason: "Slide 15 contains panel assemble direction, hook x4 check, and fixture pressurization requirement.",
    missing: ["Hook x4 inspection criteria", "Pressurization fixture ID", "Panel assemble direction confirmation"],
    evidence: ["PPT slide 15", "Step 13: Assemble Panel into A Cover", "Step 14: Pressurize Panel by fixture"],
  },
  {
    id: "170",
    process: "Route EDP cable",
    detail: "Route EDP cable through the EDP holder, then reflex the EDP cable according to Step15-1 and Step15-2.",
    station: "Hinge UP _ EDP cable routing",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Manual routing",
    material: "EDP cable, EDP holder",
    risk: "High",
    status: "CTQ",
    confidence: "76%",
    reason: "Slide 16 shows EDP cable routing with sub-steps and should keep the cable path as a CTQ-style image anchor.",
    missing: ["Cable bend radius", "EDP holder routing acceptance", "Reflex direction confirmation"],
    evidence: ["PPT slide 16", "Step15-1: The EDP through the EDP holder", "Step15-2: Reflex EDP cable"],
  },
  {
    id: "180",
    process: "Assemble Cable Cover by press fixture",
    detail: "Assemble cable cover by press fixture after panel / A cover / cable cover positioning.",
    station: "Hinge UP _ Panel / A cover / Cable cover",
    ct: "TBD",
    mtm: "TBD",
    tooling: "Press fixture",
    material: "Cable Cover, Panel, A cover",
    risk: "High",
    status: "Review",
    confidence: "78%",
    reason: "Slide 17 marks Step16 and fixture requirement for cable cover assembly.",
    missing: ["Press fixture ID", "Cable cover seating criteria"],
    evidence: ["PPT slide 17", "Step16: Assemble Cable Cover by press fixture", "fixture is required"],
  },
];

const sopMacroSteps = [
  {
    id: "010",
    title: "Assemble Mic on Camera Board",
    station: "Hinge UP _ Camera / Mic / CVF Board",
    source: "Pista SOP slide 2",
    status: "Extracted",
    tone: "done",
    microSteps: [
      ["Pick Mic and verify orientation", "TBD", 0, "Extracted"],
      ["Place Mic on Camera Board", "TBD", 0, "Extracted"],
      ["Confirm Mic cable clearance", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "020",
    title: "Assemble Camera on Camera Board",
    station: "Hinge UP _ Camera / Mic / CVF Board",
    source: "Pista SOP slide 2",
    status: "Extracted",
    tone: "review",
    microSteps: [
      ["Pick Camera module", "TBD", 0, "Extracted"],
      ["Place Camera on Camera Board", "TBD", 0, "Extracted"],
      ["Check Camera/Mic board assembly direction", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "030",
    title: "Combine Camera and Mic by adhesive",
    station: "Hinge UP _ Camera / Mic FPC routing",
    source: "Pista SOP slide 3",
    status: "Needs Review",
    tone: "ctq",
    microSteps: [
      ["Apply adhesive to combine Camera and Mic", "TBD", 0, "Needs Review"],
      ["Align to white line mark on Camera module", "TBD", 0, "Needs Review"],
      ["Route Mic cable per FPC routing note", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "040",
    title: "Paste IRLED Graphite on A cover",
    station: "Hinge UP _ IRLED Graphite",
    source: "Pista SOP slide 4",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Identify FHD or OLED SKU branch", "TBD", 0, "Needs Review"],
      ["Paste IRLED graphite on A cover", "TBD", 0, "Extracted"],
      ["Confirm different thickness requirement", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "050",
    title: "Paste Graphite on A cover",
    station: "Hinge UP _ Graphite / THM pad",
    source: "Pista SOP slide 5",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Confirm UMA SKU applicability", "TBD", 0, "Needs Review"],
      ["Paste Graphite on A cover following image sequence", "TBD", 0, "Extracted"],
      ["Check alignment against numbered PPT anchors", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "060",
    title: "Paste THM pad on Graphite or A cover",
    station: "Hinge UP _ THM pad",
    source: "Pista SOP slides 5-6",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Confirm UMA or DIS branch", "TBD", 0, "Needs Review"],
      ["Paste THM pad on Graphite or A cover", "TBD", 0, "Extracted"],
      ["Verify PAD does not exceed laser area", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "070",
    title: "Assemble BTM bezel on panel by CCD fixture",
    station: "Hinge UP _ BTM Bezel",
    source: "Pista SOP slide 7",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Confirm FHD SKU applicability", "TBD", 0, "Needs Review"],
      ["Load panel into CCD fixture", "TBD", 0, "Needs Review"],
      ["Assemble BTM bezel on panel", "TBD", 0, "Extracted"],
    ],
  },
  {
    id: "080",
    title: "Paste BTM Bezel adhesive puller on panel",
    station: "Hinge UP _ BTM Bezel",
    source: "Pista SOP slide 7",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Remove BTM Bezel release paper before CCD fixture", "TBD", 0, "Needs Review"],
      ["Paste BTM Bezel adhesive puller on panel", "TBD", 0, "Extracted"],
    ],
  },
  {
    id: "090",
    title: "Assemble EDP on CVF board",
    station: "Hinge UP _ FHD/OLED EDP / Panel / CVF Board",
    source: "Pista SOP slides 8-9",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Confirm FHD or OLED SKU branch", "TBD", 0, "Needs Review"],
      ["Assemble EDP on CVF board", "TBD", 0, "Extracted"],
      ["Preserve acetate cloth note on CNT", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "100",
    title: "Assemble EDP on Panel",
    station: "Hinge UP _ FHD/OLED EDP / Panel / CVF Board",
    source: "Pista SOP slides 8-9",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Remove release paper", "TBD", 0, "Needs Review"],
      ["Paste EDP on panel", "TBD", 0, "Extracted"],
      ["Confirm FHD/OLED variant routing", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "110",
    title: "Assemble PMIC",
    station: "Hinge UP _ OLED EDP / PMIC / TS FPC",
    source: "Pista SOP slide 10",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Connect FPC and PMIC", "TBD", 0, "Extracted"],
      ["Paste acetate on CNT", "TBD", 0, "Extracted"],
      ["Paste PMIC on panel", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "120",
    title: "Assemble TS FPC",
    station: "Hinge UP _ OLED EDP / PMIC / TS FPC",
    source: "Pista SOP slides 10-11",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Connect TS FPC", "TBD", 0, "Extracted"],
      ["Paste acetate on CNT", "TBD", 0, "Extracted"],
      ["Confirm OLED-only flow", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "130",
    title: "Remove all Key-part and panel adhesive release paper",
    station: "Hinge UP _ Remove release paper",
    source: "Pista SOP slide 12",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Remove all Key-part release paper", "TBD", 0, "Extracted"],
      ["Remove panel adhesive release paper", "TBD", 0, "Extracted"],
      ["Verify no release paper remains before fixture", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "140",
    title: "Put Panel and Key-part on CCD fixture",
    station: "Hinge UP _ EDP / Panel / CVF Board",
    source: "Pista SOP slide 13",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Prepare CCD fixture with EDP holder", "TBD", 0, "Needs Review"],
      ["Put Panel and Key-part on CCD fixture", "TBD", 0, "Extracted"],
      ["Confirm 4 pcs fixture requirement", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "150",
    title: "Route Camera / Mic / CVF into cover",
    station: "Hinge UP _ routing",
    source: "Pista SOP slide 14",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Paste camera into cover", "TBD", 0, "Extracted"],
      ["Put Mic into cover by press fixture", "TBD", 0, "Needs Review"],
      ["Paste CVF board on cover", "TBD", 0, "Extracted"],
    ],
  },
  {
    id: "160",
    title: "Assemble and pressurize Panel into A Cover",
    station: "Hinge UP _ Panel / A cover",
    source: "Pista SOP slide 15",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Assemble Panel into A Cover", "TBD", 0, "Extracted"],
      ["Ensure hook x4 assembles into Cover", "TBD", 0, "Needs Review"],
      ["Pressurize Panel by fixture", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "170",
    title: "Route EDP cable",
    station: "Hinge UP _ EDP cable routing",
    source: "Pista SOP slide 16",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Route EDP through EDP holder", "TBD", 0, "Extracted"],
      ["Reflex EDP cable", "TBD", 0, "Extracted"],
      ["Confirm bend direction and holder clearance", "TBD", 0, "Needs Review"],
    ],
  },
  {
    id: "180",
    title: "Assemble Cable Cover by press fixture",
    station: "Hinge UP _ Panel / A cover / Cable cover",
    source: "Pista SOP slide 17",
    status: "Needs Review",
    tone: "review",
    microSteps: [
      ["Position cable cover", "TBD", 0, "Extracted"],
      ["Assemble Cable Cover by press fixture", "TBD", 0, "Needs Review"],
      ["Confirm cable cover seating", "TBD", 0, "Needs Review"],
    ],
  },
];

const humanInputSections = [
  {
    id: "01",
    title: "Step / Sub-step List",
    status: "Ready",
    value: "Step sequence 010-100 confirmed; 020 thermal module split into pick / align / seat / screw lock; 030 display cable keeps the CTQ photo step.",
    detail: "Confirm whether AI-generated workflow steps and detailed steps are complete and correctly ordered.",
    placeholder: "Example: keep align / seat / diagonal screw lock under 020 Thermal module...",
  },
  {
    id: "02",
    title: "Automation Loading / Unloading Steps",
    status: "Draft",
    value: "ST02 display cable routing does not allow automated pressing for now; battery pack may use automated loading, but pull-tab routing remains manual.",
    detail: "Mark which steps allow automated loading / unloading and which must remain manual.",
    placeholder: "Example: ST02 display cable routing does not allow automated pressing...",
  },
  {
    id: "03",
    title: "Prototype Notes / Improvement Requests",
    status: "Missing",
    value: "",
    detail: "Add prototype-stage risks, rework reasons, improvement requests, and customer-specific methods.",
    placeholder: "Example: add guidance for thermal fixture alignment; display cable bend radius needs image explanation...",
  },
  {
    id: "04",
    title: "CTQ Marks for MI Format",
    status: "Ready",
    value: "030.02 cable seating, 030.05 CTQ photo, and 070 final visual inspection enter MI CTQ marks and keep image placeholders.",
    detail: "Define which CTQs enter the MI format and keep image placeholders or first-article requirements.",
    placeholder: "Example: 030.02 cable seating CTQ; 030.05 CTQ photo required...",
  },
  {
    id: "05",
    title: "Station Dimensions",
    status: "Missing",
    value: "",
    detail: "Enter station size, fixture footprint, operator space, and logistics direction constraints.",
    placeholder: "Example: ST02 width 1.2m, fixture depth 0.6m, left-in/right-out...",
  },
];

const inputSources = [
  {
    source: "Historical MI",
    type: "Previous MI package",
    parsed: "Work instructions, images, CTQ notes",
    quality: "Ready",
    issue: "",
    nextUse: "Reference previous process structure and MI format",
    tone: "done",
  },
  {
    source: "Assembly Video",
    type: "6 assembly videos",
    parsed: "6 videos, 35 generated steps",
    quality: "Review",
    issue: "12 fixture / tolerance details need confirmation",
    nextUse: "Generate new SOP draft",
    tone: "review",
  },
  {
    source: "MTM Database",
    type: "Timing reference",
    parsed: "8,214 codes available, 23 matched to detailed steps",
    quality: "Ready",
    issue: "",
    nextUse: "Estimate process time after process step review",
    tone: "done",
  },
  {
    source: "Human Rule List",
    type: "Engineer constraints",
    parsed: "15 rules, including CTQ photo and automation limits",
    quality: "Ready",
    issue: "",
    nextUse: "Protect rules when generating SOP",
    tone: "done",
  },
  {
    source: "Mapping Table",
    type: "BOM / fixture mapping",
    parsed: "Not provided",
    quality: "Missing",
    issue: "Fixture IDs will stay as review items",
    nextUse: "Defer to Station BOM List",
    tone: "warn",
  },
];

const stationDraft = [
  { id: "ST01", time: 54, hc: "1.0", state: "ok", steps: ["010", "020"], note: "Cover removal + thermal module", issue: "Within CT, fixture ID still pending" },
  { id: "ST02", time: 61, hc: "1.5", state: "over", steps: ["030"], note: "Display cable routing + CTQ photo", issue: "3s over target CT, CTQ photo cannot be dropped" },
  { id: "ST03", time: 54, hc: "1.0", state: "ok", steps: ["040"], note: "Mainboard placement and connector", issue: "Connector access angle needs station-side check" },
  { id: "ST04", time: 56, hc: "1.0", state: "ok", steps: ["050", "080"], note: "Battery pack + speaker module", issue: "Battery tray space constraint from human input" },
  { id: "ST05", time: 50, hc: "1.0", state: "ok", steps: ["060", "090"], note: "Fan sensor + labels", issue: "Label datum rule is human override" },
  { id: "ST06", time: 57, hc: "1.0", state: "ok", steps: ["070"], note: "Final visual inspection", issue: "CTQ inspection locked for MI" },
  { id: "ST07", time: 22, hc: "0.5", state: "light", steps: ["100", "110", "120", "130", "140", "150", "160", "170", "180"], note: "Remaining Pista extracted actions", issue: "Station assignment not generated yet; carried forward for MI trace continuity" },
];

const stationPlanB = [
  { id: "ST01", time: 50, hc: "1.0", state: "ok", steps: ["010"], note: "Mic / camera preparation", issue: "Lower load manual station" },
  { id: "ST02", time: 52, hc: "1.0", state: "ok", steps: ["020", "030"], note: "Camera assembly + cable routing", issue: "CTQ photo kept with cable routing" },
  { id: "ST03", time: 55, hc: "1.0", state: "ok", steps: ["040", "050"], note: "Mainboard + battery pack", issue: "Needs operator side review" },
  { id: "ST04", time: 48, hc: "1.0", state: "ok", steps: ["060", "070"], note: "Fan sensor + final visual inspection", issue: "Inspection stays manual" },
  { id: "ST05", time: 43, hc: "1.0", state: "ok", steps: ["080", "090"], note: "Speaker module + labels", issue: "Label datum rule remains human input" },
  { id: "ST06", time: 36, hc: "0.5", state: "light", steps: ["100", "110", "120", "130", "140", "150", "160", "170", "180"], note: "Remaining Pista actions", issue: "Grouped as low-load finishing station" },
];

const stationFieldLabels = {
  id: "Station",
  steps: "Assigned steps",
  note: "Work content",
  hc: "HC",
  issue: "Human constraint",
};

function stationSnapshot(station) {
  return {
    id: station.id,
    steps: station.steps.join(", "),
    note: station.note,
    hc: station.hc,
    issue: station.issue,
  };
}

function applyStationSnapshot(station, snapshot) {
  station.id = snapshot.id;
  station.steps = snapshot.steps
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  station.note = snapshot.note;
  station.hc = snapshot.hc;
  station.issue = snapshot.issue;
}

const stationTraceLog = [];

function initializeStationRuntime(station) {
  const baseline = stationSnapshot(station);
  station.aiBaseline = { ...baseline };
  station.lastSubmitted = { ...baseline };
  station.trace = [];
  station.editing = false;
  station.override = false;
}

stationDraft.forEach(initializeStationRuntime);
stationPlanB.forEach(initializeStationRuntime);

const stationPlanMeta = {
  planA: {
    name: "Plan A",
    label: "Current Draft",
    description: "Original AI station draft with current manual review state.",
  },
  planB: {
    name: "Plan B",
    label: "Balanced Alternative",
    description: "Alternative grouping with smoother station load and fewer overloaded rows.",
  },
};

const videoSopWorkflows = [
  {
    id: "010",
    process: "組理左天線（上半段）",
    detail: "視頻 1：組理左天線上半段，完成左側天線模組貼附與上半段同軸線走線。",
    station: "A 殼左側天線區",
    material: "左側天線模組、A 殼、天線同軸線纜",
    microSteps: [
      ["撕掉左側天線模組背面的白色保護紙。", "左側天線模組"],
      ["將天線模組對齊 A 殼左上角的卡槽與定位孔並貼放下去。", "左側天線模組、LCD 螢幕背殼（A 殼）"],
      ["用手指用力按壓天線模組表面，使其與 A 殼緊密黏合。", "左側天線模組"],
      ["把從天線引出的黑、灰雙色同軸線理順，用手向下引導。", "天線同軸線纜（黑、灰雙線）"],
      ["撕開 A 殼中部的固定貼，將雙線併排壓入固定貼下方。", "天線同軸線纜、中部固定貼"],
      ["將線纜繼續向右下方延伸，壓入右側的黑色貼片卡槽中固定。", "天線同軸線纜、右側黑色貼片"],
    ],
  },
  {
    id: "020",
    process: "組理左天線（下半段走線）",
    detail: "視頻 2：組理左天線下半段走線，完成線纜卡槽走線與末端固定。",
    station: "A 殼左側天線走線區",
    material: "天線同軸線纜、藍色導向保護貼、黑色絕緣布膠帶",
    microSteps: [
      ["再次用雙手大拇指反覆按壓左上角天線主體，確保邊緣導電布完全貼緊。", "左側天線模組"],
      ["將同軸線纜理順，穿過帶有藍色膠帶的導向保護塊。", "天線同軸線纜、藍色導向保護貼"],
      ["順著 A 殼左側邊緣的縱向線槽，用手指一節一節地把雙線卡入槽內。", "天線同軸線纜、A 殼左側縱向線槽"],
      ["將線纜末端引導至左下角，把接口和帶有條碼的標籤平整地貼在指定位置。", "天線末端接口與標籤"],
      ["黏貼一張黑色絕緣布膠帶，牢牢蓋壓住左下角的線纜末端。", "黑色絕緣布膠帶"],
    ],
  },
  {
    id: "030",
    process: "吹 Middle Board + 組 Middle Board",
    detail: "視頻 3：吹 Middle Board 並組裝到 A 殼，完成預熱、貼附與線纜固定。",
    station: "Middle Board 組裝區",
    material: "中間板組件、A 殼、中間板附帶線纜、黑色導電膠帶",
    microSteps: [
      ["操作員一手拿著長條形中間板，撕掉背面的膠帶離型紙。", "中間板組件（Middle Board）"],
      ["打開熱風槍，對中間板背面的膠帶進行均勻來回烘烤預熱。", "中間板組件（工具：熱風槍）"],
      ["將預熱好的中間板水平對齊 A 殼正上方頂部的長條安裝位。", "中間板組件、A 殼頂部安裝位"],
      ["由中間向兩端，用手指反覆按壓整條中間板，使其牢固黏貼。", "中間板組件"],
      ["理順中間板左側引出的細線纜，將其順著頂部金屬卡槽向左引導。", "中間板附帶線纜"],
      ["在線纜轉折處貼上一塊黑色導電膠帶進行固定。", "黑色導電膠帶"],
      ["用手指沿著頂部和左側邊緣的走線軌跡整體複檢按壓一遍。", "已安裝的線纜結構"],
    ],
  },
  {
    id: "040",
    process: "鎖 Middle Board",
    detail: "視頻 4：使用氣動治具與智慧電批鎖附 Middle Board。",
    station: "Middle Board 鎖附治具區",
    material: "A 殼組件、氣動治具、微型螺絲",
    microSteps: [
      ["將貼好中間板的 A 殼組件水平放入綠色工作台的定位底座中。", "A 殼組件"],
      ["合上帶有紅藍標記的透明有機玻璃定位上蓋。", "治具定位上蓋"],
      ["按壓氣動開關（白色球），使治具完全夾緊並鎖定 A 殼。", "氣動治具"],
      ["手持智慧電批，透過上蓋的 6 個預留孔，依次鎖緊中間板上的 6 顆微型螺絲。", "微型機動螺絲（6 顆）（工具：智慧電批）"],
      ["解開氣動夾具，打開透明上蓋，將鎖好的 A 殼組件取出。", "A 殼組件"],
    ],
  },
  {
    id: "050",
    process: "組 Camera & Camera BRK（鏡頭預組裝）",
    detail: "視頻 5：組 Camera & Camera BRK，完成鏡頭排線整理、支架組裝與壓合定型。",
    station: "Camera BRK 預組裝區",
    material: "鏡頭電路板模組、鏡頭金屬支架、鏡頭總成",
    microSteps: [
      ["拿起鏡頭模組，理順其後方引出的黑色扁平排線。", "鏡頭電路板模組"],
      ["在鏡頭排線特定的轉折或焊接點上，黏貼一層黑色絕緣小標籤或膠帶。", "鏡頭排線、黑色絕緣膠帶"],
      ["將鏡頭排線穿過金屬支架（BRK）的凹槽，並將鏡頭 PCB 精確嵌入支架的卡槽中，組裝成鏡頭總成。", "鏡頭電路板模組、鏡頭金屬支架（Camera BRK）"],
      ["將組裝好的鏡頭總成放進專用的綠色半自動壓接機台底座中。", "鏡頭總成"],
      ["合上機台保護蓋，啟動氣動設備下壓，將支架與鏡頭組件進行高精度壓合定型。", "鏡頭總成（設備：半自動壓接機台）"],
    ],
  },
  {
    id: "060",
    process: "組 Camera 到 Cover（總裝配）",
    detail: "視頻 6：組 Camera 到 Cover，完成鏡頭總成貼附、排線、小板鎖附、EDP 線與兩側收尾。",
    station: "Camera 到 A 殼總裝區",
    material: "鏡頭總成、A 殼、鏡頭排線、側邊小板、EDP 螢幕訊號線",
    microSteps: [
      ["撕掉鏡頭總成背面的白色保護紙。", "壓合好的鏡頭總成"],
      ["將鏡頭總成水平對齊 A 殼頂部正中央的鏡頭孔與定位柱，貼放進去並用雙手大拇指壓實。", "鏡頭總成、A 殼頂部中央孔位"],
      ["將鏡頭引出的黑色排線順著 A 殼中部的專用走線槽鋪平，並用手指沿線黏緊。", "鏡頭排線"],
      ["在另一個綠色氣動治具上，將一塊小電路板與排線進行預裝配並合蓋。", "側邊小板與排線、輔助治具"],
      ["使用智慧電批通過治具孔位，將該小板的螺絲鎖緊定型。", "小板螺絲（工具：智慧電批）"],
      ["回到 A 殼主體，將寬幅的 EDP 螢幕銅箔訊號線平鋪在頂部中央，並與鏡頭下方的接口對齊貼合。", "EDP 螢幕訊號線"],
      ["最後整理 A 殼左右兩側的細長金屬固定壓條（或天線貼片），將邊緣線路全部壓緊收尾。", "兩側金屬固定壓條"],
    ],
  },
];

function applyVideoInputDemoData() {
  steps.splice(
    0,
    steps.length,
    ...videoSopWorkflows.map((workflow) => ({
      id: workflow.id,
      process: workflow.process,
      detail: workflow.detail,
      station: workflow.station,
      ct: "TBD",
      mtm: "TBD",
      tooling: "Video-derived manual process",
      material: workflow.material,
      risk: "Medium",
      status: "Extracted",
      confidence: "Video input",
      reason: `${workflow.process} was generated from the provided video operation transcript.`,
      missing: ["Confirm standard time", "Confirm fixture / tool ID if applicable"],
      evidence: [workflow.detail],
    })),
  );

  sopMacroSteps.splice(
    0,
    sopMacroSteps.length,
    ...videoSopWorkflows.map((workflow) => ({
      id: workflow.id,
      title: workflow.process,
      station: workflow.station,
      source: workflow.detail.split(":")[0],
      status: "Extracted",
      tone: "review",
      microSteps: workflow.microSteps.map(([description, partName], index) => [
        description,
        "TBD",
        [6, 7, 5, 8, 6, 7, 5][index % 7],
        "Extracted",
        [6, 7.5, 5.5, 8, 6.5, 7, 5.5][index % 7],
        "",
        "",
        "M",
        partName,
      ]),
    })),
  );

  stationDraft.splice(
    0,
    stationDraft.length,
    { id: "ST01", time: 49, hc: "1.0", state: "ok", steps: ["010"], note: "左天線上半段組理", issue: "確認天線貼附按壓標準" },
    { id: "ST02", time: 48, hc: "1.0", state: "ok", steps: ["020"], note: "左天線下半段走線", issue: "確認線纜末端標籤位置" },
    { id: "ST03", time: 50, hc: "1.0", state: "ok", steps: ["030"], note: "Middle Board 預熱與組裝", issue: "確認熱風槍設定" },
    { id: "ST04", time: 49, hc: "1.0", state: "ok", steps: ["040"], note: "Middle Board 鎖附", issue: "確認 6 顆螺絲鎖附順序" },
    { id: "ST05", time: 47, hc: "1.0", state: "ok", steps: ["050"], note: "Camera BRK 預組裝", issue: "確認壓合機台參數" },
    { id: "ST06", time: 51, hc: "1.0", state: "ok", steps: ["060"], note: "Camera 到 Cover 總裝", issue: "EDP 線對位接近目標 CT" },
  );

  stationPlanB.splice(
    0,
    stationPlanB.length,
    { id: "ST01", time: 52, hc: "1.0", state: "ok", steps: ["010"], note: "左天線上半段組理", issue: "保留原始順序" },
    { id: "ST02", time: 53, hc: "1.0", state: "ok", steps: ["020", "030"], note: "左天線下半段走線 + Middle Board 預處理", issue: "平衡後的混合人工站" },
    { id: "ST03", time: 54, hc: "1.0", state: "ok", steps: ["040"], note: "Middle Board 鎖附", issue: "治具站獨立" },
    { id: "ST04", time: 52, hc: "1.0", state: "ok", steps: ["050"], note: "Camera BRK 預組裝", issue: "壓合機台站獨立" },
    { id: "ST05", time: 52, hc: "1.0", state: "ok", steps: ["060"], note: "Camera 到 Cover 總裝", issue: "總裝步驟較長" },
  );

  stationDraft.forEach(initializeStationRuntime);
  stationPlanB.forEach(initializeStationRuntime);
}

applyVideoInputDemoData();

const mappingRows = [
  {
    id: "MAP-001",
    step: "020",
    process: "Install thermal module",
    station: "ST01",
    material: "Thermal module M18",
    tool: "T03 Torque driver",
    fixture: "Fixture TBD",
    confidence: 72,
    issue: "Fixture ID missing",
    severity: "block",
    reason: "SOP p.14 and MTM TM-443 match the thermal module install step, but no fixture ID exists in the mapping table.",
    evidence: ["SOP page 14", "MTM TM-443", "3D thermal zone"],
  },
  {
    id: "MAP-002",
    step: "030",
    process: "Route display cable",
    station: "ST02",
    material: "Display cable M09",
    tool: "Nylon probe T07",
    fixture: "Cable routing fixture TBD",
    confidence: 68,
    issue: "CTQ fixture/photo rule missing",
    severity: "block",
    reason: "AI matched the cable and nylon probe from historical SOP, but the CTQ photo fixture rule is not present.",
    evidence: ["3D cable path", "Historical rework note", "Manual List rule 03"],
  },
  {
    id: "MAP-003",
    step: "040",
    process: "Install mainboard",
    station: "ST03",
    material: "Mainboard M31",
    tool: "Vacuum pick head",
    fixture: "Board placement guide",
    confidence: 76,
    issue: "Vacuum head model missing",
    severity: "review",
    reason: "BOM and dependency graph identify the mainboard, but the exact vacuum head model needs ME confirmation.",
    evidence: ["BOM M31", "MTM BD-510", "Dependency graph"],
  },
  {
    id: "MAP-004",
    step: "050",
    process: "Place battery pack",
    station: "ST04",
    material: "Battery M44",
    tool: "T03 Torque driver",
    fixture: "Battery tray guide",
    confidence: 89,
    issue: "Matched",
    severity: "ok",
    reason: "Historical SOP and MTM data match the battery install sequence with no blocking mapping gap.",
    evidence: ["SOP page 22", "MTM BT-302", "Human List rule 07"],
  },
  {
    id: "MAP-005",
    step: "070",
    process: "Final visual inspection",
    station: "ST06",
    material: "Inspection template",
    tool: "Vision camera",
    fixture: "Camera coverage TBD",
    confidence: 64,
    issue: "Camera coverage missing",
    severity: "review",
    reason: "AI can generate inspection items, but camera coverage and customer format need QE confirmation.",
    evidence: ["PFMEA CTQ tags", "Manual List rule 12", "SOP page 31"],
  },
];

const mappingFieldLabels = {
  material: "Material P/N",
  tool: "Tool",
  fixture: "Fixture ID",
  station: "Station",
};

function mappingSnapshot(row) {
  return {
    material: row.material,
    tool: row.tool,
    fixture: row.fixture,
    station: row.station,
  };
}

const mappingTraceLog = [];

mappingRows.forEach((row) => {
  const baseline = mappingSnapshot(row);
  row.aiBaseline = { ...baseline };
  row.lastSubmitted = { ...baseline };
  row.trace = [];
  row.editing = false;
  row.override = false;
});

const stationMaterialLists = [
  {
    station: "ST01",
    title: "Cover removal + thermal module",
    status: "Fixture ID missing",
    items: [
      ["010", "D-cover kit", "PST-D-CVR-001", "T03 Torque driver", "TL-TQ-003", "Matched"],
      ["020", "Thermal module M18", "PST-THM-M18-004", "Thermal alignment fixture", "FX-THM-TBD", "Missing fixture ID"],
      ["020", "Thermal screw set", "SCR-M2-030-BLK", "Screw feeder", "TL-SF-014", "Matched"],
    ],
  },
  {
    station: "ST02",
    title: "Display cable routing + CTQ photo",
    status: "Review",
    items: [
      ["030", "Display cable M09", "PST-EDP-M09-021", "Nylon probe", "TL-NP-007", "Matched"],
      ["030", "Cable mylar", "PST-MYL-CBL-018", "Routing fixture", "FX-CBL-TBD", "Missing fixture ID"],
      ["030", "CTQ photo template", "Q-TPL-CBL-030", "Vision camera", "EQ-CAM-TBD", "QE confirm"],
    ],
  },
  {
    station: "ST03",
    title: "Mainboard placement and connector",
    status: "Tool model missing",
    items: [
      ["040", "Mainboard M31", "PST-MB-M31-009", "Vacuum pick head", "TL-VAC-TBD", "Tool model missing"],
      ["040", "Board placement guide", "FX-BD-GD-003", "Board guide fixture", "FX-BD-GD-003", "Matched"],
      ["040", "Display connector tape", "PST-TAPE-AC-044", "ESD tweezer", "TL-TW-ESD-002", "Matched"],
    ],
  },
  {
    station: "ST04",
    title: "Battery pack + speaker module",
    status: "Matched",
    items: [
      ["050", "Battery pack M44", "PST-BAT-M44-006", "Battery tray guide", "FX-BAT-002", "Matched"],
      ["050", "Battery screw set", "SCR-M2-025-SLV", "T03 Torque driver", "TL-TQ-003", "Matched"],
      ["080", "Speaker module L/R", "PST-SPK-LR-012", "Speaker assist fixture", "FX-SPK-004", "Matched"],
    ],
  },
  {
    station: "ST05",
    title: "Fan sensor + labels",
    status: "Matched",
    items: [
      ["060", "Fan cable M21", "PST-FAN-CBL-021", "Nylon probe", "TL-NP-007", "Matched"],
      ["060", "Thermal sensor label", "LBL-THM-044", "Label jig", "FX-LBL-006", "Matched"],
      ["090", "Regulatory label", "LBL-REG-018", "Label jig", "FX-LBL-006", "Datum rule review"],
    ],
  },
  {
    station: "ST06",
    title: "Final visual inspection",
    status: "Camera coverage missing",
    items: [
      ["070", "Inspection template", "Q-TPL-FVI-070", "Vision camera", "EQ-CAM-TBD", "Camera coverage missing"],
      ["070", "CTQ checklist", "Q-CHK-CTQ-017", "Inspection light", "EQ-LGT-001", "Matched"],
    ],
  },
];

const outputs = {
  mi: "",
  balance: `
    <div class="balance-bars">
      <div class="balance-row"><b>ST01</b><div class="bar"><span style="width:86%"></span></div><span>86%</span></div>
      <div class="balance-row"><b>ST02</b><div class="bar warn"><span style="width:97%"></span></div><span>97%</span></div>
      <div class="balance-row"><b>ST03</b><div class="bar"><span style="width:78%"></span></div><span>78%</span></div>
      <div class="balance-row"><b>ST04</b><div class="bar"><span style="width:72%"></span></div><span>72%</span></div>
      <div class="balance-row"><b>ST05</b><div class="bar"><span style="width:61%"></span></div><span>61%</span></div>
    </div>
  `,
  layout: `
    <div class="layout-grid">
      <div class="layout-station"><b>ST01</b><span>Cover removal + thermal module</span></div>
      <div class="layout-station"><b>ST02</b><span>Cable routing + CTQ image</span></div>
      <div class="layout-station"><b>ST03</b><span>Mainboard placement</span></div>
      <div class="layout-station"><b>ST04</b><span>Battery + screw lock</span></div>
      <div class="layout-station"><b>ST05</b><span>Fan connector</span></div>
      <div class="layout-station"><b>ST06</b><span>Visual inspection</span></div>
      <div class="layout-station"><b>Rework</b><span>Thermal / cable issues</span></div>
      <div class="layout-station"><b>Buffer</b><span>WIP max 8 units</span></div>
    </div>
  `,
  hc: `
    <div class="hc-grid">
      <div class="hc-card"><b>2.0 HC</b><span>ST01 Thermal + cover</span></div>
      <div class="hc-card"><b>1.5 HC</b><span>ST02 Cable routing</span></div>
      <div class="hc-card"><b>1.0 HC</b><span>ST03 Mainboard</span></div>
      <div class="hc-card"><b>1.0 HC</b><span>ST04 Battery</span></div>
      <div class="hc-card"><b>0.5 HC</b><span>ST05 Connector</span></div>
      <div class="hc-card"><b>1.0 HC</b><span>ST06 Inspection</span></div>
      <div class="hc-card"><b>7.0 HC</b><span>Total suggested headcount</span></div>
      <div class="hc-card"><b>+0.5 HC</b><span>AI recommends buffer for ST02</span></div>
    </div>
  `,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const refs = {
  rows: $("#stepRows"),
  title: $("#stageTitle"),
  description: $("#stageDescription"),
  twinTitle: $("#twinTitle"),
  twinDescription: $("#twinDescription"),
  twinStatus: $("#twinStatus"),
  twinCanvas: $("#twinCanvas"),
  studioGrid: $("#studioGrid"),
  verticalResizeBar: $("#verticalResizeBar"),
  sidebarResizeBar: $("#sidebarResizeBar"),
  horizontalResizeBar: $("#horizontalResizeBar"),
  sideTitle: $("#sideTitle"),
  sideDescription: $("#sideDescription"),
  processStack: $("#processStack"),
  pressureTitle: $("#pressureTitle"),
  stationRadar: $("#stationRadar"),
  artifactTitle: $("#artifactTitle"),
  artifactStrip: $("#artifactStrip"),
  editorContext: $("#editorContext"),
  tableHead: $("thead tr"),
  search: $(".search"),
  aiStepTitle: $("#aiStepTitle"),
  confidence: $("#confidence"),
  aiReason: $("#aiReason"),
  missingTitle: $("#missingTitle"),
  missingList: $("#missingList"),
  evidenceTitle: $("#evidenceTitle"),
  evidenceList: $("#evidenceList"),
  output: $("#outputContent"),
  saveDraft: $("#saveDraftBtn"),
  continue: $("#continueBtn"),
};

let selectedStepId = "010";
let selectedMacroStepId = "010";
let selectedPartArea = "";
let selectedStationId = "ST01";
let activeStationPlanId = "planA";
let stationViewMode = "plan";
let selectedMappingId = "";
let currentStageKey = "inputs";
let microTableFilter = "All Micro";
const microColumnFilters = {
  processStep: "",
  microStep: "",
  description: "",
};
let draggedSopStepId = "";
let draggedMicroStep = null;
let resizingParseCanvas = false;
let resizingSidebar = false;
let resizingHorizontalPanels = false;
let sopAddPanelOpen = false;
let ctInputMode = "ct";
const ctCalculatorState = {
  targetCt: 58,
  totalHc: 7,
  dailyVolume: 18000,
  shiftCount: 2,
  shiftHours: 8,
  oee: 85,
};
const draftSavedByStage = {
  parse: false,
  steps: false,
  time: false,
  station: false,
  mapping: false,
};
const expandedStations = {};
const expandedStationWorkflows = {};
const microChangeStats = {
  added: 0,
  deleted: 0,
  moved: 0,
};
const sopStepDraft = {
  process: "",
  detail: "",
  station: "TBD area",
  ct: "0s",
  status: "Needs Review",
  risk: "Low",
  mtm: "TBD",
  tooling: "TBD",
  material: "TBD",
};

function setText(node, value) {
  if (node) node.textContent = value;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatStepId(id) {
  const numeric = Number(id);
  if (!Number.isFinite(numeric)) return id;
  return String(Math.max(1, Math.round(numeric / 10))).padStart(2, "0");
}

function formatStepNumber(id) {
  return String(Number(formatStepId(id)) || formatStepId(id));
}

function formatProcessStepLabel(macro) {
  return `${formatStepNumber(macro.id)}. ${macro.title}`;
}

function getMacroStep(id = selectedMacroStepId) {
  return sopMacroSteps.find((step) => step.id === id) || sopMacroSteps[0];
}

function getMicroTotal(macroStep) {
  return macroStep.microSteps.reduce((total, item) => total + item[2], 0);
}

function getPartAreaGroups() {
  const groups = [];
  sopMacroSteps.forEach((step) => {
    let group = groups.find((item) => item.area === step.station);
    if (!group) {
      group = { area: step.station, steps: [] };
      groups.push(group);
    }
    group.steps.push(step);
  });
  return groups;
}

function getSelectedPartAreaGroup() {
  const groups = getPartAreaGroups();
  if (!selectedPartArea || !groups.some((group) => group.area === selectedPartArea)) {
    selectedPartArea = groups[0]?.area || "";
  }
  return groups.find((group) => group.area === selectedPartArea) || groups[0];
}

function getReviewMicroCount(stepsForArea) {
  return stepsForArea.flatMap((step) => step.microSteps).filter((item) => getMicroReviewState(item[3]) === "Edit").length;
}

function getStepTableStageKey() {
  return currentStageKey === "parse" ? "parse" : "steps";
}

function addMicroStep() {
  const macro = getMacroStep();
  macro.microSteps.push(["New step", "TBD", 3, "Edit", 3, "added"]);
  microChangeStats.added += 1;
  renderStage(getStepTableStageKey());
  showToast(`Micro step added to Step ${formatStepId(macro.id)}`);
}

function deleteMicroStep(index, macroId = selectedMacroStepId) {
  const macro = getMacroStep(macroId);
  if (index < 0 || index >= macro.microSteps.length) return;
  macro.microSteps.splice(index, 1);
  microChangeStats.deleted += 1;
  selectedMacroStepId = macro.id;
  renderStage(getStepTableStageKey());
  showToast(`Micro step deleted from Step ${formatStepId(macro.id)}`);
}

function confirmMicroStep(index, macroId = selectedMacroStepId) {
  const macro = getMacroStep(macroId);
  if (index < 0 || index >= macro.microSteps.length) return;
  macro.microSteps[index][3] = "Confirm";
  selectedMacroStepId = macro.id;
  renderStage(getStepTableStageKey());
  showToast(`Micro step ${formatStepId(macro.id)}.${String(index + 1).padStart(2, "0")} confirmed`);
}

function updateMicroStepFromField(field) {
  const macro = getMacroStep(field.dataset.macroId || selectedMacroStepId);
  const index = Number(field.dataset.microIndex);
  const fieldIndex = Number(field.dataset.microField);
  if (!macro.microSteps[index] || !Number.isFinite(fieldIndex)) return;
  const value = fieldIndex === 2 || fieldIndex === 4 ? Number(field.value) || 0 : field.value;
  macro.microSteps[index][fieldIndex] = value;
  selectedMacroStepId = macro.id;
  renderStage(getStepTableStageKey());
}

function updateStationStepRisk(field) {
  const macro = getMacroStep(field.dataset.macroId || "");
  const index = Number(field.dataset.microIndex);
  if (!macro?.microSteps[index]) return;
  macro.microSteps[index][6] = field.value;
}

function getMicroAutomation(microStep) {
  return microStep[7] === "A" ? "A" : "M";
}

function getAutomationMicroRows() {
  return sopMacroSteps.flatMap((macro) =>
    macro.microSteps
      .map((microStep, index) => ({ macro, microStep, index }))
      .filter(({ microStep }) => getMicroAutomation(microStep) === "A"),
  );
}

function getStationMicroSteps(station, stepId) {
  const macro = getMacroStep(stepId);
  const detailedSteps = macro?.microSteps || [];
  return detailedSteps
    .map((microStep, index) => ({ microStep, index }))
    .filter(({ microStep }) => getMicroAutomation(microStep) === (station.automation ? "A" : "M"));
}

function updateStationTiming(station) {
  const total = station.steps.reduce((sum, stepId) => {
    return sum + getStationMicroSteps(station, stepId).reduce((stepSum, { microStep, index }) => stepSum + getActualPt(microStep, index), 0);
  }, 0);
  station.time = Math.round(total);
  station.state = station.time > 58 ? "over" : station.time === 0 ? "light" : "ok";
}

function syncAutomationStation() {
  const stations = getActiveStations();
  const automationRows = getAutomationMicroRows();
  const automationStepIds = Array.from(new Set(automationRows.map(({ macro }) => macro.id)));
  const existing = stations.find((station) => station.automation);
  if (!automationStepIds.length) {
    if (existing) {
      const index = stations.indexOf(existing);
      stations.splice(index, 1);
      if (selectedStationId === existing.id) selectedStationId = stations[0]?.id || "";
    }
    return;
  }

  const station =
    existing ||
    (() => {
      const created = {
        id: "AUTO",
        time: 0,
        hc: "0.0",
        state: "ok",
        steps: [],
        note: "Automation station",
        issue: "All A steps are grouped together",
        automation: true,
      };
      const baseline = stationSnapshot(created);
      created.aiBaseline = { ...baseline };
      created.lastSubmitted = { ...baseline };
      created.trace = [];
      created.editing = false;
      created.override = false;
      stations.unshift(created);
      return created;
    })();

  station.steps = automationStepIds;
  station.note = "Automation station";
  station.issue = `${automationRows.length} auto detailed step(s) grouped as one station`;
  station.hc = "0.0";
  updateStationTiming(station);
}

function syncStationAutomationGrouping() {
  syncAutomationStation();
}

function getMicroFlags(microStep) {
  return String(microStep[5] || "")
    .split("|")
    .map((flag) => flag.trim())
    .filter(Boolean);
}

function hasMicroFlag(microStep, flag) {
  return getMicroFlags(microStep).includes(flag);
}

function markMicroFlag(microStep, flag) {
  const flags = new Set(getMicroFlags(microStep));
  flags.add(flag);
  microStep[5] = Array.from(flags).join("|");
}

function swapMicroSteps(sourceMacroId, sourceIndex, targetMacroId, targetIndex) {
  const sourceMacro = getMacroStep(sourceMacroId);
  const targetMacro = getMacroStep(targetMacroId);
  if (!sourceMacro || !targetMacro || sourceIndex < 0 || targetIndex < 0) return;
  if (!sourceMacro.microSteps[sourceIndex] || !targetMacro.microSteps[targetIndex]) return;
  if (sourceMacro.id === targetMacro.id && sourceIndex === targetIndex) return;
  const sourceMicro = sourceMacro.microSteps[sourceIndex];
  const targetMicro = targetMacro.microSteps[targetIndex];
  sourceMacro.microSteps[sourceIndex] = targetMicro;
  targetMacro.microSteps[targetIndex] = sourceMicro;
  markMicroFlag(sourceMacro.microSteps[sourceIndex], "moved");
  markMicroFlag(targetMacro.microSteps[targetIndex], "moved");
  microChangeStats.moved += 2;
  selectedMacroStepId = targetMacro.id;
  renderStage(getStepTableStageKey());
  showToast("Two steps swapped and marked moved");
}

function getMicroReviewState(status) {
  if (status === "Needs Review" || status === "Edit") return "Edit";
  return "Confirm";
}

function getMicroPt(microStep, microIndex) {
  return microStep[2] || [3, 2, 1][microIndex % 3];
}

function getActualPt(microStep, microIndex) {
  return microStep[4] || getMicroPt(microStep, microIndex);
}

function getVolumeTargetCt() {
  const dailyVolume = Math.max(1, Number(ctCalculatorState.dailyVolume) || 1);
  const shiftCount = Math.max(1, Number(ctCalculatorState.shiftCount) || 1);
  const shiftHours = Math.max(0.1, Number(ctCalculatorState.shiftHours) || 0.1);
  const oeeRatio = Math.max(0.01, Math.min(1, (Number(ctCalculatorState.oee) || 1) / 100));
  const availableSeconds = shiftCount * shiftHours * 3600 * oeeRatio;
  return availableSeconds / dailyVolume;
}

function microMatchesFilter(microStep) {
  if (microTableFilter === "edit") return getMicroReviewState(microStep[3]) === "Edit";
  if (microTableFilter === "moved") return hasMicroFlag(microStep, "moved");
  return true;
}

function microMatchesSearch(macro, microStep, microIndex) {
  const query = refs.search?.value.trim().toLowerCase() || "";
  if (!query) return true;
  const stepNo = `step ${formatStepId(macro.id)}`;
  const processStep = formatProcessStepLabel(macro);
  const microNo = `${formatStepId(macro.id)}.${String(microIndex + 1).padStart(2, "0")}`;
  return [stepNo, processStep, microNo, macro.title, macro.station, microStep[0]]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));
}

function microMatchesColumnFilters(macro, microStep, microIndex) {
  const stepNo = formatProcessStepLabel(macro);
  const microNo = `${formatStepId(macro.id)}.${String(microIndex + 1).padStart(2, "0")}`;
  return (
    (!microColumnFilters.processStep || stepNo === microColumnFilters.processStep) &&
    (!microColumnFilters.microStep || microNo === microColumnFilters.microStep) &&
    (!microColumnFilters.description || microStep[0] === microColumnFilters.description)
  );
}

function renderFilterOptions(options, selectedValue) {
  return [`<option value="" ${selectedValue ? "" : "selected"}>All</option>`]
    .concat(
      options.map(
        (option) =>
          `<option value="${escapeHtml(option)}" ${selectedValue === option ? "selected" : ""}>${escapeHtml(option)}</option>`,
      ),
    )
    .join("");
}

function getSopStepTone(step) {
  if (step.missing?.length) return "review";
  return "done";
}

function getSopReviewState(step) {
  if (["Extracted", "Needs Review", "Confirmed"].includes(step.status)) return step.status;
  if (step.status === "Verified") return "Extracted";
  if (step.missing?.length) return "Needs Review";
  return "Extracted";
}

function getNextSopStepId() {
  const maxId = steps.reduce((max, step) => Math.max(max, Number(step.id) || 0), 0);
  return String(maxId + 10).padStart(3, "0");
}

function resetSopStepDraft() {
  sopStepDraft.process = "";
  sopStepDraft.detail = "";
  sopStepDraft.station = "TBD area";
  sopStepDraft.ct = "0s";
  sopStepDraft.status = "Needs Review";
  sopStepDraft.risk = "Low";
  sopStepDraft.mtm = "TBD";
  sopStepDraft.tooling = "TBD";
  sopStepDraft.material = "TBD";
}

function openSopStepDraft() {
  sopAddPanelOpen = true;
  renderParsePanel();
}

function closeSopStepDraft() {
  sopAddPanelOpen = false;
  resetSopStepDraft();
  renderParsePanel();
}

function updateSopStepDraft(field) {
  const key = field.dataset.draftField || field.dataset.field;
  if (key) sopStepDraft[key] = field.value;
}

function syncSopStepDraftFromForm() {
  refs.evidenceList?.querySelectorAll("[data-draft-field]").forEach((field) => updateSopStepDraft(field));
}

function generateSopStepFromDraft(event) {
  event?.target?.blur();
  syncSopStepDraftFromForm();
  const id = getNextSopStepId();
  const process = sopStepDraft.process.trim() || "New manual SOP step";
  const detail = sopStepDraft.detail.trim() || "Describe the added assembly action, method, and required evidence.";
  steps.push({
    id,
    process,
    detail,
    station: sopStepDraft.station.trim() || "ST--",
    ct: sopStepDraft.ct.trim() || "0s",
    mtm: sopStepDraft.mtm.trim() || "TBD",
    tooling: sopStepDraft.tooling.trim() || "TBD",
    material: sopStepDraft.material.trim() || "TBD",
    risk: sopStepDraft.risk,
    status: sopStepDraft.status,
    confidence: "Manual",
    reason: "This step was added manually during SOP structure review and needs AI / ME confirmation.",
    missing: ["Confirm station, CT, MTM code, tooling, and material mapping"],
    evidence: ["Manual SOP flow edit"],
  });
  selectedStepId = id;
  sopAddPanelOpen = false;
  resetSopStepDraft();
  renderStage("parse");
  showToast(`Step ${formatStepId(id)} added to SOP flow`);
}

function moveSopStep(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const sourceIndex = steps.findIndex((step) => step.id === sourceId);
  const targetIndex = steps.findIndex((step) => step.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  const [source] = steps.splice(sourceIndex, 1);
  steps.splice(targetIndex, 0, source);
  selectedStepId = source.id;
  renderStage(getStepTableStageKey());
  showToast(`Step ${formatStepId(source.id)} moved in SOP flow`);
}

function deleteSopStep(stepId) {
  const index = steps.findIndex((step) => step.id === stepId);
  if (index < 0) return;
  const [removed] = steps.splice(index, 1);
  selectedStepId = steps[Math.max(0, index - 1)]?.id || steps[0]?.id || "";
  renderStage("parse");
  showToast(`Step ${formatStepId(removed.id)} deleted`);
}

function updateSopStepFromField(field) {
  const step = getStepById(field.dataset.stepId);
  if (!step) return;
  step[field.dataset.field] = field.value;
  selectedStepId = step.id;
  renderRows();
  renderParsePanel();
}

function updateWorkflowFromField(field) {
  const step = getStepById(field.dataset.stepId);
  const macro = getMacroStep(field.dataset.stepId);
  const key = field.dataset.field;
  if (!step) return;
  step[key] = field.value;
  if (macro && key === "process") macro.title = field.value;
  if (macro && key === "station") macro.station = field.value;
  selectedStepId = step.id;
  selectedMacroStepId = step.id;
}

function scrollSelectedSopStepIntoView() {
  const card = refs.twinCanvas?.querySelector(`.sop-step-card[data-step-id="${selectedStepId}"]`);
  const track = refs.twinCanvas?.querySelector(".sop-step-track");
  if (!card || !track) return;
  const targetLeft = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
  track.scrollTo?.({ left: Math.max(0, targetLeft), behavior: "smooth" });
}

function getStepTimingMeta(stepId) {
  const macroStep = sopMacroSteps.find((item) => item.id === stepId);
  if (!macroStep) return { count: "—", time: "—" };
  return { count: macroStep.microSteps.length, time: `${getMicroTotal(macroStep)}s` };
}

function getStepById(id) {
  return steps.find((step) => step.id === id);
}

function getStationDraft(id = selectedStationId) {
  if (!id) return null;
  return getActiveStations().find((station) => station.id === id) || null;
}

function getActiveStations() {
  return activeStationPlanId === "planB" ? stationPlanB : stationDraft;
}

function getStationPlanSummary(planId) {
  const stations = planId === "planB" ? stationPlanB : stationDraft;
  const targetCt = Number(ctCalculatorState.targetCt) || 58;
  const totalHc = stations.reduce((total, station) => total + Number(station.hc), 0);
  const totalWorkContent = stations.reduce((total, station) => total + Number(station.time), 0);
  const lbe = totalHc ? (totalWorkContent / (totalHc * targetCt)) * 100 : 0;
  return {
    ...stationPlanMeta[planId],
    id: planId,
    stations,
    totalHc,
    totalWorkContent,
    lbe,
    targetCt,
  };
}

function selectStationPlan(planId) {
  if (!stationPlanMeta[planId]) return;
  activeStationPlanId = planId;
  const stations = getActiveStations();
  selectedStationId = stations.some((station) => station.id === selectedStationId) ? selectedStationId : stations[0]?.id || "";
  renderStage("station");
}

function setStationViewMode(mode) {
  stationViewMode = mode === "kpi" ? "kpi" : "plan";
  renderStage("station");
}

function renderStationPlanCards() {
  return `
    <div class="station-plan-grid">
      ${Object.keys(stationPlanMeta)
        .map((planId) => {
          const summary = getStationPlanSummary(planId);
          return `
            <button class="station-plan-card ${planId === activeStationPlanId ? "active" : ""}" type="button" data-action="select-station-plan" data-plan-id="${planId}">
              <span>${summary.name}</span>
              <strong>${summary.label}</strong>
              <small>${summary.description}</small>
              <em>${summary.lbe.toFixed(1)}% LBE · ${summary.stations.length} stations · ${summary.totalHc.toFixed(1)} HC</em>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function getStationKpiRows() {
  const targetCt = Number(ctCalculatorState.targetCt) || 58;
  const stations = getActiveStations();
  const rows = stations.map((station) => {
    const ct = Math.max(0, Number(station.time) || 0);
    const hc = Math.max(0, Number(station.hc) || 0);
    return { station, ct, hc };
  });
  const maxHc = Math.max(1, ...rows.map((row) => row.hc));
  return rows.map((row) => ({
    ...row,
    ctPct: Math.min(120, (row.ct / Math.max(1, targetCt)) * 100),
    ctOverTarget: row.ct > targetCt,
    hcPct: Math.min(100, (row.hc / maxHc) * 100),
  }));
}

function getLineKpiSummary() {
  const summary = getStationPlanSummary(activeStationPlanId);
  const stations = getActiveStations();
  const targetCt = Number(ctCalculatorState.targetCt) || 58;
  const bottleneckCt = stations.reduce((max, station) => Math.max(max, Number(station.time) || 0), 0);
  const lineUpph = bottleneckCt ? 3600 / bottleneckCt : 0;
  const overTargetCount = stations.filter((station) => (Number(station.time) || 0) > targetCt).length;
  return {
    ...summary,
    bottleneckCt,
    lineUpph,
    overTargetCount,
  };
}

function getMappingRow(id = selectedMappingId) {
  if (!id) return null;
  return mappingRows.find((row) => row.id === id) || null;
}

const defaultTwinCanvas = `
  <img src="assets/laptop-assembly-preview.png" alt="Exploded laptop assembly CAD preview" />
  <div class="callout callout-a"><b>Thermal module</b><span>Step 020 · fixture missing</span></div>
  <div class="callout callout-b"><b>Display cable</b><span>CTQ photo required</span></div>
  <div class="callout callout-c"><b>Battery pack</b><span>Dependency locked</span></div>
`;

function renderInputCanvas() {
  const uploadSlots = [
    {
      title: "Historical MI Input",
      detail: "Upload previous MI package for process structure, work instructions, images and CTQ references.",
      action: "Upload Historical MI",
      accept: ".ppt,.pptx,.pdf,.xlsx,.xls,.csv,.zip",
      status: "Loaded sample",
      source: "Historical MI",
    },
    {
      title: "Assembly Video",
      detail: "Upload assembly operation videos so AI can extract actions, parts, notes and gaps.",
      action: "Upload Assembly Video",
      accept: ".mp4,.mov,.avi,.mkv,.webm",
      status: "Loaded sample",
      source: "Assembly Video",
    },
    {
      title: "MTM / History Input",
      detail: "Upload MTM timing, previous line balance or historical station arrangement.",
      action: "Upload MTM / History",
      accept: ".xlsx,.xls,.csv,.json",
      status: "Optional but useful",
      source: "MTM Database",
    },
  ];

  return `
    <div class="input-intake-board">
      <section class="input-intake-hero">
        <div>
          <span class="input-kicker">Input Intake Board</span>
          <h3>Upload inputs to generate the new SOP draft</h3>
          <p>This is the input entry point. Upload historical MI, assembly videos, and MTM / historical layout first; the next page shows the AI-generated SOP.</p>
        </div>
        <div class="input-start-card">
          <strong>Start Parsing</strong>
          <span>Use uploaded files to generate Page 02 SOP draft</span>
          <button type="button">Parse Uploaded Inputs</button>
        </div>
      </section>

      <section class="upload-slot-grid">
        ${uploadSlots
          .map(
            (slot, index) => {
              const source = inputSources.find((item) => item.source === slot.source);
              return `
              <article class="upload-slot-card ${source?.tone || ""}">
                <div>
                  <b>${slot.title}</b>
                  <span>${slot.detail}</span>
                </div>
                <label class="upload-action">
                  <input type="file" accept="${slot.accept}" data-upload-slot="${index}" />
                  <span>${slot.action}</span>
                </label>
                <small>${slot.status}${source?.issue ? ` · ${source.issue}` : ""}</small>
              </article>
            `;
            },
          )
          .join("")}
      </section>

      <section class="upload-note-strip">
        <span>Optional: Human Rule List and Mapping Table can be added later. Missing mapping will stay as review items downstream.</span>
      </section>
    </div>
  `;
}

function renderSopFlowCanvas() {
  return `
  <div class="sop-flow-board">
    <div class="sop-step-track">
      ${steps
          .map((step, index) => {
            return `
              <article class="sop-step-card ${getSopStepTone(step)} ${step.id === selectedStepId ? "active" : ""}" data-step-id="${step.id}">
                <div class="sop-step-card-head" draggable="true" data-step-id="${step.id}">
                  <button class="sop-drag-handle" type="button" title="Drag to reorder">DRAG</button>
                  <small>Step ${formatStepId(step.id)}</small>
                  <button class="sop-delete-step" type="button" data-action="delete-sop-step" data-step-id="${step.id}" title="Delete step">Delete</button>
            </div>
                <div class="sop-step-source"><b>Part area</b><span>${escapeHtml(step.station)}</span></div>
                <label class="sop-field-label">Process Workflow</label>
                <input class="sop-step-input sop-step-title" data-step-id="${step.id}" data-field="process" value="${escapeHtml(step.process)}" />
                <label class="sop-field-label">Workflow Description</label>
                <textarea class="sop-step-input" data-step-id="${step.id}" data-field="detail" rows="3">${escapeHtml(step.detail)}</textarea>
                <div class="sop-step-meta-edit">
                  <label>Part Area<input class="sop-step-input" data-step-id="${step.id}" data-field="station" value="${escapeHtml(step.station)}" /></label>
                  <label>Review<select class="sop-step-input" data-step-id="${step.id}" data-field="status">
                    ${["Extracted", "Needs Review", "Confirmed"].map((status) => `<option value="${status}" ${getSopReviewState(step) === status ? "selected" : ""}>${status}</option>`).join("")}
                  </select></label>
                </div>
              </article>
            `;
          })
        .join("")}
    </div>
  </div>
`;
}

function renderStepTimingCanvas() {
  const selectedMacro = getMacroStep();

  return `
    <div class="timing-board">
      <section class="area-step-list sop-action-list">
        <div class="area-step-list-head">
          <b>SOP Actions</b>
          <span>${sopMacroSteps.length} actions</span>
      </div>
        <div class="area-step-grid">
        ${sopMacroSteps
          .map(
              (step) => `
                <button class="area-step-card ${step.id === selectedMacro.id ? "active" : ""}" data-sop-id="${step.id}">
                  <span>Step ${formatStepId(step.id)}</span>
                  <b>${escapeHtml(step.title)}</b>
                  <i>${step.microSteps.length} micro · ${step.microSteps.filter((item) => getMicroReviewState(item[3]) === "Edit").length} edit · ${escapeHtml(step.station)}</i>
              </button>
            `,
          )
          .join("")}
      </div>
      </section>
    </div>
  `;
}

function renderHumanGateCanvas() {
  return `
    <div class="human-gate-board">
      <div class="human-input-grid">
        ${humanInputSections
          .map((section) => {
            const recorded = section.status === "Ready" && section.value.trim();
            const draftSaved = section.status === "Draft" && section.value.trim();
            const feedback = recorded
              ? "Recorded for CT calculation"
              : draftSaved
                ? "Saved locally · pending submit"
                : "Required before CT calculation";
            return `
              <section class="human-input-card ${section.status.toLowerCase()} ${recorded ? "recorded" : ""}" data-input-id="${section.id}">
                <div class="human-input-head"><span>${section.id}</span><b>${section.title}</b><em>${recorded ? "Ready" : draftSaved ? "Draft saved" : section.status}</em></div>
                <p>${section.detail}</p>
                <textarea rows="3" data-input-id="${section.id}" placeholder="${section.placeholder}" ${recorded ? "readonly" : ""}>${section.value}</textarea>
                <small class="input-feedback">${feedback}</small>
              </section>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderCtCanvas() {
  const totalProcessTime = 354;
  const targetCt = Number(ctCalculatorState.targetCt) || 1;
  const totalHc = Number(ctCalculatorState.totalHc) || 1;
  const calculatedHc = Math.ceil(totalProcessTime / targetCt);
  const calculatedCt = totalProcessTime / totalHc;
  const volumeTargetCt = getVolumeTargetCt();
  return `
    <div class="ct-board">
      <section class="ct-simple-calculator">
        <div class="ct-simple-head">
          <div>
            <b>Calculator</b>
            <span>Use CT, HC, or volume assumptions to calculate the balancing target.</span>
          </div>
          <em>Total process time ${totalProcessTime}s</em>
        </div>
        <div class="ct-method-stack">
          <section class="ct-method-section">
            <div class="ct-method-title"><b>Method 1</b><span>Use process time to calculate CT or HC</span></div>
            <div class="ct-mode-grid">
              <article class="ct-mode-card ${ctInputMode === "ct" ? "active" : ""}">
                <label><span>Input Target CT (secs)</span><input class="ct-calc-input" type="number" min="1" step="1" data-ct-field="targetCt" value="${ctCalculatorState.targetCt}" /></label>
                <div class="ct-result-box"><span>Generated Total HC</span><strong data-ct-result="hc">${calculatedHc.toFixed(1)}</strong><small data-ct-formula="hc">${totalProcessTime}s / ${targetCt}s</small></div>
              </article>
              <article class="ct-mode-card ${ctInputMode === "hc" ? "active" : ""}">
                <label><span>Input Total HC</span><input class="ct-calc-input" type="number" min="1" step="1" data-ct-field="totalHc" value="${ctCalculatorState.totalHc}" /></label>
                <div class="ct-result-box"><span>Generated CT (secs)</span><strong data-ct-result="ct">${calculatedCt.toFixed(1)}</strong><small data-ct-formula="ct">${totalProcessTime}s / ${totalHc} HC</small></div>
              </article>
            </div>
      </section>
          <section class="ct-method-section">
            <div class="ct-method-title"><b>Method 2</b><span>Use customer volume assumptions to generate target CT</span></div>
            <article class="ct-mode-card ct-volume-card ${ctInputMode === "volume" ? "active" : ""}">
              <div class="ct-volume-inputs">
                <label><span>Daily Volume</span><input class="ct-calc-input ct-volume-input" type="number" min="1" step="1" data-ct-field="dailyVolume" value="${ctCalculatorState.dailyVolume}" /></label>
                <label><span>Shift / Hours</span><div class="ct-shift-pair"><input class="ct-calc-input ct-volume-input" type="number" min="1" step="1" data-ct-field="shiftCount" value="${ctCalculatorState.shiftCount}" /><b>×</b><input class="ct-calc-input ct-volume-input" type="number" min="0.1" step="0.5" data-ct-field="shiftHours" value="${ctCalculatorState.shiftHours}" /></div></label>
                <label><span>OEE (%)</span><input class="ct-calc-input ct-volume-input" type="number" min="1" max="100" step="1" data-ct-field="oee" value="${ctCalculatorState.oee}" /></label>
              </div>
              <div class="ct-result-box"><span>Generated Target CT (secs)</span><strong data-ct-result="volumeCt">${volumeTargetCt.toFixed(1)}</strong><small data-ct-formula="volumeCt">${ctCalculatorState.shiftCount} × ${ctCalculatorState.shiftHours}h × 3600 × ${ctCalculatorState.oee}% / ${ctCalculatorState.dailyVolume}</small></div>
            </article>
          </section>
        </div>
        <div class="ct-simple-formula">
          <span>Formula</span>
          <b>Total HC = Total Process Time / CT</b>
          <b>CT = Total Process Time / Total HC</b>
          <b>CT = Available Production Time × OEE / Daily Volume</b>
        </div>
      </section>
    </div>
  `;
}

function renderStationWorkflowDetails(station) {
  const rows = station.steps.flatMap((stepId) => {
    const macro = getMacroStep(stepId);
    const aiStep = getStepById(stepId);
    return getStationMicroSteps(station, stepId).map(({ microStep, index }) => ({
      stepId,
      macro,
      aiStep,
      microStep,
      index,
    }));
  });

  return `
    <section class="station-workflow-details">
      <div class="station-workflow-expanded">
        <div class="station-workflow-head"><span>Step</span><span>Automation</span><span>Step Description</span><span>Part</span><span>Theoretical PT (secs)</span><span>Actual PT (secs)</span></div>
        ${
          rows.length
            ? rows
                .map(({ stepId, macro, aiStep, microStep, index }) => {
                  const part = aiStep?.material || macro?.station || "TBD";
                  return `
                    <div class="station-workflow-step">
                      <span><b>${formatStepId(stepId)}.${String(index + 1).padStart(2, "0")}</b></span>
                      <span><em class="automation-chip ${getMicroAutomation(microStep) === "A" ? "auto" : ""}">${getMicroAutomation(microStep)}</em></span>
                      <span>${escapeHtml(microStep[0])}</span>
                      <span>${escapeHtml(part)}</span>
                      <span>${getMicroPt(microStep, index)}</span>
                      <span>${getActualPt(microStep, index)}</span>
                    </div>
                  `;
                })
                .join("")
            : `<div class="station-workflow-empty">No detailed steps assigned yet.</div>`
        }
      </div>
    </section>
  `;
}

function renderStationCanvas() {
  syncStationAutomationGrouping();
  const stations = getActiveStations();
  const activeSummary = getStationPlanSummary(activeStationPlanId);

  return `
    <div class="station-board">
      <section class="station-edit-workspace">
        ${renderStationPlanCards()}
        <div class="station-line-balance-summary">
          <span>Line Balance Efficiency</span>
          <strong>${activeSummary.lbe.toFixed(1)}%</strong>
        </div>
        <div class="station-table-toolbar">
          <button class="station-table-action primary" type="button" data-action="add-station">+ Add Station</button>
          <select class="station-delete-select" data-action="select-delete-station">
            <option value="">Select station to delete</option>
            ${stations.map((station) => `<option value="${station.id}" ${selectedStationId === station.id ? "selected" : ""} ${station.automation ? "disabled" : ""}>${station.id} · ${station.note}</option>`).join("")}
          </select>
          <button class="station-table-action danger" type="button" data-action="delete-station" ${selectedStationId ? "" : "disabled"}>Delete Station</button>
        </div>
        <div class="station-edit-head"><span>Station</span><span>Automation</span><span>Assigned steps</span><span>HC</span><span>Status / Trace</span></div>
        ${stations
          .map(
            (station) => {
              const disabled = station.editing ? "" : "disabled";
              const selected = station.id === selectedStationId;
              const stateClass = selected ? station.state : "";
              const isStationOpen = Boolean(expandedStations[station.id]);
              return `
              <section class="station-edit-row ${stateClass} ${station.automation ? "automation" : ""} ${station.override ? "override" : ""} ${station.editing ? "editing" : ""} ${selected ? "active" : ""}" data-station-id="${station.id}">
                <div class="station-code-cell">
                  <button class="station-expand-toggle" type="button" data-station-id="${station.id}" aria-label="Toggle station details">${isStationOpen ? "−" : "+"}</button>
                <input class="station-field station-code-field" data-field="id" value="${station.id}" ${disabled} />
                </div>
                <div class="station-automation-cell"><span class="automation-chip ${station.automation ? "auto" : ""}">${station.automation ? "A" : "M"}</span></div>
                <textarea class="station-field" rows="2" data-field="steps" ${disabled}>${station.steps.join(", ")}</textarea>
                <input class="station-field station-hc-field" data-field="hc" value="${station.hc}" ${disabled} />
                <div class="station-edit-actions">
                  <div class="station-action-row">
                    <button class="station-action" data-action="edit" type="button">${station.editing ? "Editing" : "Edit"}</button>
                    <button class="station-action submit" data-action="submit" type="button">Confirm</button>
                  </div>
                </div>
              </section>
              ${isStationOpen ? renderStationWorkflowDetails(station) : ""}
            `;
            },
          )
          .join("")}
      </section>
      <div class="station-edit-footer"><span>Station time is recalculated from locked step time after assignment changes.</span><b>Total HC ${activeSummary.totalHc.toFixed(1)}</b></div>
        </div>
  `;
}

function renderStationKpiCanvas() {
  const summary = getStationPlanSummary(activeStationPlanId);
  const targetCt = Number(ctCalculatorState.targetCt) || 58;
  const rows = getStationKpiRows();
  const maxCt = Math.max(targetCt, ...rows.map(({ ct }) => ct));
  const chartMax = Math.max(10, Math.ceil((maxCt * 1.15) / 10) * 10);
  const targetLineBottom = Math.min(100, (targetCt / chartMax) * 100);
  const yTicks = [chartMax, Math.round(chartMax * 0.75), Math.round(chartMax * 0.5), Math.round(chartMax * 0.25), 0];

  return `
    <div class="station-board station-kpi-board">
      <section class="station-edit-workspace">
        ${renderStationPlanCards()}
        <div class="station-line-balance-summary">
          <span>KPI Performance · ${summary.name}</span>
          <strong>${summary.lbe.toFixed(1)}%</strong>
        </div>
        <div class="station-ct-chart-card">
          <div class="station-ct-chart-head">
            <div>
              <b>Station CT Performance</b>
              <span>X-axis: station · Y-axis: CT (secs)</span>
            </div>
            <em>Target CT ${targetCt}s</em>
          </div>
          <div class="station-ct-chart">
            <div class="station-ct-y-axis">
              ${yTicks.map((tick) => `<span>${tick}s</span>`).join("")}
            </div>
            <div class="station-ct-plot" style="--target-line-bottom:${targetLineBottom}%;">
              <div class="station-ct-target-line"><span>Target CT ${targetCt}s</span></div>
              ${rows
                .map(({ station, ct, ctOverTarget }) => {
                  const height = Math.max(2, Math.min(100, (ct / chartMax) * 100));
                  return `
                    <article class="station-ct-bar ${ctOverTarget ? "over-target" : ""}" style="--bar-height:${height}%;">
                      <div class="station-ct-bar-track">
                        <i></i>
                      </div>
                      <strong>${ct.toFixed(0)}s</strong>
                      <span>${escapeHtml(station.id)}</span>
                    </article>
                  `;
                })
                .join("")}
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function getStationLayoutMeta(station) {
  if (!station.layoutWidth) station.layoutWidth = station.automation ? 2.4 : 0.9;
  if (!station.layoutDepth) station.layoutDepth = station.automation ? 1.4 : 0.9;
  if (!station.operatorSide) station.operatorSide = station.automation ? "Service side" : "Inside U";
  return {
    width: Number(station.layoutWidth) || 0.9,
    depth: Number(station.layoutDepth) || 0.9,
    operatorSide: station.operatorSide,
  };
}

function getLayoutStations() {
  syncStationAutomationGrouping();
  return getActiveStations().map((station) => {
    const meta = getStationLayoutMeta(station);
    return {
      station,
      ...meta,
      area: meta.width * meta.depth,
    };
  });
}

function renderLayoutStationCard({ station, width, depth, area }, index) {
  const scale = 58;
  const cardWidth = Math.max(116, Math.min(190, width * scale));
  const cardHeight = Math.max(78, Math.min(132, depth * scale));
  const riskClass = station.state === "over" ? "risk" : "";
  return `
    <article class="layout-station-card ${station.automation ? "auto" : ""} ${riskClass}" style="--station-card-w: ${cardWidth}px; --station-card-h: ${cardHeight}px;">
      <header>
        <b>${escapeHtml(station.id)}</b>
        <span class="automation-chip ${station.automation ? "auto" : ""}">${station.automation ? "A" : "M"}</span>
      </header>
      <strong>${escapeHtml(station.note)}</strong>
      <small>${width.toFixed(1)}m x ${depth.toFixed(1)}m · ${area.toFixed(1)}m²</small>
      <em>${index + 1}</em>
    </article>
  `;
}

function getLayoutStationGeometry({ station, width, depth }, index, bottomCount) {
  const squareSize = 86;
  const left = 104;
  const topY = 74;
  const positions = [
    { x: left, y: topY + squareSize * 2 },
    { x: left + squareSize, y: topY + squareSize * 2 },
    { x: left + squareSize * 2, y: topY + squareSize * 2 },
    { x: left + squareSize * 3, y: topY + squareSize },
    { x: left + squareSize * 2, y: topY },
    { x: left + squareSize, y: topY },
  ];
  const position = positions[index] || positions[positions.length - 1];
  const blockWidth = squareSize;
  const blockHeight = squareSize;
  return {
    x: position.x,
    y: position.y,
    blockWidth,
    blockHeight,
    centerX: position.x + blockWidth / 2,
    centerY: position.y + blockHeight / 2,
  };
}

function getLayoutPoint(index, total, bottomCount) {
  const cellW = 96;
  const cellH = 58;
  const left = 82;
  const topY = 28;
  const bottomY = 344;
  const sideIndex = bottomCount;
  const sideX = left + bottomCount * cellW;
  if (index < bottomCount) return { x: left + index * cellW + cellW / 2, y: bottomY - 64 };
  if (index === sideIndex) return { x: sideX - 38, y: (topY + cellH + bottomY) / 2 };
  const topVisualIndex = bottomCount - 1 - (index - sideIndex - 1);
  return { x: left + Math.max(0, topVisualIndex) * cellW + cellW / 2, y: topY + cellH + 64 };
}

function renderLayoutOperator({ station }, index, total, bottomCount) {
  if (station.automation) return "";
  const geometry = getLayoutStationGeometry({ station, width: station.layoutWidth || 0.9, depth: station.layoutDepth || 0.9 }, index, bottomCount);
  const operatorScale = 0.46;
  const bottomRow = index <= 2;
  const topRow = index >= 4;
  const x = bottomRow
    ? geometry.centerX
    : topRow
      ? geometry.centerX
      : geometry.x - 10;
  const y = bottomRow
    ? geometry.y - 7
    : topRow
      ? geometry.y + geometry.blockHeight + 18
      : geometry.centerY + 6;
            return `
    <g class="layout-operator-icon" transform="translate(${x} ${y}) scale(${operatorScale})">
      <circle cx="0" cy="-12" r="8"></circle>
      <path d="M -12 2 Q 0 -8 12 2"></path>
      <path d="M -10 10 Q 0 20 10 10"></path>
      <path d="M -15 5 L -5 12 M 15 5 L 5 12"></path>
    </g>
  `;
}

function renderLayoutStationBlock({ station, width, depth, area }, index, total, bottomCount) {
  const { x, y, blockWidth, blockHeight, centerX } = getLayoutStationGeometry({ station, width, depth }, index, bottomCount);
  const stateClass = station.automation ? "auto" : station.state === "over" ? "risk" : "manual";
  const selectedClass = station.id === selectedStationId ? "active" : "";

  return `
    <g class="layout-svg-station ${stateClass} ${selectedClass}" data-station-id="${escapeHtml(station.id)}" role="button" tabindex="0" aria-label="Show ${escapeHtml(station.id)} layout station information">
      <rect x="${x}" y="${y}" width="${blockWidth}" height="${blockHeight}" rx="0"></rect>
      <text x="${centerX}" y="${y + blockHeight / 2 - 5}" text-anchor="middle" class="station-id">${escapeHtml(station.id)}</text>
      <text x="${centerX}" y="${y + blockHeight / 2 + 14}" text-anchor="middle" class="station-size">${station.automation ? "A" : "M"} · ${width.toFixed(1)}x${depth.toFixed(1)}m</text>
    </g>
  `;
}

function renderLayoutConnectionBand(points) {
  if (points.length < 2) return "";
  const pointList = points.map((point) => `${point.x},${point.y}`).join(" ");
  return `<polyline class="layout-connection-band" points="${pointList}"></polyline>`;
}

function renderLayoutProcessSegments(points) {
  return points
    .slice(0, -1)
    .map((point, index) => {
      const next = points[index + 1];
      return `<line class="layout-process-segment" x1="${point.x}" y1="${point.y}" x2="${next.x}" y2="${next.y}"></line>`;
    })
    .join("");
}

function renderMappingCanvas() {
  const layoutStations = getLayoutStations();
  const bottomCount = Math.max(1, Math.ceil((layoutStations.length - 1) / 2));
  const floorWidth = 560;
  const floorHeight = 450;

  return `
    <div class="layout-page-board">
      <section class="layout-sketch-card">
        <div class="layout-sketch-head">
                  <div>
            <b>Drawing</b>
            <span>Station blocks are connected edge-to-edge in a U-shaped layout.</span>
                  </div>
          <em>Blueprint sketch</em>
                </div>
        <div class="layout-u-scroll">
          <svg class="layout-blueprint" viewBox="0 0 ${floorWidth} ${floorHeight}" role="img" aria-label="U-shaped station layout drawing">
              <rect class="layout-outer-border" x="22" y="18" width="${floorWidth - 44}" height="${floorHeight - 36}"></rect>
              ${layoutStations.map((item, index) => renderLayoutStationBlock(item, index, layoutStations.length, bottomCount)).join("")}
              ${layoutStations.map((item, index) => renderLayoutOperator(item, index, layoutStations.length, bottomCount)).join("")}
          </svg>
                  </div>
        <div class="layout-legend">
          <span><i class="manual"></i>Manual station</span>
          <span><i class="auto"></i>Automation station</span>
          <span><i class="warn"></i>Near / risk station</span>
                </div>
      </section>
    </div>
  `;
}

function stationStateLabel(state) {
  if (state === "over") return "Over CT";
  if (state === "light") return "Light load";
  return "Ready";
}

function getMacroStepById(stepId) {
  return sopMacroSteps.find((step) => step.id === stepId);
}

function getAiStepById(stepId) {
  return steps.find((step) => step.id === stepId);
}

function getStationMaterialList(stationId) {
  return stationMaterialLists.find((list) => list.station === stationId);
}

function getMiStationStepRows(station) {
  return station.steps.flatMap((stepId) => {
    const macro = getMacroStepById(stepId);
    const aiStep = getAiStepById(stepId);
    const partName = aiStep?.material || macro?.station || "TBD";
    const microRows = macro?.microSteps || [];
    if (!microRows.length) {
      return [
        {
          step: formatStepId(stepId),
          description: aiStep?.detail || station.note,
          partName,
          partNumber: `ASM-${formatStepId(stepId)}-000`,
        },
      ];
    }
    return microRows.map((microStep, index) => ({
      step: `${formatStepId(stepId)}.${String(index + 1).padStart(2, "0")}`,
      description: microStep[0],
      partName: microStep[8] || partName,
      partNumber: `ASM-${formatStepId(stepId)}-${String(index + 1).padStart(3, "0")}`,
    }));
  });
}

function getStationQualityRiskRows(station) {
  if (!Array.isArray(station.miQualityRisks)) station.miQualityRisks = ["", "", ""];
  while (station.miQualityRisks.length < 3) station.miQualityRisks.push("");
  return station.miQualityRisks.slice(0, 3);
}

function renderMiCanvas() {
  const targetCt = 58;
  const stations = getActiveStations();
  const allBomItems = stationMaterialLists.flatMap((station) => station.items);
  const reviewItems = allBomItems.filter((item) => item[5] !== "Matched");
  const totalHc = stations.reduce((sum, station) => sum + Number(station.hc), 0);

  return `
    <div class="mi-package-view">
      <section class="mi-package-header">
        <div>
          <span class="mi-kicker">Manufacturing Instruction · AI Draft</span>
          <h3>MI Package Preview</h3>
          <p>Rebuilt from generated steps, station layout, Station BOM List, and human input constraints. This page learns the MI information hierarchy without copying Excel.</p>
        </div>
        <div class="mi-release-summary">
          <b>Target CT 58s</b>
          <span>${stations.length} stations · ${sopMacroSteps.length} macro steps · ${totalHc.toFixed(1)} HC</span>
          <em>${reviewItems.length} BOM / tooling item(s) need confirmation</em>
        </div>
      </section>

      <section class="mi-document-fields">
        <div><span>Product</span><strong>XPS-14 Thermal Module Assembly</strong></div>
        <div><span>Revision</span><strong>Rev B03 · Draft</strong></div>
        <div><span>Source Alignment</span><strong>Steps + Station Draft + BOM List</strong></div>
        <div><span>Release Gate</span><strong>ME/QE review before export</strong></div>
      </section>

      <section class="mi-station-output-list">
        ${stations
          .map((station) => {
            const stationStepRows = getMiStationStepRows(station);
            const qualityRiskRows = getStationQualityRiskRows(station);
            const status = stationStateLabel(station.state);
            const stateClass = station.state === "over" ? "warn" : "";

            return `
              <article class="mi-station-output-card ${stateClass}">
                <header>
                  <div>
                    <b>${station.id}</b>
                    <h4>${station.note}</h4>
                    <p>${station.issue}</p>
                  </div>
                  <div class="mi-station-meta">
                    <strong>${station.time}s</strong>
                    <span>${status} · Target CT ${targetCt}s · ${station.hc} HC</span>
                    <div class="mi-station-meta-actions">
                      <label class="mi-ctq-inline">
                        <span>CTQ</span>
                        <textarea rows="2" data-mi-ctq-station="${station.id}" placeholder="Fill station CTQ">${escapeHtml(station.miCtq || "")}</textarea>
                      </label>
                      <label class="mi-image-upload">
                        <input type="file" accept="image/*" data-mi-image-station="${station.id}" />
                        <span>Upload Image</span>
                      </label>
                    </div>
                    ${station.miImageName ? `<small class="mi-image-name">${escapeHtml(station.miImageName)}</small>` : ""}
                  </div>
                </header>
                ${
                  station.miImageUrl
                    ? `<div class="mi-station-image-preview"><img src="${station.miImageUrl}" alt="${station.id} uploaded station reference" /></div>`
                    : ""
                }

                <div class="mi-station-grid mi-station-final-output">
                  <section>
                    <h5>Step List</h5>
                    <div class="mi-step-list-table">
                      <div class="mi-step-list-head"><span>Step</span><span>Step Description</span><span>Part Name</span><span>Part Number</span></div>
                      ${
                        stationStepRows.length
                          ? stationStepRows
                                      .map(
                                (row) => `
                                  <div class="mi-step-list-row">
                                    <b>${escapeHtml(row.step)}</b>
                                    <span>${escapeHtml(row.description)}</span>
                                    <small>${escapeHtml(row.partName)}</small>
                                    <em>${escapeHtml(row.partNumber)}</em>
                                  </div>
                                `,
                                      )
                                      .join("")
                          : `<div class="mi-step-list-empty">No detailed steps assigned.</div>`
                              }
                          </div>
                  </section>

                  <section>
                    <h5>Quality Risk</h5>
                    <div class="mi-quality-risk-table">
                      <div class="mi-quality-risk-head"><span>#</span><span>Risk Description</span></div>
                      ${qualityRiskRows
                              .map(
                          (risk, index) => `
                            <div class="mi-quality-risk-row">
                              <b>${index + 1}</b>
                              <textarea rows="2" data-mi-risk-station="${station.id}" data-mi-risk-index="${index}" placeholder="Fill quality risk">${escapeHtml(risk)}</textarea>
                                  </div>
                                `,
                              )
                        .join("")}
                    </div>
                  </section>
                </div>
              </article>
            `;
          })
          .join("")}
      </section>
    </div>
  `;
}

function riskClass(risk) {
  if (risk === "High") return "risk-high";
  if (risk === "Medium") return "risk-med";
  return "risk-low";
}

function renderTableHeader() {
  if (!refs.tableHead) return;
  const headers =
    currentStageKey === "inputs"
      ? ["Source", "Type", "Parsed Content", "Quality", "Blocking Issue", "Next Use"]
      : currentStageKey === "human"
      ? ["Item", "Human Input", "Purpose", "Status", "Required Before CT"]
      : currentStageKey === "steps"
        ? ["SOP Workflow", "Step", "Automation", "Step Description", "Part", "Theoretical PT (secs)", "Actual PT (secs)", "Actions"]
        : currentStageKey === "time"
          ? ["Process Step", "Step", "Automation", "Step Description", "Theoretical PT (secs)", "Actual PT (secs)"]
        : currentStageKey === "station"
          ? ["Station", "Assigned Steps", "Station Time", "Target CT", "Load", "HC", "Constraint / Issue", "Status"]
        : currentStageKey === "mapping"
          ? ["Station", "Automation", "Width (m)", "Depth (m)", "Operator Side", "Assigned Steps", "Quality Risk"]
          : currentStageKey === "parse"
            ? ["SOP Workflow", "Step", "Automation", "Step Description", "Part", "Actions"]
          : ["Step", "Process", "Station", "CT", "MTM", "Steps", "Process Time", "Tooling", "Material", "Risk", "Status"];
  refs.tableHead.innerHTML = headers.map((header) => `<th>${header}</th>`).join("");
}

function renderEditorToolbar() {
  const labels =
    currentStageKey === "inputs"
      ? ["All Inputs", "Ready", "Review", "Missing"]
      : currentStageKey === "human"
      ? ["All Inputs", "Missing", "Draft", "Ready"]
      : currentStageKey === "steps"
        ? ["All Micro", "edit", "moved"]
        : currentStageKey === "time"
          ? ["All Micro", "With Adjustment", "No Adjustment", "CT Time"]
        : currentStageKey === "station"
          ? ["All Stations", "Over CT", "Locked"]
          : currentStageKey === "parse"
            ? ["All Steps", "Needs Review", "Confirmed", "Extracted"]
          : ["All Steps", "Needs Review", "CTQ", "Locked"];

  if (currentStageKey === "steps" && !labels.includes(microTableFilter)) microTableFilter = "All Micro";

  $$(".segmented button").forEach((button, index) => {
    const label = labels[index];
    button.textContent = label || "";
    button.dataset.filter = label || "";
    button.style.display = label ? "" : "none";
    button.classList.toggle("selected", currentStageKey === "steps" ? label === microTableFilter : index === 0);
  });

  if (refs.search) {
    refs.search.placeholder =
      currentStageKey === "inputs"
        ? "Search Historical MI, Assembly Video, MTM, rule list..."
        : currentStageKey === "human"
        ? "Search human input, CTQ, station size..."
        : currentStageKey === "steps"
          ? "Search step, PT, SOP source..."
          : currentStageKey === "time"
            ? "Search CT input step, process step..."
          : currentStageKey === "station"
            ? "Search station, assigned step, constraint..."
            : "Search step, station, part, tool...";
  }

  if (!refs.editorContext) return;
  if (currentStageKey === "inputs") {
    refs.editorContext.innerHTML = `<div><h2>Uploaded Files Queue</h2><p>Track the files that will be used to generate the new SOP draft on Page 02.</p></div>`;
  } else if (currentStageKey === "human") {
    refs.editorContext.innerHTML = `<div><h2>Required Inputs Before CT</h2><p>Complete these five inputs before CT calculation and station generation.</p></div>`;
  } else if (currentStageKey === "steps") {
    refs.editorContext.innerHTML = `
      <div><h2>Generated Step List</h2><p>Review and edit process time here. Theoretical PT is the AI / MTM baseline; Actual PT is the final time used for CT calculation.</p></div>
      <button class="micro-add-step" type="button" data-action="add-micro-step">+ Add Step</button>
    `;
    refs.editorContext.querySelector?.("[data-action='add-micro-step']")?.addEventListener("click", addMicroStep);
  } else if (currentStageKey === "time") {
    refs.editorContext.innerHTML = `<div><h2>CT Calculation</h2><p>Target CT uses all confirmed step actual PT from Process Time as the total process-time basis.</p></div>`;
  } else if (currentStageKey === "station") {
    refs.editorContext.innerHTML = "";
  } else if (currentStageKey === "mapping") {
    refs.editorContext.innerHTML = `<div><h2>Layout Dimensions</h2><p>Adjust each station block size for the U-shaped layout sketch. Values are front-end mock inputs.</p></div>`;
  } else {
    refs.editorContext.innerHTML = `<div><h2>Generated Step List</h2><p>AI-generated process steps with MTM timing and review status.</p></div>`;
  }
}

function inputQualityClass(quality) {
  if (quality === "Missing") return "risk-high";
  if (quality === "Review") return "risk-med";
  return "risk-low";
}

function renderInputRows() {
  if (!refs.rows) return;
  refs.rows.innerHTML = inputSources
    .map(
      (source) => `
        <tr>
          <td><b>${source.source}</b></td>
          <td>${source.type}</td>
          <td class="process-cell"><strong>${source.parsed}</strong><small>${source.nextUse}</small></td>
          <td><span class="chip ${inputQualityClass(source.quality)}">${source.quality}</span></td>
          <td>${source.issue || "—"}</td>
          <td>${source.nextUse}</td>
        </tr>
      `,
    )
    .join("");
}

function renderMacroRows() {
  if (!refs.rows) return;
  refs.rows.innerHTML = steps
    .map((step) => {
      const timingMeta = getStepTimingMeta(step.id);
      return `
        <tr data-id="${step.id}" class="${step.id === selectedStepId ? "selected" : ""}">
          <td><b>${formatStepId(step.id)}</b></td>
          <td class="process-cell"><strong>${step.process}</strong><small>${step.detail}</small></td>
          <td>${step.station}</td>
          <td>${step.ct}</td>
          <td>${step.mtm}</td>
          <td>${timingMeta.count}</td>
          <td><strong class="time-cell">${timingMeta.time}</strong></td>
          <td>${step.tooling}</td>
          <td>${step.material}</td>
          <td><span class="chip ${riskClass(step.risk)}">${step.risk}</span></td>
          <td><span class="chip">${step.status}</span></td>
        </tr>
      `;
    })
    .join("");

  refs.rows.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => {
      selectedStepId = row.dataset.id;
      if (sopMacroSteps.some((step) => step.id === selectedStepId)) selectedMacroStepId = selectedStepId;
      renderRows();
      currentStageKey === "steps" ? renderStage("steps") : renderAI();
    });
  });
}

function renderParseRows({ showTiming = currentStageKey === "steps" } = {}) {
  if (!refs.rows) return;
  refs.rows.innerHTML = steps
    .map((step, macroIndex) => {
      const macro = getMacroStep(step.id);
      const detailedSteps = macro?.microSteps?.length ? macro.microSteps : [["New step", "TBD", 3, "Edit", 3]];
      return detailedSteps
        .map((microStep, index) => {
          const groupClass = macroIndex % 2 === 0 ? "micro-group-green" : "micro-group-blue";
          const movedClass = hasMicroFlag(microStep, "moved") ? "micro-moved" : "";
          const pt = getMicroPt(microStep, index);
          const actualPt = getActualPt(microStep, index);
          const automation = getMicroAutomation(microStep);
          return `
            <tr class="workflow-breakdown-row ${groupClass} ${movedClass} ${step.id === selectedStepId ? "selected" : ""}" data-id="${step.id}" data-macro-id="${step.id}" data-micro-index="${index}">
              ${
                index === 0
                  ? `<td class="workflow-master-cell" rowspan="${detailedSteps.length}" data-step-id="${step.id}">
                    <div class="workflow-master-card">
                      <div class="workflow-master-head">
                        <button class="workflow-sop-drag-handle" type="button" draggable="true" data-step-id="${step.id}" title="Drag SOP workflow" aria-label="Drag SOP workflow">⋮⋮</button>
                        <span>Workflow ${formatStepNumber(step.id)}</span>
                      </div>
                      <input class="workflow-edit-field workflow-title-field" data-step-id="${step.id}" data-field="process" value="${escapeHtml(step.process)}" />
                    </div>
                  </td>`
                  : ""
              }
              <td class="workflow-step-cell"><button class="workflow-drag-handle" type="button" draggable="true" data-macro-id="${step.id}" data-micro-index="${index}" title="Drag to move step" aria-label="Drag to move step">⋮⋮</button><b>${formatStepId(step.id)}.${String(index + 1).padStart(2, "0")}</b></td>
              <td>
                <select class="micro-edit-field micro-automation-field" data-macro-id="${step.id}" data-micro-index="${index}" data-micro-field="7">
                  <option value="M" ${automation === "M" ? "selected" : ""}>M</option>
                  <option value="A" ${automation === "A" ? "selected" : ""}>A</option>
                </select>
              </td>
              <td><textarea class="micro-edit-field micro-action-field workflow-step-description" rows="2" data-macro-id="${step.id}" data-micro-index="${index}" data-micro-field="0">${escapeHtml(microStep[0])}</textarea></td>
              <td><input class="workflow-edit-field workflow-part-field" data-step-id="${step.id}" data-field="material" value="${escapeHtml(step.material || "TBD")}" /></td>
              ${
                showTiming
                  ? `<td><input class="micro-edit-field micro-time-field" type="number" min="0" step="0.5" data-macro-id="${step.id}" data-micro-index="${index}" data-micro-field="2" value="${pt}" /></td>
              <td><input class="micro-edit-field micro-time-field" type="number" min="0" step="0.5" data-macro-id="${step.id}" data-micro-index="${index}" data-micro-field="4" value="${actualPt}" /></td>`
                  : ""
              }
              <td class="micro-actions-cell"><button class="micro-confirm-step" type="button" data-action="confirm-micro-step" data-macro-id="${step.id}" data-micro-index="${index}">Confirm</button><button class="micro-delete-step" type="button" data-action="delete-micro-step" data-macro-id="${step.id}" data-micro-index="${index}">Delete</button></td>
            </tr>
          `;
        })
        .join("");
    })
    .join("");

  bindWorkflowBreakdownRows();
}

function bindWorkflowBreakdownRows() {
  refs.rows.querySelectorAll(".workflow-master-cell").forEach((cell) => {
    cell.addEventListener("dragover", (event) => {
      if (!draggedSopStepId) return;
      event.preventDefault();
      event.stopPropagation();
      cell.classList.add("drop-target");
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });
    cell.addEventListener("dragleave", () => cell.classList.remove("drop-target"));
    cell.addEventListener("drop", (event) => {
      if (!draggedSopStepId) return;
      event.preventDefault();
      event.stopPropagation();
      const sourceId = event.dataTransfer?.getData("text/plain") || draggedSopStepId;
      cell.classList.remove("drop-target");
      draggedSopStepId = "";
      moveSopStep(sourceId, cell.dataset.stepId);
    });
  });

  refs.rows.querySelectorAll(".workflow-sop-drag-handle").forEach((handle) => {
    handle.addEventListener("click", (event) => event.stopPropagation());
    handle.addEventListener("dragstart", (event) => {
      event.stopPropagation();
      draggedSopStepId = handle.dataset.stepId;
      event.dataTransfer?.setData("text/plain", draggedSopStepId);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
      handle.closest(".workflow-master-cell")?.classList.add("dragging");
    });
    handle.addEventListener("dragend", () => {
      draggedSopStepId = "";
      handle.closest(".workflow-master-cell")?.classList.remove("dragging");
      refs.rows.querySelectorAll(".workflow-master-cell.drop-target").forEach((node) => node.classList.remove("drop-target"));
    });
  });

  refs.rows.querySelectorAll(".workflow-breakdown-row").forEach((row) => {
    row.addEventListener("click", () => {
      selectedStepId = row.dataset.id;
      selectedMacroStepId = row.dataset.macroId;
      if (currentStageKey === "parse") {
        renderParsePanel();
        scrollSelectedSopStepIntoView();
      } else {
        renderStage("steps");
      }
    });
    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      row.classList.add("drop-target");
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });
    row.addEventListener("dragleave", () => row.classList.remove("drop-target"));
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging", "drop-target");
      draggedMicroStep = null;
    });
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      row.classList.remove("drop-target");
      if (!draggedMicroStep) return;
      swapMicroSteps(draggedMicroStep.macroId, draggedMicroStep.index, row.dataset.macroId, Number(row.dataset.microIndex));
      draggedMicroStep = null;
    });
  });

  refs.rows.querySelectorAll(".workflow-drag-handle").forEach((handle) => {
    handle.addEventListener("click", (event) => event.stopPropagation());
    handle.addEventListener("dragstart", (event) => {
      const row = handle.closest(".workflow-breakdown-row");
      draggedMicroStep = { macroId: handle.dataset.macroId, index: Number(handle.dataset.microIndex) };
      row?.classList.add("dragging");
      event.dataTransfer?.setData("text/plain", `${handle.dataset.macroId}:${handle.dataset.microIndex}`);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    });
    handle.addEventListener("dragend", () => {
      handle.closest(".workflow-breakdown-row")?.classList.remove("dragging", "drop-target");
      draggedMicroStep = null;
    });
  });

  refs.rows.querySelectorAll(".workflow-edit-field").forEach((field) => {
    field.addEventListener("click", (event) => event.stopPropagation());
    field.addEventListener("input", () => updateWorkflowFromField(field));
    field.addEventListener("change", () => {
      updateWorkflowFromField(field);
      renderStage(getStepTableStageKey());
    });
  });
  refs.rows.querySelectorAll(".micro-edit-field").forEach((field) => {
    field.addEventListener("click", (event) => event.stopPropagation());
    field.addEventListener("input", () => {
      const macro = getMacroStep(field.dataset.macroId);
      const index = Number(field.dataset.microIndex);
      const fieldIndex = Number(field.dataset.microField);
      if (!macro.microSteps[index] || !Number.isFinite(fieldIndex)) return;
      macro.microSteps[index][fieldIndex] = fieldIndex === 2 || fieldIndex === 4 ? Number(field.value) || 0 : field.value;
      selectedMacroStepId = macro.id;
    });
    field.addEventListener("change", () => updateMicroStepFromField(field));
  });
  refs.rows.querySelectorAll("[data-action='delete-micro-step']").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteMicroStep(Number(button.dataset.microIndex), button.dataset.macroId);
    });
  });
  refs.rows.querySelectorAll("[data-action='confirm-micro-step']").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      confirmMicroStep(Number(button.dataset.microIndex), button.dataset.macroId);
    });
  });
}

function renderMicroRows() {
  if (!refs.rows) return;
  const rows = sopMacroSteps.flatMap((macro, macroIndex) =>
    macro.microSteps.map((microStep, index) => ({ macro, macroIndex, microStep, index })),
  ).filter(
    ({ macro, microStep, index }) =>
      microMatchesFilter(microStep) && microMatchesSearch(macro, microStep, index) && microMatchesColumnFilters(macro, microStep, index),
  );

  refs.rows.innerHTML = rows.length
    ? rows
    .map(
      ({ macro, macroIndex, microStep, index }) => {
        const [label] = microStep;
        const pt = getMicroPt(microStep, index);
        const actualPt = getActualPt(microStep, index);
        const automation = getMicroAutomation(microStep);
        const groupClass = macroIndex % 2 === 0 ? "micro-group-green" : "micro-group-blue";
        const movedClass = hasMicroFlag(microStep, "moved") ? "micro-moved" : "";
        return `
        <tr class="micro-xlsx-row ${groupClass} ${movedClass}" draggable="true" data-macro-id="${macro.id}" data-micro-index="${index}">
          <td class="process-cell"><strong>${escapeHtml(formatProcessStepLabel(macro))}</strong></td>
          <td><b>${formatStepId(macro.id)}.${String(index + 1).padStart(2, "0")}</b></td>
          <td>
            <select class="micro-edit-field micro-automation-field" data-macro-id="${macro.id}" data-micro-index="${index}" data-micro-field="7">
              <option value="M" ${automation === "M" ? "selected" : ""}>M</option>
              <option value="A" ${automation === "A" ? "selected" : ""}>A</option>
            </select>
          </td>
          <td><input class="micro-edit-field micro-action-field" data-macro-id="${macro.id}" data-micro-index="${index}" data-micro-field="0" value="${escapeHtml(label)}" /></td>
          <td><input class="micro-edit-field micro-time-field" type="number" min="0" step="0.5" data-macro-id="${macro.id}" data-micro-index="${index}" data-micro-field="2" value="${pt}" /></td>
          <td><input class="micro-edit-field micro-time-field" type="number" min="0" step="0.5" data-macro-id="${macro.id}" data-micro-index="${index}" data-micro-field="4" value="${actualPt}" /></td>
          <td class="micro-actions-cell"><button class="micro-confirm-step" type="button" data-action="confirm-micro-step" data-macro-id="${macro.id}" data-micro-index="${index}">Confirm</button><button class="micro-delete-step" type="button" data-action="delete-micro-step" data-macro-id="${macro.id}" data-micro-index="${index}">Delete</button></td>
        </tr>
      `;
      },
    )
    .join("")
    : `<tr><td class="micro-empty-row" colspan="7">No steps match the current filter.</td></tr>`;

  refs.rows.querySelectorAll("[data-action='delete-micro-step']").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteMicroStep(Number(button.dataset.microIndex), button.dataset.macroId);
    });
  });
  refs.rows.querySelectorAll(".micro-xlsx-row").forEach((row) => {
    row.addEventListener("click", () => {
      selectedMacroStepId = row.dataset.macroId;
    });
    row.addEventListener("dragstart", (event) => {
      draggedMicroStep = {
        macroId: row.dataset.macroId,
        index: Number(row.dataset.microIndex),
      };
      row.classList.add("dragging");
      event.dataTransfer?.setData("text/plain", `${row.dataset.macroId}:${row.dataset.microIndex}`);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      row.classList.add("drop-target");
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });
    row.addEventListener("dragleave", () => {
      row.classList.remove("drop-target");
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging", "drop-target");
      draggedMicroStep = null;
    });
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      row.classList.remove("drop-target");
      if (!draggedMicroStep) return;
      swapMicroSteps(draggedMicroStep.macroId, draggedMicroStep.index, row.dataset.macroId, Number(row.dataset.microIndex));
      draggedMicroStep = null;
    });
  });
  refs.rows.querySelectorAll("[data-action='confirm-micro-step']").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      confirmMicroStep(Number(button.dataset.microIndex), button.dataset.macroId);
    });
  });
  refs.rows.querySelectorAll(".micro-edit-field").forEach((field) => {
    field.addEventListener("input", () => {
      const macro = getMacroStep(field.dataset.macroId || selectedMacroStepId);
      const index = Number(field.dataset.microIndex);
      const fieldIndex = Number(field.dataset.microField);
      if (!macro.microSteps[index] || !Number.isFinite(fieldIndex)) return;
      macro.microSteps[index][fieldIndex] = fieldIndex === 2 || fieldIndex === 4 ? Number(field.value) || 0 : field.value;
      selectedMacroStepId = macro.id;
    });
    field.addEventListener("change", () => updateMicroStepFromField(field));
  });
}

function renderCtRows() {
  if (!refs.rows) return;
  const query = refs.search?.value.trim().toLowerCase() || "";
  const rows = sopMacroSteps
    .flatMap((macro, macroIndex) => macro.microSteps.map((microStep, index) => ({ macro, macroIndex, microStep, index })))
    .filter(({ macro, microStep, index }) => {
      if (!query) return true;
      const stepNo = `step ${formatStepId(macro.id)}`;
      const processStep = formatProcessStepLabel(macro);
      const microNo = `${formatStepId(macro.id)}.${String(index + 1).padStart(2, "0")}`;
      return [stepNo, processStep, microNo, macro.title, macro.station, microStep[0]].some((value) => String(value).toLowerCase().includes(query));
    });

  refs.rows.innerHTML = rows
    .map(({ macro, macroIndex, microStep, index }) => {
      const pt = getMicroPt(microStep, index);
      const actualPt = getActualPt(microStep, index);
      const groupClass = macroIndex % 2 === 0 ? "micro-group-green" : "micro-group-blue";
      return `
        <tr class="micro-xlsx-row ${groupClass}">
          <td class="process-cell"><strong>${escapeHtml(formatProcessStepLabel(macro))}</strong></td>
          <td><b>${formatStepId(macro.id)}.${String(index + 1).padStart(2, "0")}</b></td>
          <td><span class="automation-chip ${getMicroAutomation(microStep) === "A" ? "auto" : ""}">${getMicroAutomation(microStep)}</span></td>
          <td class="process-cell"><strong>${escapeHtml(microStep[0])}</strong><small>${escapeHtml(macro.title)}</small></td>
          <td>${pt}</td>
          <td>${actualPt}</td>
        </tr>
      `;
    })
    .join("");
}

function renderHumanRows() {
  if (!refs.rows) return;
  refs.rows.innerHTML = humanInputSections
    .map(
      (item) => `
        <tr class="${item.status === "Missing" ? "selected" : ""}">
          <td><b>${item.id}</b></td>
          <td class="process-cell"><strong>${item.title}</strong><small>${item.placeholder}</small></td>
          <td>${item.detail}</td>
          <td><span class="chip ${item.status === "Draft" ? "risk-med" : item.status === "Missing" ? "risk-high" : "risk-low"}">${item.status}</span></td>
          <td>${item.status === "Ready" ? "Done" : "Required"}</td>
        </tr>
      `,
    )
    .join("");
}

function renderStationRows() {
  if (!refs.rows) return;
  syncStationAutomationGrouping();
  const targetCt = 58;
  refs.rows.innerHTML = getActiveStations()
    .map((station) => {
      const load = Math.round((station.time / targetCt) * 100);
      const chipClass = station.override ? "risk-med" : station.state === "over" ? "risk-high" : "risk-low";
      const status = station.override
        ? "Human override"
        : station.state === "over"
          ? "Needs rebalance"
          : "Within CT";
      return `
        <tr data-station-id="${station.id}" class="${station.id === selectedStationId ? "selected" : ""} station-row-${station.state} ${station.override ? "override-row" : ""}">
          <td><b>${station.id}</b></td>
          <td class="process-cell"><strong>${station.note}</strong><small>${station.steps.map((stepId) => `${stepId} ${getStepById(stepId)?.process || ""}`).join(" · ")}</small></td>
          <td><strong class="time-cell">${station.time}s</strong></td>
          <td>58s</td>
          <td>${load}%</td>
          <td>${station.hc}</td>
          <td class="process-cell"><small>${station.issue}</small></td>
          <td><span class="chip ${chipClass}">${status}</span></td>
        </tr>
      `;
    })
    .join("");

  refs.rows.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => {
      selectedStationId = row.dataset.stationId;
      renderStage("station");
    });
  });
}

function renderLayoutRows() {
  if (!refs.rows) return;
  refs.rows.innerHTML = getLayoutStations()
    .map(({ station, width, depth, operatorSide }) => {
      return `
        <tr class="layout-dimension-row ${station.id === selectedStationId ? "selected" : ""}" data-station-id="${station.id}">
          <td><b>${escapeHtml(station.id)}</b></td>
          <td><span class="automation-chip ${station.automation ? "auto" : ""}">${station.automation ? "A" : "M"}</span></td>
          <td><input class="layout-dimension-field" type="number" min="0.5" step="0.1" data-layout-field="layoutWidth" data-station-id="${station.id}" value="${width}" /></td>
          <td><input class="layout-dimension-field" type="number" min="0.5" step="0.1" data-layout-field="layoutDepth" data-station-id="${station.id}" value="${depth}" /></td>
          <td>
            <select class="layout-dimension-field" data-layout-field="operatorSide" data-station-id="${station.id}">
              ${["Inside U", "Outside U", "Service side", "No operator"].map((option) => `<option value="${option}" ${operatorSide === option ? "selected" : ""}>${option}</option>`).join("")}
            </select>
          </td>
          <td class="process-cell"><small>${station.steps.join(", ") || "No assigned step"}</small></td>
          <td class="process-cell"><small>${escapeHtml(station.issue)}</small></td>
        </tr>
      `;
    })
    .join("");

  refs.rows.querySelectorAll(".layout-dimension-row").forEach((row) => {
    row.addEventListener("click", () => {
      selectedStationId = row.dataset.stationId;
      renderMappingPanel();
    });
  });

  refs.rows.querySelectorAll(".layout-dimension-field").forEach((field) => {
    field.addEventListener("click", (event) => event.stopPropagation());
    field.addEventListener("input", () => updateStationLayoutFromField(field));
    field.addEventListener("change", () => {
      updateStationLayoutFromField(field);
      renderStage("mapping");
    });
  });
}

function renderRows() {
  renderEditorToolbar();
  renderTableHeader();
  if (currentStageKey === "inputs") renderInputRows();
  else if (currentStageKey === "parse") renderParseRows();
  else if (currentStageKey === "human") renderHumanRows();
  else if (currentStageKey === "steps") renderParseRows({ showTiming: true });
  else if (currentStageKey === "time") renderCtRows();
  else if (currentStageKey === "station") renderStationRows();
  else if (currentStageKey === "mapping") renderLayoutRows();
  else renderMacroRows();
}

function renderInputPanel() {
  const readyCount = inputSources.filter((source) => source.quality === "Ready").length;
  const reviewItems = inputSources.filter((source) => source.quality === "Review");
  const missingItems = inputSources.filter((source) => source.quality === "Missing");
  setText(refs.aiStepTitle, "AI Input Diagnosis");
  setText(refs.confidence, `${readyCount}/${inputSources.length}`);
  setText(refs.aiReason, "Upload the inputs first: historical MI provides the previous process and MI format, assembly videos extract actions and parts, and MTM / historical layout supports later CT and station balancing.");
  if (refs.missingList) {
    refs.missingList.innerHTML = `
      <li>Historical MI and assembly videos are the minimum inputs for Page 02 SOP draft</li>
      <li>${reviewItems.length} uploaded source(s) still need human review</li>
      <li>${missingItems.length} optional source(s) missing; downstream pages keep review flags</li>
    `;
  }
  setText(refs.evidenceTitle, "Next AI Outputs");
  if (refs.evidenceList) {
    refs.evidenceList.className = "timing-exposure-list";
    refs.evidenceList.innerHTML = `
      <div class="timing-exposure-row"><b>02</b><span>SOP Draft</span><small>Generate new SOP from uploaded historical MI and assembly videos</small></div>
      <div class="timing-exposure-row"><b>03</b><span>Steps</span><small>Break SOP workflows into detailed work steps</small></div>
      <div class="timing-exposure-row warn"><b>06</b><span>Station Draft</span><small>Use MTM / history input to balance CT and HC</small></div>
      <div class="timing-exposure-row ctq"><b>08</b><span>MI Package</span><small>Export aligned MI after station and BOM checks</small></div>
    `;
  }
}

function renderAI() {
  const step = getStepById(selectedStepId) || steps[0];
  setText(refs.evidenceTitle, "Evidence Sources");
  if (refs.evidenceList) refs.evidenceList.className = "evidence-list";
  setText(refs.aiStepTitle, `Step ${formatStepId(step.id)} · ${step.process}`);
  setText(refs.confidence, step.confidence);
  setText(refs.aiReason, step.reason);
  if (refs.missingList) refs.missingList.innerHTML = step.missing.map((item) => `<li>${item}</li>`).join("");
  if (refs.evidenceList) {
    refs.evidenceList.innerHTML = step.evidence
      .map((item) => `<div class="evidence"><b>${item}</b><span>Matched by AI trace log</span></div>`)
      .join("");
  }
}

function bindSopPanelInteractions() {
  refs.evidenceList?.querySelector("[data-action='toggle-sop-add']")?.addEventListener("click", () => {
    if (sopAddPanelOpen) closeSopStepDraft();
    else openSopStepDraft();
  });

  refs.evidenceList?.querySelector("[data-action='generate-sop-step']")?.addEventListener("click", generateSopStepFromDraft);

  refs.evidenceList?.querySelectorAll("[data-draft-field]").forEach((field) => {
    field.addEventListener("input", () => updateSopStepDraft(field));
    field.addEventListener("change", () => updateSopStepDraft(field));
  });
}

function renderParsePanel() {
  const step = getStepById(selectedStepId) || steps[0];
  const reviewCount = steps.filter((item) => getSopStepTone(item) === "review").length;
  const addPanel = `
    <div class="sop-add-panel ${sopAddPanelOpen ? "open" : ""}">
      <button class="sop-panel-toggle" type="button" data-action="toggle-sop-add">${sopAddPanelOpen ? "Close Add Step" : "+ Add SOP Step"}</button>
      ${
        sopAddPanelOpen
          ? `
            <div class="sop-add-form">
              <label>Process<input data-draft-field="process" value="${escapeHtml(sopStepDraft.process)}" placeholder="Example: Apply thermal pad" /></label>
              <label>Detail<textarea data-draft-field="detail" rows="3" placeholder="Describe method, sequence, and evidence needed">${escapeHtml(sopStepDraft.detail)}</textarea></label>
              <div class="sop-add-form-grid">
                <label>Part Area<input data-draft-field="station" value="${escapeHtml(sopStepDraft.station)}" /></label>
                <label>Review<select data-draft-field="status">
                  ${["Extracted", "Needs Review", "Confirmed"].map((status) => `<option value="${status}" ${sopStepDraft.status === status ? "selected" : ""}>${status}</option>`).join("")}
                </select></label>
              </div>
              <button class="sop-generate-step" type="button" data-action="generate-sop-step">Generate Step</button>
            </div>
          `
          : ""
      }
    </div>
  `;
  setText(refs.pressureTitle, "Parsed Artifacts");
  if (refs.stationRadar) {
    refs.stationRadar.innerHTML = `
      <div class="parsed-artifact-summary">
        <div class="parsed-artifact-item"><strong>${steps.length}</strong><span>Predicted SOP steps</span><small>Editable AI-generated assembly actions</small></div>
        <div class="parsed-artifact-item"><strong>35</strong><span>Frame anchors</span><small>Assembly video operation moments and placeholders</small></div>
        <div class="parsed-artifact-item"><strong>6</strong><span>Tooling notes</span><small>Fixture and tool references from operation videos</small></div>
        <div class="parsed-artifact-item"><strong>${reviewCount}</strong><span>Human gaps</span><small>Steps still needing confirmation</small></div>
      </div>
    `;
  }
  setText(refs.aiStepTitle, `SOP Flow · Step ${formatStepId(step.id)}`);
  setText(refs.confidence, step.confidence || "Manual");
  setText(refs.aiReason, step.reason || "This SOP step is being manually adjusted before detailed step generation.");
  if (refs.missingList) {
    setText(refs.missingTitle, "");
    refs.missingList.innerHTML = "";
  }
  setText(refs.evidenceTitle, "Editable SOP Flow");
  if (refs.evidenceList) {
    refs.evidenceList.className = "timing-exposure-list sop-panel-list";
    refs.evidenceList.innerHTML = `
      ${addPanel}
      <div class="timing-exposure-row warn"><b>Edit</b><span>Correct AI extraction</span><small>fix action text, method detail, station, CT, or status</small></div>
      <div class="timing-exposure-row ctq"><b>Drag</b><span>Repair SOP order</span><small>drop onto another card to match the video flow</small></div>
    `;
  }
  bindSopPanelInteractions();
}

function bindSopFlowInteractions() {
  const track = refs.twinCanvas?.querySelector(".sop-step-track");
  let isTrackPanning = false;
  let trackStartX = 0;
  let trackStartScrollLeft = 0;

  track?.addEventListener("pointerdown", (event) => {
    if (event.target.closest("input, textarea, select, button, .sop-step-card-head")) return;
    isTrackPanning = true;
    trackStartX = event.clientX;
    trackStartScrollLeft = track.scrollLeft;
    track.classList.add("panning");
    track.setPointerCapture?.(event.pointerId);
  });

  track?.addEventListener("pointermove", (event) => {
    if (!isTrackPanning) return;
    event.preventDefault();
    track.scrollLeft = trackStartScrollLeft - (event.clientX - trackStartX);
  });

  const stopTrackPan = (event) => {
    if (!isTrackPanning) return;
    isTrackPanning = false;
    track.classList.remove("panning");
    track.releasePointerCapture?.(event.pointerId);
  };

  track?.addEventListener("pointerup", stopTrackPan);
  track?.addEventListener("pointercancel", stopTrackPan);

  refs.twinCanvas?.querySelectorAll(".sop-step-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("[data-action='delete-sop-step']")) return;
      selectedStepId = card.dataset.stepId;
      refs.twinCanvas?.querySelectorAll(".sop-step-card").forEach((node) => node.classList.toggle("active", node.dataset.stepId === selectedStepId));
      renderRows();
      renderParsePanel();
    });

    card.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      if (card.dataset.stepId !== draggedSopStepId) card.classList.add("drop-target");
    });

    card.addEventListener("dragleave", () => {
      card.classList.remove("drop-target");
    });

    card.addEventListener("drop", (event) => {
      event.preventDefault();
      const sourceId = event.dataTransfer?.getData("text/plain") || draggedSopStepId;
      card.classList.remove("drop-target");
      moveSopStep(sourceId, card.dataset.stepId);
    });
  });

  refs.twinCanvas?.querySelectorAll("[data-action='delete-sop-step']").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteSopStep(button.dataset.stepId);
    });
  });

  refs.twinCanvas?.querySelectorAll(".sop-step-card-head").forEach((head) => {
    head.addEventListener("dragstart", (event) => {
      if (!event.target.closest(".sop-drag-handle")) {
        event.preventDefault();
        return;
      }
      draggedSopStepId = head.dataset.stepId;
      event.dataTransfer?.setData("text/plain", draggedSopStepId);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
      head.closest(".sop-step-card")?.classList.add("dragging");
    });

    head.addEventListener("dragend", () => {
      draggedSopStepId = "";
      head.closest(".sop-step-card")?.classList.remove("dragging");
      refs.twinCanvas?.querySelectorAll(".sop-step-card.drop-target").forEach((node) => node.classList.remove("drop-target"));
    });
  });

  refs.twinCanvas?.querySelectorAll(".sop-step-input").forEach((field) => {
    field.addEventListener("focus", () => {
      selectedStepId = field.dataset.stepId;
      refs.twinCanvas?.querySelectorAll(".sop-step-card").forEach((node) => node.classList.toggle("active", node.dataset.stepId === selectedStepId));
      renderParsePanel();
    });
    field.addEventListener("input", () => updateSopStepFromField(field));
    field.addEventListener("change", () => {
      updateSopStepFromField(field);
      if (field.dataset.field === "status") renderStage("parse");
    });
  });
}

function renderHumanGatePanel() {
  const ready = humanInputSections.filter((item) => item.status === "Ready").length;
  const draft = humanInputSections.filter((item) => item.status === "Draft").length;
  const missing = humanInputSections.filter((item) => item.status === "Missing").length;
  setText(refs.aiStepTitle, "Human Gate · Required Inputs");
  setText(refs.confidence, `${ready}/5`);
  setText(
    refs.aiReason,
    "Before CT calculation, engineers must complete five input categories: step sub-lists, automation loading / unloading steps, prototype notes / improvement requests, MI-format CTQ marks, and station dimensions.",
  );
  if (refs.missingList) {
    refs.missingList.innerHTML = `
      <li>${missing} required input item(s) still missing</li>
      <li>${draft} item(s) saved as draft and waiting for submission</li>
      <li>CT calculation is allowed only after all five inputs are Ready</li>
    `;
  }
  setText(refs.evidenceTitle, "Input Gate");
  if (refs.evidenceList) {
    refs.evidenceList.className = "timing-exposure-list";
    refs.evidenceList.innerHTML = `
      <div class="timing-exposure-row"><b>${ready}</b><span>Ready inputs</span><small>recorded for CT calculation</small></div>
      <div class="timing-exposure-row warn"><b>${draft}</b><span>Draft inputs</span><small>saved locally, pending submit</small></div>
      <div class="timing-exposure-row hot"><b>${missing}</b><span>Missing inputs</span><small>blocks CT / station generation</small></div>
      <div class="timing-exposure-row ctq"><b>${missing ? "Hold" : "Ready"}</b><span>API 3 status</span><small>${missing ? "waiting for five completed inputs" : "ready for CT calculation"}</small></div>
    `;
  }
}

function renderCtPanel() {
  const totalProcessTime = 354;
  const generatedHc = Math.ceil(totalProcessTime / (Number(ctCalculatorState.targetCt) || 1));
  const generatedCt = totalProcessTime / Math.max(1, Math.round(Number(ctCalculatorState.totalHc) || 1));
  const volumeTargetCt = getVolumeTargetCt();
  setText(refs.aiStepTitle, "Calculation Logic");
  setText(refs.confidence, ctInputMode === "ct" ? `${generatedHc} HC` : ctInputMode === "volume" ? `${volumeTargetCt.toFixed(1)}s` : `${generatedCt.toFixed(1)}s`);
  setText(refs.aiReason, "User can input target CT to generate total HC, input total HC to generate CT, or input daily volume / shift hours / OEE to generate target CT.");
  if (refs.missingList) {
    refs.missingList.innerHTML = `
      <li>Total process time: ${totalProcessTime}s</li>
      <li>Input CT ${ctCalculatorState.targetCt}s → Total HC ${generatedHc}</li>
      <li>Input HC ${Math.round(Number(ctCalculatorState.totalHc) || 1)} → CT ${generatedCt.toFixed(1)}s</li>
      <li>Input volume ${ctCalculatorState.dailyVolume} / ${ctCalculatorState.shiftCount} × ${ctCalculatorState.shiftHours}h / OEE ${ctCalculatorState.oee}% → CT ${volumeTargetCt.toFixed(1)}s</li>
    `;
  }
  setText(refs.evidenceTitle, "Simple Formula");
  if (refs.evidenceList) {
    refs.evidenceList.className = "timing-exposure-list";
    refs.evidenceList.innerHTML = `
      <div class="timing-exposure-row"><b>HC</b><span>Total Process Time / CT</span><small>used when user inputs target CT</small></div>
      <div class="timing-exposure-row"><b>CT</b><span>Total Process Time / HC</span><small>used when user inputs total HC</small></div>
      <div class="timing-exposure-row"><b>CT</b><span>Available Time × OEE / Volume</span><small>used when user inputs volume assumptions</small></div>
      <div class="timing-exposure-row ctq"><b>Next</b><span>Station draft</span><small>uses generated CT / HC as the balancing target</small></div>
    `;
  }
}

function renderStationPanel() {
  syncStationAutomationGrouping();
  const station = getStationDraft();
  const stations = getActiveStations();
  const activeSummary = getStationPlanSummary(activeStationPlanId);
  if (stationViewMode === "kpi") {
    const lineKpi = getLineKpiSummary();
    setText(refs.aiStepTitle, `Line KPI · ${lineKpi.name}`);
    setText(refs.confidence, `${lineKpi.lbe.toFixed(1)}%`);
    setText(refs.aiReason, "Line-level KPI is evaluated on the whole station plan. The main chart keeps only station-level HC and CT target comparison.");
    setText(refs.missingTitle, "KPI");
    if (refs.missingList) {
      refs.missingList.className = "line-kpi-card-grid";
      refs.missingList.innerHTML = `
        <li><span>Line LBE</span><strong>${lineKpi.lbe.toFixed(1)}%</strong><small>overall balance</small></li>
        <li><span>Total HC</span><strong>${lineKpi.totalHc.toFixed(1)}</strong><small>planned resource</small></li>
        <li><span>Bottleneck CT</span><strong>${lineKpi.bottleneckCt.toFixed(0)}s</strong><small>slowest station</small></li>
        <li><span>Line UPPH</span><strong>${lineKpi.lineUpph.toFixed(1)}</strong><small>from bottleneck CT</small></li>
        <li class="${lineKpi.overTargetCount ? "warn" : ""}"><span>Over Target</span><strong>${lineKpi.overTargetCount}</strong><small>station count</small></li>
      `;
    }
    renderStationViewActions();
    return;
  }
  if (!station) {
    const overCount = stations.filter((item) => item.state === "over").length;
    const overrideCount = stations.filter((item) => item.override).length;
    setText(refs.aiStepTitle, `Station Balance · ${activeSummary.name}`);
    setText(refs.confidence, `${activeSummary.lbe.toFixed(1)}%`);
    setText(refs.aiReason, `${activeSummary.label}: ${activeSummary.description}`);
    if (refs.missingList) {
      refs.missingList.innerHTML = `
        <li>${stations.length} stations in this plan</li>
        <li>${overCount} station over target CT</li>
        <li>${overrideCount} manual override submitted</li>
      `;
    }
    renderStationViewActions();
    return;
  }

  const targetCt = 58;
  const load = Math.round((station.time / targetCt) * 100);
  const over = station.time > targetCt;
  const latestTrace = station.trace[0];
  setText(refs.aiStepTitle, `Station Balance · ${station.id}${station.override ? " · Human Override" : ""}`);
  setText(refs.confidence, station.override ? "Traced" : over ? "Hold" : "Ready");
  setText(
    refs.aiReason,
    station.override
      ? `${station.id} has a submitted human change. The system keeps the AI baseline, last submitted value, and current trace; downstream MI / Line Balance export must carry the override mark.`
      : over
        ? `${station.id} is currently ${station.time}s, above the locked target CT of ${targetCt}s. AI recommends keeping CTQ / locked steps unchanged first, then moving splittable actions to a lower-load station.`
        : `${station.id} is currently ${station.time}s, below the locked target CT of ${targetCt}s. The station draft can proceed to human confirmation.`,
  );
  if (refs.missingList) {
    refs.missingList.innerHTML = `
      <li>Target CT: ${targetCt}s, locked from the previous CT calculation step</li>
      <li>Assigned steps: ${station.steps.join(", ")}</li>
      <li>Station load: ${load}% · HC ${station.hc}</li>
      <li>${station.issue}</li>
      ${station.override ? `<li>Manual override submitted: ${latestTrace?.time || "trace recorded"}</li>` : ""}
    `;
  }
  renderStationViewActions();
}

function renderStationViewActions() {
  setText(refs.evidenceTitle, "Station View");
  if (!refs.evidenceList) return;
  refs.evidenceList.className = "station-view-actions";
  refs.evidenceList.innerHTML = `
    <button class="${stationViewMode === "plan" ? "active" : ""}" type="button" data-action="station-view-plan">Station Plan</button>
    <button class="${stationViewMode === "kpi" ? "active" : ""}" type="button" data-action="station-view-kpi">KPI Performance</button>
  `;
  refs.evidenceList.querySelector("[data-action='station-view-plan']")?.addEventListener("click", () => setStationViewMode("plan"));
  refs.evidenceList.querySelector("[data-action='station-view-kpi']")?.addEventListener("click", () => setStationViewMode("kpi"));
}

function renderMappingPanel() {
  const layoutStations = getLayoutStations();
  const totalArea = layoutStations.reduce((sum, item) => sum + item.area, 0);
  const selected = layoutStations.find(({ station }) => station.id === selectedStationId);
  const lineKpi = getLineKpiSummary();
  setText(refs.missingTitle, "KPI");
  setText(refs.aiStepTitle, selected ? `Layout · ${selected.station.id}` : "U-shaped Layout Draft");
  setText(refs.confidence, selected ? stationStateLabel(selected.station.state) : `${totalArea.toFixed(1)}m²`);
  setText(
    refs.aiReason,
    selected
      ? `${selected.station.id} is selected on the U-shaped layout. The station detail below is linked to the active line balance plan and editable layout dimensions.`
      : "The U-shaped layout groups station blocks by flow sequence. AUTO is generated from A steps, while manual stations keep M steps from station balancing.",
  );
  if (refs.missingList) {
    if (selected) {
      const targetCt = Number(ctCalculatorState.targetCt) || 58;
      const load = targetCt ? ((Number(selected.station.time) || 0) / targetCt) * 100 : 0;
      refs.missingList.className = "layout-station-info-grid";
    refs.missingList.innerHTML = `
        <li><span>Space</span><strong>${selected.area.toFixed(1)}m²</strong><small>station footprint</small></li>
        <li><span>HC</span><strong>${selected.station.hc}</strong><small>planned headcount</small></li>
        <li><span>CT</span><strong>${selected.station.time}s</strong><small>${load.toFixed(0)}% of ${targetCt}s target</small></li>
        <li class="${selected.station.state === "over" ? "warn" : ""}"><span>Status</span><strong>${stationStateLabel(selected.station.state)}</strong><small>${escapeHtml(selected.station.issue)}</small></li>
      `;
    } else {
      refs.missingList.className = "line-kpi-card-grid";
      refs.missingList.innerHTML = `
        <li><span>Line LBE</span><strong>${lineKpi.lbe.toFixed(1)}%</strong><small>from Page 5 station plan</small></li>
        <li><span>Total HC</span><strong>${lineKpi.totalHc.toFixed(1)}</strong><small>planned resource</small></li>
        <li><span>Bottleneck CT</span><strong>${lineKpi.bottleneckCt.toFixed(0)}s</strong><small>slowest station</small></li>
        <li><span>Space</span><strong>${totalArea.toFixed(1)}m²</strong><small>total station footprint</small></li>
      `;
    }
  }
  setText(refs.evidenceTitle, selected ? "Station Info from Page 5" : "Layout Source");
  if (refs.evidenceList) {
    if (selected) {
      refs.evidenceList.className = "layout-station-workflows";
      const targetCt = Number(ctCalculatorState.targetCt) || 58;
      const stationLoad = targetCt ? ((Number(selected.station.time) || 0) / targetCt) * 100 : 0;
      const workflowCards = selected.station.steps.length
        ? selected.station.steps
            .map((stepId) => {
              const macro = getMacroStep(stepId);
              const aiStep = getStepById(stepId);
              const microRows = macro?.microSteps || [];
              return `
                <div class="layout-workflow-item">
                  <header>
                    <b>${formatStepId(stepId)}</b>
                    <span>${escapeHtml(macro?.title || aiStep?.process || "Unmapped workflow")}</span>
                    <small>${microRows.length} detailed step(s)</small>
                  </header>
                  <div class="layout-workflow-steps">
                    ${
                      microRows.length
                        ? microRows
                            .map(
                              (microStep, index) => `
                                <div>
                                  <b>${formatStepId(stepId)}.${String(index + 1).padStart(2, "0")}</b>
                                  <span>${escapeHtml(microStep[7] || "M")}</span>
                                  <small>${escapeHtml(microStep[0])}</small>
                                  <em>${escapeHtml(microStep[8] || aiStep?.material || "TBD")}</em>
                                </div>
                              `,
                            )
                            .join("")
                        : `<div class="layout-workflow-empty">No detailed steps assigned.</div>`
                    }
                  </div>
                </div>
              `;
            })
            .join("")
        : `<div class="layout-workflow-empty">No SOP workflow assigned yet.</div>`;
      refs.evidenceList.innerHTML = `
        <div class="layout-station-summary-card">
          <div><span>Station</span><strong>${escapeHtml(selected.station.id)}</strong></div>
          <div><span>Automation</span><strong>${selected.station.automation ? "A" : "M"}</strong></div>
          <div><span>HC</span><strong>${escapeHtml(selected.station.hc)}</strong></div>
          <div><span>CT</span><strong>${selected.station.time}s</strong></div>
          <div><span>Load</span><strong>${stationLoad.toFixed(0)}%</strong></div>
          <div><span>Status</span><strong>${stationStateLabel(selected.station.state)}</strong></div>
          <p>${escapeHtml(selected.station.note || "No station note")}</p>
          <small>${escapeHtml(selected.station.issue || "No station issue")}</small>
        </div>
        ${workflowCards}
      `;
    } else {
    refs.evidenceList.className = "timing-exposure-list";
    refs.evidenceList.innerHTML = `
        <div class="timing-exposure-row"><b>Station</b><span>Station assignment</span><small>sequence, A/M, HC, assigned steps</small></div>
        <div class="timing-exposure-row"><b>Size</b><span>Manual dimensions</span><small>Width and Depth from the table below</small></div>
        <div class="timing-exposure-row warn"><b>Risk</b><span>Quality / space risk</span><small>carried from Station Layout review</small></div>
      `;
    }
  }
}

function refreshHumanGate() {
  humanInputSections.forEach((section) => {
    const card = refs.twinCanvas?.querySelector(`.human-input-card[data-input-id="${section.id}"]`);
    if (!card) return;
    const badgeEl = card.querySelector("em");
    const feedbackEl = card.querySelector(".input-feedback");
    const textarea = card.querySelector("textarea");
    const hasValue = section.value.trim().length > 0;
    const recorded = section.status === "Ready" && hasValue;
    const draftSaved = section.status === "Draft" && hasValue;
    card.classList.toggle("missing", section.status === "Missing");
    card.classList.toggle("draft", section.status === "Draft");
    card.classList.toggle("ready", section.status === "Ready");
    card.classList.toggle("recorded", Boolean(recorded));
    if (badgeEl) badgeEl.textContent = recorded ? "Ready" : draftSaved ? "Draft saved" : section.status;
    if (feedbackEl) feedbackEl.textContent = recorded ? "Recorded for CT calculation" : draftSaved ? "Saved locally · pending submit" : "Required before CT calculation";
    if (textarea) textarea.readOnly = Boolean(recorded);
  });
  renderRows();
  renderHumanGatePanel();
}

function refreshStationDraftFromField(field) {
  const row = field.closest(".station-edit-row");
  const station = getActiveStations().find((item) => item.id === row?.dataset.stationId);
  if (!station) return;
  const value = field.value.trim();
  const key = field.dataset.field;
  if (key === "steps") station.steps = value.split(",").map((item) => item.trim()).filter(Boolean);
  else if (key === "id") {
    const previousId = station.id;
    station.id = value || previousId;
    row.dataset.stationId = station.id;
    selectedStationId = station.id;
  } else if (key === "hc") station.hc = value || "0";
  else if (key === "note" || key === "issue") station[key] = value;
  selectStation(station.id);
}

function updateStationLayoutFromField(field) {
  const station = getActiveStations().find((item) => item.id === field.dataset.stationId);
  if (!station) return;
  const key = field.dataset.layoutField;
  if (key === "layoutWidth" || key === "layoutDepth") {
    station[key] = Math.max(0.5, Number(field.value) || 0.5);
  } else if (key === "operatorSide") {
    station.operatorSide = field.value;
  }
  selectedStationId = station.id;
  refs.twinCanvas.innerHTML = renderMappingCanvas();
  renderMappingPanel();
}

function syncCtCalculatorView(sourceField) {
  const totalProcessTime = 354;
  const targetCt = Math.max(1, Number(ctCalculatorState.targetCt) || 1);
  const totalHc = Math.max(1, Math.round(Number(ctCalculatorState.totalHc) || 1));
  const generatedHc = Math.ceil(totalProcessTime / targetCt);
  const generatedCt = totalProcessTime / totalHc;
  const volumeTargetCt = getVolumeTargetCt();

  if (sourceField?.dataset.ctField === "targetCt") {
    ctCalculatorState.totalHc = generatedHc;
    const hcInput = refs.twinCanvas?.querySelector("[data-ct-field='totalHc']");
    if (hcInput) hcInput.value = ctCalculatorState.totalHc;
  } else if (sourceField?.dataset.ctField === "totalHc") {
    ctCalculatorState.targetCt = Number(generatedCt.toFixed(1));
    const ctInput = refs.twinCanvas?.querySelector("[data-ct-field='targetCt']");
    if (ctInput) ctInput.value = ctCalculatorState.targetCt;
  } else if (sourceField && ["dailyVolume", "shiftCount", "shiftHours", "oee"].includes(sourceField.dataset.ctField)) {
    ctCalculatorState.targetCt = Number(volumeTargetCt.toFixed(1));
    ctCalculatorState.totalHc = Math.ceil(totalProcessTime / Math.max(0.1, ctCalculatorState.targetCt));
    const ctInput = refs.twinCanvas?.querySelector("[data-ct-field='targetCt']");
    const hcInput = refs.twinCanvas?.querySelector("[data-ct-field='totalHc']");
    if (ctInput) ctInput.value = ctCalculatorState.targetCt;
    if (hcInput) hcInput.value = ctCalculatorState.totalHc;
  }

  const hcResult = refs.twinCanvas?.querySelector("[data-ct-result='hc']");
  const ctResult = refs.twinCanvas?.querySelector("[data-ct-result='ct']");
  const volumeCtResult = refs.twinCanvas?.querySelector("[data-ct-result='volumeCt']");
  const hcFormula = refs.twinCanvas?.querySelector("[data-ct-formula='hc']");
  const ctFormula = refs.twinCanvas?.querySelector("[data-ct-formula='ct']");
  const volumeCtFormula = refs.twinCanvas?.querySelector("[data-ct-formula='volumeCt']");
  refs.twinCanvas?.querySelectorAll(".ct-mode-card").forEach((card) => card.classList.remove("active"));
  sourceField?.closest(".ct-mode-card")?.classList.add("active");
  if (hcResult) hcResult.textContent = String(Math.ceil(totalProcessTime / Math.max(1, Number(ctCalculatorState.targetCt) || 1)));
  if (ctResult) ctResult.textContent = (totalProcessTime / Math.max(1, Math.round(Number(ctCalculatorState.totalHc) || 1))).toFixed(1);
  if (volumeCtResult) volumeCtResult.textContent = getVolumeTargetCt().toFixed(1);
  if (hcFormula) hcFormula.textContent = `${totalProcessTime}s / ${Number(ctCalculatorState.targetCt).toFixed(1)}s`;
  if (ctFormula) ctFormula.textContent = `${totalProcessTime}s / ${Math.round(Number(ctCalculatorState.totalHc) || 1)} HC`;
  if (volumeCtFormula) volumeCtFormula.textContent = `${ctCalculatorState.shiftCount} × ${ctCalculatorState.shiftHours}h × 3600 × ${ctCalculatorState.oee}% / ${ctCalculatorState.dailyVolume}`;
}

function updateCtCalculator(field) {
  const key = field.dataset.ctField;
  const value = Number(field.value);
  if (key === "targetCt") {
    ctInputMode = "ct";
    ctCalculatorState.targetCt = Math.max(1, value || 1);
  } else if (key === "totalHc") {
    ctInputMode = "hc";
    ctCalculatorState.totalHc = Math.max(1, Math.round(value || 1));
  } else if (["dailyVolume", "shiftCount", "shiftHours", "oee"].includes(key)) {
    ctInputMode = "volume";
    const minValue = key === "shiftHours" ? 0.1 : 1;
    ctCalculatorState[key] = Math.max(minValue, value || minValue);
  }
  syncCtCalculatorView(field);
  renderCtPanel();
}

function saveCtCalculatorInput(field) {
  const key = field.dataset.ctField;
  const value = Number(field.value);
  if (key === "targetCt") {
    ctInputMode = "ct";
    ctCalculatorState.targetCt = Math.max(1, value || 1);
  } else if (key === "totalHc") {
    ctInputMode = "hc";
    ctCalculatorState.totalHc = Math.max(1, Math.round(value || 1));
  } else if (["dailyVolume", "shiftCount", "shiftHours", "oee"].includes(key)) {
    ctInputMode = "volume";
    const minValue = key === "shiftHours" ? 0.1 : 1;
    ctCalculatorState[key] = Math.max(minValue, value || minValue);
  }
}

function bindCtCalculatorInputs() {
  refs.twinCanvas?.querySelectorAll(".ct-calc-input").forEach((field) => {
    field.addEventListener("input", () => updateCtCalculator(field));
    field.addEventListener("change", () => updateCtCalculator(field));
  });
}

function bindMiImageUploads() {
  refs.twinCanvas?.querySelectorAll("[data-mi-image-station]").forEach((input) => {
    input.addEventListener("change", () => {
      const station = getActiveStations().find((item) => item.id === input.dataset.miImageStation);
      const file = input.files?.[0];
      if (!station || !file) return;
      station.miImageName = file.name;
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          station.miImageUrl = String(reader.result || "");
          renderStage("output");
        });
        reader.readAsDataURL(file);
      } else {
        station.miImageUrl = "";
        renderStage("output");
      }
    });
  });
  refs.twinCanvas?.querySelectorAll("[data-mi-risk-station]").forEach((field) => {
    field.addEventListener("input", () => updateMiQualityRisk(field));
    field.addEventListener("change", () => updateMiQualityRisk(field));
  });
  refs.twinCanvas?.querySelectorAll("[data-mi-ctq-station]").forEach((field) => {
    field.addEventListener("input", () => updateMiCtq(field));
    field.addEventListener("change", () => updateMiCtq(field));
  });
}

function updateMiCtq(field) {
  const station = getActiveStations().find((item) => item.id === field.dataset.miCtqStation);
  if (!station) return;
  station.miCtq = field.value;
}

function updateMiQualityRisk(field) {
  const station = getActiveStations().find((item) => item.id === field.dataset.miRiskStation);
  const index = Number(field.dataset.miRiskIndex);
  if (!station || !Number.isFinite(index)) return;
  getStationQualityRiskRows(station);
  station.miQualityRisks[index] = field.value;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function getMiExportRows() {
  const rows = [["Station", "Station Time (secs)", "HC", "Status", "Assigned Steps", "Issue", "CTQ", "Quality Risk 1", "Quality Risk 2", "Quality Risk 3", "Uploaded Image"]];
  getActiveStations().forEach((station) => {
    const risks = getStationQualityRiskRows(station);
    rows.push([
      station.id,
      station.time,
      station.hc,
      stationStateLabel(station.state),
      station.steps.join(" / "),
      station.issue,
      station.miCtq || "",
      risks[0],
      risks[1],
      risks[2],
      station.miImageName || "",
    ]);
  });
  return rows;
}

function exportMiExcel() {
  const csv = getMiExportRows().map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "mi_package_output.csv";
  link.click();
  URL.revokeObjectURL(url);
  showToast("MI Package Output exported for Excel");
}

function renderMiExportPanel() {
  setText(refs.aiStepTitle, "Excel Export");
  setText(refs.confidence, "MI");
  setText(refs.aiReason, "Export the current MI Package Output station summary for Excel review. This export is only available on this page.");
  if (refs.missingList) {
    refs.missingList.innerHTML = `
      <li>${getActiveStations().length} station row(s)</li>
      <li>Includes station time, HC, assigned steps, issue, and uploaded image file name</li>
      <li>Downloaded as CSV and can be opened in Excel</li>
    `;
  }
  setText(refs.evidenceTitle, "Export Action");
  if (refs.evidenceList) {
    refs.evidenceList.className = "mi-export-panel";
    refs.evidenceList.innerHTML = `<button class="mi-export-excel" type="button" data-action="export-mi-excel">Export Excel</button>`;
    refs.evidenceList.querySelector("[data-action='export-mi-excel']")?.addEventListener("click", exportMiExcel);
  }
}

function beginStationEdit(stationId) {
  const station = getStationDraft(stationId);
  if (!station) return;
  station.editing = true;
  selectedStationId = station.id;
  renderStage("station");
}

function addStationDraft() {
  const stations = getActiveStations();
  const maxStationNumber = stations.reduce((max, station) => {
    const match = station.id.match(/\d+/);
    return Math.max(max, match ? Number(match[0]) : 0);
  }, 0);
  const id = `ST${String(maxStationNumber + 1).padStart(2, "0")}`;
  const station = {
    id,
    time: 0,
    hc: "1.0",
    state: "light",
    steps: [],
    note: "New station work content",
    issue: "Manual station added",
    editing: true,
  };
  const baseline = stationSnapshot(station);
  station.aiBaseline = { ...baseline };
  station.lastSubmitted = { ...baseline };
  station.trace = [];
  stations.push(station);
  selectedStationId = id;
  renderStage("station");
  showToast(`${id} added`);
}

function deleteSelectedStation() {
  if (!selectedStationId) return;
  const stations = getActiveStations();
  const index = stations.findIndex((station) => station.id === selectedStationId);
  if (index < 0) return;
  if (stations[index].automation) {
    showToast("AUTO station is generated from A steps and cannot be deleted");
    return;
  }
  const [removed] = stations.splice(index, 1);
  selectedStationId = stations[Math.max(0, index - 1)]?.id || stations[0]?.id || "";
  renderStage("station");
  showToast(`${removed.id} deleted`);
}

function cancelStationEdit(stationId) {
  const station = getStationDraft(stationId);
  if (!station) return;
  applyStationSnapshot(station, station.lastSubmitted);
  station.editing = false;
  selectedStationId = station.id;
  renderStage("station");
  showToast(`${station.id} changes canceled`);
}

function submitStationOverride(stationId) {
  const station = getStationDraft(stationId);
  if (!station) return;
  const previous = station.lastSubmitted;
  const current = stationSnapshot(station);
  const changes = Object.keys(current)
    .filter((key) => current[key] !== previous[key])
    .map((key) => ({
      field: key,
      label: stationFieldLabels[key] || key,
      from: previous[key],
      to: current[key],
    }));

  station.editing = false;

  if (!changes.length) {
    renderStage("station");
    showToast(`${station.id} has no submitted change`);
    return;
  }

  const entry = {
    stationId: current.id,
    time: new Date().toLocaleString(),
    changes,
  };

  station.override = true;
  station.trace.unshift(entry);
  stationTraceLog.unshift(entry);
  station.lastSubmitted = { ...current };
  selectedStationId = current.id;
  renderStage("station");
  showToast(`${current.id} override submitted and traced`);
}

function selectStation(stationId) {
  selectedStationId = stationId;
  refs.twinCanvas?.querySelectorAll("[data-station-id]").forEach((node) => {
    node.classList.toggle("active", node.dataset.stationId === selectedStationId);
  });
  renderStationPanel();
}

function selectLayoutStation(stationId) {
  selectedStationId = stationId;
  renderStage("mapping");
}

function selectMappingRow(mappingId) {
  selectedMappingId = mappingId;
  refs.twinCanvas?.querySelectorAll("[data-mapping-id]").forEach((node) => {
    node.classList.toggle("active", node.dataset.mappingId === selectedMappingId);
  });
  renderMappingPanel();
}

function beginMappingEdit(mappingId) {
  const row = getMappingRow(mappingId);
  if (!row) return;
  row.editing = true;
  selectedMappingId = row.id;
  renderStage("mapping");
}

function cancelMappingEdit(mappingId) {
  const row = getMappingRow(mappingId);
  if (!row) return;
  Object.assign(row, row.lastSubmitted);
  row.editing = false;
  selectedMappingId = row.id;
  renderStage("mapping");
  showToast(`${row.step} mapping changes canceled`);
}

function refreshMappingFromField(field) {
  const container = field.closest(".mapping-review-row");
  const row = getMappingRow(container?.dataset.mappingId);
  if (!row) return;
  row[field.dataset.field] = field.value.trim();
  selectMappingRow(row.id);
}

function submitMappingOverride(mappingId) {
  const row = getMappingRow(mappingId);
  if (!row) return;
  const previous = row.lastSubmitted;
  const current = mappingSnapshot(row);
  const changes = Object.keys(current)
    .filter((key) => current[key] !== previous[key])
    .map((key) => ({
      field: key,
      label: mappingFieldLabels[key] || key,
      from: previous[key],
      to: current[key],
    }));

  row.editing = false;
  if (!changes.length) {
    renderStage("mapping");
    showToast(`${row.step} mapping has no submitted change`);
    return;
  }

  const entry = {
    mappingId: row.id,
    step: `Step ${row.step}`,
    time: new Date().toLocaleString(),
    changes,
  };
  row.override = true;
  row.trace.unshift(entry);
  row.lastSubmitted = { ...current };
  mappingTraceLog.unshift(entry);
  selectedMappingId = row.id;
  renderStage("mapping");
  showToast(`${row.step} mapping override submitted and traced`);
}

function renderSidePanel(stage) {
  if (refs.processStack) {
    refs.processStack.innerHTML = stage.stack.map(([label, value, state]) => `<div class="stack-row ${state}"><span>${label}</span><b>${value}</b></div>`).join("");
  }
  if (refs.stationRadar) {
    refs.stationRadar.innerHTML = stage.pressure.map(([label, value, state]) => `<div class="station-puck ${state}"><b>${label}</b><span>${value}</span></div>`).join("");
  }
  if (refs.artifactStrip) {
    refs.artifactStrip.innerHTML = stage.artifacts.map(([label, value]) => `<div><b>${label}</b><span>${value}</span></div>`).join("");
  }

  $(".station-stage")?.classList.toggle("parsed-artifact-panel", stage.sideMode === "parsedArtifacts");
  $(".output-stage")?.classList.toggle(
    "is-hidden",
    ["parsedArtifacts", "stepTiming", "humanGate", "ctCalc", "stationBalance"].includes(stage.sideMode),
  );
}

function renderStage(stageKey) {
  currentStageKey = stageKey;
  const stage = stages[stageKey];
  if (!stage) return;

  setText(refs.title, stage.title);
  setText(refs.description, stage.description);
  setText(refs.twinTitle, stage.twinTitle);
  setText(refs.twinDescription, stage.twinDescription);
  setText(refs.twinStatus, stage.status);
  setText(refs.sideTitle, stage.sideTitle);
  setText(refs.sideDescription, stage.sideDescription);
  setText(refs.pressureTitle, stage.pressureTitle || "");
  setText(refs.artifactTitle, stage.artifactTitle || "");

  updateStageActionButtons(stageKey);

  if (refs.twinCanvas) {
    refs.twinCanvas.innerHTML =
      stageKey === "inputs"
        ? renderInputCanvas()
        : stageKey === "parse"
        ? renderSopFlowCanvas()
        : stageKey === "steps"
          ? renderStepTimingCanvas()
          : stageKey === "human"
            ? renderHumanGateCanvas()
            : stageKey === "time"
              ? renderCtCanvas()
              : stageKey === "station"
                ? stationViewMode === "kpi"
                  ? renderStationKpiCanvas()
                  : renderStationCanvas()
                : stageKey === "mapping"
                  ? renderMappingCanvas()
                  : stageKey === "output"
                    ? renderMiCanvas()
                  : defaultTwinCanvas;
  }

  refs.studioGrid?.classList.toggle("input-intake-view", stageKey === "inputs");
  refs.studioGrid?.classList.toggle("parse-full-view", stageKey === "parse");
  refs.studioGrid?.classList.toggle("step-timing-view", stageKey === "steps");
  refs.studioGrid?.classList.toggle("human-gate-view", stageKey === "human");
  refs.studioGrid?.classList.toggle("ct-calc-view", stageKey === "time");
  refs.studioGrid?.classList.toggle("station-balance-view", stageKey === "station");
  refs.studioGrid?.classList.toggle("layout-drawing-view", stageKey === "mapping");
  refs.studioGrid?.classList.toggle("output-mi-view", stageKey === "output");

  if (stageKey === "parse") {
    bindSopFlowInteractions();
  }

  if (stageKey === "steps") {
    refs.twinCanvas?.querySelectorAll(".area-step-card").forEach((card) => {
      card.addEventListener("click", () => {
        selectedMacroStepId = card.dataset.sopId;
        selectedStepId = selectedMacroStepId;
        renderStage("steps");
      });
    });
  }

  if (stageKey === "human") {
    refs.twinCanvas?.querySelectorAll(".human-input-card textarea").forEach((textarea) => {
      textarea.addEventListener("input", () => {
        const section = humanInputSections.find((item) => item.id === textarea.dataset.inputId);
        if (!section) return;
        section.value = textarea.value;
        section.status = section.value.trim() ? "Draft" : "Missing";
        refreshHumanGate();
      });
    });
  }

  if (stageKey === "time") {
    bindCtCalculatorInputs();
  }

  if (stageKey === "station") {
    refs.twinCanvas?.querySelectorAll("[data-action='select-station-plan']").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        selectStationPlan(button.dataset.planId);
      });
    });
    refs.twinCanvas?.querySelector("[data-action='add-station']")?.addEventListener("click", addStationDraft);
    refs.twinCanvas?.querySelector("[data-action='select-delete-station']")?.addEventListener("change", (event) => {
      selectedStationId = event.target.value;
      renderStage("station");
    });
    refs.twinCanvas?.querySelector("[data-action='delete-station']")?.addEventListener("click", deleteSelectedStation);
    refs.twinCanvas?.querySelectorAll(".station-expand-toggle").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const stationId = button.dataset.stationId;
        expandedStations[stationId] = !expandedStations[stationId];
        selectedStationId = stationId;
        renderStage("station");
      });
    });
    refs.twinCanvas?.querySelectorAll(".station-workflow-toggle").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const key = `${button.dataset.stationId}:${button.dataset.stepId}`;
        expandedStationWorkflows[key] = !expandedStationWorkflows[key];
        selectedStationId = button.dataset.stationId;
        renderStage("station");
      });
    });
    refs.twinCanvas?.querySelectorAll(".station-edit-row[data-station-id]").forEach((stationNode) => {
      stationNode.addEventListener("click", () => selectStation(stationNode.dataset.stationId));
    });
    refs.twinCanvas?.querySelectorAll(".station-action").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const row = button.closest(".station-edit-row");
        const stationId = row?.dataset.stationId;
        if (!stationId) return;
        if (button.dataset.action === "edit") beginStationEdit(stationId);
        if (button.dataset.action === "submit") submitStationOverride(stationId);
      });
    });
    refs.twinCanvas?.querySelectorAll(".station-edit-row input, .station-edit-row textarea, .station-edit-row select").forEach((field) => {
      field.addEventListener("focus", () => {
        const row = field.closest(".station-edit-row");
        if (row) selectStation(row.dataset.stationId);
      });
      field.addEventListener("input", () => refreshStationDraftFromField(field));
      field.addEventListener("change", () => refreshStationDraftFromField(field));
    });
  }

  if (stageKey === "mapping") {
    refs.twinCanvas?.querySelectorAll(".layout-svg-station[data-station-id]").forEach((stationNode) => {
      stationNode.addEventListener("click", () => selectLayoutStation(stationNode.dataset.stationId));
      stationNode.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectLayoutStation(stationNode.dataset.stationId);
        }
      });
    });
    renderMappingPanel();
  }

  if (stageKey === "output") {
    bindMiImageUploads();
  }

  renderRows();
  renderSidePanel(stage);
  setText(refs.missingTitle, "Missing Information");
  if (refs.missingList) refs.missingList.className = "";

  if (stageKey === "inputs") renderInputPanel();
  else if (stage.sideMode === "parsedArtifacts") renderParsePanel();
  else if (stage.sideMode === "stepTiming") {
    const selectedMacro = getMacroStep();
    const totalChanges = microChangeStats.added + microChangeStats.deleted + microChangeStats.moved;
    setText(refs.aiStepTitle, `Step ${formatStepId(selectedMacro.id)} · ${selectedMacro.title}`);
    setText(refs.confidence, `${totalChanges}`);
    setText(refs.aiReason, `Track manual changes made in the step XLSX table: added rows, deleted rows, and row order changes.`);
    if (refs.missingList) {
      refs.missingList.innerHTML = `
        <li>${microChangeStats.added} step(s) added manually</li>
        <li>${microChangeStats.deleted} step(s) deleted manually</li>
        <li>${microChangeStats.moved} step(s) moved to a new position</li>
      `;
    }
    setText(refs.evidenceTitle, "Step Change Summary");
    if (refs.evidenceList) {
      refs.evidenceList.className = "timing-exposure-list";
      refs.evidenceList.innerHTML = `
        <div class="timing-exposure-row"><b>${microChangeStats.added}</b><span>Added</span><small>new step rows inserted</small></div>
        <div class="timing-exposure-row warn"><b>${microChangeStats.deleted}</b><span>Deleted</span><small>step rows removed</small></div>
        <div class="timing-exposure-row"><b>${microChangeStats.moved}</b><span>Moved</span><small>rows reordered within the table</small></div>
      `;
    }
  } else if (stage.sideMode === "humanGate") renderHumanGatePanel();
  else if (stage.sideMode === "ctCalc") renderCtPanel();
  else if (stage.sideMode === "stationBalance") renderStationPanel();
  else if (stageKey === "mapping") renderMappingPanel();
  else if (stageKey === "output") renderMiExportPanel();
  else renderAI();

  if (stageKey === "parse") scrollSelectedSopStepIntoView();

  selectOutput(stage.output);
}

function selectOutput(outputKey) {
  if (!outputs[outputKey]) return;
  $$(".output-tab").forEach((node) => node.classList.toggle("active", node.dataset.output === outputKey));
  if (refs.output) refs.output.innerHTML = outputs[outputKey];
}

function getContinueLabel(stageKey = currentStageKey) {
  const currentIndex = stageFlow.indexOf(stageKey);
  const nextKey = stageFlow[currentIndex + 1];
  return nextKey ? `Continue to ${stages[nextKey].title}` : "Finish Review";
}

function requiresDraftSave(stageKey = currentStageKey) {
  return Object.prototype.hasOwnProperty.call(draftSavedByStage, stageKey);
}

function updateStageActionButtons(stageKey = currentStageKey) {
  const needsSave = requiresDraftSave(stageKey);
  if (refs.saveDraft) {
    refs.saveDraft.hidden = !needsSave;
    refs.saveDraft.textContent = draftSavedByStage[stageKey] ? "Draft Saved" : "Save Draft";
    refs.saveDraft.classList.toggle("saved", Boolean(draftSavedByStage[stageKey]));
  }
  if (refs.continue) {
    refs.continue.textContent = getContinueLabel(stageKey);
    refs.continue.disabled = needsSave && !draftSavedByStage[stageKey];
    refs.continue.title = refs.continue.disabled ? "Save draft before continuing" : "";
  }
}

function saveCurrentDraft() {
  if (!requiresDraftSave()) return;
  draftSavedByStage[currentStageKey] = true;
  updateStageActionButtons();
  showToast(`${stages[currentStageKey].title} draft saved`);
}

function continueToNextStage() {
  if (requiresDraftSave() && !draftSavedByStage[currentStageKey]) {
    showToast("Save draft before continuing");
    return;
  }
  const currentIndex = stageFlow.indexOf(currentStageKey);
  const nextKey = stageFlow[currentIndex + 1];
  if (!nextKey) {
    showToast("Review complete");
    return;
  }
  $$(".flow-item").forEach((node) => node.classList.toggle("active", node.dataset.stage === nextKey));
  renderStage(nextKey);
}

function showToast(message) {
  $(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function bindEvents() {
  $$(".flow-item").forEach((item) => {
    item.addEventListener("click", () => {
      $$(".flow-item").forEach((node) => node.classList.remove("active"));
      item.classList.add("active");
      renderStage(item.dataset.stage);
    });
  });

  $$(".output-tab").forEach((tab) => {
    tab.addEventListener("click", () => selectOutput(tab.dataset.output));
  });

  $$(".segmented button").forEach((button) => {
    button.addEventListener("click", () => {
      if (currentStageKey !== "steps" || !button.dataset.filter) return;
      microTableFilter = button.dataset.filter;
      renderRows();
    });
  });

  refs.search?.addEventListener("input", () => {
    renderRows();
  });

  refs.verticalResizeBar?.addEventListener("pointerdown", (event) => {
    if (currentStageKey !== "parse") return;
    resizingParseCanvas = true;
    refs.verticalResizeBar.setPointerCapture?.(event.pointerId);
    document.body.classList.add("resizing-vertical");
    event.preventDefault();
  });

  refs.horizontalResizeBar?.addEventListener("pointerdown", (event) => {
    resizingHorizontalPanels = true;
    refs.horizontalResizeBar.setPointerCapture?.(event.pointerId);
    document.body.classList.add("resizing-horizontal");
    event.preventDefault();
  });

  refs.sidebarResizeBar?.addEventListener("pointerdown", (event) => {
    resizingSidebar = true;
    refs.sidebarResizeBar.setPointerCapture?.(event.pointerId);
    document.body.classList.add("resizing-horizontal");
    event.preventDefault();
  });

  window.addEventListener("pointermove", (event) => {
    if (!resizingParseCanvas || currentStageKey !== "parse" || !refs.twinCanvas) return;
    const canvasTop = refs.twinCanvas.getBoundingClientRect().top;
    const height = Math.max(320, Math.min(760, event.clientY - canvasTop - 8));
    document.documentElement.style.setProperty("--parse-canvas-height", `${height}px`);
  });

  window.addEventListener("pointermove", (event) => {
    if (!resizingHorizontalPanels) return;
    const workspace = $(".workspace");
    const sidebar = $(".sidebar");
    if (!workspace || !sidebar || !refs.horizontalResizeBar) return;
    const workspaceRect = workspace.getBoundingClientRect();
    const sidebarWidth = sidebar.getBoundingClientRect().width;
    const rightBarWidth = refs.horizontalResizeBar.getBoundingClientRect().width;
    const leftBarWidth = refs.sidebarResizeBar?.getBoundingClientRect().width || 0;
    const availableWidth = workspaceRect.width - sidebarWidth - leftBarWidth - rightBarWidth;
    const minMain = 560;
    const minAi = 240;
    const pointerX = event.clientX - workspaceRect.left - sidebarWidth - leftBarWidth;
    const mainWidth = Math.max(minMain, Math.min(availableWidth - minAi, pointerX - rightBarWidth / 2));
    const aiWidth = availableWidth - mainWidth;
    document.documentElement.style.setProperty("--main-panel-width", `${mainWidth}px`);
    document.documentElement.style.setProperty("--ai-panel-width", `${aiWidth}px`);
  });

  window.addEventListener("pointermove", (event) => {
    if (!resizingSidebar) return;
    const workspace = $(".workspace");
    if (!workspace) return;
    const workspaceRect = workspace.getBoundingClientRect();
    const sidebarWidth = Math.max(164, Math.min(320, event.clientX - workspaceRect.left));
    document.documentElement.style.setProperty("--sidebar-width", `${sidebarWidth}px`);
  });

  window.addEventListener("pointerup", () => {
    if (!resizingParseCanvas) return;
    resizingParseCanvas = false;
    document.body.classList.remove("resizing-vertical");
  });

  window.addEventListener("pointerup", () => {
    if (!resizingHorizontalPanels) return;
    resizingHorizontalPanels = false;
    document.body.classList.remove("resizing-horizontal");
  });

  window.addEventListener("pointerup", () => {
    if (!resizingSidebar) return;
    resizingSidebar = false;
    document.body.classList.remove("resizing-horizontal");
  });

  refs.saveDraft?.addEventListener("click", saveCurrentDraft);
  refs.continue?.addEventListener("click", continueToNextStage);
}

bindEvents();
renderStage("inputs");
