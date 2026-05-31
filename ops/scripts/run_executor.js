const fs = require("fs");
const path = require("path");
const { generateWithCouncil, getProviderOrder } = require("../lib/ai-council");

const root = path.resolve(__dirname, "..", "..");
const planPath = path.join(root, "ops", "master-plan.json");
const outDir = path.join(root, "ops", "output");
const execLog = path.join(outDir, "execution-log.json");
const delivLog = path.join(outDir, "deliverables.json");
const aiContentPath = path.join(outDir, "ai-content.json");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const topics = plan.topics_nano || [];

function buildPrompt() {
  return [
    "You are KHOJ STEAM School content agent.",
    "Generate JSON only, no markdown, no explanation.",
    "Language for children output must be Urdu.",
    "Audience: Pakistani children age 4-7.",
    "Topics:",
    ...topics.map((t, i) => `${i + 1}. ${t}`),
    "Return JSON with this exact shape:",
    "{",
    '  "cards":[{"ur":"", "en":"", "summary_ur":"", "mission_ur":""}],',
    '  "mission_of_day":{"title":"", "body":"", "duration_min":10, "age_group":"Nano (4-7)"},',
    '  "publish_note":"short english note"',
    "}",
    "Constraints:",
    "- cards length must be exactly 3",
    "- summary_ur max 2 lines simple Urdu",
    "- mission_ur practical household task"
  ].join("\n");
}

function parseJson(text) {
  const trimmed = String(text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("AI response is not valid JSON");
  }
}

function fallbackContent() {
  return {
    cards: [
      {
        ur: "آسمان نیلا کیوں ہے؟",
        en: "Why is the sky blue?",
        summary_ur:
          "سورج کی روشنی فضا میں بکھرتی ہے۔ نیلا رنگ زیادہ بکھرتا ہے، اسی لیے آسمان نیلا نظر آتا ہے۔",
        mission_ur: "ٹارچ اور شفاف پانی سے روشنی کا تجربہ کریں۔"
      },
      {
        ur: "پانی اوپر کیسے جاتا ہے؟",
        en: "How does water go up?",
        summary_ur:
          "گرمی سے پانی بخارات بنتا ہے۔ یہ اوپر جا کر ٹھنڈا ہو کر بوندوں میں بدلتا ہے۔",
        mission_ur: "گرم برتن کی بھاپ کو ڈھکن پر جمع ہوتا دیکھیں۔"
      },
      {
        ur: "چاند ہمارے ساتھ کیوں چلتا ہے؟",
        en: "Why does the moon follow us?",
        summary_ur:
          "چاند بہت دور ہوتا ہے، اس لیے چلتے ہوئے ہمیں لگتا ہے وہ ہمارے ساتھ حرکت کر رہا ہے۔",
        mission_ur: "قریب اور دور چیزوں کی حرکت compare کریں۔"
      }
    ],
    mission_of_day: {
      title: "گھر کا سادہ سائنس مشن",
      body: "پانی، ٹارچ اور ایک گلاس سے روشنی کا زاویہ بدل کر مشاہدہ کریں۔",
      duration_min: 10,
      age_group: "Nano (4-7)"
    },
    publish_note: "Fallback content used due to provider issue."
  };
}

async function main() {
  const now = new Date().toISOString();
  const prompt = buildPrompt();
  const councilResult = await generateWithCouncil(prompt);

  let generated;
  let mode = "ai";
  if (councilResult.ok) {
    try {
      generated = parseJson(councilResult.text);
    } catch {
      generated = fallbackContent();
      mode = "fallback_parse";
    }
  } else {
    generated = fallbackContent();
    mode = "fallback_provider";
  }

  const aiContent = {
    generated_at: now,
    mode,
    provider: councilResult.provider,
    provider_order: getProviderOrder(),
    errors: councilResult.errors,
    content: generated
  };

  const deliverables = (plan.week_1 && plan.week_1.deliverables
    ? plan.week_1.deliverables
    : []
  ).map((d) => ({ ...d }));

  // If AI generation succeeds, bump content-related progress.
  if (mode === "ai") {
    for (const d of deliverables) {
      if (d.id === "W1-D1") {
        d.percent = Math.max(85, Number(d.percent || 0));
        d.status = d.percent >= 100 ? "done" : "in_progress";
      }
      if (d.id === "W1-D4") {
        d.percent = Math.max(60, Number(d.percent || 0));
        d.status = d.percent >= 100 ? "done" : "in_progress";
      }
    }
  }

  const record = {
    timestamp: now,
    phase: plan.phase.current,
    focus: plan.focus,
    action: "Executor cycle completed with AI council routing",
    mode,
    provider: councilResult.provider,
    error_count: councilResult.errors.length
  };

  fs.writeFileSync(execLog, JSON.stringify(record, null, 2));
  fs.writeFileSync(delivLog, JSON.stringify(deliverables, null, 2));
  fs.writeFileSync(aiContentPath, JSON.stringify(aiContent, null, 2));

  console.log("[executor] updated execution-log, deliverables, and ai-content");
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  fs.writeFileSync(
    execLog,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        phase: plan.phase.current,
        focus: plan.focus,
        action: "Executor cycle failed",
        error: msg
      },
      null,
      2
    )
  );
  console.error("[executor] failed:", msg);
  process.exit(1);
});
