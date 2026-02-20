export default function CTAButton({
  children,
  disabled = false,
  onClick,
  className = "",
}) {
  return (
    <button
      disabled={disabled}
      onClick={() => onClick?.()}
      className={`text-xs px-4 py-1 font-semibold rounded-lg bg-dropdown-border hover:bg-theme-text text-white hover:text-white h-[34px] -mr-8 whitespace-nowrap shadow-[0_4px_14px_rgba(27,94,32,0.25)] w-fit ${className}`}
    >
      <div className="flex items-center justify-center gap-2">{children}</div>
    </button>
  );
}
