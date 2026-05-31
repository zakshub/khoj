const fs = require("fs");
const path = require("path");

function runPublish(rootDir) {
  const root = rootDir || path.resolve(__dirname, "..", "..");
  const planPath = path.join(root, "ops", "master-plan.json");
  const statusPath = path.join(root, "public", "data", "status.json");
  const aiContentPath = path.join(root, "ops", "output", "ai-content.json");
  const outDir = path.join(root, "ops", "output");
  const contentDir = path.join(root, "public", "content");
  const contentPath = path.join(contentDir, "latest.json");
  const publishLogPath = path.join(outDir, "publish-log.json");

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });

  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
  const aiData = fs.existsSync(aiContentPath)
    ? JSON.parse(fs.readFileSync(aiContentPath, "utf8"))
    : null;
  const now = new Date().toISOString();

  const topicDetails = [
  {
    ur: "آسمان نیلا کیوں ہے؟",
    en: "Why is the sky blue?",
    summary_ur:
      "روشنی کی لہریں فضا میں پھیلتی ہیں، نیلا رنگ زیادہ بکھرتا ہے، اس لیے آسمان نیلا دکھتا ہے۔",
    mission_ur: "شفاف گلاس میں پانی اور ٹارچ سے روشنی کے رنگ دیکھو۔"
  },
  {
    ur: "پانی اوپر کیسے جاتا ہے؟",
    en: "How does water go up?",
    summary_ur:
      "گرمی سے پانی بخارات بنتا ہے، اوپر جاتا ہے، پھر ٹھنڈا ہو کر بادل بنتا ہے۔",
    mission_ur: "ڈھکن والے برتن میں بھاپ کو جمع ہوتا دیکھو۔"
  },
  {
    ur: "چاند ہمارے ساتھ کیوں چلتا ہے؟",
    en: "Why does the moon follow us?",
    summary_ur:
      "چاند بہت دور ہے، اس لیے چلتے وقت ہمیں یوں لگتا ہے کہ وہ ہمارے ساتھ چل رہا ہے۔",
    mission_ur: "گاڑی میں بیٹھ کر دور اور قریب چیزوں کی حرکت compare کرو۔"
  }
  ];

  const content = {
    generated_at: now,
    program: plan.program,
    stage: plan.phase.title,
    focus: plan.focus,
    overall_percent: status.overall_percent,
    hero: {
      title: "KHOJ STEAM School",
      tagline: "Where Curiosity Finds Discovery",
      description:
        "Urdu-first discovery learning for Pakistani children. Daily spark, story, mission, and reward cycle."
    },
    latest_cards:
      aiData &&
      aiData.content &&
      Array.isArray(aiData.content.cards) &&
      aiData.content.cards.length
        ? aiData.content.cards
        : topicDetails,
    mission_of_day: {
      title:
        (aiData &&
          aiData.content &&
          aiData.content.mission_of_day &&
          aiData.content.mission_of_day.title) ||
        "گھر کا چھوٹا سائنس مشن",
      body:
        (aiData &&
          aiData.content &&
          aiData.content.mission_of_day &&
          aiData.content.mission_of_day.body) ||
        "ایک شفاف گلاس، پانی، اور ٹارچ سے روشنی کا جادو دیکھیں۔",
      duration_min:
        (aiData &&
          aiData.content &&
          aiData.content.mission_of_day &&
          Number(aiData.content.mission_of_day.duration_min)) ||
        10,
      age_group:
        (aiData &&
          aiData.content &&
          aiData.content.mission_of_day &&
          aiData.content.mission_of_day.age_group) ||
        "Nano (4-7)"
    },
    plan_snapshot: {
      phase: status.phase,
      eta_days: status.eta_days,
      achieved_percent: status.achieved_percent,
      remaining_percent: status.remaining_percent
    },
    source:
      aiData && aiData.mode ? `ai-council:${aiData.mode}` : "static-fallback"
  };

  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2));
  fs.writeFileSync(
    publishLogPath,
    JSON.stringify(
      {
        timestamp: now,
        status: "published",
        output: "public/content/latest.json"
      },
      null,
      2
    )
  );
}

module.exports = { runPublish };

if (require.main === module) {
  runPublish();
  console.log("[publish] updated public/content/latest.json");
}
