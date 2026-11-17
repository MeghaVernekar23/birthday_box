import React, { useState } from "react";
import imgScreen from "../images/screen.webp";
import imgDoll from "../images/doll.webp";
import imgDeco from "../images/deco.webp";
import imgHall from "../images/hall.webp";
import imgHallOther from "../images/hall_other.webp";
import imgSitting from "../images/sitting.webp";
import "./PhotoCarousel.css";

// Same venue photos (and order) as the package cards on the home page.
export const VENUE_PHOTOS = [imgScreen, imgDeco, imgSitting, imgHall, imgHallOther, imgDoll];

/** Image carousel for a card: arrows, dots and a rating badge. */
export default function PhotoCarousel({ images = VENUE_PHOTOS, startIdx = 0, alt = "", rating = "⭐ 4.9" }) {
  const [idx, setIdx] = useState(startIdx % images.length);
  const go = (e, i) => {
    e.stopPropagation();
    e.preventDefault();
    setIdx((i + images.length) % images.length);
  };

  return (
    <div className="pc-wrap">
      <img src={images[idx]} alt={alt} className="pc-img" loading="lazy" />
      <button type="button" className="pc-arrow pc-arrow-left" aria-label="Previous photo" onClick={(e) => go(e, idx - 1)}>‹</button>
      <button type="button" className="pc-arrow pc-arrow-right" aria-label="Next photo" onClick={(e) => go(e, idx + 1)}>›</button>
      <div className="pc-dots">
        {images.map((_, i) => (
          <button
            type="button"
            key={i}
            aria-label={`Photo ${i + 1}`}
            className={`pc-dot${i === idx ? " active" : ""}`}
            onClick={(e) => go(e, i)}
          />
        ))}
      </div>
      {rating && <div className="pc-rating">{rating}</div>}
    </div>
  );
}
