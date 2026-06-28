# Bookings Pages Redesign Spec
Date: 2026-04-20

## Overview

Redesign Today's Bookings, Upcoming Bookings, and Older Bookings pages from plain table wrappers into polished card-based layouts with page headers, stat chips, hover action bars, and responsive modals. Extend the shared DataTable component with a `viewMode="card"` prop so search, pagination, and actions remain centralized.

## 1. DataTable Extension

Add two new optional props to `frontend/src/components/Datatable.jsx`:

- `viewMode` — `"table"` (default, existing behavior) | `"card"`
- `cardTemplate` — render function `(row, actions) => JSX` called per data item when in card mode

When `viewMode="card"`:
- Skip `<table>` rendering entirely
- Render a CSS grid: `display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px`
- Call `cardTemplate(row, actions)` for each row
- Search input, pagination bar, and title bar remain unchanged

Global DataTable style fixes in `frontend/src/css/Datatable.css`:
- Row hover: `#520a6c` → `#eef2ff` (soft blue, matches dashboard palette)
- Table header background `#b2c1f7` — keep as-is

## 2. Shared Booking Card Design

New file: `frontend/src/css/BookingCards.css`  
Imported by all three booking pages.

Card anatomy:
```
┌─[4px accent border]────────────────────┐
│  Customer Name              [Date badge]│
│  ─────────────────────────────────────│
│  🕐 Time slot    📦 Package             │
│  🎉 Celebration  💳 Payment status pill │
│  👤 Guests                             │
│  ─────────────────────────────────────│
│  [hover: Edit]  [View]  [Delete]       │
└────────────────────────────────────────┘
```

Card base styles:
- Background: `#ffffff`
- Border-radius: `12px`
- Box-shadow: `0 2px 12px rgba(0,0,0,0.08)`
- Left accent border (4px solid) per page:
  - Today's Bookings: `#4f8ef7` (blue) — class `.booking-card--blue`
  - Upcoming Bookings: `#7c5cbf` (purple) — class `.booking-card--purple`
  - Older Bookings: `#8a9bb0` (gray) — class `.booking-card--gray`
- `position: relative; overflow: hidden`

Action bar:
- `position: absolute; bottom: 0; left: 0; right: 0`
- Hidden by default: `transform: translateY(100%); transition: transform 0.2s ease`
- Card hover: `transform: translateY(0)`
- Edit button: blue; View button: gray; Delete button: red
- Older Bookings: View only (no Edit/Delete buttons rendered)

Payment status pill:
- Paid: green (`#2bba8f` bg, white text) — `Number(payment_paid) >= Number(payment_total) && payment_total > 0`
- Partial: amber (`#f5a623` bg, white text) — `Number(payment_paid) > 0 && Number(payment_paid) < Number(payment_total)`
- Unpaid: red (`#e8603c` bg, white text) — otherwise
- Derived client-side from `row.payment_paid` and `row.payment_total` fields

Date badge:
- Top-right corner of card
- Rounded pill, `#eef2ff` background, `#3b5bdb` text
- Formatted as "Apr 20"

## 3. Page-Level Design

Each page gets a page header above the DataTable, styled same as the dashboard header (white bg, left-aligned, subtle bottom border).

### Today's Bookings header
```
Today's Bookings                          [date]
● Total Today: N  ● Confirmed: N  ● Pending Payment: N
```

### Upcoming Bookings header
```
Upcoming Bookings                         [date]
● Total Upcoming: N  ● This Week: N  ● This Month: N
```

### Older Bookings header
```
Older Bookings
● Total Records: N
```

Stat chips: white pill, `border: 1px solid #e0e6f1`, colored left dot (matches page accent color). Computed client-side from fetched data — no extra API calls.

Each page gets its own CSS file for page-level header/chip styles:
- `frontend/src/css/TodaysBookings.css`
- `frontend/src/css/UpcomingBookings.css`
- `frontend/src/css/OlderBookings.css`

Booking.css retains modal styles only.

## 4. Loading State

All three pages get `loading` boolean state (same pattern as dashboard cards):
- `true` on mount, `false` in `finally` block after fetch
- Show Bootstrap spinner while loading: `<div className="spinner-border" role="status">`
- Spinner centered in a wrapper div with `min-height: 200px`

## 5. Modal Improvements

The 7-step edit modal (TodaysBookings + UpcomingBookings) gets responsive CSS only — no logic changes:
- Modal width: `min(95vw, 900px)` instead of fixed `1000px max-width`
- Mobile (`< 768px`): stepper collapses — hide step labels, show `Step N of 7` text + `<progress>` bar
- Stepper accent color `#b2c1f7` stays unchanged

OlderBookings view modal (single-step): same responsive width fix.

## 6. Code Quality

| # | File | Fix |
|---|------|-----|
| 1 | `TodaysBookings.jsx` | Remove `console.log("entered edit booking submission", formValues)` |
| 2 | `OlderBookings.jsx` | Remove stale `showModal` state + `fetchBookingsByFilter("todayandfuture")` call in useEffect (unused) |
| 3 | All three pages | Add loading state + spinner |
| 4 | All three pages | Replace `<div className="container">` wrapper with page-header + DataTable |

## 7. Files Changed

- `frontend/src/components/Datatable.jsx` — add `viewMode` + `cardTemplate` props
- `frontend/src/css/Datatable.css` — fix hover color
- `frontend/src/css/BookingCards.css` — new: shared booking card styles
- `frontend/src/css/TodaysBookings.css` — new: page header + stat chip styles
- `frontend/src/css/UpcomingBookings.css` — new: page header + stat chip styles
- `frontend/src/css/OlderBookings.css` — new: page header + stat chip styles
- `frontend/src/pages/TodaysBookings.jsx` — card mode, page header, spinner, remove console.log
- `frontend/src/pages/UpcomingBookings.jsx` — card mode, page header, spinner
- `frontend/src/pages/OlderBookings.jsx` — card mode, page header, spinner, remove dead code
- `frontend/src/css/Booking.css` — responsive modal width + mobile stepper collapse

## 8. Out of Scope

- Sorting in DataTable
- Filtering by date range
- Any backend changes
- Consolidating TodaysBookings.jsx + UpcomingBookings.jsx into one component
- Error boundaries
