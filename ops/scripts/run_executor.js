const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const planPath = path.join(root, "ops", "master-plan.json");
const outDir = path.join(root, "ops", "output");
const execLog = path.join(outDir, "execution-log.json");
const delivLog = path.join(outDir, "deliverables.json");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const now = new Date().toISOString();

const record = {
  timestamp: now,
  phase: plan.phase.current,
  focus: plan.focus,
  action: "Executor cycle simulated: validated week 1 priorities"
};

fs.writeFileSync(execLog, JSON.stringify(record, null, 2));
fs.writeFileSync(delivLog, JSON.stringify(plan.week_1.deliverables, null, 2));

console.log("[executor] updated execution-log.json and deliverables.json");
