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

const uploadSourceNames = ["Historical MI", "Assembly Video", "MTM Database"];

// Station plans are populated by the AI line-balancing result (Page 05). No hardcoded mock.
const stationDraft = [];
const stationPlanB = [];
// stepNo -> CT(secs), built from the AI input so manual cross-station edits recompute station time.
const stationStepCt = new Map();

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
    label: "Plan A",
    description: "AI station balancing plan.",
  },
  planB: {
    name: "Plan B",
    label: "Plan B",
    description: "AI station balancing plan.",
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

function normalizeParsedWorkflow(workflow, index = 0) {
  return {
    id: String(workflow.id || (index + 1) * 10).padStart(3, "0"),
    process: workflow.process || workflow.title || `Video Workflow ${index + 1}`,
    detail: workflow.detail || workflow.description || "Generated from uploaded assembly video.",
    station: workflow.station || "Video extracted station",
    material: workflow.material || "TBD",
    confidence: workflow.confidence || "AI parsed",
    evidence: Array.isArray(workflow.evidence) ? workflow.evidence : [workflow.detail || "Video evidence"],
    microSteps: (Array.isArray(workflow.microSteps) && workflow.microSteps.length ? workflow.microSteps : [{ description: "Review extracted operation.", partName: "TBD" }]).map((microStep, microIndex) => {
      if (Array.isArray(microStep)) {
        return {
          description: microStep[0] || `Extracted action ${microIndex + 1}`,
          partName: microStep[1] || "TBD",
          theoreticalPt: Number(microStep[2]) || [6, 7, 5, 8, 6, 7, 5][microIndex % 7],
          actualPt: Number(microStep[4]) || [6, 7.5, 5.5, 8, 6.5, 7, 5.5][microIndex % 7],
          automation: microStep[7] === "A" ? "A" : "M",
          evidence: microStep[5] || "",
        };
      }
      return {
        description: microStep.description || microStep.stepDescription || `Extracted action ${microIndex + 1}`,
        partName: microStep.partName || microStep.part || microStep.material || "TBD",
        theoreticalPt: Number(microStep.theoreticalPt ?? microStep.pt) || [6, 7, 5, 8, 6, 7, 5][microIndex % 7],
        actualPt: Number(microStep.actualPt ?? microStep.theoreticalPt ?? microStep.pt) || [6, 7.5, 5.5, 8, 6.5, 7, 5.5][microIndex % 7],
        automation: microStep.automation === "A" ? "A" : "M",
        evidence: microStep.evidence || "",
      };
    }),
  };
}

function getWorkflowTime(workflow) {
  return Math.round(workflow.microSteps.reduce((sum, microStep) => sum + (Number(microStep.actualPt) || Number(microStep.theoreticalPt) || 0), 0));
}

function buildStationFromParsedWorkflow(workflow, index, sourceName = "Assembly Video") {
  const time = getWorkflowTime(workflow);
  return {
    id: `ST${String(index + 1).padStart(2, "0")}`,
    time,
    hc: "1.0",
    state: time > 58 ? "over" : time === 0 ? "light" : "ok",
    steps: [workflow.id],
    note: workflow.process,
    issue: `AI parsed from ${sourceName}; confirm tooling / CTQ before release`,
  };
}

function applyVideoInputDemoData(workflows = videoSopWorkflows, sourceFile = null) {
  const parsedWorkflows = workflows.map(normalizeParsedWorkflow);
  // Each video numbers its own workflow from "010", so merged workflows collide on id.
  // Re-number sequentially (010, 020, ...) so getMacroStep(id) resolves the right microSteps.
  parsedWorkflows.forEach((workflow, index) => {
    workflow.id = String((index + 1) * 10).padStart(3, "0");
  });
  const sourceName = sourceFile?.originalName || sourceFile?.original_name || "Assembly Video";
  steps.splice(
    0,
    steps.length,
    ...parsedWorkflows.map((workflow) => ({
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
      confidence: workflow.confidence || "Video input",
      reason: `${workflow.process} was generated from the provided video operation transcript.`,
      missing: ["Confirm standard time", "Confirm fixture / tool ID if applicable"],
      evidence: workflow.evidence?.length ? workflow.evidence : [workflow.detail],
    })),
  );

  sopMacroSteps.splice(
    0,
    sopMacroSteps.length,
    ...parsedWorkflows.map((workflow) => ({
      id: workflow.id,
      title: workflow.process,
      station: workflow.station,
      source: workflow.detail.split(":")[0],
      status: "Extracted",
      tone: "review",
      microSteps: workflow.microSteps.map((microStep) => [
        microStep.description,
        "TBD",
        microStep.theoreticalPt,
        "Extracted",
        microStep.actualPt,
        microStep.evidence || "",
        "",
        microStep.automation,
        microStep.partName,
      ]),
    })),
  );

  // Stations are NOT derived here. They are produced by AI line balancing on Page 05
  // (Page 04 → Continue → /generate) and mapped into stationDraft / stationPlanB there.
  stationDraft.splice(0, stationDraft.length);
  stationPlanB.splice(0, stationPlanB.length);
}

function applyParsedSopData(parsedResult) {
  const workflows = parsedResult?.workflows;
  if (!Array.isArray(workflows) || !workflows.length) {
    showToast("Video parsing completed but no SOP workflows were returned");
    return;
  }
  applyVideoInputDemoData(workflows, parsedResult.sourceFile);
  selectedStepId = steps[0]?.id || "";
  selectedMacroStepId = sopMacroSteps[0]?.id || "";
  selectedStationId = stationDraft[0]?.id || "";
  activeStationPlanId = "planA";
  stationViewMode = "plan";
  draftSavedByStage.parse = false;
  draftSavedByStage.steps = false;
  draftSavedByStage.time = false;
  draftSavedByStage.station = false;
  draftSavedByStage.mapping = false;
  showToast(`${workflows.length} SOP workflow(s) parsed from uploaded video`);
}

function clearGeneratedWorkflowData() {
  steps.splice(0, steps.length);
  sopMacroSteps.splice(0, sopMacroSteps.length);
}

clearGeneratedWorkflowData();

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
let stationPlanLocked = false; // false = compare both plans; true = show selected, fold the other
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
const apiBaseUrl = window.MCI_API_BASE || "http://localhost:4000";
const inputFilesApi = globalThis.MciInputFilesApi.createInputFilesApi({ baseUrl: apiBaseUrl });
const inputUploadState = globalThis.MciInputUploadState.createInputUploadState({
  inputSources,
  uploadSourceNames,
});
const inputPage = globalThis.MciInputPage.createInputPage({
  inputSources,
  inputFilesApi,
  inputUploadState,
  aiPanel: globalThis.MciAiPanel,
  escapeHtml,
  isActive: () => currentStageKey === "inputs",
  renderInputs: () => renderStage("inputs"),
  applyParsedResult: applyParsedSopData,
});
const processStepPage = globalThis.MciProcessStepPage.createProcessStepPage({
  steps,
  escapeHtml,
  formatStepId,
  aiPanel: globalThis.MciAiPanel,
  getSopStepTone,
  getSopReviewState,
  getSelectedStepId: () => selectedStepId,
  setSelectedStepId: (stepId) => {
    selectedStepId = stepId;
  },
  getDraggedSopStepId: () => draggedSopStepId,
  setDraggedSopStepId: (stepId) => {
    draggedSopStepId = stepId;
  },
  renderRows,
  renderCurrentPanel: renderParsePanel,
  renderParse: () => renderStage("parse"),
  onGenerateSopStep: generateSopStepFromDraft,
  moveSopStep,
  deleteSopStep,
  updateSopStepFromField,
});
const microChangeStats = {
  added: 0,
  deleted: 0,
  moved: 0,
};
const processTimePage = globalThis.MciProcessTimePage.createProcessTimePage({
  sopMacroSteps,
  aiPanel: globalThis.MciAiPanel,
  escapeHtml,
  formatStepId,
  getMicroReviewState,
  getSelectedMacroStep: () => getMacroStep(),
  setSelectedMacroStepId: (stepId) => {
    selectedMacroStepId = stepId;
  },
  setSelectedStepId: (stepId) => {
    selectedStepId = stepId;
  },
  getMicroChangeStats: () => microChangeStats,
  renderProcessTime: () => renderStage("steps"),
});
const workflowTable = globalThis.MciWorkflowTable.createWorkflowTable({
  steps,
  escapeHtml,
  formatStepId,
  formatStepNumber,
  getMacroStep,
  getMicroPt,
  getActualPt,
  getMicroAutomation,
  hasMicroFlag,
  getSelectedStepId: () => selectedStepId,
  setSelectedStepId: (stepId) => {
    selectedStepId = stepId;
  },
  setSelectedMacroStepId: (stepId) => {
    selectedMacroStepId = stepId;
  },
  getDraggedSopStepId: () => draggedSopStepId,
  setDraggedSopStepId: (stepId) => {
    draggedSopStepId = stepId;
  },
  getDraggedMicroStep: () => draggedMicroStep,
  setDraggedMicroStep: (microStep) => {
    draggedMicroStep = microStep;
  },
  getCurrentStageKey: () => currentStageKey,
  renderParse: renderParsePanel,
  renderSteps: () => renderStage(getStepTableStageKey()),
  renderAI,
  scrollSelectedSopStepIntoView,
  moveSopStep,
  swapMicroSteps,
  updateWorkflowFromField,
  updateMicroStepDraftFromField,
  updateMicroStepFromField,
  deleteMicroStep,
  confirmMicroStep,
});
const ctCalculationPage = globalThis.MciCtCalculationPage.createCtCalculationPage({
  ctCalculatorState,
  aiPanel: globalThis.MciAiPanel,
  sopMacroSteps,
  escapeHtml,
  formatStepId,
  formatProcessStepLabel,
  getMicroPt,
  getActualPt,
  getMicroAutomation,
  getCtInputMode: () => ctInputMode,
  setCtInputMode: (mode) => {
    ctInputMode = mode;
  },
  getSearchQuery: () => refs.search?.value || "",
  getTwinCanvas: () => refs.twinCanvas,
  renderPanel: () => renderCtPanel(),
});
const expandedStations = {};
const expandedStationWorkflows = {};
const stationPage = globalThis.MciStationPage.createStationPage({
  stationPlanMeta,
  expandedStations,
  expandedStationWorkflows,
  escapeHtml,
  formatStepId,
  stationFieldLabels,
  stationTraceLog,
  getActiveStationPlanId: () => activeStationPlanId,
  getSelectedStationId: () => selectedStationId,
  getStationViewMode: () => stationViewMode,
  setSelectedStationId: (stationId) => {
    selectedStationId = stationId;
  },
  setStationViewMode,
  syncStationAutomationGrouping,
  getActiveStations,
  getStationPlanSummary,
  getStationDraft,
  getStationKpiRows,
  getLineKpiSummary,
  getTargetCt: () => Number(ctCalculatorState.targetCt) || 58,
  getStationMicroSteps,
  getMacroStep,
  getStepById,
  getMicroAutomation,
  getMicroPt,
  getActualPt,
  stationSnapshot,
  applyStationSnapshot,
  updateStationTiming,
  selectStationPlan,
  getStationPlanLocked: () => stationPlanLocked,
  unlockStationPlans: () => {
    stationPlanLocked = false;
    renderStage("station");
  },
  renderStationStage: () => renderStage("station"),
  showToast,
});
const layoutPage = globalThis.MciLayoutPage.createLayoutPage({
  escapeHtml,
  formatStepId,
  stationStateLabel,
  getActiveStations,
  getSelectedStationId: () => selectedStationId,
  setSelectedStationId: (stationId) => {
    selectedStationId = stationId;
  },
  syncStationAutomationGrouping,
  getLineKpiSummary,
  getTargetCt: () => Number(ctCalculatorState.targetCt) || 58,
  getMacroStep,
  getStepById,
  renderMappingStage: () => renderStage("mapping"),
  renderMappingPanel,
});
const miOutputPage = globalThis.MciMiOutputPage.createMiOutputPage({
  sopMacroSteps,
  stationMaterialLists,
  escapeHtml,
  formatStepId,
  stationStateLabel,
  getActiveStations,
  getTargetCt: () => Number(ctCalculatorState.targetCt) || 58,
  getMacroStepById,
  getAiStepById,
  renderOutputStage: () => renderStage("output"),
  showToast,
});

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
  return sopMacroSteps.find((step) => step.id === id) || sopMacroSteps[0] || null;
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

function updateMicroStepDraftFromField(field) {
  const macro = getMacroStep(field.dataset.macroId || selectedMacroStepId);
  const index = Number(field.dataset.microIndex);
  const fieldIndex = Number(field.dataset.microField);
  if (!macro.microSteps[index] || !Number.isFinite(fieldIndex)) return;
  macro.microSteps[index][fieldIndex] = fieldIndex === 2 || fieldIndex === 4 ? Number(field.value) || 0 : field.value;
  selectedMacroStepId = macro.id;
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
  // Station time = sum of CT of its assigned steps (stepNos), looked up from the AI step map.
  // This makes manual cross-station step moves recompute correctly against the target CT.
  const targetCt = Number(ctCalculatorState.targetCt) || 58;
  const total = (station.steps || []).reduce((sum, stepNo) => sum + (stationStepCt.get(stepNo) || 0), 0);
  station.time = Math.round(total);
  station.state = station.time > targetCt ? "over" : station.time === 0 ? "light" : "ok";
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
  // Disabled: stations come from AI line balancing (which already groups automation steps),
  // so the legacy auto-grouping must not mutate the AI-mapped station arrays.
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

function exportStepsToExcel() {
  // Build a CSV of the Page 03 step table. CSV opens natively in Excel; UTF-8 BOM keeps Chinese readable.
  const headers = ["SOP Workflow", "Step", "Automation", "Step Description", "Part", "Theoretical PT (secs)", "Actual PT (secs)"];
  const rows = [headers];

  steps.forEach((step) => {
    const macro = getMacroStep(step.id);
    const microSteps = macro?.microSteps?.length ? macro.microSteps : [];
    microSteps.forEach((microStep, index) => {
      rows.push([
        index === 0 ? step.process : "",
        `${formatStepId(step.id)}.${String(index + 1).padStart(2, "0")}`,
        getMicroAutomation(microStep),
        microStep[0] || "",
        step.material || "",
        getMicroPt(microStep, index),
        getActualPt(microStep, index),
      ]);
    });
  });

  if (rows.length === 1) {
    showToast("No parsed steps to export yet. Run Parse first.");
    return;
  }

  const escapeCsv = (value) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = "﻿" + rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");

  downloadCsv(rows, "process-steps.csv");
  showToast(`Exported ${rows.length - 1} step row(s) to Excel`);
}

// Shared CSV download (UTF-8 BOM so Excel renders Chinese correctly).
function downloadCsv(rows, filename) {
  const escapeCsv = (value) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = "﻿" + rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportStationPlanToExcel() {
  const stations = getActiveStations();
  if (!stations.length) {
    showToast("No station plan to export yet. Generate a plan first.");
    return;
  }
  const summary = getStationPlanSummary(activeStationPlanId);
  const targetCt = Number(ctCalculatorState.targetCt) || summary.targetCt || 0;

  const rows = [
    [`${summary.name}`, `LBE ${summary.lbe.toFixed(1)}%`, `${stations.length} stations`, `Total HC ${summary.totalHc.toFixed(1)}`, `Target CT ${targetCt}s`],
    [],
    ["Station", "Automation", "Assigned Steps", "Station Time (secs)", "Target CT (secs)", "Load %", "HC", "Status"],
  ];

  stations.forEach((station) => {
    const load = targetCt > 0 ? Math.round((Number(station.time) / targetCt) * 100) : 0;
    const status = station.state === "over" ? "Over CT" : station.state === "light" ? "Light" : "Within CT";
    rows.push([
      station.id,
      station.automation ? "A" : "M",
      (station.steps || []).join(" "),
      station.time,
      targetCt,
      `${load}%`,
      station.hc,
      status,
    ]);
  });

  downloadCsv(rows, `station-plan-${activeStationPlanId}.csv`);
  showToast(`Exported ${stations.length} station(s) to Excel`);
}

function getVolumeTargetCt() {
  return ctCalculationPage.getVolumeTargetCt();
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

function generateSopStepFromDraft(sopStepDraft) {
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
  stationPlanLocked = true; // selecting a plan folds the other into an alternative bar
  const stations = getActiveStations();
  selectedStationId = stations.some((station) => station.id === selectedStationId) ? selectedStationId : stations[0]?.id || "";
  renderStage("station");
}

function setStationViewMode(mode) {
  stationViewMode = mode === "kpi" ? "kpi" : "plan";
  renderStage("station");
}

function renderStationPlanCards() {
  return stationPage.renderPlanCards();
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
  return inputPage.render();
}

function renderSopFlowCanvas() {
  return processStepPage.render();
}

function renderStepTimingCanvas() {
  return processTimePage.render();
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
  return ctCalculationPage.renderCanvas();
}

function renderStationWorkflowDetails(station) {
  return stationPage.renderWorkflowDetails(station);
}

// Compact card for compare mode — KPIs + strategy + pick button (no full station detail).
// Full view reusing the legacy station look: Line Balance Efficiency + CT bar chart + station list.
const STATION_EMPTY_PROMPT = `<div class="ai-station-loading">No station plan yet. Go to Page 04 (CT Calculation), set a target CT, then click "Continue to Station Balancing Workspace" to generate Plan A / Plan B.</div>`;

function stationCanvasGate() {
  // Returns HTML to show INSTEAD of the legacy station view, or null to use the legacy view.
  if (stationPlanState.status === "generating") {
    return `<div class="ai-station-loading"><span class="station-spinner"></span> ${escapeHtml(stationPlanState.message || "Generating station plan…")}</div>`;
  }
  if (stationPlanState.status === "failed") {
    return `<div class="ai-station-failed">Station generation failed: ${escapeHtml(stationPlanState.message || "")}</div>`;
  }
  if (!stationDraft.length && !stationPlanB.length) return STATION_EMPTY_PROMPT;
  return null;
}

function renderStationCanvas() {
  // Legacy editable station view, now populated by AI-mapped data (no hardcoded mock).
  return stationCanvasGate() ?? stationPage.renderCanvas();
}

function renderStationKpiCanvas() {
  return stationCanvasGate() ?? stationPage.renderKpiCanvas();
}

function getStationLayoutMeta(station) {
  return layoutPage.getStationLayoutMeta(station);
}

function getLayoutStations() {
  return layoutPage.getLayoutStations();
}

function renderMappingCanvas() {
  return layoutPage.renderCanvas();
}

async function refreshInputUploadStatus() {
  await inputPage.refreshUploadStatus();
}

async function uploadInputFile(input) {
  await inputPage.uploadFile(input);
}

function bindInputUploads() {
  inputPage.bind(refs.twinCanvas);
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
  return miOutputPage.getStationMaterialList(stationId);
}

function getMiStationStepRows(station) {
  return miOutputPage.getStationStepRows(station);
}

function getStationQualityRiskRows(station) {
  return miOutputPage.getQualityRiskRows(station);
}

function renderMiCanvas() {
  return miOutputPage.renderCanvas();
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
      <div class="step-toolbar-actions">
        <button class="micro-add-step" type="button" data-action="add-micro-step">+ Add Step</button>
        <button class="micro-export-step" type="button" data-action="export-steps-excel">⤓ Export Excel</button>
      </div>
    `;
    refs.editorContext.querySelector?.("[data-action='add-micro-step']")?.addEventListener("click", addMicroStep);
    refs.editorContext.querySelector?.("[data-action='export-steps-excel']")?.addEventListener("click", exportStepsToExcel);
  } else if (currentStageKey === "time") {
    refs.editorContext.innerHTML = `<div><h2>CT Calculation</h2><p>Target CT uses all confirmed step actual PT from Process Time as the total process-time basis.</p></div>`;
  } else if (currentStageKey === "station") {
    const stale = isStationPlanStale();
    const status = stationPlanState.status;
    if (status === "idle") {
      refs.editorContext.innerHTML = `<div><h2>Station Plan</h2><p>Go to Page 04, set a target CT, then click “Generate Station Plan”.</p></div>`;
    } else {
      const tone = status === "generating" ? "generating" : stale ? "stale" : status;
      refs.editorContext.innerHTML = `
        <div><h2>Station Plan</h2><p>${escapeHtml(stationPlanState.message || "")}</p></div>
        <div class="station-plan-status ${tone}">
          <span>${status === "generating" ? `<span class="station-spinner"></span> Generating station plan…` : stale ? "CT changed on Page 04 — plan is out of date" : "Plan based on CT " + stationPlanState.ctSnapshot + "s / HC " + stationPlanState.hcSnapshot}</span>
          <div class="step-toolbar-actions">
            ${status === "ready" && (stationDraft.length || stationPlanB.length) ? `<button class="micro-export-step" type="button" data-action="export-station-excel">⤓ Export Excel</button>` : ""}
            ${status !== "generating" && (stale || status === "ready" || status === "failed") ? `<button class="generate-station-btn" type="button" data-action="regenerate-station-plan">Regenerate Plan</button>` : ""}
          </div>
        </div>
      `;
      refs.editorContext.querySelector?.("[data-action='regenerate-station-plan']")?.addEventListener("click", generateStationPlan);
      refs.editorContext.querySelector?.("[data-action='export-station-excel']")?.addEventListener("click", exportStationPlanToExcel);
    }
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
  refs.rows.innerHTML = workflowTable.renderRowsHtml({ showTiming });
  bindWorkflowBreakdownRows();
}

function bindWorkflowBreakdownRows() {
  if (!refs.rows) return;
  workflowTable.bind(refs.rows);
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
  ctCalculationPage.renderRows(refs.rows);
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
  // Legacy station table, populated by AI-mapped stationDraft/stationPlanB. Empty until generated.
  if (!refs.rows) return;
  if (!stationDraft.length && !stationPlanB.length) {
    refs.rows.innerHTML = "";
    return;
  }
  stationPage.renderRows(refs);
}

function renderLayoutRows() {
  layoutPage.renderRows(refs);
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
  inputPage.renderPanel(refs);
}

function renderAI() {
  const step = getStepById(selectedStepId) || steps[0];
  if (!step) {
    globalThis.MciAiPanel.renderPanel(refs, {
      title: "Step Review · Waiting for parsing",
      confidence: "0",
      reason: "No parsed SOP workflow is available yet. Parse uploaded inputs on Page 01 before reviewing generated steps.",
      missingItems: ["Run Parse Uploaded Inputs"],
      evidenceTitle: "Evidence Sources",
      evidenceClass: "evidence-list",
      evidenceVariant: "trace",
      evidenceItems: [],
    });
    return;
  }
  globalThis.MciAiPanel.renderPanel(refs, {
    title: `Step ${formatStepId(step.id)} · ${step.process}`,
    confidence: step.confidence,
    reason: step.reason,
    missingItems: step.missing,
    evidenceTitle: "Evidence Sources",
    evidenceClass: "evidence-list",
    evidenceVariant: "trace",
    evidenceItems: step.evidence.map((item) => ({ title: item })),
  });
}

function bindSopPanelInteractions() {
  processStepPage.bindPanel(refs);
}

function renderParsePanel() {
  processStepPage.renderPanel(refs);
  bindSopPanelInteractions();
}

function bindSopFlowInteractions() {
  processStepPage.bind(refs.twinCanvas);
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
  ctCalculationPage.renderPanel(refs);
}

function renderStationPanel() {
  // Empty-state panel until AI generates; otherwise the legacy station panel (driven by AI data).
  if (!stationDraft.length && !stationPlanB.length) {
    globalThis.MciAiPanel.renderPanel(refs, {
      title: "Station Balance · Waiting",
      confidence: "0",
      reason: "No station plan yet. Set a target CT on Page 04 and click Continue to generate Plan A / Plan B.",
      missingItems: ["Generate a plan from Page 04 first"],
      evidenceTitle: "Station View",
      evidenceClass: "timing-exposure-list",
      evidenceItems: [],
    });
    return;
  }
  stationPage.renderPanel(refs);
}

function renderStationViewActions() {
  stationPage.renderViewActions(refs);
}

function renderMappingPanel() {
  layoutPage.renderPanel(refs);
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
  stationPage.refreshStationDraftFromField(field, refs);
}

function updateStationLayoutFromField(field) {
  layoutPage.updateStationLayoutFromField(field, refs);
}

function syncCtCalculatorView(sourceField) {
  ctCalculationPage.syncCalculatorView(sourceField);
}

function updateCtCalculator(field) {
  ctCalculationPage.updateCalculator(field);
}

function bindCtCalculatorInputs() {
  ctCalculationPage.bind(refs.twinCanvas);
}

function bindMiImageUploads() {
  miOutputPage.bind(refs);
}

function updateMiCtq(field) {
  miOutputPage.updateCtq(field);
}

function updateMiQualityRisk(field) {
  miOutputPage.updateQualityRisk(field);
}

function csvEscape(value) {
  return miOutputPage.csvEscape(value);
}

function getMiExportRows() {
  return miOutputPage.getExportRows();
}

function exportMiExcel() {
  miOutputPage.exportExcel();
}

function renderMiExportPanel() {
  miOutputPage.renderPanel(refs);
}

function beginStationEdit(stationId) {
  stationPage.beginStationEdit(stationId);
}

function addStationDraft() {
  stationPage.addStationDraft();
}

function deleteSelectedStation() {
  stationPage.deleteSelectedStation();
}

function cancelStationEdit(stationId) {
  stationPage.cancelStationEdit(stationId);
}

function submitStationOverride(stationId) {
  stationPage.submitStationOverride(stationId);
}

function selectStation(stationId) {
  stationPage.selectStation(stationId, refs);
}

function selectLayoutStation(stationId) {
  layoutPage.selectLayoutStation(stationId);
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

  if (stageKey === "inputs") {
    bindInputUploads();
  }

  if (stageKey === "steps") {
    processTimePage.bind(refs.twinCanvas);
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
    stationPage.bindCanvas(refs);
  }

  if (stageKey === "mapping") {
    layoutPage.bindCanvas(refs);
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
  else if (stage.sideMode === "stepTiming") processTimePage.renderPanel(refs);
  else if (stage.sideMode === "humanGate") renderHumanGatePanel();
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
  // On the station stage, recompute every station's time from its (possibly hand-edited)
  // steps, then report the recalculated Line Balance score.
  if (currentStageKey === "station" && (stationDraft.length || stationPlanB.length)) {
    getActiveStations().forEach(updateStationTiming);
    const summary = getStationPlanSummary(activeStationPlanId);
    renderStage("station");
    showToast(`Draft saved · ${summary.name} Line Balance ${summary.lbe.toFixed(1)}%`);
    return;
  }
  showToast(`${stages[currentStageKey].title} draft saved`);
}

// Page 05 station plan: tracks the CT/HC snapshot the current plan was generated from,
// so we can flag the plan as stale if the user goes back and changes CT on Page 04.
const stationPlanState = {
  status: "idle", // idle | generating | ready | failed
  message: "",
  ctSnapshot: null,
  hcSnapshot: null,
  plans: [], // AI-balanced station plans (Plan A / Plan B) with computed IE metrics
  selectedPlanIndex: null, // null = compare mode; number = locked-in plan
};

function goToStage(stageKey) {
  $$(".flow-item").forEach((node) => node.classList.toggle("active", node.dataset.stage === stageKey));
  renderStage(stageKey);
}

// Collect the data contract handed from Page 04 → Page 05 for AI station balancing.
function collectStationPlanInput() {
  const targetCt = Number(ctCalculatorState.targetCt) || 0;
  const totalHc = Number(ctCalculatorState.totalHc) || 0;
  const steps = sopMacroSteps.flatMap((macro) =>
    (macro.microSteps || []).map((microStep, index) => ({
      workflowId: macro.id,
      workflow: macro.title,
      stepNo: `${formatStepId(macro.id)}.${String(index + 1).padStart(2, "0")}`,
      description: microStep[0],
      automation: getMicroAutomation(microStep),
      actualPt: getActualPt(microStep, index),
    })),
  );
  return { targetCt, totalHc, steps };
}

// Map the AI line-balancing result into the legacy station model so the existing Page 05
// view (plan cards, LBE bar, editable rows, KPI chart) renders it. Plan A → stationDraft,
// Plan B → stationPlanB; metadata + station times come straight from the AI/computed values.
function mapAiPlansToLegacyStations(input, plans) {
  // Build stepNo -> CT so manual cross-station moves can recompute station time + LBE.
  stationStepCt.clear();
  input.steps.forEach((s) => stationStepCt.set(s.stepNo, Number(s.actualPt) || 0));

  function toLegacyStations(plan) {
    return plan.stations.map((s, i) => {
      const isAuto = s.automation === "A";
      const station = {
        id: `ST${String(s.stationNo || i + 1).padStart(2, "0")}`,
        time: Math.round(s.st),
        hc: isAuto ? "0.0" : "1.0",
        state: s.overTarget ? "over" : s.st === 0 ? "light" : "ok",
        steps: [...s.stepNos], // micro-step ids; editable + movable across stations
        note: s.name,
        issue: isAuto ? "Automated station (A steps grouped)" : "Manual station",
        automation: isAuto,
      };
      initializeStationRuntime(station);
      return station;
    });
  }

  const planAStations = plans[0] ? toLegacyStations(plans[0]) : [];
  const planBStations = plans[1] ? toLegacyStations(plans[1]) : [];
  stationDraft.splice(0, stationDraft.length, ...planAStations);
  stationPlanB.splice(0, stationPlanB.length, ...planBStations);

  // Plan card labels/descriptions from the AI strategy text.
  if (plans[0]) {
    stationPlanMeta.planA.label = "Plan A";
    stationPlanMeta.planA.description = plans[0].strategy || "AI station balancing plan.";
  }
  if (plans[1]) {
    stationPlanMeta.planB.label = "Plan B";
    stationPlanMeta.planB.description = plans[1].strategy || "AI station balancing plan.";
  }

  activeStationPlanId = "planA";
  stationPlanLocked = false; // start in compare mode (both plans shown)
  selectedStationId = stationDraft[0]?.id || "";
}

async function generateStationPlan() {
  const input = collectStationPlanInput();
  if (!input.steps.length) {
    showToast("Parse and review steps before generating a station plan");
    return;
  }
  if (!input.targetCt) {
    showToast("Set a target CT on Page 04 first");
    return;
  }

  stationPlanState.status = "generating";
  stationPlanState.message = `AI is balancing ${input.steps.length} step(s) into stations at target CT ${input.targetCt}s...`;
  stationPlanState.ctSnapshot = input.targetCt;
  stationPlanState.hcSnapshot = input.totalHc;
  stationPlanState.selectedPlanIndex = null; // start in compare mode
  goToStage("station");

  try {
    const result = await inputFilesApi.generateStations(input);
    stationPlanState.plans = Array.isArray(result.plans) ? result.plans : [];
    if (!stationPlanState.plans.length) throw new Error("AI returned no station plans");
    mapAiPlansToLegacyStations(input, stationPlanState.plans);
    stationPlanState.status = "ready";
    const best = stationPlanState.plans.reduce((a, b) => (b.lbr > a.lbr ? b : a));
    stationPlanState.message = `${stationPlanState.plans.length} plan(s) generated · best LBR ${best.lbr}% at CT ${input.targetCt}s`;
  } catch (error) {
    stationPlanState.status = "failed";
    stationPlanState.message = error.message || "Station generation failed";
    console.warn(error);
  }
  if (currentStageKey === "station") renderStage("station");
}

function isStationPlanStale() {
  if (stationPlanState.status !== "ready") return false;
  return Number(ctCalculatorState.targetCt) !== stationPlanState.ctSnapshot
    || Number(ctCalculatorState.totalHc) !== stationPlanState.hcSnapshot;
}

function continueToNextStage() {
  if (requiresDraftSave() && !draftSavedByStage[currentStageKey]) {
    showToast("Save draft before continuing");
    return;
  }
  if (currentStageKey === "inputs" && !inputPage.hasCompletedParse()) {
    showToast("Parse uploaded inputs before continuing");
    return;
  }
  // From CT Calculation, "Continue" triggers AI station balancing (with loading) into Page 05.
  if (currentStageKey === "time") {
    generateStationPlan();
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
refreshInputUploadStatus();
