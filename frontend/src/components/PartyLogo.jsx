import React from "react";
import LogoMark from "../images/logo_mark.png";
import LogoWordmark from "../images/logo_wordmark.png";
import "../css/neon.css";
import "../css/PartyLogo.css";

/* Birthday Box logo: the gift mark spins, fireworks go off behind it, and
   the wordmark lights up letter by letter like a neon sign.
   Pure CSS animation; honours prefers-reduced-motion (static logo). */

// Each firework: burst position (relative to the stage), radius, colours, stagger
const FIREWORKS = [
  { id: "a", x: "20%", y: "20%", r: 62, delay: 0, colors: ["#e91e8c", "#ff7ab8"] },
  { id: "b", x: "82%", y: "12%", r: 70, delay: 0.45, colors: ["#f7941d", "#ffd23f"] },
  { id: "c", x: "50%", y: "2%", r: 56, delay: 0.9, colors: ["#f05537", "#e91e8c"] },
];

const SPARKS = 16;

// Neon letters of "BIRTHDAY BOX" (R+T and A+Y touch in the logo font, so they
// light together). Overlay images are generated full-size, one per group.
const GLOW_IMAGES = Object.entries(
  import.meta.glob("../images/logo_wm_glow_*.png", { eager: true, import: "default" })
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, url]) => url);
const LETTERS = [
  { label: "B",  glow: "255,82,169",  d: 0.9, mode: "struggle" },
  { label: "I",  glow: "255,86,162",  d: 1.15, mode: "quick" },
  { label: "RT", glow: "255,92,150",  d: 1.45, mode: "sputter" },
  { label: "H",  glow: "255,100,135", d: 1.25, mode: "quick" },
  { label: "D",  glow: "255,105,125", d: 1.65, mode: "quick" },
  { label: "AY", glow: "255,114,108", d: 1.35, mode: "sputter" },
  { label: "B",  glow: "255,124,90",  d: 1.85, mode: "quick" },
  { label: "O",  glow: "255,131,77",  d: 1.55, mode: "quick" },
  { label: "X",  glow: "255,137,65",  d: 1.5, mode: "struggle" },
];

function Firework({ x, y, r, delay, colors }) {
  return (
    <div className="fw" style={{ left: x, top: y, "--fw-delay": `${delay}s`, "--fw-r": `${r}px` }} aria-hidden="true">
      <span className="fw-trail" style={{ "--c": colors[0] }} />
      <span className="fw-flash" style={{ "--c": colors[1] }} />
      {Array.from({ length: SPARKS }, (_, i) => {
        const c = colors[i % 2];
        return (
          <React.Fragment key={i}>
            <span className="fw-spark" style={{ "--a": `${(360 / SPARKS) * i}deg`, "--c": c }} />
            <span
              className="fw-dot"
              style={{ "--a": `${(360 / SPARKS) * i + 360 / SPARKS / 2}deg`, "--c": colors[(i + 1) % 2] }}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function PartyLogo() {
  return (
    <div className="party-logo" role="img" aria-label="Birthday Box">
      <div className="pl-stage">
        {FIREWORKS.map((f) => (
          <Firework key={f.id} {...f} />
        ))}
        <img src={LogoMark} alt="" className="pl-mark" />
      </div>
      <div className="pl-word">
        <img src={LogoWordmark} alt="" className="pl-wordmark" />
        {/* Neon sign: each letter sputters on, then stays lit */}
        {LETTERS.map((l, i) => (
          <img
            key={i}
            src={GLOW_IMAGES[i]}
            alt=""
            className={`pl-bulb pl-bulb--${l.mode}`}
            style={{ "--glow": l.glow, "--d": `${l.d}s` }}
          />
        ))}
      </div>
    </div>
  );
}
