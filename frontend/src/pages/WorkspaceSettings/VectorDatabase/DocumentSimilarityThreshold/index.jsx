export default function DocumentSimilarityThreshold({
  workspace,
  setHasChanges,
}) {
  return (
    <div>
      <div className="flex flex-col">
        <label htmlFor="name" className="block input-label">
          Document similarity threshold
        </label>
        <p className="text-theme-text-muted text-xs font-medium py-1.5">
          The minimum similarity score required for a source to be considered
          related to the chat. The higher the number, the more similar the
          source must be to the chat.
        </p>
      </div>
      <select
        name="similarityThreshold"
        defaultValue={workspace?.similarityThreshold ?? 0.25}
        className="theme-input mt-2 block w-full"
        onChange={() => setHasChanges(true)}
        required={true}
      >
        <option value={0.0}>No restriction</option>
        <option value={0.25}>Low (similarity score &ge; .25)</option>
        <option value={0.5}>Medium (similarity score &ge; .50)</option>
        <option value={0.75}>High (similarity score &ge; .75)</option>
      </select>
    </div>
  );
}
