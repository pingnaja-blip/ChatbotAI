export default function WorkspaceName({ workspace, setHasChanges }) {
  return (
    <div>
      <div className="flex flex-col">
        <label htmlFor="name" className="block input-label">
          Workspace Name
        </label>
        <p className="text-theme-text-muted text-xs font-medium py-1.5">
          This will only change the display name of your workspace.
        </p>
      </div>
      <input
        name="name"
        type="text"
        minLength={2}
        maxLength={80}
        defaultValue={workspace?.name}
        className="theme-input block w-full"
        placeholder="My Workspace"
        required={true}
        autoComplete="off"
        onChange={() => setHasChanges(true)}
      />
    </div>
  );
}
