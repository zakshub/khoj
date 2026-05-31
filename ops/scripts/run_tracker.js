const fs = require("fs");
const path = require("path");
const { runPublish } = require("./run_publish");

const root = path.resolve(__dirname, "..", "..");
const plan = JSON.parse(
  fs.readFileSync(path.join(root, "ops", "master-plan.json"), "utf8")
);
const deliverables = JSON.parse(
  fs.readFileSync(path.join(root, "ops", "output", "deliverables.json"), "utf8")
);
const statusPath = path.join(root, "public", "data", "status.json");

const avg = Math.round(
  deliverables.reduce((acc, d) => acc + Number(d.percent || 0), 0) /
    Math.max(deliverables.length, 1)
);

const achieved = Math.max(0, Math.round(avg * 0.76));
const remaining = 100 - achieved;

const status = {
  last_updated: new Date().toISOString(),
  phase: `${plan.phase.current} - ${plan.phase.title}`,
  overall_percent: avg,
  achieved_percent: achieved,
  remaining_percent: remaining,
  eta_days: Math.max(7, 30 - Math.floor(avg / 2)),
  currently_ongoing: [
    "Week 1 content production",
    "Dashboard data integrity update",
    "Execution-to-tracking sync cycle"
  ],
  upcoming: [
    "Logo integration",
    "4-week calendar finalization",
    "WhatsApp auto-report activation"
  ],
  remaining_work: [
    "Real production metrics",
    "Parent feedback integration",
    "Automated quality checks"
  ]
};

fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
console.log("[tracker] updated public/data/status.json");
try {
  runPublish(root);
  console.log("[tracker] auto-triggered publish step");
} catch (err) {
  console.log(
    `[tracker] publish trigger failed; will retry in next cycle (${err && err.message ? err.message : "unknown"})`
  );
}
