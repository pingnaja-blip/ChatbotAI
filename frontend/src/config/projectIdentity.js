/**
 * Project Identity Configuration
 *
 * Centralizes branding, metadata, and identity for the application.
 * Update these values to customize your deployment.
 */

export const projectIdentity = {
  /** Display name used across the app (login, titles, placeholders) */
  name: "ChatbotAI",

  /** Tagline shown in onboarding and marketing copy */
  tagline: "Your personal AI assistant trained on your data",

  /** Short description for meta tags and previews */
  description:
    "ChatbotAI is an open-source AI chatbot platform. Connect your documents, customize your LLM, and chat with your data.",

  /** Default app name when no custom name is configured (login page, headers) */
  defaultAppName: "ChatbotAI",

  /** URLs for external resources */
  urls: {
    docs: "https://useanything.com/docs",
    discord: "https://discord.gg/anythingllm",
    website: "https://useanything.com",
  },

  /** Meta / Open Graph configuration for SEO and social sharing */
  meta: {
    title: "ChatbotAI | Your personal AI assistant trained on your data",
    description:
      "ChatbotAI is an open-source AI chatbot platform. Connect your documents, customize your LLM, and chat with your data.",
    ogImage: "/favicon.png",
  },
};

export default projectIdentity;
