export function ActionButtons({
  onView,
  onApprove,
  onReject,
}: {
  onView?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  return (
    <div className="action-buttons">
      {onView ? <button onClick={onView}>View</button> : null}
      {onApprove ? <button className="btn-approve" onClick={onApprove}>Approve</button> : null}
      {onReject ? <button className="btn-reject" onClick={onReject}>Reject</button> : null}
    </div>
  );
}
