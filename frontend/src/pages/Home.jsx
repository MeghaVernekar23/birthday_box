import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.jpg";
import logoPng from "../images/logo.png";
import imgScreen from "../images/screen.jpeg";
import imgDoll from "../images/doll.jpeg";
import imgDeco from "../images/deco.JPG";
import imgHall from "../images/hall.JPG";
import imgHallOther from "../images/hall_other.JPG";
import imgSitting from "../images/sitting.JPG";
import "./Home.css";
import { fetchPackage } from "../services/bookingServices";

// Parse "BASIC = BALLOON DECORATION + MUSIC = 999/-" into { name, features, price }
function parsePackageName(raw) {
  const parts = raw.split(" = ").map((s) => s.trim());
  if (parts.length >= 3) {
    const name = parts[0];
    const featureStr = parts.slice(1, -1).join(" ");
    const priceStr = parts[parts.length - 1];
    const price = priceStr.replace(/[^\d]/g, "");
    const features = featureStr.split("+").map((f) => f.trim()).filter(Boolean);
    return { name, features, price };
  }
  return { name: raw, features: [], price: "" };
}

const EXCLUDED_PKG_IDS = [9, 13, 16];

const PKG_DESC = {
  1:  "Perfect for intimate get-togethers — a cosy setup to kick off your celebration.",
  2:  "Our most popular starter — balloons, big screen, and great music all in one.",
  3:  "Step it up with fun games and a surprise gift for the guest of honour.",
  4:  "Add a dramatic fog entry to your Classic Package for an unforgettable entrance.",
  5:  "Everything in Dynamic plus a delicious half-kg pastry to sweeten the moment.",
  6:  "A dazzling fire entry crowns this premium package — pure golden vibes.",
  7:  "Our ultimate package — drinks, a full photoshoot, and every luxury included.",
  8:  "Catch every boundary live on our big screen with your squad — pure match-day magic.",
  11: "An upgraded Dynamic experience with enhanced décor and added perks.",
  14: "Pair our BASIC package with a professionally edited Instagram Reel — memories made shareable.",
};

function PackageCard({ pkg, desc, images, startIdx, onBook }) {
  const [imgIdx, setImgIdx] = useState(startIdx % images.length);
  const { name, features } = parsePackageName(pkg.package_name);
  const price = pkg.price;

  const prev = (e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % images.length); };

  return (
    <div className="bb-pkg-card">
      <div className="bb-pkg-img-wrap">
        <img src={images[imgIdx]} alt={name} className="bb-pkg-img" />
        <button className="bb-pkg-arrow bb-pkg-arrow-left" onClick={prev}>‹</button>
        <button className="bb-pkg-arrow bb-pkg-arrow-right" onClick={next}>›</button>
        <div className="bb-pkg-dots">
          {images.map((_, i) => (
            <span key={i} className={`bb-pkg-dot${i === imgIdx ? " active" : ""}`} onClick={(e) => { e.stopPropagation(); setImgIdx(i); }} />
          ))}
        </div>
        <div className="bb-pkg-rating">⭐ 4.9</div>
      </div>
      <div className="bb-pkg-body">
        <h3 className="bb-pkg-name">{name}</h3>
        {desc && <p className="bb-pkg-desc">{desc}</p>}
        {price > 0 && (
          <div className="bb-pkg-price">
            <span className="bb-pkg-currency">₹</span>
            <span className="bb-pkg-amount">{price.toLocaleString("en-IN")}</span>
          </div>
        )}
        {features.length > 0 && (
          <ul className="bb-pkg-features">
            {features.map((f, i) => (
              <li key={i}><span className="bb-pkg-check">✓</span>{f}</li>
            ))}
          </ul>
        )}
        <button className="bb-pkg-btn" onClick={onBook}>Book This Package</button>
      </div>
    </div>
  );
}

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

const venueImages = [imgScreen, imgDeco, imgSitting, imgHall, imgHallOther, imgDoll];

export default function Home() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetchPackage()
      .then((res) => setPackages(Array.isArray(res) ? res : []))
      .catch((err) => console.error("Failed to load packages:", err));
  }, []);

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
        <div className="bb-nav-actions">
          <button className="bb-nav-booknow" onClick={() => navigate("/booknow")}>
            Book Now
          </button>
          <button className="bb-nav-cta" onClick={() => navigate("/login")}>
            Staff Login
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bb-hero">
        <div className="bb-hero-bg" />
        <div className="bb-hero-inner">
          <div className="bb-hero-text">
            <span className="bb-pill">📍 Mysuru's Favourite Celebration Venue</span>
            <span className="bb-pill bb-pill-price">🎉 Celebrations Starting at ₹999</span>
            <h1>
              Every Occasion <br />
              <span className="bb-gradient-text">Deserves a Box</span>
            </h1>
            <p className="bb-hero-sub">
              A cosy, private venue you can rent for birthdays, anniversaries,
              baby showers, IPL nights &amp; more. Fully decorated. Completely yours.
            </p>
            <div className="bb-hero-btns">
              <button className="bb-btn-primary" onClick={() => navigate("/booknow")}>Book Your Slot</button>
              <a href="#packages" className="bb-btn-ghost">See Packages</a>
            </div>
          </div>
          <div className="bb-hero-card-wrap">
            <div className="bb-hero-card">
              <img src={logo} alt="Birthday Box" className="bb-hero-card-logo" />
              <p className="bb-hero-card-tag">Private Celebration Venue</p>
              <a href="tel:+918971543330" className="bb-hero-card-phone">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="bb-phone-icon">
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V21a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"/>
                </svg>
                +91 89715 43330
              </a>
              <ul className="bb-hero-card-list">
                <li>✔ Upto 10 Guests (extra charges apply)</li>
                <li>✔ Custom Décor</li>
                <li>✔ HD Projector</li>
                <li>✔ Flexible Slots</li>
              </ul>
              <div className="bb-hero-card-price">Starting at <strong>₹999</strong> · up to 10 guests</div>
              <button className="bb-btn-primary" style={{ width: "100%", textAlign: "center", display: "block" }} onClick={() => navigate("/booknow")}>
                Check Availability
              </button>
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

      {/* ── PACKAGES ── */}
      <section className="bb-packages" id="packages">
        <div className="bb-section-head">
          <span className="bb-pill bb-pill-dark">Our Packages</span>
          <h2>Choose Your <span className="bb-gradient-text">Celebration Package</span></h2>
          <p>Simple, transparent pricing. Pick the package that fits your occasion.</p>
        </div>
        {packages.length === 0 ? (
          <p className="bb-packages-empty">Loading packages…</p>
        ) : (
          <div className="bb-packages-grid">
            {[...packages]
              .filter((pkg) => !EXCLUDED_PKG_IDS.includes(pkg.package_id) && !pkg.package_name.toUpperCase().startsWith("SIMPLE"))
              .sort((a, b) => a.price - b.price)
              .map((pkg, idx) => (
                <PackageCard
                  key={pkg.package_id}
                  pkg={pkg}
                  desc={PKG_DESC[pkg.package_id] || ""}
                  images={venueImages}
                  startIdx={idx}
                  onBook={() => navigate("/booknow")}
                />
              ))}
          </div>
        )}
      </section>

      {/* ── VENUE ── */}
      <section className="bb-venue-section" id="venue">
      <div className="bb-venue">
        <div className="bb-venue-visual">
          <div className="bb-venue-img-mock">
            <div className="bb-venue-badge">🎈 Now Booking</div>
            <div className="bb-venue-tiles">
              <div className="vt vt1">
                <img src={imgScreen} alt="Birthday Setup" />
                <span>Birthday Setup</span>
              </div>
              <div className="vt vt2">
                <img src={imgDeco} alt="Balloon Décor" />
                <span>Balloon Décor</span>
              </div>
              <div className="vt vt3">
                <img src={imgSitting} alt="Seating Area" />
                <span>Seating Area</span>
              </div>
              <div className="vt vt4">
                <img src={imgHall} alt="Toy Corner" />
                <span>Toy Corner</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bb-venue-text">
          <span className="bb-pill bb-pill-dark">Our Space</span>
          <h2>A Venue Built <span className="bb-gradient-text">for Joy</span></h2>
          <p className="bb-venue-desc">
            Our thoughtfully designed space in Mysuru holds up to <strong>10 guests</strong> in the base package, with additional guests welcome at an extra charge. It transforms completely to match your event's theme. Whether it's a princess birthday, a cricket night, or a romantic dinner — Birthday Box becomes whatever you need it to be.
          </p>
          <div className="bb-perks-grid">
            <div className="bb-perk"><span>🎬</span> HD Projector &amp; Big Screen</div>
            <div className="bb-perk"><span>🎨</span> Custom Décor &amp; Lighting</div>
            <div className="bb-perk"><span>🔊</span> Premium Sound System</div>
            <div className="bb-perk"><span>❄️</span> Air-conditioned Comfort</div>
            <div className="bb-perk"><span>🅿️</span> Dedicated Parking</div>
            <div className="bb-perk"><span>🕐</span> Flexible Booking Slots</div>
          </div>
          <button className="bb-btn-primary" style={{ display: "inline-block", marginTop: "2rem" }} onClick={() => navigate("/booknow")}>
            Book This Venue
          </button>
        </div>
      </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="bb-gallery" id="gallery">
        <div className="bb-section-head">
          <span className="bb-pill bb-pill-dark">Real Celebrations</span>
          <h2>Moments That <span className="bb-gradient-text">Last Forever</span></h2>
          <p>Every event at Birthday Box is a memory in the making. Here's a peek inside.</p>
        </div>
        <div className="bb-gallery-grid">
          <div className="bb-gallery-item bb-gallery-tall">
            <img src={imgDeco} alt="Balloon Décor" />
            <div className="bb-gallery-overlay"><span>🎂 Balloon Décor</span></div>
          </div>
          <div className="bb-gallery-item">
            <img src={imgScreen} alt="Birthday + IPL Night" />
            <div className="bb-gallery-overlay"><span>🏏 IPL Night</span></div>
          </div>
          <div className="bb-gallery-item">
            <img src={imgSitting} alt="Seating Area" />
            <div className="bb-gallery-overlay"><span>✨ Seating Ambience</span></div>
          </div>
          <div className="bb-gallery-item bb-gallery-wide">
            <img src={imgHallOther} alt="Venue Hall" />
            <div className="bb-gallery-overlay"><span>🎊 The Venue</span></div>
          </div>
        </div>
        <div className="bb-gallery-cta">
          <a href="https://www.instagram.com/birthdaybox2025/" target="_blank" rel="noreferrer" className="bb-btn-primary">
            📸 See More on Instagram
          </a>
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
        <img src={logoPng} alt="Birthday Box" className="bb-footer-logo" />
        <div className="bb-footer-center">
          <p>📍 MIG5, Nrupatunga Road, Near Bus Depo Circle, Kuvempunagar, Mysuru – 570 023</p>
          <p>📞 <a href="tel:+918971543330">+91 89715 43330</a></p>
        </div>
        <p className="bb-footer-copy">© {new Date().getFullYear()} Birthday Box · All rights reserved.</p>
      </footer>

    </div>
  );
}
