import React, { useEffect, useState } from "react";
import BookingSummary from "./BookingTakenSummary";
import NextBooking from "./NextBooking";
import CelebrationAndPackage from "./CelebrationAndPackage";
import "../css/Dashboard.css";
import AnalyticsSection from "./AnalyticsSection";
import { fetchBookingsByFilter } from "../services/bookingServices";

function TotalBookingsCard() {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    fetchBookingsByFilter("all")
      .then((data) => setTotal(Array.isArray(data) ? data.length : 0))
      .catch(() => setTotal(0));
  }, []);

  return (
    <div className="dashboard-card dashboard-card--blue shadow-sm">
      {total === null ? (
        <div className="card-spinner-wrapper">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card-content">
          <div className="card-header">
            <div>
              <h6 className="label">Total Bookings</h6>
              <h2 className="count">{total}</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
          <CelebrationAndPackage />
        </div>
        <div className="dashboard-card-col">
          <TotalBookingsCard />
        </div>
      </div>

      <AnalyticsSection />
    </div>
  );
}

export default Dashboard;
