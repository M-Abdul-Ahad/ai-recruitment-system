import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import "./toast.css";

const ToastContext = createContext(null);

/* ── SVG Icons for Toast Types ────────────────────────────────────────── */
const ToastIcons = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const DefaultTitles = {
  success: "Success",
  error: "Error",
  warning: "Attention",
  info: "Notice",
};

/* ── Individual Toast Item ────────────────────────────────────────────── */
function ToastItem({ toast, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(toast.duration || 4500);
  const timerRef = useRef(null);
  const animFrameRef = useRef(null);

  const duration = toast.duration || 4500;

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 250);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (duration === Infinity) return;

    const startTimer = () => {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, remainingTimeRef.current);

      const updateProgress = () => {
        if (!isPaused) {
          const elapsed = Date.now() - startTimeRef.current;
          const remaining = Math.max(0, remainingTimeRef.current - elapsed);
          const percent = (remaining / duration) * 100;
          setProgress(percent);
          if (remaining > 0) {
            animFrameRef.current = requestAnimationFrame(updateProgress);
          }
        }
      };
      animFrameRef.current = requestAnimationFrame(updateProgress);
    };

    if (!isPaused) {
      startTimer();
    }

    return () => {
      clearTimeout(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [duration, handleDismiss, isPaused]);

  const handleMouseEnter = () => {
    if (duration === Infinity) return;
    setIsPaused(true);
    clearTimeout(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    if (duration === Infinity) return;
    setIsPaused(false);
  };

  const type = toast.type || "info";
  const icon = toast.icon || ToastIcons[type] || ToastIcons.info;
  const title = toast.title || (toast.message ? DefaultTitles[type] : "");

  return (
    <div
      role="status"
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`nominate-toast nominate-toast-${type}${isExiting ? " toast-exiting" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="nominate-toast-icon-wrap" aria-hidden="true">
        {icon}
      </div>

      <div className="nominate-toast-content">
        {title && <div className="nominate-toast-title">{title}</div>}
        {toast.message && <div className="nominate-toast-message">{toast.message}</div>}
        {toast.action && (
          <button
            type="button"
            className="nominate-toast-action"
            onClick={() => {
              if (toast.action.onClick) toast.action.onClick();
              handleDismiss();
            }}
          >
            {toast.action.label || "Action"}
          </button>
        )}
      </div>

      <button
        type="button"
        className="nominate-toast-close"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {duration !== Infinity && (
        <div className="nominate-toast-progress-wrap" aria-hidden="true">
          <div
            className="nominate-toast-progress-bar"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Toast Provider & API ─────────────────────────────────────────────── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const show = useCallback((options) => {
    const id = options.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toastObj = typeof options === "string"
      ? { id, message: options, type: "info" }
      : { id, type: "info", duration: 4500, ...options };

    setToasts((prev) => [toastObj, ...prev.slice(0, 5)]); // max 6 visible toasts
    return id;
  }, []);

  const success = useCallback((messageOrOptions, options = {}) => {
    if (typeof messageOrOptions === "string") {
      return show({ message: messageOrOptions, type: "success", ...options });
    }
    return show({ type: "success", ...messageOrOptions });
  }, [show]);

  const error = useCallback((messageOrOptions, options = {}) => {
    if (typeof messageOrOptions === "string") {
      return show({ message: messageOrOptions, type: "error", ...options });
    }
    return show({ type: "error", ...messageOrOptions });
  }, [show]);

  const warning = useCallback((messageOrOptions, options = {}) => {
    if (typeof messageOrOptions === "string") {
      return show({ message: messageOrOptions, type: "warning", ...options });
    }
    return show({ type: "warning", ...messageOrOptions });
  }, [show]);

  const info = useCallback((messageOrOptions, options = {}) => {
    if (typeof messageOrOptions === "string") {
      return show({ message: messageOrOptions, type: "info", ...options });
    }
    return show({ type: "info", ...messageOrOptions });
  }, [show]);

  const toastApi = {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    clearAll,
  };

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <div className="nominate-toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Custom Hook ──────────────────────────────────────────────────────── */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback safe dummy object if used outside Provider
    return {
      show: () => {},
      success: (msg) => console.log("[Toast success]:", msg),
      error: (msg) => console.error("[Toast error]:", msg),
      warning: (msg) => console.warn("[Toast warning]:", msg),
      info: (msg) => console.log("[Toast info]:", msg),
      dismiss: () => {},
      clearAll: () => {},
    };
  }
  return context;
}

export default ToastContext;
