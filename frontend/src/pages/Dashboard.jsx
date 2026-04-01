import React from "react";
import BookingSummary from "./BookingTakenSummary";
import NextBooking from "./NextBooking";
import UpcomingHolidaysCard from "./UpcomingHolidays";
import AvailableSlots from "./AvailableSlots";
import PaymentStatus from "./PaymentStatus";
import CelebrationAndPackage from "./CelebrationAndPackage";
import "../css/Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-wrapper">
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
