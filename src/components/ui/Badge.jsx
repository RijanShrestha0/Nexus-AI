export function Badge({ children }) {
  return (
    <span className="badge">
      <span className="badge-dot" />
      {children}
    </span>
  );
}
