# Dashboard Redesign Spec
Date: 2026-04-20

## Overview

Clean, fix, and visually modernize the Dashboard page. Scope: bug fixes, layout improvements, visual redesign, and code quality. No architectural rewrite.

## 1. Header

Add a greeting header inside `Dashboard.jsx` (no new file):
- Time-based greeting: "Good morning / afternoon / evening, [username]"
- Today's date: formatted as "Sunday, April 20, 2026"
- Username from `localStorage.getItem("current_user")` parsed as JSON `.username`
- Styled: white background, left-aligned, subtle bottom border

## 2. Card Visual Redesign

Replace gradient blue backgrounds with flat white cards:
- Background: `#ffffff`
- Border radius: `16px`
- Box shadow: `0 2px 12px rgba(0,0,0,0.08)`
- Left accent border (4px solid) unique per card:
  - Bookings Today: `#4f8ef7` (blue)
  - Next Booking: `#7c5cbf` (purple)
  - Upcoming Holidays: `#f5a623` (amber)
  - Pending Payments: `#e8603c` (red-orange)
  - Celebrations & Packages: `#2bba8f` (teal)
  - Available Slots: no accent strip (full-width, different treatment)
- Icon box color matches accent color per card
- Uniform height per row via CSS grid `align-items: stretch` + `height: 100%` on cards
  - Top row cards: `200px` min-height
  - Mid row cards: `220px` min-height
  - Remove hardcoded px heights from individual component CSS rules

## 3. Bug Fixes & Code Quality

| # | File | Fix |
|---|------|-----|
| 1 | `PaymentStatus.jsx` | Move count + "View All" outside `.card-header` into `.card-content` flow |
| 2 | `Dashboard.css` | `font-weight: 5000` → `font-weight: 700` on `.past-payment-row td` |
| 3 | `UpcomingHolidays.jsx` | Remove duplicate `../css/Dashboard.css` import |
| 4 | `AvailableSlots.jsx` | Remove `AddBooking.css` import; move slot styles into `Dashboard.css` |
| 5 | `BookingTakenSummary.jsx` | Remove `console.log` |
| 6 | `CelebrationAndPackage.jsx` | Remove `console.log`; rename class `pending-payment-card` → `dashboard-info-card` |
| 7 | All cards | Add `loading` boolean state; show Bootstrap spinner while fetching |

## 4. Files Changed

- `frontend/src/pages/Dashboard.jsx` — add header, import header styles
- `frontend/src/pages/BookingTakenSummary.jsx` — spinner, remove console.log, new card class
- `frontend/src/pages/NextBooking.jsx` — spinner, new card class
- `frontend/src/pages/UpcomingHolidays.jsx` — spinner, fix duplicate import, new card class
- `frontend/src/pages/PaymentStatus.jsx` — fix layout bug, spinner, new card class
- `frontend/src/pages/CelebrationAndPackage.jsx` — spinner, remove console.log, rename class
- `frontend/src/pages/AvailableSlots.jsx` — remove AddBooking.css import, spinner
- `frontend/src/css/Dashboard.css` — full visual overhaul: white cards, accent borders, fix invalid font-weight, absorb AvailableSlots styles, add header styles, add spinner styles

## 5. Out of Scope

- Shared `DashboardCard` wrapper component (Option C)
- Error boundaries
- Consolidating modal CSS across all pages
- Any backend changes
