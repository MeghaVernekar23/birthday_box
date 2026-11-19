import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTour } from "../tour/createTour";
import "./ShopTour.css";

const STOPS = [
  {
    title: "The Hall",
    text: "Walk in to warm wooden floors, glowing toy cabinets, our wooden display wall and a little stage for photos.",
  },
  {
    title: "The Projector",
    text: "Step into the celebration room. A ceiling projector throws your movie, match or photo slideshow onto a big screen.",
  },
  {
    title: "The Seating",
    text: "Two tiers of plush tufted sofas with LED-lit steps, so every guest gets a great view of the screen.",
  },
  {
    title: "The Decor",
    text: "Balloon arch, sequin backdrop and themed décor, all set up and waiting before you arrive.",
  },
  {
    title: "The Whole Box",
    text: "That's Birthday Box. Drag to spin around, and pinch or scroll to zoom in.",
  },
];

export default function ShopTour() {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const tourRef = useRef(null);
  const [step, setStep] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    try {
      tourRef.current = createTour(mountRef.current);
    } catch (err) {
      console.error("3D tour failed to start:", err);
      setFailed(true);
    }
    return () => {
      tourRef.current?.dispose();
      tourRef.current = null;
    };
  }, []);

  useEffect(() => {
    tourRef.current?.goTo(step);
  }, [step]);

  const last = STOPS.length - 1;
  const stop = STOPS[step];

  return (
    <div className="tour-root">
      <div className="tour-canvas" ref={mountRef} />

      <header className="tour-top">
        <button className="tour-back" onClick={() => navigate("/")}>← Home</button>
        <span className="tour-brand">Birthday Box · 3D tour</span>
      </header>

      {failed ? (
        <div className="tour-card">
          <h2>3D view isn't available</h2>
          <p>Your browser couldn't start the 3D view. Try another browser, or see our photos on the home page.</p>
        </div>
      ) : (
        <div className="tour-card" aria-live="polite">
          <div className="tour-step-label">
            {step < last ? `Stop ${step + 1} of ${last}` : "Full view"}
          </div>
          <h2>{stop.title}</h2>
          <p>{stop.text}</p>
          <div className="tour-nav">
            <button className="tour-btn tour-btn-ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
              Back
            </button>
            <div className="tour-dots" role="tablist" aria-label="Tour stops">
              {STOPS.map((s, i) => (
                <button
                  key={s.title}
                  role="tab"
                  aria-selected={i === step}
                  aria-label={s.title}
                  className={`tour-dot${i === step ? " active" : ""}`}
                  onClick={() => setStep(i)}
                />
              ))}
            </div>
            {step < last ? (
              <button className="tour-btn" onClick={() => setStep((s) => s + 1)}>
                {step === last - 1 ? "See it all" : "Next"}
              </button>
            ) : (
              <button className="tour-btn" onClick={() => setStep(0)}>Start again</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
