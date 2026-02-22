export default function VectorDBIdentifier({ workspace }) {
  return (
    <div>
      <h3 className="input-label">Vector database identifier</h3>
      <p className="text-theme-text-muted text-xs font-medium py-1"> </p>
      <p className="text-theme-text-muted text-sm">{workspace?.slug}</p>
    </div>
  );
}
