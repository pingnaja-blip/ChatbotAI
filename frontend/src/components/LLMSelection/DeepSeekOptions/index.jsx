import { useState, useRef } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import System from "@/models/system";
import showToast from "@/utils/toast";

const DEEPSEEK_BASE_PATH = "https://api.deepseek.com";
const DEEPSEEK_MODELS = [
  { id: "deepseek-chat", label: "DeepSeek Chat (V3.2)" },
  { id: "deepseek-reasoner", label: "DeepSeek Reasoner (V3.2)" },
  { id: "deepseek-coder", label: "DeepSeek Coder" },
];

export default function DeepSeekOptions({ settings }) {
  const [validating, setValidating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const apiKeyRef = useRef(null);

  const modelPref = DEEPSEEK_MODELS.some((m) => m.id === settings?.GenericOpenAiModelPref)
    ? settings.GenericOpenAiModelPref
    : "deepseek-chat";
  const tokenLimit = settings?.GenericOpenAiTokenLimit || 128000;

  return (
    <div className="flex flex-col gap-y-4">
      <input
        type="hidden"
        name="GenericOpenAiBasePath"
        value={DEEPSEEK_BASE_PATH}
      />
      <div className="flex gap-4 flex-wrap">
        <div className="flex flex-col min-w-[280px]">
          <label className="text-theme-text text-sm font-semibold block mb-4">
            API Key
          </label>
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <input
                ref={apiKeyRef}
                type={showApiKey ? "text" : "password"}
                name="GenericOpenAiKey"
                className="w-full pr-10 bg-dropdown-bg text-theme-text placeholder:text-theme-text-muted text-sm rounded-lg focus:border-dropdown-border block p-2.5 border border-dropdown-border"
                placeholder="DeepSeek API Key"
                defaultValue={settings?.GenericOpenAiKey ?? ""}
                required={true}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowApiKey((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-theme-text-muted hover:text-theme-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
                tabIndex={-1}
              >
                {showApiKey ? (
                  <EyeSlash size={18} weight="bold" />
                ) : (
                  <Eye size={18} weight="bold" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={async () => {
                setValidating(true);
                try {
                  const key = apiKeyRef.current?.value?.trim();
                  const isMasked =
                    !key ||
                    key.length < 8 ||
                    /^\*+$/.test(key) ||
                    key === "*".repeat(20);
                  const result = isMasked
                    ? await System.validateLlmKey()
                    : await System.validateAiApiKey("deepseek", key);
                  if (result.valid) {
                    showToast("API key is valid.", "success");
                  } else {
                    showToast(result.error || "Invalid API key.", "error");
                  }
                } finally {
                  setValidating(false);
                }
              }}
              disabled={validating}
              className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold bg-accent hover:bg-accent-hover text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {validating ? "Validating…" : "Validate key"}
            </button>
          </div>
        </div>
        <div className="flex flex-col w-60">
          <label className="text-theme-text text-sm font-semibold block mb-4">
            Chat Model Selection
          </label>
          <select
            name="GenericOpenAiModelPref"
            className="bg-dropdown-bg text-theme-text text-sm rounded-lg focus:border-dropdown-border block w-full p-2.5 border border-dropdown-border"
            required={true}
            defaultValue={modelPref}
          >
            {DEEPSEEK_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-x-4 flex-wrap">
        <div className="flex flex-col w-60">
          <label className="text-theme-text text-sm font-semibold block mb-4">
            Token context window
          </label>
          <input
            type="number"
            name="GenericOpenAiTokenLimit"
            className="bg-dropdown-bg text-theme-text placeholder:text-theme-text-muted text-sm rounded-lg focus:border-dropdown-border block w-full p-2.5 border border-dropdown-border"
            placeholder="128000"
            min={1}
            onScroll={(e) => e.target.blur()}
            defaultValue={tokenLimit}
            required={true}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col w-60">
          <label className="text-theme-text text-sm font-semibold block mb-4">
            Max Tokens
          </label>
          <input
            type="number"
            name="GenericOpenAiMaxTokens"
            className="bg-dropdown-bg text-theme-text placeholder:text-theme-text-muted text-sm rounded-lg focus:border-dropdown-border block w-full p-2.5 border border-dropdown-border"
            placeholder="Max tokens per request"
            min={1}
            defaultValue={settings?.GenericOpenAiMaxTokens || 4096}
            required={true}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
