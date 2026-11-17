import React from "react";
import "../css/neon.css";
import "../css/NeonText.css";

/* Text that switches on letter by letter like a neon sign, then stays lit.
   Each letter is a dim "tube" with a lit copy layered on top (::after)
   whose opacity runs one of the shared flicker animations in neon.css.

   <NeonText text="BIRTHDAY BOX" as="h1" className="bn-hero-title" />

   Flicker style and start time per letter come from `plan`; letters not
   listed fall back to a quick switch-on. The first and last letters
   struggle by default. */

const DEFAULT_MODES = ["struggle", "quick", "sputter", "quick", "quick", "sputter", "quick", "quick"];

function defaultPlan(chars) {
  const visible = chars.map((c, i) => (c.trim() ? i : -1)).filter((i) => i >= 0);
  const first = visible[0];
  const last = visible[visible.length - 1];
  return chars.map((c, i) => {
    if (!c.trim()) return null;
    if (i === first) return { mode: "struggle", d: 0.5 };
    if (i === last) return { mode: "struggle", d: 1.1 };
    // spread the rest between 0.7s and 1.6s in a stable, shuffled-looking order
    const order = (i * 7) % visible.length;
    return { mode: DEFAULT_MODES[i % DEFAULT_MODES.length], d: +(0.7 + (order / visible.length) * 0.9).toFixed(2) };
  });
}

export default function NeonText({ text, as: Tag = "span", className = "", plan }) {
  const chars = Array.from(text);
  const steps = plan || defaultPlan(chars);

  // Group letters by word so lines only ever break between words
  const words = [];
  chars.forEach((ch, i) => {
    if (!ch.trim()) words.push(null);
    else if (!words.length || words[words.length - 1] === null) words.push([i]);
    else words[words.length - 1].push(i);
  });

  return (
    <Tag className={`neon-text ${className}`} aria-label={text}>
      {words.map((w, wi) =>
        w === null ? (
          <span key={`g${wi}`} aria-hidden="true" className="neon-gap" />
        ) : (
          <span key={`w${wi}`} aria-hidden="true" className="neon-word">
            {w.map((i) => (
              <span
                key={i}
                className={`neon-ch neon-ch--${steps[i].mode}`}
                data-ch={chars[i]}
                style={{ "--d": `${steps[i].d}s` }}
              >
                {chars[i]}
              </span>
            ))}
          </span>
        )
      )}
    </Tag>
  );
}
