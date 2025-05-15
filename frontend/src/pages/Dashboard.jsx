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
    { key: "package_name", label: "Package" },
    { key: "status", label: "Status" },
    { key: "updated_by", label: "Updated By" },
  ];

  const ActionEdit = ({ row }) => (
    <Edit
      className="action-icon text-primary"
      size={18}
      onClick={() => console.log("Edit", row)}
    />
  );

  const ActionDelete = ({ row }) => (
    <Trash2
      className="action-icon text-danger"
      size={18}
      onClick={() => console.log("Delete", row)}
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
      formData.created_by = JSON.parse(user).username;
      formData.status = "pending";
      await submitBooking(formData, token);
      alert("Booking successful!");
      setShowModal(false);
      setFormData(emptyForm);
      setStep(1);
      fetchTodaysBookings();
      fetchUpcomingBookings();
    } catch (error) {
      alert("Booking failed. Please try again.");
      console.error("Booking failed in service:", error);
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
        actions={[ActionEdit, ActionDelete]}
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
                Add Booking
              </h5>
              <button
                className="btn-close-modal"
                onClick={() => {
                  setShowModal(false);
                  setFormData(emptyForm);
                  setStep(1);
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
                  <div className="input-group-wrapper">
                    <input
                      className="form-control mb-3"
                      placeholder="Customer Name"
                      value={formData.customer_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer_name: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      className="form-control mb-3"
                      placeholder="Phone"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                      required
                    />

                    <input
                      className="form-control mb-3"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />

                    <input
                      className="form-control mb-3"
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
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

                          return (
                            <button
                              key={time}
                              className={`btn btn-sm m-1 ${
                                selectedTime === time
                                  ? "btn-pink"
                                  : "btn-outline-secondary"
                              }`}
                              disabled={isBooked}
                              style={{
                                opacity: isBooked ? 0.5 : 1,
                                cursor: isBooked ? "not-allowed" : "pointer",
                              }}
                              onClick={() => {
                                if (!isBooked) setSelectedTime(time);
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
                    if (
                      formData.customer_name.trim() === "" ||
                      formData.phone_number.trim() === ""
                    ) {
                      alert("Customer name and phone number are required.");
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
