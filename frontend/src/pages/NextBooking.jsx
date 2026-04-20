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
        <div className="ps-modal-overlay">
          <div className="ps-modal-box">
            <div className="modal-close-icon" onClick={() => setShowBookingModal(false)}>
              ×
            </div>
            <div className="form-step-wrapper text-start px-3">
              <h5 className="mb-3 text-center">Upcoming Booking</h5>
              <div className="review-box mb-3">
                <h5 className="review-title">Customer Details</h5>
                <p><strong>Name:</strong> {nextBooking.customer_name}</p>
                <p><strong>Phone:</strong> {nextBooking.phone_number}</p>
                {nextBooking.email && <p><strong>Email:</strong> {nextBooking.email}</p>}
                {nextBooking.address && <p><strong>Address:</strong> {nextBooking.address}</p>}
              </div>
              <div className="review-box mb-3">
                <h5 className="review-title">Date & Time</h5>
                <p><strong>Date:</strong> {nextBooking.event_date}</p>
                <p><strong>Time Slot:</strong> {nextBooking.time_slot}</p>
              </div>
              <div className="review-box mb-3">
                <h5 className="review-title">Celebration Type</h5>
                {celebrationOptions.map(
                  (celebration) =>
                    Number(celebration.celebration_id) === Number(nextBooking.celebration_id) && (
                      <p key={celebration.celebration_id}>{celebration.celebration_name}</p>
                    )
                )}
              </div>
              <div className="review-box mb-3">
                <h5 className="review-title">Package</h5>
                {packageOptions.map(
                  (pkg) =>
                    Number(pkg.package_id) === Number(nextBooking.package_id) && (
                      <p key={pkg.package_id}>
                        <strong>{pkg.package_name}</strong>
                        <br />
                        <span style={{ fontSize: "0.9rem" }}>{pkg.description}</span>
                        <br />
                        <span style={{ fontSize: "0.85rem" }}>Price: ₹{pkg.price}</span>
                      </p>
                    )
                )}
              </div>
              {(nextBooking.addons_note || (nextBooking.additional_items && nextBooking.additional_items.length > 0)) && (
                <div className="review-box mb-3">
                  <h5 className="review-title">Add-ons / Notes</h5>
                  {nextBooking.addons_note && <p>{nextBooking.addons_note}</p>}
                  {nextBooking.additional_items && nextBooking.additional_items.length > 0 && (
                    <>
                      <p><strong>Additional Requirements:</strong></p>
                      <ul className="mb-3">
                        {nextBooking.additional_items.map((item, index) => (
                          <li key={index}>{item.description} – ₹{item.price}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
              <div className="review-box mb-3">
                <h5 className="review-title">Booking Status</h5>
                <p>{nextBooking.status}</p>
              </div>
              <div className="review-box mb-3">
                <h5 className="review-title">Payment Details</h5>
                <p><strong>Payment Mode:</strong> {nextBooking.payment_mode ? nextBooking.payment_mode.replace("_", " ").toUpperCase() : "N/A"}</p>
                <p><strong>Total Amount:</strong> ₹{nextBooking.payment_total || "0"}</p>
                <p><strong>Amount Paid:</strong> ₹{nextBooking.payment_paid || "0"}</p>
                <p><strong>Balance:</strong> ₹{Math.max(0, (Number(nextBooking.payment_total) || 0) - (Number(nextBooking.payment_paid) || 0))}</p>
                {nextBooking.payment_notes && <p><strong>Notes:</strong> {nextBooking.payment_notes}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextBookingCard;
