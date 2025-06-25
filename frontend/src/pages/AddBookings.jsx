import React, { useState, useEffect } from "react";
import { getCustomerByPhone } from "../services/CustomerService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NotificationPopup from "../components/NotificationPopup";
import "../css/Addbooking.css";
import {
  fetchCelebrationType,
  fetchPackage,
  fetchBookingsByFilter,
  submitBooking,
} from "../services/bookingServices";
function AddBookings() {
  const user = localStorage.getItem("current_user");
  const [step, setStep] = useState(1);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [customerChecked, setCustomerChecked] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const [bookingDate, setBookingDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [celebrationOptions, setcelebrationOptions] = useState([]);
  const [packageOptions, setpackageOptions] = useState([]);
  const [popup, setPopup] = useState({ visible: false });
  const [additionalItems, setAdditionalItems] = useState([]);
  const [paymentMode, setPaymentMode] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
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
    payment_mode: "",
    payment_total: "",
    payment_paid: "",
    payment_notes: "",
    additional_items: [],
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
    payment_mode: "",
    payment_total: "",
    payment_paid: "",
    payment_notes: "",
    additional_items: [],
  };

  const checkCustomerByPhone = async () => {
    try {
      const data = await getCustomerByPhone(formData.phone_number);
      console.log("data ", data);
      setIsExistingCustomer(true);
      setFormData({
        ...formData,
        customer_name: data.name,
        email: data.email,
        address: data.address,
      });
      setCheckMessage("Customer details found");
    } catch (error) {
      console.log("error ", error);
      setIsExistingCustomer(false);
      setFormData({ ...formData, customer_name: "", email: "", address: "" });
      setCheckMessage("Customer details not found");
    } finally {
      setCustomerChecked(true);
      setTimeout(() => setCheckMessage(""), 3000);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookings = await fetchBookingsByFilter("todayandfuture");
        const celebrationData = await fetchCelebrationType();
        console.log("celebration type ", celebrationData);
        const packageData = await fetchPackage();
        setcelebrationOptions(celebrationData);
        setpackageOptions(packageData);
        setBookedSlots(bookings);
      } catch (err) {
        console.error("Error fetching celebration and package data", err);
      }
    };

    fetchData();
  }, []);

  const submitBookingDetails = async () => {
    try {
      const username = JSON.parse(user).username;
      const updatedForm = {
        ...formData,
        updated_by: username,
      };
      updatedForm.created_by = username;
      console.log("updated form:", updatedForm);
      await submitBooking(updatedForm);
      alert("Booking created successfully!");

      setFormData(emptyForm);
      setStep(1);
      setBookingDate(null);
      setSelectedTime(null);
      setCustomerChecked(false);
      setAdditionalItems([]);
      setPopup({ visible: false, booking: null });
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error("Submit failed:", error);
    }
  };

  const cancelDelete = () => {
    setPopup({ visible: false, booking: null });
  };

  const handleConfirmBooking = (booking) => {
    setPopup({ visible: true, booking });
  };
  return (
    <div className="container">
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
      <div>
        {popup.visible && (
          <NotificationPopup
            message={`Are you sure you want to save the booking for ${popup.booking.customer_name}?`}
            onConfirm={submitBookingDetails}
            onCancel={cancelDelete}
          />
        )}
      </div>
      <div className="modal-box">
        <div
          className="modal-close-icon"
          onClick={() => {
            setFormData(emptyForm);
            setAdditionalItems([]);
            setStep(1);
            setBookingDate(null);
            setSelectedTime(null);
            setCustomerChecked(false);
          }}
        >
          ×
        </div>
        {step === 1 && (
          <div className="form-step-wrapper text-center">
            <h5>Add Customer</h5>
            <div className="input-group-wrapper text-start">
              <label className="form-label">Phone Number</label>
              <input
                className="form-control"
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
              />

              <button
                className="pop-up-button"
                onClick={checkCustomerByPhone}
                disabled={
                  !formData.phone_number || formData.phone_number.length < 7
                }
              >
                Check
              </button>
              {checkMessage && (
                <div className="form-label-text" style={{ fontSize: "1.0rem" }}>
                  {checkMessage}
                </div>
              )}

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
                    disabled={isExistingCustomer}
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
            <h5>Select Date</h5>

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
                      formData.celebration_id === String(option.celebration_id)
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
                <p className="text-muted mb-3">No additional items added.</p>
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
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
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
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>

            <div className="review-box mb-3">
              <label className="form-label">Transaction Note (optional)</label>
              <textarea
                className="form-control mb-3"
                placeholder="e.g. UPI Ref No, Card Last 4 digits..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <h5>Balance Summary</h5>
              <p>
                <strong>Total Amount:</strong> ₹
                {(() => {
                  const packagePrice =
                    packageOptions.find(
                      (pkg) => String(pkg.package_id) === formData.package_id
                    )?.price || 0;
                  const addOnPrice = additionalItems.reduce(
                    (sum, item) => sum + Number(item.price || 0),
                    0
                  );
                  return packagePrice + addOnPrice;
                })()}
              </p>
              <p>
                <strong>Amount Paid:</strong> ₹{amountPaid || 0}
              </p>
              <p>
                <strong>Balance:</strong> ₹
                {(() => {
                  const packagePrice =
                    packageOptions.find(
                      (pkg) => String(pkg.package_id) === formData.package_id
                    )?.price || 0;
                  const addOnPrice = additionalItems.reduce(
                    (sum, item) => sum + Number(item.price || 0),
                    0
                  );
                  const total = packagePrice + addOnPrice;
                  return Math.max(0, total - Number(amountPaid || 0));
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
                <strong>Total Amount:</strong> ₹{formData.payment_total || "0"}
              </p>
              <p>
                <strong>Amount Paid:</strong> ₹{formData.payment_paid || "0"}
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
                setFormData(emptyForm);
                setStep(1);
                setCustomerChecked(false);
                setAdditionalItems([]);
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
              if (step === 5) {
                setFormData({
                  ...formData,
                  additional_items: additionalItems,
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

                if (!paymentMode) {
                  alert("Please select a payment mode.");
                  return;
                }
                if (!amountPaid || Number(amountPaid) < 0) {
                  alert("Amount paid must be a valid number.");
                  return;
                }
                if (Number(amountPaid) > total) {
                  alert("Amount paid cannot exceed total amount.");
                  return;
                }

                setFormData({
                  ...formData,
                  payment_mode: paymentMode,
                  payment_paid: amountPaid,
                  payment_notes: paymentNotes,
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
  );
}

export default AddBookings;
