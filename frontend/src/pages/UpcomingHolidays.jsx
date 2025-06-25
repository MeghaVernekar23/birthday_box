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
import "../css/Dashboard.css";
import NotificationPopup from "../components/NotificationPopup";

const UpcomingHolidaysCard = () => {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);
  const [showHolidayModal, setshowHolidayModal] = useState(false);
  const [showCalenderModal, setShowCalenderModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [holidayTitle, setHolidayTitle] = useState("");
  const [deletePopup, setDeletePopup] = useState({
    visible: false,
    holiday: null,
  });

  const columns = [
    { key: "title", label: "Title" },
    { key: "date", label: "Date" },
  ];

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const upcomingHolidays = await fetchUpcomingHoliday();
        console.log("data::", upcomingHolidays);
        setHolidays(upcomingHolidays);
      } catch (error) {
        console.error("Error fetching today's bookings", error);
      }
    };
    fetchHolidays();
  }, []);

  const handleCalender = async () => {
    try {
      setshowHolidayModal(true);
    } catch (err) {
      console.error("Error fetching bookings", err);
      alert("Failed to load bookings");
    }
  };

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

  const handleAddHoliday = () => {
    setShowCalenderModal(true);
  };

  return (
    <div className="conainer">
      <div className="today-bookings-card shadow-sm">
        <div className="card-content">
          <div className="card-header">
            <h6 className="label">Upcoming Holidays</h6>
          </div>

          <ul className="holiday-list">
            {holidays.slice(0, 2).map((holiday, index) => (
              <li key={index} className="holiday-item">
                <strong>{holiday.date}</strong> : {holiday.title}
              </li>
            ))}
          </ul>

          <div className="holiday-card-footer">
            <button className="view-all-btn" onClick={() => handleCalender()}>
              View Calender <i className="bi bi-arrow-right" />
            </button>
          </div>
        </div>
      </div>
      {showHolidayModal && (
        <div className="uh-modal-overlay">
          <div className="uh-modal-box">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Manage Holidays</h5>
              <button
                className="btn-close"
                aria-label="Close"
                onClick={() => setshowHolidayModal(false)}
                style={{
                  fontSize: "1.2rem",
                  border: "none",
                  background: "transparent",
                }}
              >
                &times;
              </button>
            </div>
            <div className="d-flex justify-content-end">
              <button className="add-holiday-button" onClick={handleAddHoliday}>
                Add Holiday
              </button>
            </div>

            <DataTable
              title="Upcoming Holidays"
              columns={columns}
              data={holidays}
              actions={[ActionDelete]}
            />

            {deletePopup.visible && (
              <NotificationPopup
                message={`Are you sure you want to delete the holiday?`}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
              />
            )}

            {showCalenderModal && (
              <div className="uh-modal-overlay">
                <div className="uh-modal-box">
                  <div className="form-step-wrapper text-start px-3">
                    <h5 className="text-center mb-3">Add Holiday</h5>
                    <label htmlFor="holiday-title" className="form-label">
                      Select Date
                    </label>
                    <div className="d-flex justify-content-center mb-3">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => {
                          setSelectedDate(date);
                        }}
                        minDate={new Date()}
                        maxDate={
                          new Date(
                            new Date().setMonth(new Date().getMonth() + 2)
                          )
                        }
                        inline
                        calendarClassName="custom-datepicker"
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>
                    <label htmlFor="holiday-title" className="form-label">
                      Holiday Title
                    </label>
                    <input
                      type="text"
                      id="holiday-title"
                      className="form-control mb-3"
                      value={holidayTitle}
                      onChange={(e) => setHolidayTitle(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveHoliday}
                    >
                      Save
                    </button>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingHolidaysCard;
