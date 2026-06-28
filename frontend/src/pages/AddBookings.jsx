import React, { useState, useEffect } from "react";
import { getCustomerByPhone } from "../services/CustomerService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NotificationPopup from "../components/NotificationPopup";
import "../css/AddBooking.css";
import {
  fetchCelebrationType,
  fetchPackage,
  fetchBookingsByFilter,
  submitBooking,
  fetchUpcomingHoliday,
} from "../services/bookingServices";

const STEPS = [
  { label: "Customer",    title: "Customer Details",      subtitle: "Look up an existing customer or enter details manually" },
  { label: "Date & Time", title: "Select Date & Time",    subtitle: "Choose an available date and time slot for the event" },
  { label: "Celebration", title: "Celebration Type",      subtitle: "What are we celebrating?" },
  { label: "Package",     title: "Choose a Package",      subtitle: "Select the package that fits the occasion" },
  { label: "Add-ons",     title: "Add-ons & Notes",       subtitle: "Any special instructions or extra items?" },
  { label: "Payment",     title: "Payment Details",       subtitle: "Record the payment information for this booking" },
  { label: "Review",      title: "Review Booking",        subtitle: "Verify all details before submitting" },
];

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
  const [holidayDates, setHolidayDates] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: "", phone_number: "", email: "", address: "",
    event_date: "", time_slot: "", celebration_id: "", package_id: "",
    addons_note: "", updated_by: "", created_by: "", status: "pending",
    created_at: "", updated_at: "", payment_mode: "", payment_total: "",
    payment_paid: "", payment_notes: "", additional_items: [],
  });

  const emptyForm = {
    customer_name: "", phone_number: "", email: "", address: "",
    event_date: "", time_slot: "", celebration_id: "", package_id: "",
    addons_note: "", updated_by: "", created_by: "", status: "pending",
    payment_mode: "", payment_total: "", payment_paid: "", payment_notes: "",
    additional_items: [],
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setAdditionalItems([]);
    setStep(1);
    setBookingDate(null);
    setSelectedTime(null);
    setCustomerChecked(false);
    setIsExistingCustomer(false);
    setPaymentMode("");
    setAmountPaid("");
    setPaymentNotes("");
    setCheckMessage("");
  };

  const checkCustomerByPhone = async () => {
    try {
      const data = await getCustomerByPhone(formData.phone_number);
      setIsExistingCustomer(true);
      setFormData({ ...formData, customer_name: data.name, email: data.email, address: data.address });
      setCheckMessage("found");
    } catch {
      setIsExistingCustomer(false);
      setFormData({ ...formData, customer_name: "", email: "", address: "" });
      setCheckMessage("not-found");
    } finally {
      setCustomerChecked(true);
      setTimeout(() => setCheckMessage(""), 3000);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookings, celebrationData, packageData, holidays] = await Promise.all([
          fetchBookingsByFilter("todayandfuture"),
          fetchCelebrationType(),
          fetchPackage(),
          fetchUpcomingHoliday(),
        ]);
        setcelebrationOptions(celebrationData);
        setpackageOptions(packageData);
        setBookedSlots(bookings);
        setHolidayDates(holidays.map((h) => new Date(h.date)));
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, []);

  const calcTotals = () => {
    const packagePrice = packageOptions.find(
      (pkg) => String(pkg.package_id) === formData.package_id
    )?.price || 0;
    const addOnPrice = additionalItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const total = packagePrice + addOnPrice;
    const paid = Number(amountPaid || formData.payment_paid || 0);
    return { total, paid, balance: Math.max(0, total - paid) };
  };

  const submitBookingDetails = async () => {
    try {
      const username = JSON.parse(user).username;
      await submitBooking({ ...formData, updated_by: username, created_by: username });
      alert("Booking created successfully!");
      resetForm();
      setPopup({ visible: false, booking: null });
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error("Submit failed:", error);
    }
  };

  const handleNext = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (step === 1) {
      if (!formData.customer_name.trim()) { alert("Customer name is required."); return; }
      if (!nameRegex.test(formData.customer_name.trim())) { alert("Name should contain only letters and spaces."); return; }
      if (formData.email.trim() && !emailRegex.test(formData.email)) { alert("Please enter a valid email address."); return; }
    }
    if (step === 2) {
      if (!bookingDate || !selectedTime) { alert("Please select a date and time."); return; }
      setFormData({ ...formData, event_date: bookingDate.toLocaleDateString("en-CA"), time_slot: selectedTime });
    }
    if (step === 3 && !formData.celebration_id) { alert("Please select a celebration type."); return; }
    if (step === 4 && !formData.package_id) { alert("Please select a package."); return; }
    if (step === 5) { setFormData({ ...formData, additional_items: additionalItems }); }
    if (step === 6) {
      const { total } = calcTotals();
      if (!paymentMode) { alert("Please select a payment mode."); return; }
      if (!amountPaid || Number(amountPaid) < 0) { alert("Amount paid must be a valid number."); return; }
      if (Number(amountPaid) > total) { alert("Amount paid cannot exceed the total amount."); return; }
      setFormData({ ...formData, payment_mode: paymentMode, payment_paid: amountPaid, payment_notes: paymentNotes, payment_total: total });
    }
    if (step === 7) { setPopup({ visible: true, booking: formData }); return; }
    setStep(step + 1);
  };

  const selectedPackage = packageOptions.find((pkg) => String(pkg.package_id) === formData.package_id);
  const { total, balance } = calcTotals();
  const currentStep = STEPS[step - 1];

  return (
    <div className="add-booking-page">

      {/* ── Stepper ── */}
      <div className="stepper">
        {STEPS.map(({ label }, idx) => {
          const num = idx + 1;
          return (
            <div key={num} className={`step ${step === num ? "active" : ""} ${step > num ? "completed" : ""}`}>
              <div className="step-number">
                {step > num ? (
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : num}
              </div>
              <span className="step-label">{label}</span>
              {num < STEPS.length && <div className="step-line" />}
            </div>
          );
        })}
      </div>

      {/* ── Confirmation Popup ── */}
      {popup.visible && (
        <NotificationPopup
          message={`Are you sure you want to save the booking for ${popup.booking?.customer_name}?`}
          onConfirm={submitBookingDetails}
          onCancel={() => setPopup({ visible: false, booking: null })}
        />
      )}

      {/* ── Main Card ── */}
      <div className="ab-card">

        {/* Card Header */}
        <div className="ab-card-header">
          <div className="ab-card-header-text">
            <h4>{currentStep.title}</h4>
            <p>{currentStep.subtitle}</p>
          </div>
          <button className="ab-close-btn" onClick={resetForm} aria-label="Reset form">×</button>
        </div>

        {/* Card Content (scrollable) */}
        <div className="ab-card-content">

          {/* Step 1 – Customer */}
          {step === 1 && (
            <div className="field-group">
              <div className="form-field">
                <label>Phone Number</label>
                <div className="phone-row">
                  <input
                    type="text"
                    placeholder="e.g. 98765 43210"
                    value={formData.phone_number}
                    maxLength={11}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value))
                        setFormData({ ...formData, phone_number: e.target.value });
                    }}
                  />
                  <button
                    className="check-button"
                    onClick={checkCustomerByPhone}
                    disabled={!formData.phone_number || formData.phone_number.length < 7}
                  >
                    Check
                  </button>
                </div>
                {checkMessage && (
                  <div className={`check-message ${checkMessage}`}>
                    {checkMessage === "found"
                      ? "✓ Customer found — details pre-filled"
                      : "✗ Not found — please enter details below"}
                  </div>
                )}
              </div>

              {customerChecked && (
                <>
                  <div className="form-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter customer name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      disabled={isExistingCustomer}
                    />
                  </div>
                  <div className="form-field">
                    <label>Email (optional)</label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isExistingCustomer}
                    />
                  </div>
                  <div className="form-field">
                    <label>Address (optional)</label>
                    <input
                      type="text"
                      placeholder="Enter address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={isExistingCustomer}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2 – Date & Time */}
          {step === 2 && (
            <div className="date-time-wrapper">
              <DatePicker
                selected={bookingDate}
                onChange={(date) => { setBookingDate(date); setSelectedTime(null); }}
                minDate={new Date()}
                maxDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
                excludeDates={holidayDates}
                inline
                calendarClassName="custom-datepicker"
                filterDate={(date) => {
                  const formatted = date.toISOString().split("T")[0];
                  const allSlots = Array.from({ length: 12 }, (_, i) => `${10 + i}:00`.padStart(5, "0"));
                  const booked = bookedSlots.filter((s) => s.event_date === formatted).map((s) => s.time_slot);
                  return allSlots.filter((s) => !booked.includes(s)).length > 0;
                }}
              />
              {bookingDate && (
                <div className="time-slots-section">
                  <h6>Available Time Slots</h6>
                  <div className="time-slots-grid">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const hour = 10 + i;
                      const time = `${hour.toString().padStart(2, "0")}:00`;
                      const selectedDate = bookingDate.toLocaleDateString("en-CA");
                      const isBooked = bookedSlots.some(
                        (slot) => slot.event_date === selectedDate && slot.time_slot?.trim().substring(0, 5) === time
                      );
                      const now = new Date();
                      const slotTime = new Date(bookingDate);
                      slotTime.setHours(hour, 0, 0, 0);
                      const isDisabled = isBooked || (bookingDate.toDateString() === now.toDateString() && slotTime < now);
                      return (
                        <button
                          key={time}
                          className={`time-slot-btn ${selectedTime === time ? "selected" : ""}`}
                          disabled={isDisabled}
                          onClick={() => { if (!isDisabled) setSelectedTime(time); }}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 – Celebration */}
          {step === 3 && (
            <div className="option-grid">
              {celebrationOptions.map((option) => (
                <label
                  key={option.celebration_id}
                  className={`option-card ${formData.celebration_id === String(option.celebration_id) ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="celebration_id"
                    value={option.celebration_id}
                    checked={formData.celebration_id === String(option.celebration_id)}
                    onChange={(e) => setFormData({ ...formData, celebration_id: e.target.value })}
                  />
                  <div className="option-content">
                    <div className="option-name">{option.celebration_name}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Step 4 – Package */}
          {step === 4 && (
            <div className="option-grid">
              {packageOptions.map((pkg) => (
                <label
                  key={pkg.package_id}
                  className={`option-card ${formData.package_id === String(pkg.package_id) ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="package"
                    value={pkg.package_id}
                    checked={formData.package_id === String(pkg.package_id)}
                    onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                  />
                  <div className="option-content">
                    <div className="option-name">{pkg.package_name}</div>
                    {pkg.description && <div className="option-desc">{pkg.description}</div>}
                    <div className="option-price">₹{pkg.price}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Step 5 – Add-ons */}
          {step === 5 && (
            <div className="addons-wrapper">
              {selectedPackage && (
                <div className="info-card">
                  <div className="info-card-title">Selected Package</div>
                  <p><strong>{selectedPackage.package_name}</strong> — ₹{selectedPackage.price}</p>
                </div>
              )}
              <div className="form-field">
                <label>Special Instructions (optional)</label>
                <textarea
                  placeholder="Write any special instructions or requirements..."
                  value={formData.addons_note}
                  onChange={(e) => setFormData({ ...formData, addons_note: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Booking Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ maxWidth: "220px" }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="section-label">Additional Items</label>
                {additionalItems.length === 0 && (
                  <div className="empty-state">No additional items added yet</div>
                )}
                {additionalItems.map((item, index) => (
                  <div key={index} className="additional-item-row">
                    <input
                      className="ai-name"
                      placeholder="Item name"
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...additionalItems];
                        updated[index].description = e.target.value;
                        setAdditionalItems(updated);
                      }}
                    />
                    <input
                      className="ai-price"
                      type="number"
                      min="0"
                      placeholder="₹ Price"
                      value={item.price}
                      onChange={(e) => {
                        const updated = [...additionalItems];
                        updated[index].price = e.target.value;
                        setAdditionalItems(updated);
                      }}
                    />
                    <button
                      className="ai-remove"
                      onClick={() => setAdditionalItems(additionalItems.filter((_, i) => i !== index))}
                    >✕</button>
                  </div>
                ))}
                <button
                  className="add-item-btn"
                  onClick={() => setAdditionalItems([...additionalItems, { description: "", price: "" }])}
                >
                  + Add Item
                </button>
              </div>
            </div>
          )}

          {/* Step 6 – Payment */}
          {step === 6 && (
            <div className="payment-wrapper">
              <div className="payment-grid">
                <div className="form-field payment-full">
                  <label>Payment Mode</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                    <option value="">Select mode</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Transaction Note (optional)</label>
                  <input
                    type="text"
                    placeholder="UPI ref, card last 4…"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="balance-summary">
                <div className="balance-row">
                  <span className="bal-label">Package + Add-ons</span>
                  <span className="bal-value">₹{total}</span>
                </div>
                <div className="balance-row">
                  <span className="bal-label">Amount Paid</span>
                  <span className="bal-value">₹{amountPaid || 0}</span>
                </div>
                <hr className="balance-divider" />
                <div className="balance-row balance-due">
                  <span className="bal-label">Balance Due</span>
                  <span className="bal-value">₹{Math.max(0, total - Number(amountPaid || 0))}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 7 – Review */}
          {step === 7 && (
            <div className="review-grid">
              <div className="review-card">
                <div className="review-card-title">Customer</div>
                <p className="rv-main">{formData.customer_name}</p>
                <p className="rv-sub">{formData.phone_number}</p>
                {formData.email && <p className="rv-sub">{formData.email}</p>}
                {formData.address && <p className="rv-sub">{formData.address}</p>}
              </div>
              <div className="review-card">
                <div className="review-card-title">Date & Time</div>
                <p className="rv-main">{formData.event_date}</p>
                <p className="rv-sub">{formData.time_slot}</p>
              </div>
              <div className="review-card">
                <div className="review-card-title">Celebration</div>
                {celebrationOptions.map((c) =>
                  String(c.celebration_id) === formData.celebration_id && (
                    <p key={c.celebration_id} className="rv-main">{c.celebration_name}</p>
                  )
                )}
              </div>
              <div className="review-card">
                <div className="review-card-title">Status</div>
                <span className={`status-badge ${formData.status}`}>{formData.status}</span>
              </div>
              <div className="review-card review-full">
                <div className="review-card-title">Package</div>
                {selectedPackage && (
                  <>
                    <p className="rv-main">{selectedPackage.package_name}</p>
                    {selectedPackage.description && <p className="rv-sub">{selectedPackage.description}</p>}
                    <p className="rv-sub">₹{selectedPackage.price}</p>
                  </>
                )}
              </div>
              {(formData.addons_note || additionalItems.length > 0) && (
                <div className="review-card review-full">
                  <div className="review-card-title">Add-ons & Notes</div>
                  {formData.addons_note && <p className="rv-sub">{formData.addons_note}</p>}
                  {additionalItems.length > 0 && (
                    <ul className="rv-list">
                      {additionalItems.map((item, i) => (
                        <li key={i}>{item.description} — ₹{item.price}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div className="review-card review-full">
                <div className="review-card-title">Payment</div>
                <div className="rv-payment-row">
                  <span><span className="rv-sub">Mode </span><strong>{formData.payment_mode ? formData.payment_mode.replace("_", " ").toUpperCase() : "—"}</strong></span>
                  <span><span className="rv-sub">Total </span><strong>₹{formData.payment_total || total}</strong></span>
                  <span><span className="rv-sub">Paid </span><strong>₹{formData.payment_paid || 0}</strong></span>
                  <span><span className="rv-sub">Balance </span><strong className="rv-balance">₹{Math.max(0, Number(formData.payment_total || total) - Number(formData.payment_paid || 0))}</strong></span>
                </div>
                {formData.payment_notes && <p className="rv-sub" style={{ marginTop: 6 }}>Note: {formData.payment_notes}</p>}
              </div>
            </div>
          )}

        </div>{/* end ab-card-content */}

        {/* Card Footer */}
        <div className="ab-card-footer">
          <button
            className="btn-nav btn-nav-secondary"
            onClick={() => { if (step === 1) resetForm(); else setStep(step - 1); }}
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          <span className="step-indicator">{step} / {STEPS.length}</span>
          <button className="btn-nav btn-nav-primary" onClick={handleNext}>
            {step === STEPS.length ? "Submit Booking" : "Next →"}
          </button>
        </div>

      </div>{/* end ab-card */}
    </div>
  );
}

export default AddBookings;
