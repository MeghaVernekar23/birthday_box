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
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-4 mb-4">
            <BookingSummary />
          </div>
          <div className="col-md-4 mb-4">
            <NextBooking />
          </div>
          <div className="col-md-4 mb-4">
            <UpcomingHolidaysCard />
          </div>
        </div>
        <div className="row align-items-start">
          <div className="col-md-6 mb-4">
            <PaymentStatus />
          </div>
          <div className="col-md-6 mb-4">
            <CelebrationAndPackage />
          </div>
          
        </div>

        <div className="row align-items-start">
          <div className="col-md-12">
            <AvailableSlots />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
