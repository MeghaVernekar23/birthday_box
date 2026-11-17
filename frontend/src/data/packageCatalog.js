// Single source of truth for package prices shown to customers.
// Used by the booking form (BookNow) and the public menu (/menu).
// The menu is purely static: it reads this file and calls no API.

export const PACKAGES_1HR = [
  { id: "p1h1", label: "BASIC = BALLON DECORATION + PRIVATE SCRENING + MUSIC", price: "₹999" },
  // { id: "p1h2", label: "CLASSIC PACKAGE = BASIC + GAMES + GIFT", price: "₹1,299" },
  // { id: "p1h3", label: "DYNAMIC PACKAGE = CLASSIC + FOG ENTRY", price: "₹1,799" },
  // { id: "p1h4", label: "ELITE PACKAGE = DYNAMIC + 1/2KG PASTY", price: "₹2,199" },
  // { id: "p1h5", label: "GOLDEN GLOW PACKAGE = ELITE + FIRE ENTRY", price: "₹2,699" },
  // { id: "p1h6", label: "DREAM CELEBRATION PACKAGE = GOLDEN GLOW + COMPLEMENTARY WELCOME DRINKS (FRESH JUICE) + 1HR PHOTOSHOOT (50 PICKS)", price: "₹4,999" },
  // { id: "p1h7", label: "INSTAGRAM REEL EDIT USING IPHONE 16 PRO MAX (PROFESSIONALLY EDITED & INSTAGRAM-READY)", price: "₹1,000" }, // hidden
];

export const PACKAGES_1HR30 = [
  { id: "p15h1", label: "BASIC = BALLON DECORATION + PRIVATE SCRENING + MUSIC", price: "₹1,499" },
  { id: "p15h2", label: "CLASSIC PACKAGE = BASIC + GAMES + GIFT", price: "₹1,799" },
  { id: "p15h3", label: "DYNAMIC PACKAGE = CLASSIC + FOG ENTRY", price: "₹2,499" },
  { id: "p15h4", label: "ELITE PACKAGE = DYNAMIC + 1/2KG PASTY", price: "₹2,899" },
  { id: "p15h5", label: "GOLDEN GLOW PACKAGE = ELITE + FIRE ENTRY", price: "₹3,699" },
  { id: "p15h6", label: "DREAM CELEBRATION PACKAGE = GOLDEN GLOW + COMPLEMENTARY WELCOME DRINKS (FRESH JUICE) + 1HR PHOTOSHOOT (50 PICKS)", price: "₹5,999" },
  // { id: "p15h7", label: "INSTAGRAM REEL EDIT USING IPHONE 16 PRO MAX (PROFESSIONALLY EDITED & INSTAGRAM-READY)", price: "₹1,000" },
];

export const PACKAGES_2HR = [
  { id: "p2h1", label: "BASIC = BALLON DECORATION + PRIVATE SCRENING + MUSIC", price: "₹1,998" },
  { id: "p2h2", label: "CLASSIC PACKAGE = BASIC + GAMES + GIFT", price: "₹2,598" },
  { id: "p2h3", label: "DYNAMIC PACKAGE = CLASSIC + FOG ENTRY", price: "₹3,598" },
  { id: "p2h4", label: "ELITE PACKAGE = DYNAMIC + 1/2KG PASTY", price: "₹4,398" },
  { id: "p2h5", label: "GOLDEN GLOW PACKAGE = ELITE + FIRE ENTRY", price: "₹5,398" },
  { id: "p2h6", label: "DREAM CELEBRATION PACKAGE = GOLDEN GLOW + COMPLEMENTARY WELCOME DRINKS (FRESH JUICE) + 1HR PHOTOSHOOT (50 PICKS)", price: "₹9,998" },
  // { id: "p2h7", label: "INSTAGRAM REEL EDIT USING IPHONE 16 PRO MAX (PROFESSIONALLY EDITED & INSTAGRAM-READY)", price: "₹2,000" },
];

export const PACKAGES_3HR = [
  { id: "p3h1", label: "BASIC = BALLON DECORATION + PRIVATE SCRENING + MUSIC", price: "₹2,997" },
  { id: "p3h2", label: "CLASSIC PACKAGE = BASIC + GAMES + GIFT", price: "₹3,897" },
  { id: "p3h3", label: "DYNAMIC PACKAGE = CLASSIC + FOG ENTRY", price: "₹5,397" },
  { id: "p3h4", label: "ELITE PACKAGE = DYNAMIC + 1/2KG PASTY", price: "₹6,597" },
  { id: "p3h5", label: "GOLDEN GLOW PACKAGE = ELITE + FIRE ENTRY", price: "₹8,097" },
  { id: "p3h6", label: "DREAM CELEBRATION PACKAGE = GOLDEN GLOW + COMPLEMENTARY WELCOME DRINKS (FRESH JUICE) + 1HR PHOTOSHOOT (50 PICKS)", price: "₹14,997" },
];

export const ADDONS = [
  { id: "a9", label: "Cake (½ kg) - ₹500", price: 500 },
  { id: "a1", label: "Customised Cake", price: null },
  { id: "a2", label: "Customized Decoration", price: null },
  { id: "a3", label: "Photography - ₹1,500/hr", price: 1500 },
  { id: "a4", label: "Fire Entry - ₹800", price: 800 },
  { id: "a5", label: "Popcorn", price: null },
  { id: "a6", label: "Fog Entry - ₹750", price: 750 },
  { id: "a7", label: "Instagram Reel Edit by iPhone 16 Pro Max - ₹1,000", price: 1000 },
  { id: "a8", label: "Photography by iPhone 16 Pro Max - ₹1,000 (30 Photos)", price: 1000 },
];

// The ½ kg cake add-on offered on cards for packages without a cake.
export const CAKE_ADDON = ADDONS.find((a) => a.id === "a9");

/** "₹1,499" -> 1499 */
export const priceToNumber = (p) => parseInt(String(p || "").replace(/[^\d]/g, ""), 10) || 0;
export const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// ── Menu presentation ───────────────────────────────────────────────

// Durations shown on the menu, each mapped to the booking form's time-slot value.
export const MENU_DURATIONS = [
  { key: "1h", title: "1 Hour", timeSlot: "1 Hour (Quick)", packages: PACKAGES_1HR },
  { key: "1.5h", title: "1.5 Hours", timeSlot: "1.5 Hours (Classic)", packages: PACKAGES_1HR30, popular: true },
  { key: "2h", title: "2 Hours", timeSlot: "2 Hours", packages: PACKAGES_2HR },
  { key: "3h", title: "3 Hours", timeSlot: "3 Hours", packages: PACKAGES_3HR },
];

// "Every celebration includes" highlights on the menu.
// ⚠️ Owner: keep only what is actually true for Birthday Box — edit/remove freely.
export const EVERY_BOOKING_PERKS = [
  { icon: "🔒", title: "Fully private space", text: "The whole room is yours — no strangers, no sharing." },
  { icon: "🎈", title: "Decor ready on arrival", text: "Balloon decoration set up before you walk in." },
  { icon: "📺", title: "Your own screening", text: "Play a movie, birthday video or photo slideshow." },
  { icon: "🎵", title: "Music of your choice", text: "Your playlist, your vibe, all through the party." },
  { icon: "👥", title: "10 guests included", text: "Bring family & friends at no extra cost." },
  { icon: "🎂", title: "Cake-cutting moment", text: "Bring your own cake, or add our ½ kg cake for just ₹500." },
  { icon: "📸", title: "Photo-ready backdrop", text: "Made for pictures, selfies and Instagram reels." },
  { icon: "🤝", title: "Help with surprises", text: "Tell us your plan — our team helps you pull it off." },
];

// Occasions we host (matches the celebration types on the booking form).
export const OCCASIONS = [
  "Birthdays", "Anniversaries", "Proposals", "Baby showers", "Gender reveals",
  "Bride-to-be", "Teen nights", "Private movies", "Retirements", "Mother's & Father's Day",
];

// Each tier includes everything in the tier before it, plus its own extras.
export const PACKAGE_TIERS = [
  { tier: "BASIC", name: "Basic", emoji: "🎈", adds: ["Balloon decoration", "Private screening", "Music"] },
  { tier: "CLASSIC", name: "Classic", emoji: "🎲", adds: ["Games", "Gift"] },
  { tier: "DYNAMIC", name: "Dynamic", emoji: "🌫️", adds: ["Fog entry"] },
  { tier: "ELITE", name: "Elite", emoji: "🍰", adds: ["½ kg pastry cake"] },
  { tier: "GOLDEN", name: "Golden Glow", emoji: "🔥", adds: ["Fire entry"] },
  { tier: "DREAM", name: "Dream Celebration", emoji: "✨", adds: ["Complimentary welcome drinks (fresh juice)", "1 hr photoshoot (50 pics)"] },
];

/** Tier info for a package label like "CLASSIC PACKAGE = BASIC + GAMES + GIFT". */
export const tierFor = (label) => {
  const head = (label || "").split("=")[0].trim().toUpperCase().split(/\s+/)[0];
  const idx = PACKAGE_TIERS.findIndex((t) => t.tier === head);
  if (idx === -1) return null;
  const t = PACKAGE_TIERS[idx];
  return {
    ...t,
    previous: idx > 0 ? PACKAGE_TIERS[idx - 1].name : null,
    // full cumulative list, e.g. Classic = Basic's items + games + gift
    includes: PACKAGE_TIERS.slice(0, idx + 1).flatMap((x) => x.adds),
    inherited: PACKAGE_TIERS.slice(0, idx).flatMap((x) => x.adds),
    // Elite and above include a pastry cake; lower tiers get the cake add-on hint
    hasCake: PACKAGE_TIERS.slice(0, idx + 1).some((x) => x.adds.some((a) => /cake/i.test(a))),
  };
};
