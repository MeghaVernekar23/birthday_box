import React, { useEffect, useState } from "react";
import { fetchScheduledMessages } from "../services/bookingServices";
import "../css/ScheduledMessages.css";

// Read-only list of the Telegram messages the backend will send.
const fmt = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d)
    ? iso
    : d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function ScheduledMessages() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchScheduledMessages()
      .then((res) => setData(res))
      .catch((e) => {
        console.error("Scheduled messages error", e);
        setError("Could not load scheduled messages.");
      });
  }, []);

  if (error) return <div className="sm-page"><p className="sm-error">{error}</p></div>;
  if (!data) {
    return (
      <div className="sm-page">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  const reminders = data.reminders || [];
  const sending = reminders.filter((r) => r.will_send).length;

  return (
    <div className="sm-page">
      <div className="sm-header">
        <h4>Scheduled messages</h4>
        <p>Telegram messages the system will send. This page is read-only.</p>
      </div>

      <h5 className="sm-h5">Daily messages</h5>
      <div className="sm-daily">
        {(data.daily || []).map((d) => (
          <div className="sm-daily-card" key={d.name}>
            <strong>{d.name}</strong>
            <span>{d.description}</span>
            <span className="sm-next">Next: {fmt(d.send_at)}</span>
          </div>
        ))}
      </div>

      <h5 className="sm-h5">
        Booking reminders <span className="sm-count">{reminders.length} scheduled · {sending} will send</span>
      </h5>
      {reminders.length === 0 ? (
        <p className="sm-empty">No booking reminders scheduled.</p>
      ) : (
        <div className="sm-table-wrap">
          <table className="sm-table">
            <thead>
              <tr>
                <th>Send at</th>
                <th>Message</th>
                <th>Customer</th>
                <th>Event</th>
                <th>Booking status</th>
                <th>Will send?</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((r) => (
                <tr key={r.job_id} className={r.will_send ? "" : "sm-row-skip"}>
                  <td data-label="Send at" className="sm-nowrap sm-when"><div className="sm-val">{fmt(r.send_at)}</div></td>
                  <td data-label="Message"><div className="sm-val">{r.label}</div></td>
                  <td data-label="Customer"><div className="sm-val">
                    {r.customer_name || "—"}
                    {r.phone_number && <div className="sm-sub">{r.phone_number}</div>}
                  </div></td>
                  <td data-label="Event" className="sm-nowrap"><div className="sm-val">
                    {fmtDate(r.event_date)}
                    {r.time_slot && <div className="sm-sub">{r.time_slot}</div>}
                    {r.booking_id && <div className="sm-sub">#{r.booking_id}</div>}
                  </div></td>
                  <td data-label="Status"><div className="sm-val">
                    {r.status ? (
                      <span className={`nb-status-badge nb-status--${r.status.toLowerCase()}`}>{r.status}</span>
                    ) : "—"}
                  </div></td>
                  <td data-label="Will send?"><div className="sm-val">
                    {r.will_send
                      ? <span className="sm-yes">Yes</span>
                      : <span className="sm-no">No — {r.skip_reason}</span>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
