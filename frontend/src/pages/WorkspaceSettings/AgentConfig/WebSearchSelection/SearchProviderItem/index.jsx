export default function SearchProviderItem({ provider, checked, onClick }) {
  const { name, value, logo, description } = provider;
  return (
    <div
      onClick={onClick}
      className={`w-full p-2 rounded-md hover:cursor-pointer hover:bg-sidebar-button ${
        checked ? "bg-sidebar-button" : ""
      }`}
    >
      <input
        type="checkbox"
        value={value}
        className="peer hidden"
        checked={checked}
        readOnly={true}
        formNoValidate={true}
      />
      <div className="flex gap-x-4 items-center">
        <img src={logo} alt={`${name} logo`} className="w-10 h-10 rounded-md" />
        <div className="flex flex-col">
          <div className="text-sm font-semibold text-theme-text">{name}</div>
          <div className="mt-1 text-xs text-theme-text-muted">{description}</div>
        </div>
      </div>
    </div>
  );
}
