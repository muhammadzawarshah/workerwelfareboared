export function ActionCard({
  title,
  caption,
  active,
  onClick,
}: {
  title: string;
  caption: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={`action-card ${active ? "active" : ""}`} onClick={onClick}>
      <span>{active ? "+" : "•"}</span>
      <div>
        <strong>{title}</strong>
        <small>{caption}</small>
      </div>
    </button>
  );
}
