"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; message: string; tone: ToastTone };

/** Call signature exposed to the whole app: toast("Saved successfully") */
type NotifyFn = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<NotifyFn>(() => {});

/** Access the global toast notifier from any client component. */
export function useToast(): NotifyFn {
  return useContext(ToastContext);
}

/** Guess a tone from the message text so existing neutral messages still get colour. */
function inferTone(message: string): ToastTone {
  const m = message.toLowerCase();
  if (/(fail|unable|error|invalid|required|must|cannot|can't|denied|wrong|mismatch|missing|please|provide|exceed|not |no )/.test(m)) {
    return "error";
  }
  if (/(success|saved|created|updated|deleted|removed|recorded|assigned|completed|sent|added|generated|attached|moved|started|verified|vacant)/.test(m)) {
    return "success";
  }
  return "info";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback<NotifyFn>(
    (message, tone) => {
      const text = String(message ?? "").trim();
      if (!text) return;
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, message: text, tone: tone ?? inferTone(text) }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {toasts.length > 0 ? (
        <div className="toast-stack" role="region" aria-label="Notifications">
          {toasts.map((t) => (
            <div key={t.id} className={`toast-notification toast-${t.tone}`} role="status">
              <span>{t.message}</span>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}
