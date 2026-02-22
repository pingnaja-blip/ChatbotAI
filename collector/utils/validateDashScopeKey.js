/**
 * Validate the collector's DASHSCOPE_API_KEY (Qwen) with a real API call.
 * Used by GET /validate-dashscope to check the key in .env.
 */

const QWEN_BASE =
  process.env.DASHSCOPE_BASE_URL ||
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const QWEN_CHAT_MODEL = "qwen-turbo";

async function validateDashScopeKey() {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: "DASHSCOPE_API_KEY is not set." };
  }

  const OpenAI = require("openai");
  const client = new OpenAI({
    apiKey: apiKey.trim(),
    baseURL: QWEN_BASE.replace(/\/+$/, ""),
  });

  try {
    const response = await client.chat.completions.create({
      model: QWEN_CHAT_MODEL,
      messages: [{ role: "user", content: "Hi" }],
      max_tokens: 1,
    });
    if (response?.choices?.length) {
      return { valid: true };
    }
    return { valid: false, error: "Unexpected API response." };
  } catch (err) {
    const status = err?.status ?? err?.code;
    const message = err?.message || String(err);
    if (
      status === 401 ||
      message.toLowerCase().includes("incorrect api key") ||
      message.toLowerCase().includes("invalid api key") ||
      message.toLowerCase().includes("authentication")
    ) {
      return { valid: false, error: "Invalid or expired API key." };
    }
    if (status === 403 || message.toLowerCase().includes("forbidden")) {
      return { valid: false, error: "API key rejected (forbidden)." };
    }
    if (status === 429 || message.toLowerCase().includes("rate limit")) {
      return { valid: true };
    }
    return { valid: false, error: message || "Validation request failed." };
  }
}

module.exports = { validateDashScopeKey };
