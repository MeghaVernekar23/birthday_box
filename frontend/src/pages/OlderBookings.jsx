import React, { useState, useEffect, useMemo, useCallback } from "react";

import "../css/Booking.css";
import "../css/OlderBookings.css";
import "../css/BookingCards.css";
import { Eye, Trash2, X } from "lucide-react";
import DataTable from "../components/Datatable";
import NotificationPopup from "../components/NotificationPopup";

import {
  fetchBookingsByFilter,
  fetchBookingById,
  deleteBooking,
} from "../services/bookingServices";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getPaymentStatus = (row) => {
  const total = Number(row.payment_total) || 0;
  const paid = Number(row.payment_paid) || 0;
  if (total > 0 && paid >= total) return { key: "paid", label: "Paid" };
  if (paid > 0 && paid < total) return { key: "partial", label: "Partial" };
  return { key: "unpaid", label: "Unpaid" };
};

const formatEventDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const OlderBookingCard = ({ row, onView, onDelete }) => {
  const ps = getPaymentStatus(row);
  return (
    <div className="booking-card booking-card--gray">
      <div className="booking-card__header">
        <span className="booking-card__name">{row.customer_name || "—"}</span>
        <span className="booking-card__date-badge">{formatEventDate(row.event_date)}</span>
      </div>
      <div className="booking-card__body">
        <div className="booking-card__field">🕐 {row.time_slot || "—"}</div>
        <div className="booking-card__field">📦 {row.package_name || "—"}</div>
        <div className="booking-card__field">🎉 {row.celebration_name || "—"}</div>
        <div className="booking-card__field">👤 {row.updated_by || "—"}</div>
        <span className={`booking-card__pill booking-card__pill--${ps.key}`}>{ps.label}</span>
      </div>
      <div className="booking-card__actions">
        <button className="btn btn-sm btn-secondary" onClick={() => onView(row)}>View</button>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(row)}>Delete</button>
      </div>
    </div>
  );
};

function Bookings() {
  const [popupView, setPopupView] = useState({ visible: false, booking: null });
  const [popupDelete, setPopupDelete] = useState({ visible: false, booking: null });
  const [olderBookingData, setOlderBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDate, setFilterDate] = useState("");

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
    <div className="d-flex justify-content-center gap-3">
      <Eye
        className="action-icon text-info"
        size={18}
        onClick={() => handleViewBooking(row)}
      />
      <Trash2
        className="action-icon text-danger"
        size={18}
        onClick={() => handleDeleteBooking(row)}
      />
    </div>
  );

  useEffect(() => {
    fetchOlderBookings();
  }, []);

  const fetchOlderBookings = async () => {
    setLoading(true);
    const data = await fetchBookingsByFilter("past");
    setOlderBookings(data);
    setLoading(false);
  };

  const handleViewBooking = async (booking) => {
    try {
      const fullBooking = await fetchBookingById(booking.booking_id);
      setPopupView({ visible: true, booking: fullBooking });
    } catch (error) {
      alert("Failed to load booking details.");
      console.error("View error:", error);
    }
  };

  const handleDeleteBooking = (booking) => {
    setPopupDelete({ visible: true, booking });
  };

  const confirmDelete = async () => {
    try {
      await deleteBooking(popupDelete.booking.booking_id);
      setPopupDelete({ visible: false, booking: null });
      alert("Booking deleted successfully!");
      fetchOlderBookings();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete the booking. Please try again.");
      setPopupDelete({ visible: false, booking: null });
    }
  };

  const cancelDelete = () => {
    setPopupDelete({ visible: false, booking: null });
  };

  // Unique years from data for year dropdown
  const availableYears = useMemo(() => {
    const years = new Set();
    olderBookingData.forEach((b) => {
      if (b.event_date) {
        const y = new Date(b.event_date).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [olderBookingData]);

  // Filtered data
  const filteredData = useMemo(() => {
    return olderBookingData.filter((b) => {
      if (!b.event_date) return false;
      const d = new Date(b.event_date);
      if (isNaN(d.getTime())) return false;

      if (filterDate) {
        // Exact date match takes priority — ignore month/year selects
        return b.event_date.slice(0, 10) === filterDate;
      }
      if (filterYear && d.getFullYear() !== Number(filterYear)) return false;
      if (filterMonth && d.getMonth() !== Number(filterMonth)) return false;
      return true;
    });
  }, [olderBookingData, filterYear, filterMonth, filterDate]);

  const hasFilter = filterYear || filterMonth || filterDate;

  const clearFilters = () => {
    setFilterYear("");
    setFilterMonth("");
    setFilterDate("");
  };

  const stats = useMemo(() => {
    const total = filteredData.length;
    const paid = filteredData.filter((b) => getPaymentStatus(b).key === "paid").length;
    const unpaid = filteredData.filter((b) => getPaymentStatus(b).key !== "paid").length;
    return { total, paid, unpaid };
  }, [filteredData]);

  const cardTemplate = useCallback(
    (row) => (
      <OlderBookingCard
        row={row}
        onView={handleViewBooking}
        onDelete={handleDeleteBooking}
      />
    ),
    [handleViewBooking, handleDeleteBooking]
  );

  return (
    <div className="bookings-page-wrapper">
      <div className="bookings-page-header">
        <h4>Older Bookings</h4>
        <p className="page-date">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <div className="bookings-stat-chips">
          <span className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--gray" />
            {hasFilter ? "Filtered" : "Total"}: {stats.total}
          </span>
          <span className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--green" />
            Paid: {stats.paid}
          </span>
          <span className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--amber" />
            Outstanding: {stats.unpaid}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bk-filter-bar-card">
        <div className="bk-filter-group">
          <label className="bk-filter-label">Year</label>
          <select
            className="bk-filter-select"
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setFilterDate("");
            }}
          >
            <option value="">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="bk-filter-group">
          <label className="bk-filter-label">Month</label>
          <select
            className="bk-filter-select"
            value={filterMonth}
            onChange={(e) => {
              setFilterMonth(e.target.value);
              setFilterDate("");
            }}
          >
            <option value="">All Months</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </div>

        <div className="bk-filter-group">
          <label className="bk-filter-label">Exact Date</label>
          <input
            type="date"
            className="bk-filter-date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setFilterYear("");
              setFilterMonth("");
            }}
          />
        </div>

        {hasFilter && (
          <button className="bk-filter-clear" onClick={clearFilters}>
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="bookings-spinner-wrapper">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <DataTable
          title=""
          columns={columns}
          data={filteredData}
          actions={[ActionView]}
          searchableFields={["customer_name", "phone_number"]}
          viewMode="card"
          cardTemplate={cardTemplate}
        />
      )}

      {popupDelete.visible && (
        <NotificationPopup
          message={`Are you sure you want to delete the booking for ${popupDelete.booking.customer_name}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {popupView.visible && popupView.booking && (
        <div className="ps-modal-overlay" onClick={() => setPopupView({ visible: false, booking: null })}>
          <div className="nb-modal" onClick={(e) => e.stopPropagation()}>

            <div className="nb-modal-header">
              <div>
                <span className="nb-modal-eyebrow">Booking Details</span>
                <h4 className="nb-modal-title">{popupView.booking.customer_name}</h4>
              </div>
              <button className="nb-modal-close" onClick={() => setPopupView({ visible: false, booking: null })}>×</button>
            </div>

            <div className="nb-modal-body">
              <div className="nb-info-row">
                <div className="nb-info-chip">
                  <span className="nb-chip-label">Date</span>
                  <span className="nb-chip-value">{popupView.booking.event_date}</span>
                </div>
                <div className="nb-info-chip">
                  <span className="nb-chip-label">Time Slot</span>
                  <span className="nb-chip-value">{popupView.booking.time_slot}</span>
                </div>
                <div className="nb-info-chip">
                  <span className="nb-chip-label">Status</span>
                  <span className={`nb-status-badge nb-status--${popupView.booking.status?.toLowerCase()}`}>
                    {popupView.booking.status}
                  </span>
                </div>
              </div>

              <div className="nb-section-grid">
                <div className="nb-section">
                  <p className="nb-section-label">Customer Details</p>
                  <div className="nb-field-list">
                    <div className="nb-field">
                      <span className="nb-field-key">Phone</span>
                      <span className="nb-field-val">{popupView.booking.phone_number}</span>
                    </div>
                    {popupView.booking.email && (
                      <div className="nb-field">
                        <span className="nb-field-key">Email</span>
                        <span className="nb-field-val">{popupView.booking.email}</span>
                      </div>
                    )}
                    {popupView.booking.address && (
                      <div className="nb-field">
                        <span className="nb-field-key">Address</span>
                        <span className="nb-field-val">{popupView.booking.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="nb-section">
                  <p className="nb-section-label">Celebration</p>
                  <div className="nb-field-list">
                    <div className="nb-field">
                      <span className="nb-field-key">Type</span>
                      <span className="nb-field-val">{popupView.booking.celebration_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nb-section nb-package-section">
                <p className="nb-section-label">Package</p>
                <div className="nb-package-card">
                  <div className="nb-package-top">
                    <span className="nb-package-name">{popupView.booking.package_name}</span>
                    {popupView.booking.payment_total && (
                      <span className="nb-package-price">₹{popupView.booking.payment_total}</span>
                    )}
                  </div>
                </div>
              </div>

              {popupView.booking.additional_items?.length > 0 && (
                <div className="nb-section">
                  <p className="nb-section-label">Additional Requirements</p>
                  <div className="nb-field-list">
                    {popupView.booking.additional_items.map((item, i) => (
                      <div className="nb-field" key={i}>
                        <span className="nb-field-key">{item.description}</span>
                        <span className="nb-field-val">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="nb-section">
                <p className="nb-section-label">Payment</p>
                <div className="nb-payment-grid">
                  <div className="nb-payment-cell nb-payment-cell--total">
                    <span className="nb-payment-key">Total</span>
                    <span className="nb-payment-val">₹{popupView.booking.payment_total || 0}</span>
                  </div>
                  <div className="nb-payment-cell nb-payment-cell--paid">
                    <span className="nb-payment-key">Paid</span>
                    <span className="nb-payment-val">₹{popupView.booking.payment_paid || 0}</span>
                  </div>
                  <div className="nb-payment-cell nb-payment-cell--balance">
                    <span className="nb-payment-key">Balance</span>
                    <span className="nb-payment-val">
                      ₹{Math.max(0, (Number(popupView.booking.payment_total) || 0) - (Number(popupView.booking.payment_paid) || 0))}
                    </span>
                  </div>
                </div>
                {popupView.booking.payment_mode && (
                  <p className="nb-payment-mode">
                    Mode: <strong>{popupView.booking.payment_mode.replace("_", " ").toUpperCase()}</strong>
                  </p>
                )}
                {popupView.booking.payment_notes && (
                  <p className="nb-payment-mode">Notes: {popupView.booking.payment_notes}</p>
                )}
              </div>

              <div className="nb-section">
                <p className="nb-section-label">Audit Trail</p>
                <div className="nb-field-list">
                  <div className="nb-field">
                    <span className="nb-field-key">Created by</span>
                    <span className="nb-field-val">{popupView.booking.created_by}</span>
                  </div>
                  <div className="nb-field">
                    <span className="nb-field-key">Created at</span>
                    <span className="nb-field-val">
                      {popupView.booking.created_at ? new Date(popupView.booking.created_at).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  <div className="nb-field">
                    <span className="nb-field-key">Updated by</span>
                    <span className="nb-field-val">{popupView.booking.updated_by || "N/A"}</span>
                  </div>
                  <div className="nb-field">
                    <span className="nb-field-key">Updated at</span>
                    <span className="nb-field-val">
                      {popupView.booking.updated_at ? new Date(popupView.booking.updated_at).toLocaleString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
