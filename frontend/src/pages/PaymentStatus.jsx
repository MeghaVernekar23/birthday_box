import React, { useEffect, useState } from "react";
import {
  fetchBookingsByFilter,
  updatePayment,
} from "../services/bookingServices";
import DataTable from "../components/Datatable";
import "../css/Dashboard.css";
import { Edit } from "lucide-react";

const PaymentStatus = () => {
  const user = localStorage.getItem("current_user");
  const [pendingPayments, setPendingPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const columns = [
    { key: "customer_name", label: "Customer" },
    { key: "event_date", label: "Event Date" },
    { key: "payment_total", label: "Total" },
    { key: "payment_paid", label: "Paid" },
    { key: "balance", label: "Balance" },
  ];

  const ActionButtons = ({ row }) => (
    <div className="d-flex justify-content-center gap-3">
      <span title="Edit Customer">
        <Edit
          className="action-icon text-primary"
          size={18}
          onClick={() => handleEditPaymentDetails(row)}
        />
      </span>
    </div>
  );

  const handleEditPaymentDetails = (row) => {
    setEditFormData(row);
    setEditModalVisible(true);
  };

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

  const updatePaymentDetails = async () => {
    try {
      const paid = Number(editFormData.payment_paid);
      const total = Number(editFormData.payment_total);

      if (paid > total) {
        alert("Paid amount cannot exceed the total amount.");
        return;
      }
      const username = JSON.parse(user).username;
      const updatedForm = {
        ...editFormData,
        updated_by: username,
      };
      await updatePayment(editFormData.booking_id, updatedForm);
      alert("Payment updated");

      const allBookings = await fetchBookingsByFilter("all");
      const updatedPending = allBookings
        .filter((b) => Number(b.payment_total) > Number(b.payment_paid))
        .map((b) => ({
          ...b,
          balance: b.payment_total - b.payment_paid,
        }));
      setPendingPayments(updatedPending);
      setEditModalVisible(false);
    } catch (err) {
      alert("Error saving payment");
    }
  };
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
            <h5>Pending Payment Details</h5>
            <div
              className="modal-close-icon"
              onClick={() => {
                setShowPaymentModal(false);
              }}
            >
              ×
            </div>
            <DataTable
              title=""
              columns={columns}
              data={pendingPayments}
              actions={[ActionButtons]}
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

      {editModalVisible && (
        <div className="ps-modal-overlay">
          <div className="edit-payment-modal-box">
            <h5>Edit Payment</h5>
            <div
              className="modal-close-icon"
              onClick={() => setEditModalVisible(false)}
            >
              ×
            </div>

            <label>Amount Paid:</label>
            <input
              type="number"
              className="form-control mb-2"
              value={editFormData.payment_paid}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  payment_paid: e.target.value,
                })
              }
            />

            <div className="mt-4">
              <h5>Balance Summary</h5>
              <p>
                <strong>Total Amount:</strong> ₹{" "}
                {editFormData.payment_total || 0}
              </p>
              <p>
                <strong>Amount Paid:</strong> ₹{editFormData.payment_paid || 0}
              </p>
              <p>
                <strong>Balance:</strong> ₹
                {editFormData.payment_total - editFormData.payment_paid || 0}
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setEditModalVisible(false);
                  setEditFormData();
                
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={updatePaymentDetails}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
