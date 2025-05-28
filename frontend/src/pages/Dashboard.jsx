import { useState, React, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";
import BirthdayLogo from "../images/logo.jpg";
import { Edit, Trash2, Search } from "lucide-react";
import DataTable from "../components/Datatable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  fetchBookingsByFilter,
  fetchCelebrationType,
  fetchPackage,
  submitBooking,
  getCustomerByPhone,
  deleteBooking,
  fetchBookingById,
  updateBooking,
} from "../services/bookingServices";

function Dashboard() {
  console.log("entered dashboard");
  const navigate = useNavigate();
  const user = localStorage.getItem("current_user");
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);

  const [bookingDate, setBookingDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [todayBookingData, setTodaysBookings] = useState([]);
  const [upcomingBookingData, setUpcomingBookings] = useState([]);
  const [olderBookingData, setOlderBookings] = useState([]);

  const [celebrationOptions, setcelebrationOptions] = useState([]);

  const [packageOptions, setpackageOptions] = useState([]);

  const [bookedSlots, setBookedSlots] = useState([]);

  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [customerChecked, setCustomerChecked] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);

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

  const ActionEdit = ({ row }) => (
    <Edit
      className="action-icon text-primary"
      size={18}
      onClick={() => handleEditBooking(row)}
    />
  );

  const ActionDelete = ({ row }) => (
    <Trash2
      className="action-icon text-danger"
      size={18}
      onClick={() => handleDeleteBooking(row)}
    />
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    fetchTodaysBookings();
    fetchUpcomingBookings();
    fetchOlderBookings();
  }, []);

  const fetchTodaysBookings = async () => {
    const data = await fetchBookingsByFilter("today", token);
    setTodaysBookings(data);
  };

  const fetchUpcomingBookings = async () => {
    const data = await fetchBookingsByFilter("future", token);
    setUpcomingBookings(data);
  };

  const fetchOlderBookings = async () => {
    const data = await fetchBookingsByFilter("past", token);
    setOlderBookings(data);
  };

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");

      const fetchModalData = async () => {
        try {
          const [bookings, celebrations, packages] = await Promise.all([
            fetchBookingsByFilter("all", token),
            fetchCelebrationType(token),
            fetchPackage(token),
          ]);
          setBookedSlots(bookings);
          setcelebrationOptions(celebrations);
          setpackageOptions(packages);
        } catch (err) {
          console.error("Error fetching modal data", err);
        }
      };
      fetchModalData();
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  const submitBookingDetails = async () => {
    try {
      const username = JSON.parse(user).username;
      const updatedForm = {
        ...formData,
        updated_by: username,
        booking_id: editingBookingId,
      };

      if (isEditMode) {
        await updateBooking(editingBookingId, updatedForm, token);
        alert("Booking updated successfully!");
      } else {
        updatedForm.created_by = username;
        updatedForm.status = "pending";
        await submitBooking(updatedForm, token);
        alert("Booking created successfully!");
      }

      setShowModal(false);
      setFormData(emptyForm);
      setStep(1);
      setCustomerChecked(false);
      setIsEditMode(false);
      setEditingBookingId(null);

      fetchTodaysBookings();
      fetchUpcomingBookings();
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error("Submit failed:", error);
    }
  };

  const checkCustomerByPhone = async () => {
    try {
      const data = await getCustomerByPhone(formData.phone_number, token);
      console.log("customer details found", data);
      setIsExistingCustomer(true);
      setFormData({
        ...formData,
        customer_name: data[0].name,
        email: data[0].email,
        address: data[0].address,
      });
      console.log("formData", formData);
    } catch (error) {
      console.log("customer details not found");
      setIsExistingCustomer(false);
      setFormData({ ...formData, customer_name: "", email: "", address: "" });
    } finally {
      setCustomerChecked(true);
    }
  };

  const handleEditBooking = async (booking) => {
    try {
      console.log("fetching booking...", booking);
      const fullBooking = await fetchBookingById(booking.booking_id, token);
      console.log("full booking...", fullBooking);
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
      });

      if (fullBooking.event_date) {
        setBookingDate(new Date(fullBooking.event_date));
      } else {
        console.warn("Invalid event_date", fullBooking.event_date);
      }
      setSelectedTime(fullBooking.time_slot);
      setIsEditMode(true);
      setEditingBookingId(fullBooking.booking_id);
      setCustomerChecked(true);
      setStep(1);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching booking for edit:", error);
      alert("Failed to load booking details for editing.");
    }
  };

  const handleDeleteBooking = async (booking) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the booking for ${booking.customer_name}?`
    );
    if (!confirmDelete) return;

    try {
      await deleteBooking(booking.booking_id, token);
      alert("Booking deleted successfully!");

      fetchTodaysBookings();
      fetchUpcomingBookings();
      fetchOlderBookings();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete the booking. Please try again.");
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <nav className="navbar navbar-expand-md custom-navbar">
        <div className="container-fluid">
          <a className="navbar-brand" href="#"></a>
          <img
            src={BirthdayLogo}
            alt="Logo"
            style={{
              height: "60px",
              objectFit: "contain",
              marginLeft: "-10px",
            }}
          />
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" onClick={handleLogout}>
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="mb-3"></div>

      <div className="d-flex justify-content-end align-items-center px-4 my-3">
        <button className="btn btn-pink" onClick={() => setShowModal(true)}>
          Add Booking
        </button>
      </div>
      <div className="mb-3"></div>
      <DataTable
        title="Today's Bookings"
        columns={columns}
        data={todayBookingData}
        actions={[ActionEdit, ActionDelete]}
        collapseId="todayTable"
      />

      <div className="mb-5"></div>

      <DataTable
        title="Upcoming Bookings"
        columns={columns}
        data={upcomingBookingData}
        actions={[ActionEdit, ActionDelete]}
        collapseId="upcomingTable"
      />

      <div className="mb-5"></div>
      <DataTable
        title="Older Bookings"
        columns={columns}
        data={olderBookingData}
        collapseId="olderTable"
      />
      {showModal && (
        <>
          <div
            className="custom-modal-overlay"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="custom-modal">
            <div className="modal-header">
              <h5
                className="modal-title"
                style={{ marginLeft: "10px", margin: "0 auto" }}
              >
                {isEditMode ? "Edit Booking" : "Add Booking"}
              </h5>
              <button
                className="btn-close-modal"
                onClick={() => {
                  setShowModal(false);
                  setFormData(emptyForm);
                  setStep(1);
                  setCustomerChecked(false);
                }}
              >
                &times;
              </button>
            </div>
            <div className="stepper">
              <div className={`step ${step === 1 ? "active" : ""}`}>
                <div className="step-number">1</div>
                Customer Details
              </div>
              <div className={`step ${step === 2 ? "active" : ""}`}>
                <div className="step-number">2</div>
                Date & Time
              </div>
              <div className={`step ${step === 3 ? "active" : ""}`}>
                <div className="step-number">3</div>
                Celebration Type
              </div>
              <div className={`step ${step === 4 ? "active" : ""}`}>
                <div className="step-number">4</div>
                Package
              </div>
              <div className={`step ${step === 5 ? "active" : ""}`}>
                <div className="step-number">5</div>
                Add-ons
              </div>
              <div className={`step ${step === 6 ? "active" : ""}`}>
                <div className="step-number">6</div>
                Review
              </div>
            </div>

            <div className="modal-body ">
              {step === 1 && (
                <div className="form-step-wrapper text-center">
                  <h6 className="mb-3">Customer Details</h6>
                  <div className="input-group-wrapper text-start">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-control mb-3"
                      placeholder="Enter Phone Number"
                      value={formData.phone_number}
                      maxLength={11}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only digits
                        if (/^\d*$/.test(value)) {
                          setFormData({ ...formData, phone_number: value });
                        }
                      }}
                      disabled={isEditMode}
                    />

                    <button
                      className="btn btn-pink mb-3"
                      onClick={checkCustomerByPhone}
                      disabled={
                        !formData.phone_number ||
                        formData.phone_number.length < 7
                      }
                    >
                      Check
                    </button>

                    {customerChecked && (
                      <>
                        <div className="mb-1"></div>
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
                          disabled={isExistingCustomer || isEditMode}
                        />
                        <label className="form-label">Email</label>
                        <input
                          className="form-control mb-3"
                          placeholder="Enter Email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={isExistingCustomer}
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
                          disabled={isExistingCustomer}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="form-step-wrapper text-center">
                  <h6 className="mb-3">Select Date</h6>

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
                      inline
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

                  {/* Time Slots */}
                  {bookingDate && (
                    <>
                      <h6>Available Time Slots</h6>
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
                                  ? "btn-pink"
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
                  <h6 className="mb-3">Select Celebration Type</h6>
                  <div className="input-group-wrapper">
                    {celebrationOptions.map((option, index) => (
                      <div className="form-check text-start mb-2 " key={index}>
                        <input
                          className="form-check-input"
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
                  <h6 className="mb-3">Choose a Package</h6>
                  <div className="input-group-wrapper text-start">
                    {packageOptions.map((pkg) => (
                      <div className="form-check mb-3" key={pkg.package_id}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="package"
                          id={`package-${pkg.package_id}`}
                          value={pkg.package_id}
                          checked={
                            formData.package_id === String(pkg.package_id)
                          }
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
                  <h6 className="mb-3">Add-ons (Optional)</h6>
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
                  <div className="mb-5"></div>
                  {isEditMode && (
                    <div className="d-flex flex-column align-items-center mt-3">
                      <h6 className="mb-3">Booking Status</h6>
                      <select
                        className="form-select w-auto"
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
                  )}
                </div>
              )}
              {step === 6 && (
                <div className="form-step-wrapper text-start px-3">
                  <h6 className="mb-3 text-center">Review Your Booking</h6>

                  {/* Section Box */}
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

                  {formData.addons_note && (
                    <div className="review-box mb-3">
                      <h5 className="review-title">Add-ons / Notes</h5>
                      <p>{formData.addons_note}</p>
                    </div>
                  )}
                  {isEditMode && (
                    <div className="review-box mb-3">
                      <h5 className="review-title">Booking Status</h5>
                      <p>{formData.status}</p>
                    </div>
                  )}
                  {isEditMode && (
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
                        <strong>Updated By:</strong>{" "}
                        {formData.updated_by || "N/A"}
                      </p>
                      <p>
                        <strong>Updated At:</strong>{" "}
                        {formData.updated_at
                          ? new Date(formData.updated_at).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-pink"
                onClick={() => {
                  if (step === 1) {
                    setShowModal(false);
                    setFormData(emptyForm);
                    setStep(1);
                    setCustomerChecked(false);
                  } else {
                    setStep(step - 1);
                  }
                }}
              >
                {step === 1 ? "Cancel" : "Previous"}
              </button>
              <button
                className="btn btn-pink"
                onClick={() => {
                  if (step === 1) {
                    const nameRegex = /^[A-Za-z\s]+$/;
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (formData.customer_name.trim() === "") {
                      alert("Customer details are required.");
                      return;
                    }
                    if (!nameRegex.test(formData.customer_name.trim())) {
                      alert(
                        "Customer name should contain only alphabets and spaces."
                      );
                      return;
                    }
                    if (
                      formData.email.trim() &&
                      !emailRegex.test(formData.email)
                    ) {
                      alert("Please enter a valid email address.");
                      return;
                    }
                  }
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
                  if (step === 6) {
                    console.log("Submitting formData:", formData);
                    submitBookingDetails();
                    setShowModal(false);
                    setStep(1);
                    setCustomerChecked(false);
                    return;
                  }

                  setStep(step + 1);
                }}
              >
                {step === 6 ? "Submit" : "Next"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
