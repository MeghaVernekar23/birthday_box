import React, { useEffect, useState, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import "../css/Notify.css";

/* ------------------------------------------------------------------
   Birthday Box notifications — replaces window.alert / window.confirm.

   notify.success("Booking created")        → toast
   notify.error("Failed to delete")         → toast
   notify.warning("Please select a date")   → toast
   notify.info("…")                         → toast
   await confirmDialog({ title, message, confirmText, tone: "danger" }) → true/false
   notify.flash("…", "warning")             → shown after the next full page load

   Mount <NotifyHost /> once (main.jsx). Works from non-React code too.
------------------------------------------------------------------ */

const FLASH_KEY = "bb_flash";
let listeners = new Set();
let state = { toasts: [], dialog: null };
let nextId = 1;

const emit = () => listeners.forEach((l) => l(state));
const setState = (patch) => {
  state = { ...state, ...patch };
  emit();
};

const DURATION = { success: 3200, info: 3800, warning: 4500, error: 5500 };

function push(type, message, opts = {}) {
  if (!message) return;
  const id = nextId++;
  const toast = { id, type, message: String(message), title: opts.title };
  setState({ toasts: [...state.toasts, toast].slice(-4) });
  const ms = opts.duration ?? DURATION[type];
  if (ms) setTimeout(() => dismiss(id), ms);
  return id;
}

function dismiss(id) {
  setState({ toasts: state.toasts.filter((t) => t.id !== id) });
}

export const notify = {
  success: (m, o) => push("success", m, o),
  error: (m, o) => push("error", m, o),
  warning: (m, o) => push("warning", m, o),
  info: (m, o) => push("info", m, o),
  dismiss,
  /** Show a toast after a full page navigation (e.g. window.location redirect). */
  flash: (message, type = "info") => {
    try {
      sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, type }));
    } catch {
      /* storage unavailable — skip */
    }
  },
};

export function confirmDialog({
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "primary", // "primary" | "danger"
} = {}) {
  return new Promise((resolve) => {
    // Resolve any dialog that is still open
    if (state.dialog) state.dialog.resolve(false);
    setState({ dialog: { title, message, confirmText, cancelText, tone, resolve } });
  });
}

function closeDialog(result) {
  const d = state.dialog;
  if (!d) return;
  setState({ dialog: null });
  d.resolve(result);
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TITLES = {
  success: "Success",
  error: "Something went wrong",
  warning: "Check this",
  info: "Heads up",
};

export function NotifyHost() {
  const [s, setS] = useState(state);
  const confirmBtn = useRef(null);

  useEffect(() => {
    listeners.add(setS);
    try {
      const raw = sessionStorage.getItem(FLASH_KEY);
      if (raw) {
        sessionStorage.removeItem(FLASH_KEY);
        const { message, type } = JSON.parse(raw);
        push(type || "info", message);
      }
    } catch {
      /* ignore */
    }
    return () => listeners.delete(setS);
  }, []);

  // Keyboard: Esc cancels, Enter confirms
  useEffect(() => {
    if (!s.dialog) return;
    confirmBtn.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") closeDialog(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s.dialog]);

  const d = s.dialog;
  const DialogIcon = d?.tone === "danger" ? AlertTriangle : Info;

  return (
    <>
      <div className="bbn-toasts" role="region" aria-live="polite" aria-label="Notifications">
        {s.toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} className={`bbn-toast bbn-toast--${t.type}`} role={t.type === "error" ? "alert" : "status"}>
              <span className="bbn-toast__icon">
                <Icon size={20} />
              </span>
              <div className="bbn-toast__body">
                <div className="bbn-toast__title">{t.title || TITLES[t.type]}</div>
                <div className="bbn-toast__msg">{t.message}</div>
              </div>
              <button className="bbn-toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {d && (
        <div className="bbn-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeDialog(false)}>
          <div className={`bbn-dialog bbn-dialog--${d.tone}`} role="alertdialog" aria-modal="true" aria-labelledby="bbn-dialog-title">
            <div className="bbn-dialog__icon">
              <DialogIcon size={26} />
            </div>
            <h5 id="bbn-dialog-title" className="bbn-dialog__title">{d.title}</h5>
            {d.message && <p className="bbn-dialog__msg">{d.message}</p>}
            <div className="bbn-dialog__actions">
              <button className="bbn-btn bbn-btn--ghost" onClick={() => closeDialog(false)}>
                {d.cancelText}
              </button>
              <button
                ref={confirmBtn}
                className={`bbn-btn ${d.tone === "danger" ? "bbn-btn--danger" : "bbn-btn--primary"}`}
                onClick={() => closeDialog(true)}
              >
                {d.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
