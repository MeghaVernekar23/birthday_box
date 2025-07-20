import React, { useEffect, useState } from "react";
import { fetchBookingByDate } from "../services/bookingServices";
import "../css/Dashboard.css";
import DataTable from "../components/Datatable";

const TodayBookingsSummaryCard = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState([]);

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
        console.log("cuurent day booking", allBookings);
        setTodayCount(allBookings.length);
        setBookingData(allBookings);
      } catch (error) {
        console.error("Error fetching today's bookings", error);
      }
    };

    fetchTodayBookings();
  }, []);

  const handleViewBookings = async () => {
    try {
      setShowBookingModal(true);
    } catch (err) {
      console.error("Error fetching bookings", err);
      alert("Failed to load bookings");
    }
  };

  return (
    <div>
      <div className="today-bookings-card shadow-sm">
        <div className="card-content">
          <div className="card-header">
            <div>
              <h6 className="label">Booking Taken Today</h6>
              <h2 className="count">{todayCount}</h2>
            </div>
          </div>
          <div className="bts-card-footer ">
            <button
              className="view-all-btn"
              onClick={() => handleViewBookings()}
            >
              View All <i className="bi bi-arrow-right" />
            </button>
          </div>
        </div>
      </div>
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="booking-taken-modal-box">
            <h5>Bookings Taken Today</h5>
            <div
              className="modal-close-icon"
              onClick={() => {
                setShowBookingModal(false);
              }}
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
