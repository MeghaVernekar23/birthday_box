import React from "react";
import LogoMark from "../images/logo_mark.png";
import LogoWordmark from "../images/logo_wordmark.png";
import "../css/PartyLogo.css";

/* Birthday Box logo: the gift mark spins, then fireworks go off behind it.
   Pure CSS animation; honours prefers-reduced-motion (static logo). */

// Each firework: burst position (relative to the stage), radius, colours, stagger
const FIREWORKS = [
  { id: "a", x: "20%", y: "20%", r: 62, delay: 0, colors: ["#e91e8c", "#ff7ab8"] },
  { id: "b", x: "82%", y: "12%", r: 70, delay: 0.45, colors: ["#f7941d", "#ffd23f"] },
  { id: "c", x: "50%", y: "2%", r: 56, delay: 0.9, colors: ["#f05537", "#e91e8c"] },
];

const SPARKS = 16;

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
      <img src={LogoWordmark} alt="" className="pl-wordmark" />
    </div>
  );
}
