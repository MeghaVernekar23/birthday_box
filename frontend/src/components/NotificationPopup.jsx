import React, { useEffect, useRef } from "react";
import { AlertTriangle, Info, Wallet, Pencil, Save } from "lucide-react";
import "../css/Notify.css";

/* Branded confirm popup (same look as confirmDialog in Notify.jsx).
   Props stay backward-compatible: message, onConfirm, onCancel.
   Title / button / tone are inferred from the message unless passed in. */

function infer(message = "") {
  const m = message.toLowerCase();
  if (m.includes("delete")) {
    const what = m.includes("booking") ? " booking" : m.includes("holiday") ? " holiday" : "";
    return { title: `Delete${what}?`, confirmText: "Delete", tone: "danger", Icon: AlertTriangle };
  }
  if (m.includes("paid"))
    return { title: "Mark as paid?", confirmText: "Mark as paid", tone: "primary", Icon: Wallet };
  if (m.includes("edit"))
    return { title: "Edit booking?", confirmText: "Edit", tone: "primary", Icon: Pencil };
  if (m.includes("save"))
    return { title: "Save booking?", confirmText: "Save", tone: "primary", Icon: Save };
  return { title: "Are you sure?", confirmText: "Confirm", tone: "primary", Icon: Info };
}

function NotificationPopup({ message, onConfirm, onCancel, title, confirmText, cancelText = "Cancel", tone }) {
  const guess = infer(message);
  const finalTone = tone || guess.tone;
  const Icon = guess.Icon;
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="bbn-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel?.()}>
      <div className={`bbn-dialog bbn-dialog--${finalTone}`} role="alertdialog" aria-modal="true" aria-labelledby="bbn-popup-title">
        <div className="bbn-dialog__icon">
          <Icon size={26} />
        </div>
        <h5 id="bbn-popup-title" className="bbn-dialog__title">{title || guess.title}</h5>
        <p className="bbn-dialog__msg">{message}</p>
        <div className="bbn-dialog__actions">
          <button className="bbn-btn bbn-btn--ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            className={`bbn-btn ${finalTone === "danger" ? "bbn-btn--danger" : "bbn-btn--primary"}`}
            onClick={onConfirm}
          >
            {confirmText || guess.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationPopup;
