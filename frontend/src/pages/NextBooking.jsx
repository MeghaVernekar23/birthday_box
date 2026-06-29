import React, { useEffect, useState } from "react";
import {
  fetchNextBooking,
  fetchCelebrationType,
  fetchPackage,
} from "../services/bookingServices";
import "../css/Dashboard.css";

const NextBookingCard = () => {
  const [nextBooking, setNextBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [celebrationOptions, setCelebrationOptions] = useState([]);
  const [packageOptions, setPackageOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNextBooking = async () => {
      try {
        const data = await fetchNextBooking();
        setNextBooking(data);
      } catch (err) {
        console.error("Failed to load next booking", err);
      } finally {
        setLoading(false);
      }
    };

    loadNextBooking();
    const interval = setInterval(loadNextBooking, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleViewBookings = async () => {
    try {
      setShowBookingModal(true);
      const celebrationType = await fetchCelebrationType();
      setCelebrationOptions(celebrationType);
      const packagesType = await fetchPackage();
      setPackageOptions(packagesType);
    } catch (err) {
      console.error("Error fetching bookings", err);
      alert("Failed to load bookings");
    }
  };

  return (
    <div>
      <div className="dashboard-card dashboard-card--purple shadow-sm">
        {loading ? (
          <div className="card-spinner-wrapper">
            <div className="spinner-border" style={{ color: "#7c5cbf" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="card-content">
            <div className="card-header">
              <div>
                <h6 className="label">Next Booking</h6>
                {nextBooking ? (
                  <>
                    <h5 className="text">Customer: {nextBooking.customer_name}</h5>
                    <p className="text-muted">Time Slot: {nextBooking.time_slot}</p>
                  </>
                ) : (
                  <p className="text-muted">No upcoming bookings today</p>
                )}
              </div>
            </div>
            {nextBooking && (
              <div className="nb-card-footer">
                <button className="view-all-btn" onClick={handleViewBookings}>
                  More Info <i className="bi bi-arrow-right" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showBookingModal && (
        <div className="ps-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="nb-modal" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="nb-modal-header">
              <div>
                <span className="nb-modal-eyebrow">Next Booking</span>
                <h4 className="nb-modal-title">{nextBooking.customer_name}</h4>
              </div>
              <button className="nb-modal-close" onClick={() => setShowBookingModal(false)}>×</button>
            </div>

            <div className="nb-modal-body">
              {/* Status + Date row */}
              <div className="nb-info-row">
                <div className="nb-info-chip">
                  <span className="nb-chip-label">Date</span>
                  <span className="nb-chip-value">{nextBooking.event_date}</span>
                </div>
                <div className="nb-info-chip">
                  <span className="nb-chip-label">Time Slot</span>
                  <span className="nb-chip-value">{nextBooking.time_slot}</span>
                </div>
                <div className="nb-info-chip">
                  <span className="nb-chip-label">Status</span>
                  <span className={`nb-status-badge nb-status--${nextBooking.status?.toLowerCase()}`}>
                    {nextBooking.status}
                  </span>
                </div>
              </div>

              {/* Customer + Celebration */}
              <div className="nb-section-grid">
                <div className="nb-section">
                  <p className="nb-section-label">Customer Details</p>
                  <div className="nb-field-list">
                    <div className="nb-field">
                      <span className="nb-field-key">Phone</span>
                      <span className="nb-field-val">{nextBooking.phone_number}</span>
                    </div>
                    {nextBooking.email && (
                      <div className="nb-field">
                        <span className="nb-field-key">Email</span>
                        <span className="nb-field-val">{nextBooking.email}</span>
                      </div>
                    )}
                    {nextBooking.address && (
                      <div className="nb-field">
                        <span className="nb-field-key">Address</span>
                        <span className="nb-field-val">{nextBooking.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="nb-section">
                  <p className="nb-section-label">Celebration</p>
                  <div className="nb-field-list">
                    {celebrationOptions.map(
                      (c) =>
                        Number(c.celebration_id) === Number(nextBooking.celebration_id) && (
                          <div className="nb-field" key={c.celebration_id}>
                            <span className="nb-field-key">Type</span>
                            <span className="nb-field-val">{c.celebration_name}</span>
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>

              {/* Package */}
              {packageOptions.map(
                (pkg) =>
                  Number(pkg.package_id) === Number(nextBooking.package_id) && (
                    <div className="nb-section nb-package-section" key={pkg.package_id}>
                      <p className="nb-section-label">Package</p>
                      <div className="nb-package-card">
                        <div className="nb-package-top">
                          <span className="nb-package-name">{pkg.package_name}</span>
                          <span className="nb-package-price">₹{pkg.price}</span>
                        </div>
                        {pkg.description && (
                          <p className="nb-package-desc">{pkg.description}</p>
                        )}
                      </div>
                    </div>
                  )
              )}

              {/* Add-ons */}
              {(nextBooking.addons_note || nextBooking.additional_items?.length > 0) && (
                <div className="nb-section">
                  <p className="nb-section-label">Add-ons & Notes</p>
                  <div className="nb-field-list">
                    {nextBooking.addons_note && (
                      <div className="nb-field">
                        <span className="nb-field-key">Note</span>
                        <span className="nb-field-val">{nextBooking.addons_note}</span>
                      </div>
                    )}
                    {nextBooking.additional_items?.map((item, i) => (
                      <div className="nb-field" key={i}>
                        <span className="nb-field-key">{item.description}</span>
                        <span className="nb-field-val">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment */}
              <div className="nb-section">
                <p className="nb-section-label">Payment</p>
                <div className="nb-payment-grid">
                  <div className="nb-payment-cell nb-payment-cell--total">
                    <span className="nb-payment-key">Total</span>
                    <span className="nb-payment-val">₹{nextBooking.payment_total || 0}</span>
                  </div>
                  <div className="nb-payment-cell nb-payment-cell--paid">
                    <span className="nb-payment-key">Paid</span>
                    <span className="nb-payment-val">₹{nextBooking.payment_paid || 0}</span>
                  </div>
                  <div className="nb-payment-cell nb-payment-cell--balance">
                    <span className="nb-payment-key">Balance</span>
                    <span className="nb-payment-val">
                      ₹{Math.max(0, (Number(nextBooking.payment_total) || 0) - (Number(nextBooking.payment_paid) || 0))}
                    </span>
                  </div>
                </div>
                {nextBooking.payment_mode && (
                  <p className="nb-payment-mode">
                    Mode: <strong>{nextBooking.payment_mode.replace("_", " ").toUpperCase()}</strong>
                  </p>
                )}
                {nextBooking.payment_notes && (
                  <p className="nb-payment-mode">Notes: {nextBooking.payment_notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextBookingCard;
