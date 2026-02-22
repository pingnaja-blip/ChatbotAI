/**
 * Real API checks to validate DeepSeek and Qwen (DashScope) API keys.
 * Makes a minimal chat completion request; 401/403 → invalid, 200 → valid.
 */

const DEEPSEEK_BASE = "https://api.deepseek.com";
const QWEN_DASHSCOPE_BASE =
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const QWEN_CHAT_MODEL = "qwen-turbo";
const DEEPSEEK_CHAT_MODEL = "deepseek-chat";

/**
 * Validate an API key by performing a minimal chat completion request.
 * @param {string} apiKey - API key to validate
 * @param {string} baseUrl - Base URL (e.g. https://api.deepseek.com)
 * @param {string} model - Model name for the completion
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
async function validateOpenAiCompatibleKey(apiKey, baseUrl, model) {
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return { valid: false, error: "API key is required." };
  }
  const key = apiKey.trim();
  if (!baseUrl || !model) {
    return { valid: false, error: "Base URL and model are required." };
  }

  const OpenAI = require("openai");
  const client = new OpenAI({
    apiKey: key,
    baseURL: baseUrl.replace(/\/+$/, ""),
  });

  try {
    const response = await client.chat.completions.create({
      model,
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
    if (status === 401 || message.toLowerCase().includes("incorrect api key") || message.toLowerCase().includes("invalid api key") || message.toLowerCase().includes("authentication")) {
      return { valid: false, error: "Invalid or expired API key." };
    }
    if (status === 403 || message.toLowerCase().includes("forbidden")) {
      return { valid: false, error: "API key rejected (forbidden)." };
    }
    if (status === 429 || message.toLowerCase().includes("rate limit")) {
      return { valid: true }; // Key is valid; rate limit is a separate issue
    }
    return { valid: false, error: message || "Validation request failed." };
  }
}

/**
 * Validate DeepSeek API key (for chat).
 * @param {string} apiKey - DeepSeek API key (from https://platform.deepseek.com)
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
async function validateDeepSeekKey(apiKey) {
  return validateOpenAiCompatibleKey(
    apiKey,
    DEEPSEEK_BASE,
    DEEPSEEK_CHAT_MODEL
  );
}

/**
 * Validate Qwen/DashScope API key (for file upload OCR and extraction).
 * @param {string} apiKey - Alibaba DashScope API key
 * @param {string} [baseUrl] - Optional base URL (default: international DashScope)
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
async function validateQwenDashScopeKey(apiKey, baseUrl = QWEN_DASHSCOPE_BASE) {
  return validateOpenAiCompatibleKey(
    apiKey,
    baseUrl || QWEN_DASHSCOPE_BASE,
    QWEN_CHAT_MODEL
  );
}

module.exports = {
  validateDeepSeekKey,
  validateQwenDashScopeKey,
  validateOpenAiCompatibleKey,
  DEEPSEEK_BASE,
  QWEN_DASHSCOPE_BASE,
};
