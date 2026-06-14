export function Toast({
  message,
  tone,
  onClose,
}: {
  message: string;
  tone: "success" | "error" | "info";
  onClose: () => void;
}) {
  return (
    <div className={`toast-notification toast-${tone}`} role="status">
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Close notification">
        x
      </button>
    </div>
  );
}
