// Venue photos, each with smaller variants so phones don't download the
// full-size file. Use with <VenueImg> (or spread `src`/`srcSet` onto an <img>).
// Variants were generated from bb_images/*.jpeg at 480w / 960w (WebP).
import frontFull from "./front.webp";
import front480 from "./front-480.webp";
import mainDecFull from "./main_dec.webp";
import mainDec480 from "./main_dec-480.webp";
import mainDec960 from "./main_dec-960.webp";
import hallMainFull from "./hall_main.webp";
import hallMain480 from "./hall_main-480.webp";
import hallMain960 from "./hall_main-960.webp";
import hallMain1Full from "./hall_main_1.webp";
import hallMain1_480 from "./hall_main_1-480.webp";
import hallMain1_960 from "./hall_main_1-960.webp";
import entryFull from "./entry_2.webp";
import entry480 from "./entry_2-480.webp";
import deco1 from "./deco_1.webp";
import deco2 from "./deco_2.webp";
import deco3Full from "./deco_3.webp";
import deco3_480 from "./deco_3-480.webp";

// `pos` = CSS object-position: which part of the photo stays in frame when a
// tile crops it (e.g. keep the light-up name letters at the bottom visible).
const photo = (alt, full, fullW, variants = {}, pos = "center") => ({
  alt,
  pos,
  src: full,
  srcSet: [...Object.entries(variants).map(([w, s]) => `${s} ${w}w`), `${full} ${fullW}w`].join(", "),
});

export const PHOTOS = {
  mainDec: photo("Gold and white birthday backdrop with Happy Birthday neon sign", mainDecFull, 1600, { 480: mainDec480, 960: mainDec960 }, "center 70%"),
  deco1: photo("Pink and gold balloon décor with name lights", deco1, 408, {}, "center 80%"),
  deco2: photo("Pink balloon arch with Happy Birthday sign", deco2, 408, {}, "center 55%"),
  deco3: photo("Bride-to-be décor with balloon arch and name lights", deco3Full, 720, { 480: deco3_480 }, "center 38%"),
  hallMain: photo("Tiered velvet sofas in the celebration room", hallMainFull, 1280, { 480: hallMain480, 960: hallMain960 }, "center 45%"),
  hallMain1: photo("Celebration room seating with balloon décor", hallMain1Full, 1280, { 480: hallMain1_480, 960: hallMain1_960 }, "center 55%"),
  entry: photo("Toy hall with lit display shelves", entryFull, 960, { 480: entry480 }, "center 50%"),
  front: photo("Floral entrance with hanging lights and glass birds", frontFull, 960, { 480: front480 }, "center 45%"),
};

// Order used by the package-card carousels on /menu.
export const VENUE_PHOTOS = [
  PHOTOS.mainDec, PHOTOS.deco1, PHOTOS.hallMain, PHOTOS.deco2,
  PHOTOS.entry, PHOTOS.deco3, PHOTOS.front, PHOTOS.hallMain1,
];
