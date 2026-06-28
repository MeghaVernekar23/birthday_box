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
