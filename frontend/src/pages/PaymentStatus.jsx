import React, { useEffect, useState } from "react";
import { fetchBookingsByFilter } from "../services/bookingServices";
import DataTable from "../components/Datatable";
import NotificationPopup from "../components/NotificationPopup";
import "../css/Dashboard.css";

const PaymentStatus = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const columns = [
    { key: "customer_name", label: "Customer" },
    { key: "event_date", label: "Event Date" },
    { key: "payment_total", label: "Total" },
    { key: "payment_paid", label: "Paid" },
    { key: "balance", label: "Balance" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allBookings = await fetchBookingsByFilter("all");
        const pending = allBookings
          .filter((b) => Number(b.payment_total) > Number(b.payment_paid))
          .map((b) => ({
            ...b,
            balance: b.payment_total - b.payment_paid,
          }));
        console.log("pending::", pending);
        setPendingPayments(pending);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="pending-payment-card shadow-sm">
      <div className="card-content">
        <div className="card-header">
          <h6 className="label">Pending Payments</h6>
          <h2 className="text-center mt-2">{pendingPayments.length}</h2>
          <div className="holiday-card-footer">
            <button
              className="view-all-btn"
              onClick={() => setShowPaymentModal(true)}
            >
              View All <i className="bi bi-arrow-right" />
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="ps-modal-overlay">
          <div className="ps-modal-box">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Pending Payment Details</h5>
              <button
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowPaymentModal(false)}
                style={{
                  fontSize: "1.2rem",
                  border: "none",
                  background: "transparent",
                }}
              >
                &times;
              </button>
            </div>
            <DataTable
              title="Pending Payments"
              columns={columns}
              data={pendingPayments}
              rowClassName={(row) => {
                const eventDate = new Date(row.event_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // normalize
                eventDate.setHours(0, 0, 0, 0); // normalize
                return eventDate < today ? "past-payment-row" : "";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
