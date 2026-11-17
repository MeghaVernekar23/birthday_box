import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo_mark.png"; // gift mark only (no wordmark) in the navbar
import "./BookNow.css";
import "./Menu.css";
import PhotoCarousel from "../components/PhotoCarousel";
import NeonText from "../components/NeonText";
import {
  MENU_DURATIONS, ADDONS, EVERY_BOOKING_PERKS, OCCASIONS, CAKE_ADDON,
  tierFor, priceToNumber, formatINR,
} from "../data/packageCatalog";

// Public package menu (/menu). Static: no API calls, no login.
export default function Menu() {
  const navigate = useNavigate();
  const [durationKey, setDurationKey] = useState(
    (MENU_DURATIONS.find((d) => d.popular) || MENU_DURATIONS[0]).key
  );
  const duration = MENU_DURATIONS.find((d) => d.key === durationKey);

  // package id -> cake add-on ticked on that card
  const [cakeFor, setCakeFor] = useState({});
  const toggleCake = (pkgId) => setCakeFor((prev) => ({ ...prev, [pkgId]: !prev[pkgId] }));

  const book = (pkgId) => {
    const q = new URLSearchParams({ slot: duration.timeSlot });
    if (pkgId) q.set("pkg", pkgId);
    if (pkgId && cakeFor[pkgId] && CAKE_ADDON) q.set("addons", CAKE_ADDON.id);
    navigate(`/booknow?${q.toString()}`);
  };

  return (
    <div className="bn-root mn-page">
      <nav className="bn-nav">
        <img src={logo} alt="Birthday Box" className="bn-logo" onClick={() => navigate("/")} />
        <span className="bn-nav-title">Packages & Prices</span>
        <button className="bn-nav-back" onClick={() => navigate("/booknow")}>Book Now →</button>
      </nav>

      <div className="bn-hero">
        <NeonText as="h1" text="BIRTHDAY BOX" className="bn-hero-title" />
        <p className="bn-hero-sub">Private celebrations with decoration, screening & music. Pick a duration, then a package.</p>
      </div>

      <div className="mn-wrap">
        <h2 className="mn-h2 mn-h2--first">Every celebration includes</h2>
        <div className="mn-perks">
          {EVERY_BOOKING_PERKS.map((p) => (
            <div className="mn-perk" key={p.title}>
              <span className="mn-perk-icon" aria-hidden="true">{p.icon}</span>
              <div>
                <strong>{p.title}</strong>
                <span>{p.text}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mn-occasions">
          <span className="mn-occ-label">Perfect for</span>
          {OCCASIONS.map((o) => <span className="mn-occ" key={o}>{o}</span>)}
        </div>

        <h2 className="mn-h2">Choose your package</h2>
        <p className="mn-sub">Pick how long you want the room, then a package.</p>
        <div className="mn-tabs" role="tablist" aria-label="Duration">
          {MENU_DURATIONS.map((d) => (
            <button
              key={d.key}
              role="tab"
              aria-selected={d.key === durationKey}
              className={`mn-tab ${d.key === durationKey ? "mn-tab--on" : ""}`}
              onClick={() => setDurationKey(d.key)}
            >
              {d.title}
              {d.popular && <span className="mn-pop">Popular</span>}
            </button>
          ))}
        </div>

        <div className="mn-grid">
          {duration.packages.map((p, i) => {
            const t = tierFor(p.label);
            const name = t ? t.name : p.label.split("=")[0].trim();
            const offerCake = t && !t.hasCake && CAKE_ADDON;
            const withCake = offerCake && !!cakeFor[p.id];
            const total = priceToNumber(p.price) + (withCake ? CAKE_ADDON.price : 0);
            return (
              <div className="mn-card" key={p.id}>
                <PhotoCarousel startIdx={i} alt={`${name} package at Birthday Box`} />
                <div className="mn-card-body">
                <div className="mn-card-top">
                  <span className="mn-emoji" aria-hidden="true">{t?.emoji || "🎉"}</span>
                  <div>
                    <h3 className="mn-name">{name}</h3>
                    <span className="mn-dur">{duration.title}</span>
                  </div>
                  <span className="mn-price-box">
                    <span className="mn-price" aria-live="polite">{formatINR(total)}</span>
                    {withCake && <span className="mn-price-note">incl. cake</span>}
                  </span>
                </div>

                {t && (
                  <>
                    <span className="mn-count">{t.includes.length} inclusions</span>
                    <ul className="mn-list">
                      {t.adds.map((f) => (
                        <li key={f} className="mn-new"><span className="mn-tick">✓</span>{f}</li>
                      ))}
                      {t.inherited.map((f) => (
                        <li key={f} className="mn-inh"><span className="mn-tick">✓</span>{f}</li>
                      ))}
                    </ul>
                    {offerCake && (
                      <label className={`mn-optional ${withCake ? "mn-optional--on" : ""}`}>
                        <input
                          type="checkbox"
                          className="mn-check"
                          checked={withCake}
                          onChange={() => toggleCake(p.id)}
                        />
                        <span>Add a ½ kg cake for <strong>{formatINR(CAKE_ADDON.price)}</strong> <em>(optional)</em></span>
                      </label>
                    )}
                    {t.previous && <span className="mn-prev">Includes everything in {t.previous}</span>}
                  </>
                )}

                <button className="bn-submit-btn mn-book" onClick={() => book(p.id)}>
                  Book {name}
                </button>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mn-h2">Add-ons</h2>
        <p className="mn-sub">Add any of these while booking.</p>
        <div className="mn-addons">
          {ADDONS.map((a) => (
            <div className="mn-addon" key={a.id}>
              <span>{a.label.replace(/\s*-\s*₹[\d,]+(\/hr)?/, "")}</span>
              <strong>{a.price ? `₹${a.price.toLocaleString("en-IN")}${a.label.includes("/hr") ? "/hr" : ""}` : "Ask us"}</strong>
            </div>
          ))}
        </div>

        <h2 className="mn-h2">Good to know</h2>
        <div className="mn-facts">
          <span>👥 Up to 10 guests included in every package</span>
          <span>➕ Extra guests ₹100 / person</span>
          <span>🎂 Cake not included — request a ½ kg cake for ₹500 while booking</span>
          <span>🏛 Extra dining hall ₹2,000 (Sun, or weekdays after 5 PM)</span>
          <span>⏰ Please arrive 15 minutes before your slot</span>
          <span>📞 Booking confirmed after a quick call with our team</span>
        </div>

        <div className="mn-cta">
          <p>Want something custom or a different duration?</p>
          <div className="mn-cta-row">
            <button className="bn-submit-btn" onClick={() => navigate("/booknow")}>Go to booking form</button>
            <a className="mn-call" href="tel:+918971543330">📞 +91 89715 43330</a>
          </div>
        </div>
      </div>

      <footer className="bn-footer">
        <p>© {new Date().getFullYear()} Birthday Box. All rights reserved.</p>
      </footer>
    </div>
  );
}
