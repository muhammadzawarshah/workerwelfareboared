export function ChartCard({ title, stacked, line }: { title: string; stacked?: boolean; line?: boolean }) {
  const bars = [72, 78, 74, 80, 76, 82, 69];
  return (
    <section className="chart-card">
      <div className="card-title">
        <div>
          <h2>{title}</h2>
          <p>Monthly trends — FY 2025-26</p>
        </div>
      </div>
      <div className={line ? "line-chart" : "bar-chart"}>
        {bars.map((height, index) => (
          <div className="bar-wrap" key={index}>
            <span style={{ height: `${height}%` }} className={stacked ? "stacked" : ""} />
            <small>{["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][index]}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DonutCard({ title, items, total = 0 }: { title: string; items: [string, number][]; total?: number }) {
  return (
    <section className="chart-card">
      <div className="card-title">
        <h2>{title}</h2>
      </div>
      <div className="donut-layout">
        <div className="donut">
          <strong>{total}</strong>
          <span>Total</span>
        </div>
        <div className="legend">
          {items.map(([label, value]) => (
            <span key={label}>
              <i />
              {label} {value}%
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
