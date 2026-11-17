import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../images/logo_mark.png"; // gift mark only (no wordmark) in the navbar
import "./BookNow.css";
import "./PublicBooking.css";
import { BASE_URL } from "../services/utils";

const inr = (n) => `₹${(Number(n) || 0).toLocaleString("en-IN")}`;

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d) ? iso : d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

export default function PublicBooking() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const unlock = async (e) => {
    e.preventDefault();
    if (!password.trim()) { setError("Please enter the password."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/public/booking/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail || "Could not open this booking.");
        setPassword("");
        return;
      }
      setBooking(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bn-root">
      <nav className="bn-nav">
        <img src={logo} alt="Birthday Box" className="bn-logo" onClick={() => navigate("/")} />
        <span className="bn-nav-title">Your Booking</span>
      </nav>

      <div className="pb-wrap">
        {!booking ? (
          <form className="bn-card pb-lock" onSubmit={unlock} noValidate>
            <div className="pb-lock-icon">🔒</div>
            <h2 className="pb-title">View your booking</h2>
            <p className="pb-sub">Enter the 8-digit password shared with you by Birthday Box.</p>
            <input
              className={`bn-input pb-pass ${error ? "bn-input-err" : ""}`}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={8}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 8))}
              autoFocus
            />
            {error && <span className="bn-error">{error}</span>}
            <button type="submit" className="bn-submit-btn" disabled={loading}>
              {loading ? "Checking..." : "View Booking"}
            </button>
          </form>
        ) : (
          <div className="bn-card pb-details">
            <div className="pb-head">
              <div>
                <span className="pb-eyebrow">Booking #{booking.booking_id}</span>
                <h2 className="pb-title">🎉 {booking.celebrant_name}</h2>
              </div>
              <span className={`pb-status pb-status--${(booking.status || "").toLowerCase()}`}>{booking.status}</span>
            </div>

            <div className="pb-grid">
              <div className="pb-chip"><span>Date</span><strong>{formatDate(booking.event_date)}</strong></div>
              <div className="pb-chip"><span>Time</span><strong>{booking.time_slot || "—"}</strong></div>
              {booking.duration && <div className="pb-chip"><span>Duration</span><strong>{booking.duration}</strong></div>}
              {booking.celebration_name && <div className="pb-chip"><span>Celebration</span><strong>{booking.celebration_name}</strong></div>}
            </div>

            <h3 className="pb-section">Package & add-ons</h3>
            <div className="pb-lines">
              <div className="pb-line">
                <span>
                  {booking.package_name || "Package"}
                  {booking.package_description && <small className="pb-desc">{booking.package_description}</small>}
                </span>
                <span>{booking.package_price != null ? inr(booking.package_price) : ""}</span>
              </div>
              {booking.additional_items.map((item, i) => (
                <div className="pb-line" key={i}>
                  <span>{item.description}</span>
                  <span>{item.price ? inr(item.price) : "—"}</span>
                </div>
              ))}
            </div>

            <div className="pb-pay">
              <div><span>Total</span><strong>{inr(booking.payment_total)}</strong></div>
              <div><span>Paid</span><strong>{inr(booking.payment_paid)}</strong></div>
              <div className="pb-balance"><span>Balance</span><strong>{inr(booking.balance)}</strong></div>
            </div>

            {booking.customer_message && (
              <p className="pb-note"><strong>Your message:</strong> {booking.customer_message}</p>
            )}

            <p className="bn-success-note pb-help">
              Please arrive 15 minutes before your slot. Questions? Call us at{" "}
              <a href="tel:+918971543330"><strong>+91 89715 43330</strong></a>
            </p>
          </div>
        )}
      </div>

      <footer className="bn-footer">
        <p>© {new Date().getFullYear()} Birthday Box. All rights reserved.</p>
      </footer>
    </div>
  );
}
