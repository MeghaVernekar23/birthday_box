import React from "react";
import BookingSummary from "./BookingTakenSummary";
import NextBooking from "./NextBooking";
import UpcomingHolidaysCard from "./UpcomingHolidays";
import AvailableSlots from "./AvailableSlots";
import PaymentStatus from "./PaymentStatus";
import CelebrationAndPackage from "./CelebrationAndPackage";

function Dashboard() {
  return (
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
      <div className="row">
        <div className="col-md-8 mb-4">
          <AvailableSlots />
        </div>

        <div className="col-md-4 d-flex flex-column justify-content-between h-100">
          <div className="mb-4">
            <PaymentStatus />
          </div>
          <div className="mb-4">
            <CelebrationAndPackage />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
