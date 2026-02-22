export default function ChatHistorySettings({ workspace, setHasChanges }) {
  return (
    <div>
      <div className="flex flex-col gap-y-1 mb-4">
        <label htmlFor="name" className="block mb-2 input-label">
          Chat History
        </label>
        <p className="text-theme-text-muted text-xs font-medium">
          The number of previous chats that will be included in the
          response&apos;s short-term memory.
          <i>Recommend 20. </i>
          Anything more than 45 is likely to lead to continuous chat failures
          depending on message size.
        </p>
      </div>
      <input
        name="openAiHistory"
        type="number"
        min={1}
        max={45}
        step={1}
        onWheel={(e) => e.target.blur()}
        defaultValue={workspace?.openAiHistory ?? 20}
        className="theme-input block w-full"
        placeholder="20"
        required={true}
        autoComplete="off"
        onChange={() => setHasChanges(true)}
      />
    </div>
  );
}
