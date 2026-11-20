import React, { useEffect, useState } from "react";
import { VENUE_PHOTOS } from "../images/venuePhotos";
import "./PhotoCarousel.css";

export { VENUE_PHOTOS };

// Accept either a photo object ({ src, srcSet, alt }) or a plain URL string.
const toPhoto = (p) => (typeof p === "string" ? { src: p } : p);

/** Image carousel for a card: arrows, dots, swipe and a rating badge. */
export default function PhotoCarousel({
  images = VENUE_PHOTOS,
  startIdx = 0,
  alt = "",
  rating = "⭐ 4.9",
  // Cards are full-width on phones and ~280–420px wide on bigger screens.
  sizes = "(max-width: 600px) 100vw, 420px",
}) {
  const [idx, setIdx] = useState(startIdx % images.length);
  const [touchX, setTouchX] = useState(null);
  const go = (i) => setIdx((i + images.length) % images.length);
  const onArrow = (e, i) => {
    e.stopPropagation();
    e.preventDefault();
    go(i);
  };

  // Warm the cache for the next photo so the arrow feels instant.
  useEffect(() => {
    const next = toPhoto(images[(idx + 1) % images.length]);
    const img = new Image();
    img.sizes = sizes;
    if (next.srcSet) img.srcset = next.srcSet;
    img.src = next.src;
  }, [idx, images, sizes]);

  const photo = toPhoto(images[idx]);

  return (
    <div
      className="pc-wrap"
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX == null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
        setTouchX(null);
      }}
    >
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={photo.srcSet ? sizes : undefined}
        alt={alt || photo.alt || ""}
        className="pc-img"
        style={photo.pos ? { objectPosition: photo.pos } : undefined}
        loading="lazy"
        decoding="async"
        draggable="false"
      />
      <button type="button" className="pc-arrow pc-arrow-left" aria-label="Previous photo" onClick={(e) => onArrow(e, idx - 1)}>‹</button>
      <button type="button" className="pc-arrow pc-arrow-right" aria-label="Next photo" onClick={(e) => onArrow(e, idx + 1)}>›</button>
      <div className="pc-dots">
        {images.map((_, i) => (
          <button
            type="button"
            key={i}
            aria-label={`Photo ${i + 1}`}
            className={`pc-dot${i === idx ? " active" : ""}`}
            onClick={(e) => onArrow(e, i)}
          />
        ))}
      </div>
      {rating && <div className="pc-rating">{rating}</div>}
    </div>
  );
}
