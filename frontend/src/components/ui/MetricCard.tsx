export function MetricCard({
  title,
  value,
  hint,
  tone = "blue",
}: {
  title: string;
  value: string | number;
  hint: string;
  tone?: "blue" | "green" | "amber" | "red" | "purple";
}) {
  return (
    <section className="metric-card">
      <div className={`metric-icon ${tone}`}>{title.slice(0, 1)}</div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        <span>{hint}</span>
      </div>
    </section>
  );
}
