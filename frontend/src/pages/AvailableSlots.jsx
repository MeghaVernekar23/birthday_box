import React, { useEffect, useState } from "react";
import {
  fetchBookingsByFilter,
  fetchUpcomingHoliday,
} from "../services/bookingServices";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/AddBooking.css";

const AvailableSlots = () => {
  const [bookingDate, setBookingDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [holidayDates, setHolidayDates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookings = await fetchBookingsByFilter("todayandfuture");
        setBookedSlots(bookings);
        const holidays = await fetchUpcomingHoliday();
        const converted = holidays.map((h) => new Date(h.date));
        setHolidayDates(converted);
      } catch (err) {
        console.error("Error fetching booked slots", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="slot-availability-card">
      <h5 className="text-center">Check Available Slots</h5>
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
                    selectedTime === time
                      ? "btn-check-time"
                      : "btn-outline-secondary"
                  }`}
                  disabled={isDisabled}
                  style={{
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                  }}
                  onClick={() => {
                    if (!isDisabled) setSelectedTime(time);
                  }}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableSlots;
