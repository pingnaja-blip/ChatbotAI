/**
 * Project Identity Configuration
 *
 * Centralizes branding, metadata, and identity for the application.
 * Update these values to customize your deployment.
 */

export const projectIdentity = {
  /** Display name used across the app (login, titles, placeholders) */
  name: "KBTG Regional Team",

  /** Tagline shown in onboarding and marketing copy */
  tagline: "Your personal AI assistant trained on your data",

  /** Short description for meta tags and previews */
  description:
    "KBTG Regional Team is an AI chatbot platform. Connect your documents, customize your LLM, and chat with your data.",

  /** Default app name when no custom name is configured (login page, headers) */
  defaultAppName: "KBTG Regional Team",

  /** URLs for external resources */
  urls: {
    docs: "https://useanything.com/docs",
    discord: "https://discord.gg/anythingllm",
    website: "https://useanything.com",
  },

  /** Meta / Open Graph configuration for SEO and social sharing */
  meta: {
    title:
      "KBTG Regional Team | Your personal AI assistant trained on your data",
    description:
      "KBTG Regional Team is an AI chatbot platform. Connect your documents, customize your LLM, and chat with your data.",
    ogImage: "/favicon.png",
  },
};

export default projectIdentity;
