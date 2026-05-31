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

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const to = process.env.WHATSAPP_TO;

async function sendWhatsAppText() {
  if (!token || !phoneNumberId || !to) {
    return {
      sent: false,
      error:
        "Missing env vars. Required: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TO"
    };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: message }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        sent: false,
        error: data?.error?.message || `HTTP ${res.status}`,
        raw: data
      };
    }

    return {
      sent: true,
      message_id: data?.messages?.[0]?.id || null,
      raw: data
    };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

(async () => {
  const result = await sendWhatsAppText();
  const log = {
    timestamp: new Date().toISOString(),
    channel: "whatsapp",
    provider: "meta",
    to: to || null,
    sent: result.sent,
    message_id: result.message_id || null,
    error: result.error || null,
    message
  };

  fs.writeFileSync(
    path.join(outDir, "whatsapp-log.json"),
    JSON.stringify(log, null, 2)
  );

  if (result.sent) {
    console.log("[reporter] WhatsApp message sent successfully");
  } else {
    console.log("[reporter] WhatsApp send failed. Check ops/output/whatsapp-log.json");
  }
})();
