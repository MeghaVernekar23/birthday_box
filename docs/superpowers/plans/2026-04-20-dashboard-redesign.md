# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix bugs, modernize card visuals, add greeting header, and add spinners to the Dashboard page.

**Architecture:** All changes are isolated to the 7 existing dashboard component files and their shared CSS file. No new files. CSS lives in `Dashboard.css`; each component references a semantic card class. The header is rendered inline in `Dashboard.jsx`.

**Tech Stack:** React, Bootstrap 5 (spinner), Lucide React (icons already in use), plain CSS

---

## File Map

| File | What changes |
|------|-------------|
| `frontend/src/css/Dashboard.css` | Full visual overhaul — white cards, accent borders, header, spinner, fix font-weight, absorb AvailableSlots styles |
| `frontend/src/pages/Dashboard.jsx` | Add greeting header with date/username |
| `frontend/src/pages/BookingTakenSummary.jsx` | Spinner, remove console.log, swap class to `dashboard-card--blue` |
| `frontend/src/pages/NextBooking.jsx` | Spinner, swap class to `dashboard-card--purple` |
| `frontend/src/pages/UpcomingHolidays.jsx` | Spinner, remove duplicate CSS import, swap class to `dashboard-card--amber` |
| `frontend/src/pages/PaymentStatus.jsx` | Fix layout bug, spinner, swap class to `dashboard-card--red` |
| `frontend/src/pages/CelebrationAndPackage.jsx` | Spinner, remove console.log, swap class to `dashboard-card--teal` |
| `frontend/src/pages/AvailableSlots.jsx` | Remove AddBooking.css import, spinner |

---

### Task 1: Overhaul Dashboard.css

**Files:**
- Modify: `frontend/src/css/Dashboard.css`

- [ ] **Step 1: Replace the entire contents of Dashboard.css**

Replace the full file with the following:

```css
/* ===== Dashboard Layout ===== */
.dashboard-wrapper {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== Dashboard Header ===== */
.dashboard-header {
  background: #ffffff;
  border-radius: 12px;
  padding: 18px 24px;
  border-bottom: 2px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dashboard-header h4 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a1a2e;
}

.dashboard-header p {
  margin: 2px 0 0;
  font-size: 0.9rem;
  color: #6c757d;
}

/* ===== Grid Rows ===== */
.dashboard-grid-top {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: stretch;
}

.dashboard-grid-mid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  align-items: stretch;
}

.dashboard-grid-bottom {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.dashboard-card-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ===== Base Card ===== */
.dashboard-card {
  width: 100%;
  height: 100%;
  min-height: 200px;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-left: 4px solid transparent;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* ===== Accent Variants ===== */
.dashboard-card--blue  { border-left-color: #4f8ef7; }
.dashboard-card--purple { border-left-color: #7c5cbf; }
.dashboard-card--amber { border-left-color: #f5a623; }
.dashboard-card--red   { border-left-color: #e8603c; }
.dashboard-card--teal  { border-left-color: #2bba8f; }

/* Icon box accent colors */
.dashboard-card--blue  .icon-box { background-color: #4f8ef7; }
.dashboard-card--purple .icon-box { background-color: #7c5cbf; }
.dashboard-card--amber .icon-box { background-color: #f5a623; }
.dashboard-card--red   .icon-box { background-color: #e8603c; }
.dashboard-card--teal  .icon-box { background-color: #2bba8f; }

/* ===== Mid-row cards taller ===== */
.dashboard-grid-mid .dashboard-card {
  min-height: 220px;
}

/* ===== Available Slots card ===== */
.slot-availability-card {
  width: 100%;
  height: auto;
  min-height: 450px;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

/* ===== Card internals ===== */
.card-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.label {
  font-size: 1.0rem;
  color: #6c757d;
  margin-bottom: 6px;
  font-weight: 500;
}

.count {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a2e;
}

.text {
  margin-top: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a2e;
}

.icon-box {
  color: #fff;
  padding: 12px;
  border-radius: 50%;
  font-size: 1.5rem;
}

/* ===== Card footers ===== */
.bts-card-footer,
.nb-card-footer,
.holiday-card-footer {
  margin-top: auto;
  padding-top: 12px;
  text-align: right;
}

/* ===== View all button ===== */
.view-all-btn {
  background: transparent;
  border: none;
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.view-all-btn i {
  margin-left: 6px;
  transition: transform 0.2s ease;
}

.view-all-btn:hover {
  color: #0b5ed7;
  text-decoration: underline;
}

.view-all-btn:hover i {
  transform: translateX(4px);
}

/* ===== Spinner ===== */
.card-spinner-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 120px;
}

/* ===== Holiday list ===== */
.holiday-list {
  list-style: none;
  padding-left: 0;
  margin: 8px 0;
}

.holiday-item {
  font-size: 0.9rem;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
  color: #333;
}

/* ===== Celebration/Package list ===== */
.celebration-package-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}

.celebration-package-list li {
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  background-color: #f9f9f9;
  transition: background-color 0.3s ease;
}

.celebration-package-list li:last-child {
  border-bottom: none;
}

.celebration-package-list li:hover {
  background-color: #e7efff;
}

.celebration-package-item {
  font-size: 0.9rem;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

/* ===== Modals ===== */
.uh-modal-overlay,
.ps-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.uh-modal-box,
.ps-modal-box,
.booking-taken-modal-box {
  position: relative;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.add-upcoming-holiday-modal-box,
.edit-payment-modal-box {
  position: relative;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.booking-taken-modal-box table {
  margin-bottom: 0 !important;
}

.booking-taken-modal-box .pagination-bar {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

/* ===== Payment table rows ===== */
.past-payment-row {
  background-color: #ffe0e0 !important;
}

.past-payment-row td {
  color: #b30000 !important;
  font-weight: 700 !important;
}

/* ===== Add holiday button ===== */
.add-holiday-button {
  background-color: #b2c1f7;
  color: black;
  border: 1px solid #b2c1f7;
  padding: 5px 16px;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: background-color 0.2s ease-in-out;
}

/* ===== Misc ===== */
.modal-datatable {
  max-height: 60vh !important;
}

.align-right {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .dashboard-grid-top {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .dashboard-grid-top,
  .dashboard-grid-mid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/css/Dashboard.css
git commit -m "style: overhaul Dashboard.css — white cards, accent borders, header, spinner styles, fix font-weight"
```

---

### Task 2: Add Greeting Header to Dashboard.jsx

**Files:**
- Modify: `frontend/src/pages/Dashboard.jsx`

- [ ] **Step 1: Replace Dashboard.jsx with the new version including the header**

```jsx
import React from "react";
import BookingSummary from "./BookingTakenSummary";
import NextBooking from "./NextBooking";
import UpcomingHolidaysCard from "./UpcomingHolidays";
import AvailableSlots from "./AvailableSlots";
import PaymentStatus from "./PaymentStatus";
import CelebrationAndPackage from "./CelebrationAndPackage";
import "../css/Dashboard.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getUsername() {
  try {
    const raw = localStorage.getItem("current_user");
    return raw ? JSON.parse(raw).username : "there";
  } catch {
    return "there";
  }
}

function Dashboard() {
  const username = getUsername();

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h4>{getGreeting()}, {username}</h4>
        <p>{getFormattedDate()}</p>
      </div>

      <div className="dashboard-grid-top">
        <div className="dashboard-card-col">
          <BookingSummary />
        </div>
        <div className="dashboard-card-col">
          <NextBooking />
        </div>
        <div className="dashboard-card-col">
          <UpcomingHolidaysCard />
        </div>
      </div>

      <div className="dashboard-grid-mid">
        <div className="dashboard-card-col">
          <PaymentStatus />
        </div>
        <div className="dashboard-card-col">
          <CelebrationAndPackage />
        </div>
      </div>

      <div className="dashboard-grid-bottom">
        <div className="dashboard-card-col">
          <AvailableSlots />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Dashboard.jsx
git commit -m "feat: add greeting header with date and username to Dashboard"
```

---

### Task 3: Update BookingTakenSummary.jsx

**Files:**
- Modify: `frontend/src/pages/BookingTakenSummary.jsx`

- [ ] **Step 1: Replace BookingTakenSummary.jsx**

Changes: add `loading` state, show spinner while fetching, remove `console.log`, swap `today-bookings-card` → `dashboard-card dashboard-card--blue`.

```jsx
import React, { useEffect, useState } from "react";
import { fetchBookingByDate } from "../services/bookingServices";
import "../css/Dashboard.css";
import DataTable from "../components/Datatable";

const TodayBookingsSummaryCard = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(true);

  const bookingColumns = [
    { key: "customer_name", label: "Customer Name" },
    { key: "phone_number", label: "Number" },
    { key: "event_date", label: "Event Date" },
    { key: "time_slot", label: "Time Slot" },
    { key: "celebration_name", label: "Celebration Type" },
    { key: "package_name", label: "Package" },
    { key: "status", label: "Status" },
    { key: "updated_by", label: "Updated By" },
  ];

  useEffect(() => {
    const fetchTodayBookings = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const allBookings = await fetchBookingByDate(today);
        setTodayCount(allBookings.length);
        setBookingData(allBookings);
      } catch (error) {
        console.error("Error fetching today's bookings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayBookings();
  }, []);

  return (
    <div>
      <div className="dashboard-card dashboard-card--blue shadow-sm">
        {loading ? (
          <div className="card-spinner-wrapper">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="card-content">
            <div className="card-header">
              <div>
                <h6 className="label">Booking Taken Today</h6>
                <h2 className="count">{todayCount}</h2>
              </div>
            </div>
            <div className="bts-card-footer">
              <button
                className="view-all-btn"
                onClick={() => setShowBookingModal(true)}
              >
                View All <i className="bi bi-arrow-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showBookingModal && (
        <div className="modal-overlay">
          <div className="booking-taken-modal-box">
            <h5>Bookings Taken Today</h5>
            <div
              className="modal-close-icon"
              onClick={() => setShowBookingModal(false)}
            >
              ×
            </div>
            {bookingData.length === 0 ? (
              <p>No bookings found</p>
            ) : (
              <div className="modal-datatable">
                <DataTable
                  title=""
                  columns={bookingColumns}
                  data={bookingData}
                  searchableFields={[]}
                  actions={[]}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayBookingsSummaryCard;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/BookingTakenSummary.jsx
git commit -m "fix: add spinner, remove console.log, update card class in BookingTakenSummary"
```

---

### Task 4: Update NextBooking.jsx

**Files:**
- Modify: `frontend/src/pages/NextBooking.jsx`

- [ ] **Step 1: Replace NextBooking.jsx**

Changes: add `loading` state, show spinner while fetching, swap `today-bookings-card` → `dashboard-card dashboard-card--purple`, fix typo `conainer` → `div`.

```jsx
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
        <div className="modal-overlay">
          <div className="modal-box">
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/NextBooking.jsx
git commit -m "fix: add spinner, update card class, fix typo in NextBooking"
```

---

### Task 5: Update UpcomingHolidays.jsx

**Files:**
- Modify: `frontend/src/pages/UpcomingHolidays.jsx`

- [ ] **Step 1: Replace UpcomingHolidays.jsx**

Changes: remove duplicate `../css/Dashboard.css` import, add `loading` state, show spinner while fetching, swap `today-bookings-card` → `dashboard-card dashboard-card--amber`.

```jsx
import React, { useState, useEffect } from "react";
import "../css/Dashboard.css";
import { useNavigate } from "react-router-dom";
import {
  fetchUpcomingHoliday,
  addHoliday,
  deleteHoliday,
} from "../services/bookingServices";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DataTable from "../components/Datatable";
import { Trash2 } from "lucide-react";
import NotificationPopup from "../components/NotificationPopup";

const UpcomingHolidaysCard = () => {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);
  const [showHolidayModal, setshowHolidayModal] = useState(false);
  const [showCalenderModal, setShowCalenderModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [holidayTitle, setHolidayTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletePopup, setDeletePopup] = useState({ visible: false, holiday: null });

  const columns = [
    { key: "title", label: "Title" },
    { key: "date", label: "Date" },
  ];

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const upcomingHolidays = await fetchUpcomingHoliday();
        setHolidays(upcomingHolidays);
      } catch (error) {
        console.error("Error fetching upcoming holidays", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, []);

  const ActionDelete = ({ row }) => (
    <Trash2
      className="action-icon text-danger"
      size={18}
      onClick={() => handleDeleteHoliday(row)}
    />
  );

  const handleDeleteHoliday = (holiday) => {
    setDeletePopup({ visible: true, holiday });
  };

  const handleSaveHoliday = async () => {
    if (!selectedDate || !holidayTitle.trim()) {
      alert("Please select a date and enter a title");
      return;
    }
    try {
      const formattedDate = selectedDate.toLocaleDateString("en-CA");
      await addHoliday({ date: formattedDate, title: holidayTitle });
      alert("Holiday added successfully!");
      setShowCalenderModal(false);
      setHolidayTitle("");
      setSelectedDate(null);
      const updated = await fetchUpcomingHoliday();
      setHolidays(updated);
      navigate("/dashboard", { state: { refetch: true } });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        alert("Failed to add holiday");
      }
      console.error("Error adding holiday", error);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteHoliday(deletePopup.holiday.holiday_id);
      setDeletePopup({ visible: false, holiday: null });
      alert("Holiday deleted successfully!");
      const updated = await fetchUpcomingHoliday();
      setHolidays(updated);
      navigate("/dashboard", { state: { refetch: true } });
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete the holiday. Please try again.");
      setDeletePopup({ visible: false, holiday: null });
    }
  };

  const cancelDelete = () => {
    setDeletePopup({ visible: false, holiday: null });
  };

  return (
    <div>
      <div className="dashboard-card dashboard-card--amber shadow-sm">
        {loading ? (
          <div className="card-spinner-wrapper">
            <div className="spinner-border" style={{ color: "#f5a623" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="card-content">
            <div className="card-header">
              <h6 className="label">Upcoming Holidays</h6>
            </div>
            <ul className="holiday-list">
              {holidays.slice(0, 2).map((holiday, index) => (
                <li key={index} className="holiday-item">
                  <strong>{holiday.date}</strong>: {holiday.title}
                </li>
              ))}
              {holidays.length === 0 && (
                <li className="holiday-item text-muted">No upcoming holidays</li>
              )}
            </ul>
            <div className="holiday-card-footer">
              <button className="view-all-btn" onClick={() => setshowHolidayModal(true)}>
                View Calendar <i className="bi bi-arrow-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showHolidayModal && (
        <div className="uh-modal-overlay">
          <div className="uh-modal-box">
            <h5 className="mb-5">Upcoming Holidays</h5>
            <div className="modal-close-icon" onClick={() => setshowHolidayModal(false)}>
              ×
            </div>
            <div className="modal-datatable">
              <DataTable
                title=""
                columns={columns}
                data={holidays}
                actions={[ActionDelete]}
                actionButton={
                  <div className="align-right">
                    <button className="add-holiday-button" onClick={() => setShowCalenderModal(true)}>
                      Add Holiday
                    </button>
                  </div>
                }
              />
            </div>
            {deletePopup.visible && (
              <NotificationPopup
                message="Are you sure you want to delete the holiday?"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
              />
            )}
            {showCalenderModal && (
              <div className="uh-modal-overlay">
                <div className="add-upcoming-holiday-modal-box">
                  <div className="form-step-wrapper text-start px-3">
                    <h5 className="text-center mb-3">Add Holiday</h5>
                    <div
                      className="modal-close-icon"
                      onClick={() => {
                        setShowCalenderModal(false);
                        setHolidayTitle("");
                        setSelectedDate(null);
                      }}
                    >
                      ×
                    </div>
                    <label htmlFor="holiday-title" className="form-label">Select Date</label>
                    <div className="d-flex justify-content-center mb-3">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        minDate={new Date()}
                        maxDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
                        excludeDates={holidays}
                        inline
                        calendarClassName="custom-datepicker"
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>
                    <label htmlFor="holiday-title" className="form-label">Holiday Title</label>
                    <input
                      type="text"
                      id="holiday-title"
                      className="form-control mb-3"
                      value={holidayTitle}
                      onChange={(e) => setHolidayTitle(e.target.value)}
                    />
                    <div className="d-flex justify-content-end">
                      <button className="btn btn-primary" onClick={handleSaveHoliday}>Save</button>
                      <button
                        className="btn btn-outline-secondary ms-2"
                        onClick={() => {
                          setShowCalenderModal(false);
                          setHolidayTitle("");
                          setSelectedDate(null);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingHolidaysCard;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/UpcomingHolidays.jsx
git commit -m "fix: add spinner, remove duplicate import, update card class in UpcomingHolidays"
```

---

### Task 6: Fix PaymentStatus.jsx

**Files:**
- Modify: `frontend/src/pages/PaymentStatus.jsx`

- [ ] **Step 1: Replace PaymentStatus.jsx**

Changes: fix broken layout (move count + "View All" out of `.card-header`), add `loading` state + spinner, swap `pending-payment-card` → `dashboard-card dashboard-card--red`.

```jsx
import React, { useEffect, useState } from "react";
import { fetchBookingsByFilter, updatePayment } from "../services/bookingServices";
import DataTable from "../components/Datatable";
import "../css/Dashboard.css";
import { Edit } from "lucide-react";

const PaymentStatus = () => {
  const user = localStorage.getItem("current_user");
  const [pendingPayments, setPendingPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const columns = [
    { key: "customer_name", label: "Customer" },
    { key: "event_date", label: "Event Date" },
    { key: "payment_total", label: "Total" },
    { key: "payment_paid", label: "Paid" },
    { key: "balance", label: "Balance" },
  ];

  const ActionButtons = ({ row }) => (
    <div className="d-flex justify-content-center gap-3">
      <span title="Edit Payment">
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

  const loadPendingPayments = async () => {
    const allBookings = await fetchBookingsByFilter("all");
    return allBookings
      .filter((b) => Number(b.payment_total) > Number(b.payment_paid))
      .map((b) => ({ ...b, balance: b.payment_total - b.payment_paid }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pending = await loadPendingPayments();
        setPendingPayments(pending);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
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
      await updatePayment(editFormData.booking_id, { ...editFormData, updated_by: username });
      alert("Payment updated");
      const updated = await loadPendingPayments();
      setPendingPayments(updated);
      setEditModalVisible(false);
    } catch (err) {
      alert("Error saving payment");
    }
  };

  return (
    <div>
      <div className="dashboard-card dashboard-card--red shadow-sm">
        {loading ? (
          <div className="card-spinner-wrapper">
            <div className="spinner-border" style={{ color: "#e8603c" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="card-content">
            <div className="card-header">
              <h6 className="label">Pending Payments</h6>
            </div>
            <h2 className="count">{pendingPayments.length}</h2>
            <div className="holiday-card-footer">
              <button className="view-all-btn" onClick={() => setShowPaymentModal(true)}>
                View All <i className="bi bi-arrow-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <div className="ps-modal-overlay">
          <div className="ps-modal-box">
            <h5>Pending Payment Details</h5>
            <div className="modal-close-icon" onClick={() => setShowPaymentModal(false)}>
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
                today.setHours(0, 0, 0, 0);
                eventDate.setHours(0, 0, 0, 0);
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
            <div className="modal-close-icon" onClick={() => setEditModalVisible(false)}>
              ×
            </div>
            <label>Amount Paid:</label>
            <input
              type="number"
              className="form-control mb-2"
              value={editFormData.payment_paid}
              onChange={(e) => setEditFormData({ ...editFormData, payment_paid: e.target.value })}
            />
            <div className="mt-4">
              <h5>Balance Summary</h5>
              <p><strong>Total Amount:</strong> ₹{editFormData.payment_total || 0}</p>
              <p><strong>Amount Paid:</strong> ₹{editFormData.payment_paid || 0}</p>
              <p><strong>Balance:</strong> ₹{editFormData.payment_total - editFormData.payment_paid || 0}</p>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => { setEditModalVisible(false); setEditFormData({}); }}
              >
                Cancel
              </button>
              <button className="btn btn-outline-primary btn-sm" onClick={updatePaymentDetails}>
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/PaymentStatus.jsx
git commit -m "fix: fix layout bug, add spinner, update card class in PaymentStatus"
```

---

### Task 7: Update CelebrationAndPackage.jsx

**Files:**
- Modify: `frontend/src/pages/CelebrationAndPackage.jsx`

- [ ] **Step 1: Replace CelebrationAndPackage.jsx**

Changes: add `loading` state + spinner, remove `console.log`, swap `pending-payment-card` → `dashboard-card dashboard-card--teal`.

```jsx
import React, { useEffect, useState } from "react";
import { fetchCelebrationType, fetchPackage } from "../services/bookingServices";
import "../css/Dashboard.css";

const CelebrationAndPackage = () => {
  const [celebrations, setCelebrations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [celebrationData, packageData] = await Promise.all([
          fetchCelebrationType(),
          fetchPackage(),
        ]);
        setCelebrations(celebrationData);
        setPackages(packageData);
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div>
      <div className="dashboard-card dashboard-card--teal shadow-sm">
        {loading ? (
          <div className="card-spinner-wrapper">
            <div className="spinner-border" style={{ color: "#2bba8f" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="card-content">
            <div className="card-header">
              <h6 className="label">Celebrations & Packages</h6>
            </div>
            <div className="mt-2">
              <div>
                <button className="view-all-btn" onClick={() => setShowCelebrationModal(true)}>
                  View Celebration Types <i className="bi bi-arrow-right" />
                </button>
              </div>
              <div className="mt-2">
                <button className="view-all-btn" onClick={() => setShowPackageModal(true)}>
                  View Package Types <i className="bi bi-arrow-right" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCelebrationModal && (
        <div className="ps-modal-overlay">
          <div className="ps-modal-box">
            <h5 className="mb-3">Available Celebration Types</h5>
            <div className="modal-close-icon" onClick={() => setShowCelebrationModal(false)}>
              ×
            </div>
            <ul className="celebration-package-list">
              {celebrations.map((c) => (
                <li key={c.celebration_id} className="celebration-package-item">
                  {c.celebration_name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showPackageModal && (
        <div className="ps-modal-overlay">
          <div className="ps-modal-box">
            <h5 className="mb-3">Available Package Types</h5>
            <div className="modal-close-icon" onClick={() => setShowPackageModal(false)}>
              ×
            </div>
            <ul className="celebration-package-list">
              {packages.map((p) => (
                <li key={p.package_id} className="celebration-package-item">
                  {p.package_name} {p.description} – ₹{p.price}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CelebrationAndPackage;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/CelebrationAndPackage.jsx
git commit -m "fix: add spinner, remove console.log, update card class in CelebrationAndPackage"
```

---

### Task 8: Update AvailableSlots.jsx

**Files:**
- Modify: `frontend/src/pages/AvailableSlots.jsx`

- [ ] **Step 1: Replace AvailableSlots.jsx**

Changes: remove `AddBooking.css` import (styles now live in `Dashboard.css`), add `loading` state + spinner.

```jsx
import React, { useEffect, useState } from "react";
import { fetchBookingsByFilter, fetchUpcomingHoliday } from "../services/bookingServices";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/Dashboard.css";

const AvailableSlots = () => {
  const [bookingDate, setBookingDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [holidayDates, setHolidayDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookings, holidays] = await Promise.all([
          fetchBookingsByFilter("todayandfuture"),
          fetchUpcomingHoliday(),
        ]);
        setBookedSlots(bookings);
        setHolidayDates(holidays.map((h) => new Date(h.date)));
      } catch (err) {
        console.error("Error fetching booked slots", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="slot-availability-card">
      <h5 className="text-center">Check Available Slots</h5>

      {loading ? (
        <div className="card-spinner-wrapper">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-center mb-3">
            <DatePicker
              selected={bookingDate}
              onChange={(date) => {
                setBookingDate(date);
                setSelectedTime(null);
              }}
              minDate={new Date()}
              maxDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
              excludeDates={holidayDates}
              inline
              calendarClassName="custom-datepicker"
            />
          </div>

          {bookingDate && (
            <>
              <h6 className="text-center">Time Slots</h6>
              <div className="d-flex flex-wrap justify-content-center">
                {Array.from({ length: 12 }).map((_, i) => {
                  const hour = 10 + i;
                  const time = `${hour.toString().padStart(2, "0")}:00`;
                  const selectedDate = bookingDate.toLocaleDateString("en-CA");

                  const isBooked = bookedSlots.some(
                    (slot) =>
                      slot.event_date === selectedDate &&
                      slot.time_slot?.trim().substring(0, 5) === time
                  );

                  const now = new Date();
                  const isToday = bookingDate.toDateString() === now.toDateString();
                  const slotTime = new Date(bookingDate);
                  slotTime.setHours(hour, 0, 0, 0);
                  const isPastTime = isToday && slotTime < now;
                  const isDisabled = isBooked || isPastTime;

                  return (
                    <button
                      key={time}
                      className={`btn btn-sm m-1 ${
                        selectedTime === time ? "btn-check-time" : "btn-outline-secondary"
                      }`}
                      disabled={isDisabled}
                      style={{
                        opacity: isDisabled ? 0.5 : 1,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                      }}
                      onClick={() => { if (!isDisabled) setSelectedTime(time); }}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AvailableSlots;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/AvailableSlots.jsx
git commit -m "fix: remove AddBooking.css import, add spinner in AvailableSlots"
```

---

### Task 9: Smoke Test

- [ ] **Step 1: Start the frontend dev server**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Open the dashboard and verify**

Check each of the following:
1. Greeting header shows correct time-based greeting, username, and today's date
2. All 5 top/mid cards show a spinner briefly then load content
3. All cards are white with a left accent border in the correct color
4. PaymentStatus shows count and "View All" properly (not crammed into header)
5. AvailableSlots shows spinner then date picker
6. Pending payments table: past-event rows are red, font is bold (not invisible from invalid weight)
7. "View Calendar" button (was "View Calender" — typo fixed) in UpcomingHolidays
8. Modals still open and close correctly for all cards
9. No console.log output in browser devtools from dashboard components

- [ ] **Step 3: Commit if any last tweaks were needed, otherwise done**

```bash
git add -p
git commit -m "fix: smoke test adjustments"
```
