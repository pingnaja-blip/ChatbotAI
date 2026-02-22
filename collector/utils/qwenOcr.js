/**
 * Qwen (Alibaba DashScope) OCR for extracting text from document images.
 * Used when processing non-plain-text uploads (e.g. PDF) in sets of 100 pages.
 * Set DASHSCOPE_API_KEY in collector .env to enable. See Alibaba Model Studio for API key.
 */

const PAGES_PER_SET = 100;
const DEFAULT_PROMPT =
  "Please output only the text content from the image without any additional descriptions or formatting.";

/**
 * Extract text from a single image using Qwen-VL-OCR via DashScope (OpenAI-compatible API).
 * @param {string} imageDataUrl - Data URL e.g. "data:image/png;base64,..."
 * @returns {Promise<string>} Extracted text or empty string on failure
 */
async function extractTextFromImage(imageDataUrl) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const baseURL =
    process.env.DASHSCOPE_BASE_URL ||
    "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

  if (!apiKey) {
    throw new Error("DASHSCOPE_API_KEY is not set. Cannot use Qwen OCR.");
  }

  const OpenAI = require("openai");
  const client = new OpenAI({ apiKey, baseURL });

  const response = await client.chat.completions.create({
    model: process.env.DASHSCOPE_OCR_MODEL || "qwen-vl-ocr-2025-11-20",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: DEFAULT_PROMPT },
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl,
              min_pixels: 32 * 32 * 3,
              max_pixels: 32 * 32 * 8192,
            },
          },
        ],
      },
    ],
  });

  const text = response?.choices?.[0]?.message?.content?.trim() || "";
  return text;
}

module.exports = {
  PAGES_PER_SET,
  extractTextFromImage,
};
