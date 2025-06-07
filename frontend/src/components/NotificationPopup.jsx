import "../css/NotificationPopup.css";
import React from "react";

function NotificationPopup({ message, onConfirm, onCancel }) {
  return (
    <>
      <div className="popup-overlay"></div>
      <div className="popup-message">
        <div className="popup-content">
          <p>{message}</p>
          <div className="popup-actions">
            <button className="btn-pink" onClick={onConfirm}>
              Confirm
            </button>
            <button className="btn-pink" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationPopup;
