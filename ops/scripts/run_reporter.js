const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const outDir = path.join(root, "ops", "output");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const status = JSON.parse(
  fs.readFileSync(path.join(root, "public", "data", "status.json"), "utf8")
);

const message = [
  "KHOJ STATUS UPDATE",
  `Phase: ${status.phase}`,
  `Overall: ${status.overall_percent}%`,
  `Achieved: ${status.achieved_percent}% | Remaining: ${status.remaining_percent}%`,
  `ETA: ${status.eta_days} days`,
  "Ongoing:",
  ...status.currently_ongoing.map((x) => `- ${x}`),
  "Upcoming:",
  ...status.upcoming.map((x) => `- ${x}`)
].join("\n");

const log = {
  timestamp: new Date().toISOString(),
  channel: "whatsapp",
  sent: false,
  message
};

fs.writeFileSync(
  path.join(outDir, "whatsapp-log.json"),
  JSON.stringify(log, null, 2)
);

console.log("[reporter] prepared WhatsApp payload in ops/output/whatsapp-log.json");
