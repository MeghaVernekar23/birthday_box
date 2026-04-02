import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.jpg";
import "./BookNow.css";
import { BASE_URL } from "../services/utils";

const TIME_SLOTS = [
  "1 Hour (Quick)",
  "1.5 Hours (Classic)",
  "Other",
];

const CELEBRATION_TYPES = [
  "Birthday Parties",
  "Teen Nights",
  "Private Movies",
  "Anniversaries",
  "Baby Shower/Gender Reveal",
  "Retirement",
  "Proposals",
  "Bride Events",
  "Mother's Day",
  "Father's Day",
];

const PACKAGES_1HR = [
  { id: "p1h1", label: "BASIC = BALLON DECORATION + PRIVATE SCRENING + MUSIC", price: "₹999" },
  { id: "p1h2", label: "CLASSIC PACKAGE = BASIC + GAMES + GIFT", price: "₹1,299" },
  { id: "p1h3", label: "DYNAMIC PACKAGE = CLASSIC + FOG ENTRY", price: "₹1,799" },
  { id: "p1h4", label: "ELITE PACKAGE = DYNAMIC + 1/2KG PASTY", price: "₹2,199" },
  { id: "p1h5", label: "GLODEN GLOW PACKAGE = ELITE + FIRE ENTRY", price: "₹2,699" },
  { id: "p1h6", label: "DREAM CELEBRATION PACKAGE = GOLDEN GLOW + COMPLEMENTARY WELCOME DRINKS (FRESH JUICE) + 1HR PHOTOSHOOT (50 PICKS)", price: "₹4,999" },
  { id: "p1h7", label: "INSTAGRAM REEL EDIT USING IPHONE 16 PRO MAX (PROFESSIONALLY EDITED & INSTAGRAM-READY)", price: "₹1,000" },
];

const PACKAGES_1HR30 = [
  { id: "p15h1", label: "BASIC = BALLON DECORATION + PRIVATE SCRENING + MUSIC", price: "₹1,499" },
  { id: "p15h2", label: "CLASSIC PACKAGE = BASIC + GAMES + GIFT", price: "₹1,799" },
  { id: "p15h3", label: "DYNAMIC PACKAGE = CLASSIC + FOG ENTRY", price: "₹2,499" },
  { id: "p15h4", label: "ELITE PACKAGE = DYNAMIC + 1/2KG PASTY", price: "₹2,899" },
  { id: "p15h5", label: "GLODEN GLOW PACKAGE = ELITE + FIRE ENTRY", price: "₹3,699" },
  { id: "p15h6", label: "DREAM CELEBRATION PACKAGE = GOLDEN GLOW + COMPLEMENTARY WELCOME DRINKS (FRESH JUICE) + 1HR PHOTOSHOOT (50 PICKS)", price: "₹5,999" },
  { id: "p15h7", label: "INSTAGRAM REEL EDIT USING IPHONE 16 PRO MAX (PROFESSIONALLY EDITED & INSTAGRAM-READY)", price: "₹1,000" },
];

const ADDONS = [
  "Customised Cake",
  "Customized Decoration",
  "Photography - ₹1,500/hr",
  "Fire Entry - ₹800",
  "Popcorn",
  "Fog Entry - ₹750",
  "Instagram Reel Edit by iPhone 16 Pro Max - ₹1,000",
  "Photography by iPhone 16 Pro Max - ₹1,000 (30 Photos)",
];

const TIME_OPTIONS = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
];

const REFERRAL_SOURCES = [
  "Instagram",
  "Friends",
  "Google",
  "Walk-in",
  "Bakery",
  "Others",
];

const TERMS = `BIRTHDAY BOX — CUSTOMER DISCLAIMER

By submitting this form, you acknowledge and agree to the following terms:

1. BOOKING CONFIRMATION: Submitting this form does NOT confirm your booking. You must call us at 8971543330 to check availability and complete payment.

2. GUEST CAPACITY: Up to 10 guests are included in the package. Additional guests may incur extra charges.

3. ARRIVAL: Please arrive 15 minutes before your scheduled slot to ensure a smooth setup and start.

4. EXTERNAL ITEMS: Any food or items brought from outside require prior approval from Birthday Box management.

5. PROHIBITED ITEMS: Alcohol, smoking, and any illegal substances are strictly prohibited on the premises.

6. TIME LIMITS: Time slots are strictly enforced. Overtime will incur additional charges.

7. DAMAGES: Customers are fully liable for any damages caused to the property or equipment during their booking period.

8. CLEANLINESS: All guests are required to maintain cleanliness and follow the cleaning guidelines provided.

9. MEDIA USAGE: Photo and video content captured during your event may be used by Birthday Box for promotional purposes unless you explicitly opt out.

10. CANCELLATION POLICY: Cancellations must be made at least 48 hours in advance for a partial refund. Late cancellations are non-refundable.`;

export default function BookNow() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    timeSlot: "",
    needCake: "",
    preferredDate: "",
    preferredTime: "",
    celebrationType: "",
    packages1hr: [],
    packages1hr30: [],
    addons: [],
    referral: "",
    confirmation: "",
    agreement: false,
    contactUs: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [celebrationTypes, setCelebrationTypes] = useState([]);
  const [packages, setPackages] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/bookings/celebration-type`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCelebrationTypes(data); })
      .catch(() => {});

    fetch(`${BASE_URL}/bookings/package`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPackages(data); })
      .catch(() => {});
  }, []);

  const fetchBookedTimesForDate = (date) => {
    if (!date) { setBookedTimes([]); return; }
    // Login as customer then fetch bookings for that date
    const loginForm = new URLSearchParams();
    loginForm.append("username", "customer");
    loginForm.append("password", "customer@birthdaybox");
    fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: loginForm.toString(),
    })
      .then((r) => r.json())
      .then(({ access_token }) =>
        fetch(`${BASE_URL}/bookings/by-filter?filter=todayandfuture`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
      )
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        // Parse duration in hours from the addons_note field
        const getDuration = (note) => {
          if (!note) return 1;
          if (note.includes("1.5 Hours")) return 1.5;
          if (note.includes("1 Hour")) return 1;
          return 1;
        };

        // Convert a 12hr string like "5:00 PM" to total minutes from midnight
        const toMinutes = (timeStr) => {
          const match = timeStr && timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!match) return null;
          let h = parseInt(match[1]);
          const m = parseInt(match[2]);
          const mer = match[3].toUpperCase();
          if (mer === "PM" && h !== 12) h += 12;
          if (mer === "AM" && h === 12) h = 0;
          return h * 60 + m;
        };

        // Convert 24hr "HH:MM" to minutes
        const to24Minutes = (timeStr) => {
          const match = timeStr && timeStr.match(/(\d+):(\d+)/);
          if (!match) return null;
          return parseInt(match[1]) * 60 + parseInt(match[2]);
        };

        // Build set of blocked minutes ranges from existing bookings
        const blockedRanges = data
          .filter((b) => b.event_date === date && b.status !== "cancelled")
          .map((b) => {
            const startMin = to24Minutes(b.time_slot) ?? toMinutes(b.time_slot);
            const durationMin = getDuration(b.addons_note) * 60;
            return startMin != null ? { start: startMin, end: startMin + durationMin } : null;
          })
          .filter(Boolean);

        // For each TIME_OPTION slot, mark it blocked if it overlaps any booked range
        // Also need to consider the duration the current user is selecting — but we
        // block any slot whose 1hr OR 1.5hr window overlaps a booked range
        const blocked = TIME_OPTIONS.filter((t) => {
          const slotMin = toMinutes(t);
          if (slotMin == null) return false;
          return blockedRanges.some(
            (r) => slotMin < r.end && slotMin + 60 > r.start
          );
        });

        setBookedTimes(blocked);
      })
      .catch(() => {});
  };

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleCheck = (field, value) => {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    if (!form.timeSlot) e.timeSlot = "Please choose a time slot.";
    if (!form.preferredTime.trim()) e.preferredTime = "Preferred time is required.";
    if (!form.celebrationType) e.celebrationType = "Please select a celebration type.";
    if (!form.referral) e.referral = "Please tell us how you heard about us.";
    if (!form.confirmation.trim()) e.confirmation = "Please read and type to acknowledge the terms.";
    if (!form.agreement) e.agreement = "You must agree to the Customer Disclaimer.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      const firstKey = Object.keys(e2)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      // Resolve celebration_id by matching name from API, fallback to first available
      const celebList = Array.isArray(celebrationTypes) ? celebrationTypes : [];
      const celebMatch = celebList.find(
        (c) => c.celebration_name.toLowerCase().includes(form.celebrationType.toLowerCase()) ||
               form.celebrationType.toLowerCase().includes(c.celebration_name.toLowerCase())
      );
      const celebration_id = celebMatch ? celebMatch.celebration_id : celebList[0]?.celebration_id;
      if (!celebration_id) throw new Error("Could not resolve celebration type. Please try again.");

      // Resolve package_id: pick first selected package by label match, fallback to first available
      const pkgList = Array.isArray(packages) ? packages : [];
      const allSelectedLabels = [
        ...form.packages1hr.map((id) => PACKAGES_1HR.find((p) => p.id === id)?.label),
        ...form.packages1hr30.map((id) => PACKAGES_1HR30.find((p) => p.id === id)?.label),
      ].filter(Boolean);

      let package_id = pkgList[0]?.package_id;
      if (!package_id) throw new Error("Could not resolve package. Please try again.");
      if (allSelectedLabels.length > 0) {
        const firstLabel = allSelectedLabels[0].split("=")[0].trim().toUpperCase();
        const pkgMatch = pkgList.find(
          (p) => p.package_name.toUpperCase().includes(firstLabel) || firstLabel.includes(p.package_name.toUpperCase())
        );
        if (pkgMatch) package_id = pkgMatch.package_id;
      }

      // Build addons note
      const addonsList = [...form.addons];
      if (form.needCake === "YES") addonsList.push("Cake required");
      const addons_note = [
        form.timeSlot ? `Time slot: ${form.timeSlot}` : "",
        form.referral ? `Heard from: ${form.referral}` : "",
        addonsList.length > 0 ? `Add-ons: ${addonsList.join(", ")}` : "",
        allSelectedLabels.length > 0 ? `Packages selected: ${allSelectedLabels.join("; ")}` : "",
        form.contactUs ? `Message: ${form.contactUs}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const eventDate = form.preferredDate || new Date().toISOString().split("T")[0];

      // Login as the customer service account to get a token
      const loginForm = new URLSearchParams();
      loginForm.append("username", "customer");
      loginForm.append("password", "customer@birthdaybox");
      const loginRes = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: loginForm.toString(),
      });
      if (!loginRes.ok) {
        const loginErr = await loginRes.json().catch(() => ({}));
        throw new Error(loginErr.detail || `Login failed (${loginRes.status}). Please try again.`);
      }
      const { access_token } = await loginRes.json();

      const payload = {
        customer_name: form.name,
        phone_number: form.phone,
        email: "",
        address: "",
        event_date: eventDate,
        time_slot: form.preferredTime,
        celebration_id,
        package_id,
        addons_note,
        status: "pending",
        payment_mode: "",
        payment_total: 0,
        payment_paid: 0,
        payment_notes: "",
        created_by: "customer",
        updated_by: null,
        additional_items: [],
      };

      const res = await fetch(`${BASE_URL}/bookings/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Submission failed. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bn-root">
        <nav className="bn-nav">
          <img src={logo} alt="Birthday Box" className="bn-logo" onClick={() => navigate("/")} />
        </nav>
        <div className="bn-success">
          <div className="bn-success-card">
            <div className="bn-success-icon">🎉</div>
            <h2>Thank You, {form.name}!</h2>
            <p>Your booking request has been received.</p>
            <p className="bn-success-note">
              Please call us at <strong>+91 89715 43330</strong> to confirm availability and complete payment.
            </p>
            <button className="bn-btn-primary" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bn-root">
      {/* Navbar */}
      <nav className="bn-nav">
        <img src={logo} alt="Birthday Box" className="bn-logo" onClick={() => navigate("/")} />
        <span className="bn-nav-title">Book Your Celebration</span>
        <button className="bn-nav-back" onClick={() => navigate("/")}>
          ← Home
        </button>
      </nav>

      {/* Hero */}
      <div className="bn-hero">
        <h1 className="bn-hero-title">B I R T H D A Y &nbsp; B O X</h1>
        <p className="bn-hero-sub">Fill in the form below to request your celebration slot</p>
      </div>

      <form className="bn-form" onSubmit={handleSubmit} noValidate>
        <div className="bn-card">

          {/* NAME */}
          <div className="bn-field" id="field-name">
            <label className="bn-label">NAME <span className="bn-req">*</span></label>
            <input
              className={`bn-input ${errors.name ? "bn-input-err" : ""}`}
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <span className="bn-error">{errors.name}</span>}
          </div>

          {/* PHONE */}
          <div className="bn-field" id="field-phone">
            <label className="bn-label">PHONE NUMBER <span className="bn-req">*</span></label>
            <input
              className={`bn-input ${errors.phone ? "bn-input-err" : ""}`}
              type="tel"
              placeholder="Your phone number"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            {errors.phone && <span className="bn-error">{errors.phone}</span>}
          </div>

          {/* TIME SLOT */}
          <div className="bn-field" id="field-timeSlot">
            <label className="bn-label">CHOOSE YOUR TIME SLOT <span className="bn-req">*</span></label>
            <div className="bn-radio-group">
              {TIME_SLOTS.map((slot) => (
                <label key={slot} className={`bn-radio-option ${form.timeSlot === slot ? "bn-radio-selected" : ""}`}>
                  <input
                    type="radio"
                    name="timeSlot"
                    value={slot}
                    checked={form.timeSlot === slot}
                    onChange={() => {
                      set("timeSlot", slot);
                      setForm((prev) => ({ ...prev, packages1hr: [], packages1hr30: [] }));
                    }}
                  />
                  {slot}
                </label>
              ))}
            </div>
            {errors.timeSlot && <span className="bn-error">{errors.timeSlot}</span>}
          </div>

          {/* NEED CAKE */}
          <div className="bn-field">
            <label className="bn-label">DO YOU NEED A CAKE?</label>
            <div className="bn-radio-group">
              {["YES", "NO"].map((opt) => (
                <label key={opt} className={`bn-radio-option ${form.needCake === opt ? "bn-radio-selected" : ""}`}>
                  <input
                    type="radio"
                    name="needCake"
                    value={opt}
                    checked={form.needCake === opt}
                    onChange={() => set("needCake", opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* PREFERRED DATE */}
          <div className="bn-field">
            <label className="bn-label">PREFERRED DATE OF BOOKING</label>
            <input
              className="bn-input"
              type="date"
              value={form.preferredDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                set("preferredDate", e.target.value);
                set("preferredTime", "");
                fetchBookedTimesForDate(e.target.value);
              }}
            />
          </div>

          {/* PREFERRED TIME */}
          <div className="bn-field" id="field-preferredTime">
            <label className="bn-label">
              PREFERRED TIME SLOT <span className="bn-req">*</span>
            </label>
            <select
              className={`bn-select ${errors.preferredTime ? "bn-input-err" : ""}`}
              value={form.preferredTime}
              onChange={(e) => set("preferredTime", e.target.value)}
            >
              <option value="">-- Select a time slot --</option>
              {TIME_OPTIONS.map((t) => {
                const isBooked = bookedTimes.includes(t);
                return (
                  <option key={t} value={t} disabled={isBooked}>
                    {isBooked ? `${t} — Booked` : t}
                  </option>
                );
              })}
            </select>
            {errors.preferredTime && <span className="bn-error">{errors.preferredTime}</span>}
          </div>

          {/* CELEBRATION TYPE */}
          <div className="bn-field" id="field-celebrationType">
            <label className="bn-label">TYPES OF CELEBRATIONS <span className="bn-req">*</span></label>
            <select
              className={`bn-select ${errors.celebrationType ? "bn-input-err" : ""}`}
              value={form.celebrationType}
              onChange={(e) => set("celebrationType", e.target.value)}
            >
              <option value="">-- Select celebration type --</option>
              {CELEBRATION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.celebrationType && <span className="bn-error">{errors.celebrationType}</span>}
          </div>

          {/* PACKAGES 1 HR — only when 1 Hour is selected */}
          {form.timeSlot === "1 Hour (Quick)" && (
            <div className="bn-field">
              <label className="bn-label">PACKAGES (1 HR)</label>
              <div className="bn-checkbox-group">
                {PACKAGES_1HR.map((pkg) => (
                  <label key={pkg.id} className={`bn-checkbox-option ${form.packages1hr.includes(pkg.id) ? "bn-checkbox-selected" : ""}`}>
                    <input
                      type="checkbox"
                      checked={form.packages1hr.includes(pkg.id)}
                      onChange={() => toggleCheck("packages1hr", pkg.id)}
                    />
                    <span className="bn-pkg-label">{pkg.label}</span>
                    <span className="bn-pkg-price">{pkg.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* PACKAGES 1 HR 30 MIN — only when 1.5 Hours is selected */}
          {form.timeSlot === "1.5 Hours (Classic)" && (
            <div className="bn-field">
              <label className="bn-label">PACKAGES (1 HR 30 MIN)</label>
              <div className="bn-checkbox-group">
                {PACKAGES_1HR30.map((pkg) => (
                  <label key={pkg.id} className={`bn-checkbox-option ${form.packages1hr30.includes(pkg.id) ? "bn-checkbox-selected" : ""}`}>
                    <input
                      type="checkbox"
                      checked={form.packages1hr30.includes(pkg.id)}
                      onChange={() => toggleCheck("packages1hr30", pkg.id)}
                    />
                    <span className="bn-pkg-label">{pkg.label}</span>
                    <span className="bn-pkg-price">{pkg.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ADD-ONS */}
          <div className="bn-field">
            <label className="bn-label">ADD-ONS</label>
            <div className="bn-checkbox-group bn-addons-group">
              {ADDONS.map((addon) => (
                <label key={addon} className={`bn-checkbox-option ${form.addons.includes(addon) ? "bn-checkbox-selected" : ""}`}>
                  <input
                    type="checkbox"
                    checked={form.addons.includes(addon)}
                    onChange={() => toggleCheck("addons", addon)}
                  />
                  <span>{addon}</span>
                </label>
              ))}
            </div>
          </div>

          {/* REFERRAL */}
          <div className="bn-field" id="field-referral">
            <label className="bn-label">HOW DID YOU HEAR ABOUT US? <span className="bn-req">*</span></label>
            <select
              className={`bn-select ${errors.referral ? "bn-input-err" : ""}`}
              value={form.referral}
              onChange={(e) => set("referral", e.target.value)}
            >
              <option value="">-- Select an option --</option>
              {REFERRAL_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.referral && <span className="bn-error">{errors.referral}</span>}
          </div>

          {/* CONFIRMATION / T&C */}
          <div className="bn-field" id="field-confirmation">
            <label className="bn-label">CONFIRMATION <span className="bn-req">*</span></label>
            <div className="bn-terms-box">
              <pre className="bn-terms-text">{TERMS}</pre>
            </div>
            <p className="bn-terms-prompt">
              Type <strong>"I AGREE"</strong> below to acknowledge that you have read and understood the above terms:
            </p>
            <input
              className={`bn-input ${errors.confirmation ? "bn-input-err" : ""}`}
              type="text"
              placeholder='Type "I AGREE" to acknowledge'
              value={form.confirmation}
              onChange={(e) => set("confirmation", e.target.value)}
            />
            {errors.confirmation && <span className="bn-error">{errors.confirmation}</span>}
          </div>

          {/* AGREEMENT CHECKBOX */}
          <div className="bn-field" id="field-agreement">
            <label className={`bn-agreement-label ${errors.agreement ? "bn-error-border" : ""}`}>
              <input
                type="checkbox"
                checked={form.agreement}
                onChange={(e) => set("agreement", e.target.checked)}
              />
              <span>
                I have read and agree to the Customer Disclaimer <span className="bn-req">*</span>
              </span>
            </label>
            {errors.agreement && <span className="bn-error">{errors.agreement}</span>}
          </div>

          {/* CONTACT US */}
          <div className="bn-field">
            <label className="bn-label">CONTACT US</label>
            <p className="bn-contact-info">
              📞 <a href="tel:+918971543330">+91 89715 43330</a>
            </p>
            <input
              className="bn-input"
              type="text"
              placeholder="Any message for us? (optional)"
              value={form.contactUs}
              onChange={(e) => set("contactUs", e.target.value)}
            />
          </div>

          {submitError && (
            <div className="bn-submit-error">{submitError}</div>
          )}

          <button type="submit" className="bn-submit-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Booking Request"}
          </button>
        </div>
      </form>

      <footer className="bn-footer">
        <p>© {new Date().getFullYear()} Birthday Box. All rights reserved.</p>
      </footer>
    </div>
  );
}
