export function AppIcon({ label }: { label: string }) {
  return (
    <span className="app-icon" aria-hidden>
      {label.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
      <path d="M14 6l3 3" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
      <path d="M8 7V5" />
      <path d="M16 7V5" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

export function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 3.8 3.8" />
      <path d="M8.4 5.5A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a15.4 15.4 0 0 1-3 3.8" />
      <path d="M6.1 6.9C3.5 8.7 2 12 2 12s3.5 7 10 7a10.9 10.9 0 0 0 5-1.2" />
    </svg>
  );
}
