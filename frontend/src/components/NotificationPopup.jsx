import React from "react";
import "../css/NotificationPopup.css";

function NotificationPopup({ message, onConfirm, onCancel }) {
  return (
    <>
      <div className="notification-overlay" />
      <div className="notification-box">
        <div className="notification-content">
          <p className="notification-message">{message}</p>
          <div className="notification-actions">
            <button
              className="btn btn-outline-success btn-sm"
              onClick={onConfirm}
            >
              Confirm
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationPopup;
