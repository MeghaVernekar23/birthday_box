import React, { useState, useEffect } from "react";

import "../css/Booking.css";
import { Edit, Trash2, Eye } from "lucide-react";
import DataTable from "../components/Datatable";
import NotificationPopup from "../components/NotificationPopup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  fetchBookingsByFilter,
  fetchCelebrationType,
  fetchPackage,
  deleteBooking,
  fetchBookingById,
  updateBooking,
  fetchUpcomingHoliday,
} from "../services/bookingServices";

function Bookings() {
  const user = localStorage.getItem("current_user");
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const [bookingDate, setBookingDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [todayBookingData, setTodaysBookings] = useState([]);
  const [additionalItems, setAdditionalItems] = useState([]);

  const [celebrationOptions, setcelebrationOptions] = useState([]);

  const [packageOptions, setpackageOptions] = useState([]);

  const [bookedSlots, setBookedSlots] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);

  const [editingBookingId, setEditingBookingId] = useState(null);

  const [popupDelete, setPopupDelete] = useState({
    visible: false,
    booking: null,
  });
  const [popupEdit, setPopupEdit] = useState({ visible: false, booking: null });

  const [popupView, setPopupView] = useState({ visible: false, booking: null });

  const [holidayDates, setHolidayDates] = useState([]);

  const [formData, setFormData] = useState({
    customer_name: "",
    phone_number: "",
    email: "",
    address: "",
    event_date: "",
    time_slot: "",
    celebration_id: "",
    package_id: "",
    addons_note: "",
    updated_by: "",
    created_by: "",
    status: "",
    created_at: "",
    updated_at: "",
    additional_items: [],
    payment_mode: "",
    payment_paid: "",
    payment_notes: "",
    payment_total: "",
  });

  const emptyForm = {
    customer_name: "",
    phone_number: "",
    email: "",
    address: "",
    event_date: "",
    time_slot: "",
    celebration_id: "",
    package_id: "",
    addons_note: "",
    updated_by: "",
    created_by: "",
    status: "",
    additional_items: [],
    payment_mode: "",
    payment_paid: "",
    payment_notes: "",
    payment_total: "",
  };

  const columns = [
    { key: "customer_name", label: "Customer Name" },
    { key: "phone_number", label: "Number" },
    { key: "event_date", label: "Event Date" },
    { key: "time_slot", label: "Time Slot" },
    { key: "celebration_name", label: "Celebration Type" },
    { key: "package_name", label: "Package" },
    { key: "status", label: "Status" },
    { key: "updated_by", label: "Updated By" },
  ];

  const ActionButtons = ({ row }) => (
    <div className="d-flex justify-content-center gap-3">
      <span title="Edit Customer">
        <Edit
          className="action-icon text-primary"
          size={18}
          onClick={() => handleEditBooking(row)}
        />
      </span>
      <span title="Delete Customer">
        <Trash2
          className="action-icon text-danger"
          size={18}
          onClick={() => handleDeleteBooking(row)}
        />
      </span>
      <span title="View Bookings">
        <Eye
          className="action-icon text-info"
          size={18}
          onClick={() => handleViewBooking(row)}
        />
      </span>
    </div>
  );

  useEffect(() => {
    fetchTodaysBookings();
  }, []);

  const fetchTodaysBookings = async () => {
    const data = await fetchBookingsByFilter("today");
    setTodaysBookings(data);
  };

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");

      const fetchModalData = async () => {
        try {
          const [bookings, celebrations, packages] = await Promise.all([
            fetchBookingsByFilter("todayandfuture"),
            fetchCelebrationType(),
            fetchPackage(),
          ]);
          setBookedSlots(bookings);
          setcelebrationOptions(celebrations);
          setpackageOptions(packages);
          const holidays = await fetchUpcomingHoliday();
          const converted = holidays.map((h) => new Date(h.date));
          setHolidayDates(converted);
        } catch (err) {
          console.error("Error fetching modal data", err);
        }
      };
      fetchModalData();
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  const submitBookingDetails = async (formValues) => {
    console.log("entered edit booking submission", formValues);
    try {
      const username = JSON.parse(user).username;
      const updatedForm = {
        ...formValues,
        updated_by: username,
        booking_id: editingBookingId,
      };

      await updateBooking(editingBookingId, updatedForm);
      alert("Booking updated successfully!");

      setPopupEdit({ visible: false, booking: null });
      setShowModal(false);
      setStep(1);
      fetchTodaysBookings();
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error("Submit failed:", error);
    }
  };

  const handleEditBooking = async (booking) => {
    try {
      const fullBooking = await fetchBookingById(booking.booking_id);

      setFormData({
        customer_name: fullBooking.customer_name,
        phone_number: fullBooking.phone_number,
        email: fullBooking.email,
        address: fullBooking.address,
        event_date: fullBooking.event_date,
        time_slot: fullBooking.time_slot,
        celebration_id: String(fullBooking.celebration_id),
        package_id: String(fullBooking.package_id),
        addons_note: fullBooking.addons_note,
        updated_by: fullBooking.updated_by,
        created_by: fullBooking.created_by,
        status: fullBooking.status,
        created_at: fullBooking.created_at,
        updated_at: fullBooking.updated_at,
        payment_mode: fullBooking.payment_mode,
        payment_paid: fullBooking.payment_paid,
        payment_notes: fullBooking.payment_notes,
        payment_total: fullBooking.payment_total,
      });
      setAdditionalItems(fullBooking.additional_items || []);

      if (fullBooking.event_date) {
        setBookingDate(new Date(fullBooking.event_date));
      } else {
        console.warn("Invalid event_date", fullBooking.event_date);
      }
      setSelectedTime(fullBooking.time_slot);
      setIsEditMode(true);
      setEditingBookingId(fullBooking.booking_id);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching booking for edit:", error);
      alert("Failed to load booking details for editing.");
    }
  };

  const handleDeleteBooking = (booking) => {
    setPopupDelete({ visible: true, booking });
  };

  const handleConfirmBooking = (formData) => {
    setPopupEdit({ visible: true, booking: formData });
  };
  const confirmDelete = async () => {
    try {
      await deleteBooking(popupDelete.booking.booking_id);
      setPopupDelete({ visible: false, booking: null });
      alert("Booking deleted successfully!");
      fetchTodaysBookings();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete the booking. Please try again.");
      setPopupDelete({ visible: false, booking: null });
    }
  };

  const cancelDelete = () => {
    setPopupDelete({ visible: false, booking: null });
  };

  const cancelEdit = () => {
    setPopupEdit({ visible: false, booking: null });
  };

  const handleViewBooking = async (booking) => {
    try {
      const fullBooking = await fetchBookingById(booking.booking_id);
      setPopupView({ visible: true, booking: fullBooking });
    } catch (error) {
      alert("Failed to load booking details.");
      console.error("View error:", error);
    }
  };

  return (
    <div className="container">
      <DataTable
        title="Today's Bookings"
        columns={columns}
        data={todayBookingData}
        actions={[ActionButtons]}
        searchableFields={["customer_name", "phone_number"]}
      />

      <div className="mb-5"></div>

      {popupDelete.visible && (
        <NotificationPopup
          message={`Are you sure you want to delete the booking for ${popupDelete.booking.customer_name}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {popupEdit.visible && (
        <NotificationPopup
          message={`Are you sure you want to edit the booking for ${popupEdit.booking.customer_name}?`}
          onConfirm={() => {
            submitBookingDetails(popupEdit.booking);
          }}
          onCancel={cancelEdit}
        />
      )}

      {popupView.visible && popupView.booking && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div
              className="modal-close-icon"
              onClick={() => setPopupView({ visible: false, booking: null })}
            >
              ×
            </div>
            <h5 className="text-center mb-3">Booking Details</h5>

            <div className="form-step-wrapper text-start px-3">
              <div className="review-box mb-3">
                <h5 className="review-title">Customer Details</h5>
                <p>
                  <strong>Name:</strong> {popupView.booking.customer_name}
                </p>
                <p>
                  <strong>Phone:</strong> {popupView.booking.phone_number}
                </p>
                {popupView.booking.email && (
                  <p>
                    <strong>Email:</strong> {popupView.booking.email}
                  </p>
                )}
                {popupView.booking.address && (
                  <p>
                    <strong>Address:</strong> {popupView.booking.address}
                  </p>
                )}
              </div>

              <div className="review-box mb-3">
                <h5 className="review-title">Date & Time</h5>
                <p>
                  <strong>Date:</strong> {popupView.booking.event_date}
                </p>
                <p>
                  <strong>Time Slot:</strong> {popupView.booking.time_slot}
                </p>
              </div>

              <div className="review-box mb-3">
                <h5 className="review-title">Celebration Type</h5>
                <p>{popupView.booking.celebration_name}</p>
              </div>

              <div className="review-box mb-3">
                <h5 className="review-title">Package</h5>
                <p>{popupView.booking.package_name}</p>
              </div>

              {popupView.booking.additional_items?.length > 0 && (
                <div className="review-box mb-3">
                  <h6>Additional Requirements:</h6>
                  <ul>
                    {popupView.booking.additional_items.map((item, index) => (
                      <li key={index}>
                        {item.description} – ₹{item.price}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="review-box mb-3">
                <h5 className="review-title">Booking Status</h5>
                <p>{popupView.booking.status}</p>
              </div>

              <div className="review-box mb-3">
                <h5 className="review-title">Payment Details</h5>
                <p>
                  <strong>Payment Mode:</strong>{" "}
                  {popupView.booking.payment_mode
                    ? popupView.booking.payment_mode
                        .replace("_", " ")
                        .toUpperCase()
                    : "N/A"}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹
                  {popupView.booking.payment_total || "0"}
                </p>
                <p>
                  <strong>Amount Paid:</strong> ₹
                  {popupView.booking.payment_paid || "0"}
                </p>
                <p>
                  <strong>Balance:</strong> ₹
                  {Math.max(
                    0,
                    (Number(popupView.booking.payment_total) || 0) -
                      (Number(popupView.booking.payment_paid) || 0)
                  )}
                </p>
                {popupView.booking.payment_notes && (
                  <p>
                    <strong>Notes:</strong> {popupView.booking.payment_notes}
                  </p>
                )}
              </div>

              <div className="review-box mb-3">
                <h5 className="review-title">Audit Trail</h5>
                <p>
                  <strong>Created By:</strong> {popupView.booking.created_by}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {popupView.booking.created_at
                    ? new Date(popupView.booking.created_at).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Updated By:</strong>{" "}
                  {popupView.booking.updated_by || "N/A"}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {popupView.booking.updated_at
                    ? new Date(popupView.booking.updated_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h5>Edit Booking Details</h5>
            <div
              className="modal-close-icon"
              onClick={() => {
                setShowModal(false);
                setFormData(emptyForm);
                setAdditionalItems([]);
                setStep(1);
                setBookingDate(null);
                setSelectedTime(null);
                setIsEditMode(false);
              }}
            >
              ×
            </div>
            <div className="stepper">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <div
                  key={num}
                  className={`step 
        ${step === num ? "active" : ""} 
        ${step > num ? "completed" : ""}`}
                >
                  <div className="step-number">{num}</div>
                  {
                    [
                      "Customer Details",
                      "Date & Time",
                      "Celebration Type",
                      "Package",
                      "Add-ons",
                      "Payment",
                      "Review",
                    ][num - 1]
                  }
                  {num < 7 && <div className="step-line" />}
                </div>
              ))}
            </div>
            {step === 1 && (
              <div className="form-step-wrapper text-center">
                <h5 className="mb-3">Customer Details</h5>
                <div className="input-group-wrapper text-start">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-control mb-3"
                    placeholder="Enter Phone Number"
                    value={formData.phone_number}
                    maxLength={11}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setFormData({ ...formData, phone_number: value });
                      }
                    }}
                    disabled={isEditMode}
                  />

                  {isEditMode && (
                    <>
                      <label className="form-label">Customer Name</label>
                      <input
                        className="form-control mb-3"
                        placeholder="Enter Customer Name"
                        value={formData.customer_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customer_name: e.target.value,
                          })
                        }
                        disabled={isEditMode}
                      />
                      <label className="form-label">Email</label>
                      <input
                        className="form-control mb-3"
                        placeholder="Enter Email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
                        }
                        disabled={isEditMode}
                      />
                      <label className="form-label">Address</label>
                      <input
                        className="form-control mb-3"
                        placeholder="Enter Address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: e.target.value,
                          })
                        }
                        disabled={isEditMode}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="form-step-wrapper text-center">
                <h5 className="mb-3">Select Date</h5>

                <div className="d-flex justify-content-center mb-3">
                  <DatePicker
                    selected={bookingDate}
                    onChange={(date) => {
                      setBookingDate(date);
                      setSelectedTime(null);
                    }}
                    minDate={new Date()}
                    maxDate={
                      new Date(new Date().setMonth(new Date().getMonth() + 2))
                    }
                    excludeDates={holidayDates}
                    inline
                    calendarClassName="custom-datepicker"
                    filterDate={(date) => {
                      const formatted = date.toISOString().split("T")[0];

                      const allSlots = Array.from({ length: 12 }, (_, i) =>
                        `${10 + i}:00`.padStart(5, "0")
                      );
                      const bookedForDate = bookedSlots
                        .filter((slot) => slot.event_date === formatted)
                        .map((slot) => slot.time_slot);

                      const freeSlots = allSlots.filter(
                        (slot) => !bookedForDate.includes(slot)
                      );
                      return freeSlots.length > 0;
                    }}
                  />
                </div>

                {bookingDate && (
                  <>
                    <h5>Available Time Slots</h5>
                    <div className="d-flex flex-wrap justify-content-center">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const hour = 10 + i;
                        const time = `${hour.toString().padStart(2, "0")}:00`;
                        const selectedDate =
                          bookingDate.toLocaleDateString("en-CA");

                        const isBooked = bookedSlots.some(
                          (slot) =>
                            slot.event_date === selectedDate &&
                            slot.time_slot?.trim().substring(0, 5) === time
                        );

                        const now = new Date();
                        const isToday =
                          bookingDate.toDateString() === now.toDateString();
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
            )}

            {step === 3 && (
              <div className="form-step-wrapper text-center">
                <h5 className="mb-4">Select Celebration Type</h5>
                <div className="input-group-wrapper ">
                  {celebrationOptions.map((option, index) => (
                    <div className="form-check text-start mb-4 " key={index}>
                      <input
                        className="form-check-input "
                        type="radio"
                        name="celebration_id"
                        id={`option-${option.celebration_id}`}
                        value={option.celebration_id}
                        checked={
                          formData.celebration_id ===
                          String(option.celebration_id)
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            celebration_id: e.target.value,
                          })
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`option-${option.id}`}
                      >
                        {option.celebration_name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="form-step-wrapper text-center">
                <h5 className="mb-4">Choose a Package</h5>
                <div className="input-group-wrapper text-start">
                  {packageOptions.map((pkg) => (
                    <div className="form-check mb-4" key={pkg.package_id}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="package"
                        id={`package-${pkg.package_id}`}
                        value={pkg.package_id}
                        checked={formData.package_id === String(pkg.package_id)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            package_id: e.target.value,
                          })
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`package-${pkg.package_id}`}
                      >
                        <strong>{pkg.package_name}</strong>{" "}
                        <span style={{ fontSize: "0.8rem", color: "#555" }}>
                          ({pkg.description} – ₹{pkg.price})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {step === 5 && (
              <div className="form-step-wrapper text-center">
                <h5 className="mb-3">Add-ons (Optional)</h5>
                <div className="input-group-wrapper">
                  <textarea
                    className="form-control"
                    rows={5}
                    placeholder="Write any special instructions or additional requirements here..."
                    value={formData.addons_note}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        addons_note: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="d-flex flex-column align-items-center mt-3">
                  <h5 className="mb-3">Booking Status</h5>
                  <select
                    className="form-select w-auto mb-4"
                    style={{ minWidth: "200px" }}
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="review-box mb-3">
                  <h5 className="review-title">Selected Package</h5>
                  {packageOptions.map(
                    (pkg) =>
                      String(pkg.package_id) === formData.package_id && (
                        <div key={pkg.package_id}>
                          <p>
                            <strong>🎁 {pkg.package_name}</strong>
                          </p>
                          <p>
                            💵 <strong>Price:</strong> ₹{pkg.price}
                          </p>
                        </div>
                      )
                  )}
                </div>
                <div className="review-box mb-3">
                  <h5 className="review-title mb-3">Additional Requirements</h5>
                  <button
                    className="btn btn-sm btn-outline-primary mb-3"
                    onClick={() =>
                      setAdditionalItems([
                        ...additionalItems,
                        { description: "", price: "" },
                      ])
                    }
                  >
                    ＋ Add Item
                  </button>

                  {additionalItems.length === 0 && (
                    <p className="text-muted mb-3">
                      No additional items added.
                    </p>
                  )}
                  <div className="d-flex flex-column align-items-center">
                    {additionalItems.map((item, index) => (
                      <div
                        key={index}
                        className="d-flex flex-wrap justify-content-center align-items-center gap-2 mb-3 w-100"
                        style={{ maxWidth: "600px" }}
                      >
                        <input
                          className="form-control"
                          style={{ maxWidth: "300px", flex: "1 1 auto" }}
                          placeholder="Enter item name"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...additionalItems];
                            updated[index].description = e.target.value;
                            setAdditionalItems(updated);
                          }}
                        />
                        <input
                          className="form-control"
                          style={{ width: "120px", flex: "0 0 auto" }}
                          type="number"
                          min="0"
                          placeholder="₹"
                          value={item.price}
                          onChange={(e) => {
                            const updated = [...additionalItems];
                            updated[index].price = e.target.value;
                            setAdditionalItems(updated);
                          }}
                        />
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            const updated = additionalItems.filter(
                              (_, i) => i !== index
                            );
                            setAdditionalItems(updated);
                          }}
                        >
                          🗑 Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 6 && (
              <div className="form-step-wrapper text-start px-3">
                <h5 className="mb-3 text-center">Payment Details</h5>
                <div className="review-box mb-3">
                  <label className="form-label">Payment Mode</label>
                  <select
                    className="form-select mb-3"
                    value={formData.payment_mode}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_mode: e.target.value })
                    }
                  >
                    <option value="">Select mode</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="review-box mb-3">
                  <label className="form-label">Amount Paid (₹)</label>
                  <input
                    type="number"
                    className="form-control mb-3"
                    min="0"
                    value={formData.payment_paid}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_paid: e.target.value })
                    }
                  />
                </div>

                <div className="review-box mb-3">
                  <label className="form-label">
                    Transaction Note (optional)
                  </label>
                  <textarea
                    className="form-control mb-3"
                    placeholder="e.g. UPI Ref No, Card Last 4 digits..."
                    value={formData.payment_notes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_notes: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mt-4">
                  <h5>Balance Summary</h5>
                  <p>
                    <strong>Total Amount:</strong> ₹
                    {(() => {
                      const packagePrice =
                        packageOptions.find(
                          (pkg) =>
                            String(pkg.package_id) === formData.package_id
                        )?.price || 0;
                      const addOnPrice = additionalItems.reduce(
                        (sum, item) => sum + Number(item.price || 0),
                        0
                      );
                      return packagePrice + addOnPrice;
                    })()}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> ₹{formData.payment_paid || 0}
                  </p>
                  <p>
                    <strong>Balance:</strong> ₹
                    {(() => {
                      const packagePrice =
                        packageOptions.find(
                          (pkg) =>
                            String(pkg.package_id) === formData.package_id
                        )?.price || 0;
                      const addOnPrice = additionalItems.reduce(
                        (sum, item) => sum + Number(item.price || 0),
                        0
                      );
                      const total = packagePrice + addOnPrice;
                      return Math.max(
                        0,
                        total - Number(formData.payment_paid || 0)
                      );
                    })()}
                  </p>
                </div>
              </div>
            )}
            {step === 7 && (
              <div className="form-step-wrapper text-start px-3">
                <h5 className="mb-3 text-center">Review Your Booking</h5>

                <div className="review-box mb-3">
                  <h5 className="review-title">Customer Details</h5>
                  <p>
                    <strong>Name:</strong> {formData.customer_name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {formData.phone_number}
                  </p>
                  {formData.email && (
                    <p>
                      <strong>Email:</strong> {formData.email}
                    </p>
                  )}
                  {formData.address && (
                    <p>
                      <strong>Address:</strong> {formData.address}
                    </p>
                  )}
                </div>

                <div className="review-box mb-3">
                  <h5 className="review-title">Date & Time</h5>
                  <p>
                    <strong>Date:</strong> {formData.event_date}
                  </p>
                  <p>
                    <strong>Time Slot:</strong> {formData.time_slot}
                  </p>
                </div>

                <div className="review-box mb-3">
                  <h5 className="review-title">Celebration Type</h5>
                  {celebrationOptions.map(
                    (celebration) =>
                      String(celebration.celebration_id) ===
                        formData.celebration_id && (
                        <p key={celebration.celebration_id}>
                          {celebration.celebration_name}
                        </p>
                      )
                  )}
                </div>

                <div className="review-box mb-3">
                  <h5 className="review-title">Package</h5>
                  {packageOptions.map(
                    (pkg) =>
                      String(pkg.package_id) === formData.package_id && (
                        <p key={pkg.package_id}>
                          <strong>{pkg.package_name}</strong>
                          <br />
                          <span style={{ fontSize: "0.9rem" }}>
                            {pkg.description}
                          </span>
                          <br />
                          <span style={{ fontSize: "0.85rem" }}>
                            Price: ₹{pkg.price}
                          </span>
                        </p>
                      )
                  )}
                </div>

                {(formData.addons_note ||
                  (additionalItems && additionalItems.length > 0)) && (
                  <div className="review-box mb-3">
                    <h5 className="review-title">Add-ons / Notes</h5>
                    {formData.addons_note && <p>{formData.addons_note}</p>}

                    {additionalItems && additionalItems.length > 0 && (
                      <>
                        <p>
                          <strong>Additional Requirements:</strong>
                        </p>
                        <ul className="mb-3">
                          {additionalItems.map((item, index) => (
                            <li key={index}>
                              {item.description} – ₹{item.price}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}

                <div className="review-box mb-3">
                  <h5 className="review-title">Booking Status</h5>
                  <p>{formData.status}</p>
                </div>

                <div className="review-box mb-3">
                  <h5 className="review-title">Payment Details</h5>
                  <p>
                    <strong>Payment Mode:</strong>{" "}
                    {formData.payment_mode
                      ? formData.payment_mode.replace("_", " ").toUpperCase()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Total Amount:</strong> ₹
                    {formData.payment_total || "0"}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> ₹
                    {formData.payment_paid || "0"}
                  </p>
                  <p>
                    <strong>Balance:</strong> ₹
                    {Math.max(
                      0,
                      (Number(formData.payment_total) || 0) -
                        (Number(formData.payment_paid) || 0)
                    )}
                  </p>
                  {formData.payment_notes && (
                    <p>
                      <strong>Notes:</strong> {formData.payment_notes}
                    </p>
                  )}
                </div>

                <div className="review-box mb-3">
                  <h5 className="review-title">Audit Trail</h5>
                  <p>
                    <strong>Created By:</strong> {formData.created_by}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {formData.created_at
                      ? new Date(formData.created_at).toLocaleString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Updated By:</strong> {formData.updated_by || "N/A"}
                  </p>
                  <p>
                    <strong>Updated At:</strong>{" "}
                    {formData.updated_at
                      ? new Date(formData.updated_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            )}
            <div className="modal-footer">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  if (step === 1) {
                    setShowModal(false);
                    setFormData(emptyForm);
                    setAdditionalItems([]);
                    setStep(1);
                    setBookingDate(null);
                    setSelectedTime(null);
                    setIsEditMode(false);
                  } else {
                    setStep(step - 1);
                  }
                }}
              >
                {step === 1 ? "Cancel" : "Previous"}
              </button>

              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                  if (step === 2) {
                    if (!bookingDate || !selectedTime) {
                      alert("Please select a date and time.");
                      return;
                    }

                    setFormData({
                      ...formData,
                      event_date: bookingDate.toLocaleDateString("en-CA"),
                      time_slot: selectedTime,
                    });
                  }
                  if (step === 3) {
                    if (!formData.celebration_id) {
                      alert("Please select a celebration type.");
                      return;
                    }
                  }
                  if (step === 4) {
                    if (!formData.package_id) {
                      alert("Please select a package.");
                      return;
                    }
                  }
                  if (step === 5) {
                    setFormData({
                      ...formData,
                      additional_items: additionalItems, // preserve structured data
                    });
                  }

                  if (step === 6) {
                    const packagePrice =
                      packageOptions.find(
                        (pkg) => String(pkg.package_id) === formData.package_id
                      )?.price || 0;

                    const addOnPrice = additionalItems.reduce(
                      (sum, item) => sum + Number(item.price || 0),
                      0
                    );
                    const total = packagePrice + addOnPrice;

                    if (!formData.payment_mode) {
                      alert("Please select a payment mode.");
                      return;
                    }
                    if (
                      !formData.payment_paid ||
                      Number(formData.payment_paid) < 0
                    ) {
                      alert("Amount paid must be a valid number.");
                      return;
                    }
                    if (Number(formData.payment_paid) > total) {
                      alert("Amount paid cannot exceed total amount.");
                      return;
                    }

                    setFormData({
                      ...formData,
                      payment_mode: formData.payment_mode,
                      payment_paid: formData.payment_paid,
                      payment_notes: formData.payment_notes,
                      payment_total: total,
                    });
                  }
                  if (step === 7) {
                    handleConfirmBooking(formData);
                    return;
                  }

                  setStep(step + 1);
                }}
              >
                {step === 7 ? "Submit" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
