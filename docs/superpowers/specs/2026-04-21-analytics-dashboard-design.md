# Analytics Dashboard — Design Spec

**Date:** 2026-04-21

## Overview

Add an analytics section to the dashboard showing monthly bookings trend and key business metrics derived from all bookings in the database.

## Data Source

Single API call: `fetchBookingsByFilter("all")` — returns all bookings with fields:
- `event_date`, `status`, `payment_total`, `payment_paid`, `celebration_name`, `package_name`

All chart data computed frontend-side via `useMemo`. No new backend endpoints required.

## Components

### New: `AnalyticsSection.jsx`

Self-contained component. Fetches all bookings once on mount. Derives all metrics via `useMemo`. Renders:

1. **Monthly Bookings Bar Chart** (`recharts` BarChart)
   - X-axis: month/year labels (last 12 months)
   - Y-axis: booking count
   - Data: group bookings by `event_date` month

2. **Revenue Stat Cards** (3 cards in a row)
   - Total Billed: sum of `payment_total`
   - Total Collected: sum of `payment_paid`
   - Pending: Total Billed − Total Collected

3. **Booking Status Donut** (`recharts` PieChart)
   - Slices: confirmed / pending / cancelled
   - Legend below chart

4. **Top Celebrations Bar** (`recharts` BarChart, horizontal)
   - Y-axis: celebration_name
   - X-axis: count

5. **Package Popularity Bar** (`recharts` BarChart, horizontal)
   - Y-axis: package_name
   - X-axis: count

### Modified: `Dashboard.jsx`

Add `<AnalyticsSection />` below existing `dashboard-grid-bottom`.

### Modified: `Dashboard.css`

Add `.dashboard-grid-analytics` — full-width row. Inner grid: charts laid out responsively.

## Library

`recharts` — installed via npm. React-native, composable, lightweight.

## Files Changed

| File | Change |
|------|--------|
| `frontend/package.json` | Add `recharts` dependency |
| `frontend/src/pages/AnalyticsSection.jsx` | New component |
| `frontend/src/pages/Dashboard.jsx` | Import and render AnalyticsSection |
| `frontend/src/css/Dashboard.css` | Analytics layout styles |

## Layout

```
[ Monthly Bookings Bar Chart — full width ]
[ Total Billed ] [ Total Collected ] [ Pending ]
[ Status Donut ] [ Top Celebrations ] [ Package Popularity ]
```

Responsive: collapses to single column on mobile.
