const DEEPSEEK_BASE_PATH = "https://api.deepseek.com";
const DEEPSEEK_MODELS = [
  { id: "deepseek-chat", label: "DeepSeek Chat (V3.2)" },
  { id: "deepseek-reasoner", label: "DeepSeek Reasoner (V3.2)" },
  { id: "deepseek-coder", label: "DeepSeek Coder" },
];

export default function DeepSeekOptions({ settings }) {
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
        <div className="flex flex-col w-60">
          <label className="text-theme-text text-sm font-semibold block mb-4">
            API Key
          </label>
          <input
            type="password"
            name="GenericOpenAiKey"
            className="bg-dropdown-bg text-theme-text placeholder:text-theme-text-muted text-sm rounded-lg focus:border-dropdown-border block w-full p-2.5 border border-dropdown-border"
            placeholder="DeepSeek API Key"
            defaultValue={settings?.GenericOpenAiKey ? "*".repeat(20) : ""}
            required={true}
            autoComplete="off"
            spellCheck={false}
          />
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
