import React, { useState, useRef, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { AVAILABLE_LLM_PROVIDERS } from "@/pages/GeneralSettings/LLMPreference";
import Workspace from "@/models/workspace";
import showToast from "@/utils/toast";

const DEFAULT_PROVIDER = "deepseek";
const PROVIDER_MODELS = {
  deepseek: "deepseek-chat",
  qwen: "qwen-turbo",
  openai: "gpt-4o",
  anthropic: "claude-2",
  gemini: "gemini-pro",
};

const PROVIDERS = AVAILABLE_LLM_PROVIDERS.filter(
  (p) =>
    !["native", "textgenwebui", "koboldcpp", "localai", "lmstudio"].includes(
      p.value
    )
);

export default function ChatLLMDropdown({ workspace, onWorkspaceUpdate }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const dropdownRef = useRef(null);

  const effectiveProvider =
    workspace?.chatProvider && workspace.chatProvider !== "default"
      ? workspace.chatProvider
      : DEFAULT_PROVIDER;

  const selectedProvider = PROVIDERS.find((p) => p.value === effectiveProvider);
  const displayName = selectedProvider?.name ?? "DeepSeek";

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (provider) => {
    if (provider === effectiveProvider) {
      setOpen(false);
      return;
    }
    setUpdating(true);
    try {
      const chatProvider =
        provider === "default" || provider === DEFAULT_PROVIDER
          ? provider === "default"
            ? "default"
            : "deepseek"
          : provider;
      const chatModel =
        chatProvider === "default"
          ? null
          : PROVIDER_MODELS[chatProvider] || null;

      const { workspace: updated, message } = await Workspace.update(
        workspace.slug,
        {
          chatProvider: chatProvider === "default" ? "default" : chatProvider,
          chatModel,
        }
      );
      if (updated) {
        showToast(
          `Switched to ${PROVIDERS.find((p) => p.value === provider)?.name ?? provider}`,
          "success"
        );
        onWorkspaceUpdate?.(updated);
      } else {
        showToast(message || "Failed to update", "error");
      }
    } finally {
      setUpdating(false);
      setOpen(false);
    }
  };

  if (!workspace?.slug) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={updating}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dropdown-bg border border-dropdown-border text-theme-text text-sm font-medium hover:bg-dropdown-border/30 transition-colors disabled:opacity-60"
        aria-label="Select AI provider"
      >
        <img
          src={selectedProvider?.logo}
          alt=""
          className="w-5 h-5 rounded object-contain"
        />
        <span className="truncate max-w-[120px]">{displayName}</span>
        <CaretDown
          size={16}
          weight="bold"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-dropdown-bg border border-dropdown-border rounded-lg shadow-lg z-50 py-1">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.value}
              type="button"
              onClick={() => handleSelect(provider.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-dropdown-border/30 transition-colors ${
                provider.value === effectiveProvider
                  ? "bg-accent/20 text-accent"
                  : "text-theme-text"
              }`}
            >
              <img
                src={provider.logo}
                alt=""
                className="w-8 h-8 rounded object-contain shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-medium truncate">{provider.name}</span>
                <span className="text-xs text-theme-text-muted truncate">
                  {provider.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
