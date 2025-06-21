import React, { useState, useEffect } from "react";

import "../css/Booking.css";
import { Eye } from "lucide-react";
import DataTable from "../components/Datatable";

import {
  fetchBookingsByFilter,
  fetchBookingById,
} from "../services/bookingServices";

function Bookings() {
  const [popupView, setPopupView] = useState({ visible: false, booking: null });

  const [showModal, setShowModal] = useState(false);

  const [olderBookingData, setOlderBookings] = useState([]);

  const columns = [
    { key: "customer_name", label: "Customer Name" },
    { key: "phone_number", label: "Number" },
    { key: "event_date", label: "Event Date" },
    { key: "time_slot", label: "Time Slot" },
    { key: "celebration_name", label: "Celebration Type" },
    { key: "package_name", label: "Package" },
    { key: "status", label: "Status" },
    { key: "updated_by", label: "Updated By" },
  ];

  const ActionView = ({ row }) => (
    <Eye
      className="action-icon text-info"
      size={18}
      onClick={() => handleViewBooking(row)}
    />
  );

  useEffect(() => {
    fetchOlderBookings();
  }, []);

  const fetchOlderBookings = async () => {
    const data = await fetchBookingsByFilter("past");
    setOlderBookings(data);
  };

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");

      const fetchModalData = async () => {
        try {
          fetchBookingsByFilter("all");
        } catch (err) {
          console.error("Error fetching modal data", err);
        }
      };
      fetchModalData();
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  const handleViewBooking = async (booking) => {
    try {
      const fullBooking = await fetchBookingById(booking.booking_id);
      setPopupView({ visible: true, booking: fullBooking });
    } catch (error) {
      alert("Failed to load booking details.");
      console.error("View error:", error);
    }
  };

  return (
    <div>
      <DataTable
        title="Older Bookings"
        columns={columns}
        data={olderBookingData}
        actions={[ActionView]}
        searchableFields={["customer_name", "phone_number"]}
      />

      {popupView.visible && popupView.booking && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div
              className="modal-close-icon"
              onClick={() => setPopupView({ visible: false, booking: null })}
            >
              ×
            </div>
            <h5 className="text-center mb-3">Booking Details</h5>

            <div className="form-step-wrapper text-start px-3">
              <div className="review-box mb-3">
                <h5 className="review-title">Customer Details</h5>
                <p>
                  <strong>Name:</strong> {popupView.booking.customer_name}
                </p>
                <p>
                  <strong>Phone:</strong> {popupView.booking.phone_number}
                </p>
                {popupView.booking.email && (
                  <p>
                    <strong>Email:</strong> {popupView.booking.email}
                  </p>
                )}
                {popupView.booking.address && (
                  <p>
                    <strong>Address:</strong> {popupView.booking.address}
                  </p>
                )}
              </div>

              <div className="review-box mb-3">
                <h5 className="review-title">Date & Time</h5>
                <p>
                  <strong>Date:</strong> {popupView.booking.event_date}
                </p>
                <p>
                  <strong>Time Slot:</strong> {popupView.booking.time_slot}
                </p>
              </div>

              <div className="review-box mb-3">
                <h5 className="review-title">Celebration Type</h5>
                <p>{popupView.booking.celebration_name}</p>
              </div>

              <div className="review-box mb-3">
                <h5 className="review-title">Package</h5>
                <p>{popupView.booking.package_name}</p>
              </div>

              {popupView.booking.additional_items?.length > 0 && (
                <div className="review-box mb-3">
                  <h6>Additional Requirements:</h6>
                  <ul>
                    {popupView.booking.additional_items.map((item, index) => (
                      <li key={index}>
                        {item.description} – ₹{item.price}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="review-box mb-3">
                <h5 className="review-title">Booking Status</h5>
                <p>{popupView.booking.status}</p>
              </div>

              <div className="review-box mb-3">
                <h5 className="review-title">Payment Details</h5>
                <p>
                  <strong>Payment Mode:</strong>{" "}
                  {popupView.booking.payment_mode
                    ? popupView.booking.payment_mode
                        .replace("_", " ")
                        .toUpperCase()
                    : "N/A"}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹
                  {popupView.booking.payment_total || "0"}
                </p>
                <p>
                  <strong>Amount Paid:</strong> ₹
                  {popupView.booking.payment_paid || "0"}
                </p>
                <p>
                  <strong>Balance:</strong> ₹
                  {Math.max(
                    0,
                    (Number(popupView.booking.payment_total) || 0) -
                      (Number(popupView.booking.payment_paid) || 0)
                  )}
                </p>
                {popupView.booking.payment_notes && (
                  <p>
                    <strong>Notes:</strong> {popupView.booking.payment_notes}
                  </p>
                )}
              </div>

              <div className="review-box mb-3">
                <h5 className="review-title">Audit Trail</h5>
                <p>
                  <strong>Created By:</strong> {popupView.booking.created_by}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {popupView.booking.created_at
                    ? new Date(popupView.booking.created_at).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Updated By:</strong>{" "}
                  {popupView.booking.updated_by || "N/A"}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {popupView.booking.updated_at
                    ? new Date(popupView.booking.updated_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
