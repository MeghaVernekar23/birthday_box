import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/Dashboard.css";
const BookingFormModal = ({
  show,
  onClose,
  onSubmit,
  initialData,
  celebrationOptions,
  packageOptions,
  bookedSlots,
  fetchModalData,
  isEditMode,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData);

  const [bookingDate, setBookingDate] = useState(
    initialData.event_date ? new Date(initialData.event_date) : null
  );
  const [selectedTime, setSelectedTime] = useState(initialData.time_slot || "");

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
  useEffect(() => {
    if (show) {
      fetchModalData?.();
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [show]);

  const handlePrevious = () => {
    if (step === 1) {
      setFormData(emptyForm);
      setStep(1);
    } else {
      setStep((prev) => prev - 1);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="custom-modal-overlay" onClick={onClose}></div>
      <div className="custom-modal">
        <div className="modal-header">
          <h5
            className="modal-title"
            style={{ marginLeft: "10px", margin: "0 auto" }}
          >
            Edit Booking
          </h5>
          <button className="btn-close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="stepper">
          {[1, 2, 3, 4, 5, 6].map((num) => (
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
                  "Review",
                ][num - 1]
              }
              {num < 6 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="modal-body">
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
                    <strong>Updated By:</strong> {formData.updated_by || "N/A"}
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
          <button className="btn btn-pink" onClick={handlePrevious}>
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
                if (formData.email.trim() && !emailRegex.test(formData.email)) {
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
                onSubmit({
                  ...formData,
                  event_date: bookingDate.toLocaleDateString("en-CA"),
                  time_slot: selectedTime,
                });
              }

              setStep(step + 1);
            }}
          >
            {step === 6 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
};

export default BookingFormModal;
