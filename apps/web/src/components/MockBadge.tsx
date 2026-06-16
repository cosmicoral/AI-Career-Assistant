export function MockBadge({ show }: { show?: boolean }) {
  if (!show) return null;
  return <span className="mock-badge">MOCK</span>;
}
