import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.jpg";
import "./Home.css";

const services = [
  {
    icon: "🎂",
    title: "Birthday Parties",
    desc: "From toddlers to milestone birthdays — we create magical, personalised setups that make every moment count.",
  },
  {
    icon: "💍",
    title: "Anniversary & Proposals",
    desc: "Surprise your loved one with a beautifully decorated private venue, perfect for intimate celebrations.",
  },
  {
    icon: "🏏",
    title: "IPL & Sports Screenings",
    desc: "Book the venue for match nights with your crew. Big screen, great vibes, unforgettable game days.",
  },
  {
    icon: "🎊",
    title: "Private Gatherings",
    desc: "Baby showers, farewells, graduations — any occasion that deserves a special, dedicated space.",
  },
];

const highlights = [
  { num: "500+", label: "Events Hosted" },
  { num: "1000+", label: "Happy Guests" },
  { num: "50+", label: "Sports Screenings" },
  { num: "4.9 ★", label: "Average Rating" },
];

const testimonials = [
  {
    name: "Priya S.",
    text: "Absolutely stunning setup for my daughter's birthday! Every little detail was taken care of. The team at Birthday Box made it truly magical.",
  },
  {
    name: "Rahul M.",
    text: "Watched the IPL finals here with 15 friends — the big screen, the energy, the vibe was incredible. Already booked again for the next season!",
  },
  {
    name: "Ananya K.",
    text: "Surprised my mom for her anniversary here. The décor was elegant and the space felt so personal. Couldn't have asked for more.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bb-root">

      {/* ── NAVBAR ── */}
      <header className="bb-nav">
        <img src={logo} alt="Birthday Box" className="bb-nav-logo" />
        <nav className="bb-nav-links">
          <a href="#services">Services</a>
          <a href="#venue">Venue</a>
          <a href="#testimonials">Reviews</a>
          <a href="#contact">Contact</a>
        </nav>
        <button className="bb-nav-cta" onClick={() => navigate("/login")}>
          Staff Login
        </button>
      </header>

      {/* ── HERO ── */}
      <section className="bb-hero">
        <div className="bb-hero-bg" />
        <div className="bb-hero-inner">
          <div className="bb-hero-text">
            <span className="bb-pill">📍 Mysuru's Favourite Celebration Venue</span>
            <h1>
              Every Occasion <br />
              <span className="bb-gradient-text">Deserves a Box</span>
            </h1>
            <p className="bb-hero-sub">
              A cosy, private venue you can rent for birthdays, anniversaries,
              baby showers, IPL nights &amp; more. Fully decorated. Completely yours.
            </p>
            <div className="bb-hero-btns">
              <a href="#contact" className="bb-btn-primary">Book Your Slot</a>
              <a href="#services" className="bb-btn-ghost">See Packages</a>
            </div>
          </div>
          <div className="bb-hero-card-wrap">
            <div className="bb-hero-card">
              <img src={logo} alt="Birthday Box" className="bb-hero-card-logo" />
              <p className="bb-hero-card-tag">Private Celebration Venue</p>
              <ul className="bb-hero-card-list">
                <li>✔ Upto 30 Guests</li>
                <li>✔ Custom Décor</li>
                <li>✔ HD Projector</li>
                <li>✔ Flexible Slots</li>
              </ul>
              <a href="#contact" className="bb-btn-primary" style={{ width: "100%", textAlign: "center", display: "block" }}>
                Check Availability
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bb-stats">
        {highlights.map((h) => (
          <div className="bb-stat" key={h.label}>
            <span className="bb-stat-num">{h.num}</span>
            <span className="bb-stat-label">{h.label}</span>
          </div>
        ))}
      </section>

      {/* ── SERVICES ── */}
      <section className="bb-services" id="services">
        <div className="bb-section-head">
          <span className="bb-pill bb-pill-dark">What We Offer</span>
          <h2>Every Celebration, <span className="bb-gradient-text">Perfectly Hosted</span></h2>
          <p>We handle the setup so you can focus on the moments that matter.</p>
        </div>
        <div className="bb-services-grid">
          {services.map((s) => (
            <div className="bb-service-card" key={s.title}>
              <div className="bb-service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VENUE ── */}
      <section className="bb-venue-section" id="venue">
      <div className="bb-venue">
        <div className="bb-venue-visual">
          <div className="bb-venue-img-mock">
            <div className="bb-venue-badge">🎈 Now Booking</div>
            <div className="bb-venue-tiles">
              <div className="vt vt1">🎂<span>Birthday Setup</span></div>
              <div className="vt vt2">🏏<span>IPL Night</span></div>
              <div className="vt vt3">💐<span>Anniversary</span></div>
              <div className="vt vt4">🎊<span>Baby Shower</span></div>
            </div>
          </div>
        </div>
        <div className="bb-venue-text">
          <span className="bb-pill bb-pill-dark">Our Space</span>
          <h2>A Venue Built <span className="bb-gradient-text">for Joy</span></h2>
          <p className="bb-venue-desc">
            Our thoughtfully designed space in Mysuru holds up to <strong>30 guests</strong> and transforms completely to match your event's theme. Whether it's a princess birthday, a cricket night, or a romantic dinner — Birthday Box becomes whatever you need it to be.
          </p>
          <div className="bb-perks-grid">
            <div className="bb-perk"><span>🎬</span> HD Projector &amp; Big Screen</div>
            <div className="bb-perk"><span>🎨</span> Custom Décor &amp; Lighting</div>
            <div className="bb-perk"><span>🔊</span> Premium Sound System</div>
            <div className="bb-perk"><span>❄️</span> Air-conditioned Comfort</div>
            <div className="bb-perk"><span>🅿️</span> Dedicated Parking</div>
            <div className="bb-perk"><span>🕐</span> Flexible Booking Slots</div>
          </div>
          <a href="#contact" className="bb-btn-primary" style={{ display: "inline-block", marginTop: "2rem" }}>
            Book This Venue
          </a>
        </div>
      </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bb-testimonials" id="testimonials">
        <div className="bb-section-head">
          <span className="bb-pill bb-pill-dark">Reviews</span>
          <h2>Loved by Families <span className="bb-gradient-text">&amp; Friends</span></h2>
          <p>Don't take our word for it — here's what our guests say.</p>
        </div>
        <div className="bb-testi-grid">
          {testimonials.map((t) => (
            <div className="bb-testi-card" key={t.name}>
              <div className="bb-testi-stars">★★★★★</div>
              <p className="bb-testi-text">"{t.text}"</p>
              <div className="bb-testi-author">
                <div className="bb-testi-avatar">{t.name[0]}</div>
                <span>{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA / CONTACT ── */}
      <section className="bb-cta" id="contact">
        <div className="bb-cta-inner">
          <h2>Ready to Celebrate?</h2>
          <p>
            Slots fill up fast — especially on weekends and match days. Get in
            touch now to check availability and lock in your date.
          </p>
          <div className="bb-cta-btns">
            <a href="tel:+918971543330" className="bb-btn-primary">📞 +91 89715 43330</a>
            <a href="https://www.instagram.com/birthdaybox2025/" target="_blank" rel="noreferrer" className="bb-btn-ghost bb-btn-ghost-dark">
              📸 View on Instagram
            </a>
          </div>
          <div className="bb-cta-address">
            <span>📍</span>
            <span>MIG5, Nrupatunga Road, Near Bus Depo Circle,<br />Kuvempunagar, Mysuru – 570 023</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bb-footer">
        <img src={logo} alt="Birthday Box" className="bb-footer-logo" />
        <div className="bb-footer-center">
          <p>📍 MIG5, Nrupatunga Road, Near Bus Depo Circle, Kuvempunagar, Mysuru – 570 023</p>
          <p>📞 <a href="tel:+918971543330">+91 89715 43330</a></p>
        </div>
        <p className="bb-footer-copy">© {new Date().getFullYear()} Birthday Box · All rights reserved.</p>
      </footer>

    </div>
  );
}
