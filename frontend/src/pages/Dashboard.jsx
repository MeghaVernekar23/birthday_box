import React from "react";
import BookingSummary from "./BookingTakenSummary";
import NextBooking from "./NextBooking";
import UpcomingHolidaysCard from "./UpcomingHolidays";
import AvailableSlots from "./AvailableSlots";
import PaymentStatus from "./PaymentStatus";
import CelebrationAndPackage from "./CelebrationAndPackage";
import "../css/Dashboard.css";
import AnalyticsSection from "./AnalyticsSection";

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

      <div className="dashboard-grid-analytics">
        <AnalyticsSection />
      </div>
    </div>
  );
}

export default Dashboard;
