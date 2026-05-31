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
const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "hello_world";
const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || "en_US";

async function sendMeta(payload) {
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      ok: false,
      error: data?.error?.message || `HTTP ${res.status}`,
      raw: data
    };
  }
  return {
    ok: true,
    message_id: data?.messages?.[0]?.id || null,
    raw: data
  };
}

async function sendWhatsAppText() {
  if (!token || !phoneNumberId || !to) {
    return {
      sent: false,
      error:
        "Missing env vars. Required: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TO"
    };
  }

  try {
    const textResult = await sendMeta({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: message }
    });

    if (textResult.ok) {
      return {
        sent: true,
        mode: "text",
        message_id: textResult.message_id || null,
        raw: textResult.raw
      };
    }

    // Fallback: template message for reliability outside free-text session windows.
    const templateResult = await sendMeta({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: templateLang }
      }
    });

    if (templateResult.ok) {
      return {
        sent: true,
        mode: "template",
        message_id: templateResult.message_id || null,
        raw: templateResult.raw,
        warning: `Text failed, fallback template sent: ${templateName}`
      };
    }

    return {
      sent: false,
      mode: "failed",
      error: `Text failed: ${textResult.error}; Template failed: ${templateResult.error}`,
      raw: {
        text: textResult.raw,
        template: templateResult.raw
      }
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
    mode: result.mode || null,
    message_id: result.message_id || null,
    warning: result.warning || null,
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
