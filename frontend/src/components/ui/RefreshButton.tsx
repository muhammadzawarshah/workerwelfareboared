export function RefreshButton({ onRefresh, isRefreshing }: { onRefresh?: () => void; isRefreshing?: boolean }) {
  return (
    <button type="button" className="ghost-button refresh-button" onClick={onRefresh} disabled={!onRefresh || isRefreshing}>
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </button>
  );
}
