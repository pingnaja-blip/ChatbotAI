function recommendedSettings(provider = null) {
  switch (provider) {
    case "mistral":
      return { temp: 0 };
    default:
      return { temp: 0.7 };
  }
}

export default function ChatTemperatureSettings({
  settings,
  workspace,
  setHasChanges,
}) {
  const defaults = recommendedSettings(settings?.LLMProvider);
  return (
    <div>
      <div className="flex flex-col">
        <label htmlFor="name" className="block input-label">
          LLM Temperature
        </label>
        <p className="text-theme-text-muted text-xs font-medium py-1.5">
          This setting controls how &quot;creative&quot; your LLM responses will
          be.
          <br />
          The higher the number the more creative. For some models this can lead
          to incoherent responses when set too high.
          <br />
          <br />
          <i>
            Most LLMs have various acceptable ranges of valid values. Consult
            your LLM provider for that information.
          </i>
        </p>
      </div>
      <input
        name="openAiTemp"
        type="number"
        min={0.0}
        step={0.1}
        onWheel={(e) => e.target.blur()}
        defaultValue={workspace?.openAiTemp ?? defaults.temp}
        className="theme-input block w-full"
        placeholder="0.7"
        required={true}
        autoComplete="off"
        onChange={() => setHasChanges(true)}
      />
    </div>
  );
}
