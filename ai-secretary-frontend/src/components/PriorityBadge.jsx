export default function PriorityBadge({ priority, actionRequired }) {
  const config = {
    high: { label: "🔴 High", cls: "badge-high" },
    medium: { label: "🟡 Medium", cls: "badge-medium" },
    low: { label: "🟢 Low", cls: "badge-low" },
  };

  const { label, cls } = config[priority] || config.medium;

  return (
    <span className={`priority-badge ${cls}`}>
      {label}
      {actionRequired && <span className="action-dot" title="Action required">!</span>}
    </span>
  );
}
