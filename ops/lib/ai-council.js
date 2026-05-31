const OPENAI_URL = "https://api.openai.com/v1/responses";
const GEMINI_URL_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

function getProviderOrder() {
  const primary = (process.env.AI_PROVIDER_PRIMARY || "openai").toLowerCase();
  const secondary = (process.env.AI_PROVIDER_SECONDARY || "gemini").toLowerCase();
  const tertiary = (process.env.AI_PROVIDER_TERTIARY || "anthropic").toLowerCase();
  return [primary, secondary, tertiary];
}

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-5";
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: prompt
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenAI HTTP ${res.status}`);
  }

  const text = data?.output_text;
  if (!text) throw new Error("OpenAI empty output_text");
  return text;
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-pro";
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const url = `${GEMINI_URL_BASE}/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini HTTP ${res.status}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini empty output");
  return text;
}

async function callAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Anthropic HTTP ${res.status}`);
  }

  const text = data?.content?.[0]?.text;
  if (!text) throw new Error("Anthropic empty output");
  return text;
}

async function callProvider(provider, prompt) {
  if (provider === "openai") return callOpenAI(prompt);
  if (provider === "gemini") return callGemini(prompt);
  if (provider === "anthropic") return callAnthropic(prompt);
  throw new Error(`Unknown provider: ${provider}`);
}

async function generateWithCouncil(prompt) {
  const order = getProviderOrder();
  const errors = [];

  for (const provider of order) {
    try {
      const text = await callProvider(provider, prompt);
      return { ok: true, provider, text, errors };
    } catch (err) {
      errors.push({
        provider,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  return { ok: false, provider: null, text: null, errors };
}

module.exports = {
  generateWithCouncil,
  getProviderOrder
};
