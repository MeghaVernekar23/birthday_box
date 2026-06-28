# Resend Telegram Notification — Design Spec
**Date:** 2026-04-20

## Overview
Add a "Resend Message" action button in the Today's Bookings module that allows staff to re-send a Telegram notification about a booking to the owners/admins.

## Backend

**New endpoint:** `POST /bookings/resend-notification/{booking_id}`

- Fetches the full booking record by ID (including package_name, celebration_name)
- Builds the message using existing `build_booking_message()` from `telegram_service.py` with label `"🔁 Booking Reminder"`
- Sends via existing `_send_message_sync()`
- Returns `{"success": true}` on success, raises HTTP 404 if booking not found

**File:** `backend/api/bookings.py`
**No new services or DB changes required.**

## Frontend

**File:** `frontend/src/pages/TodaysBookings.jsx`

1. Import `Send` icon from lucide-react (alongside existing Edit, Trash2, Eye)
2. Add a `popupResend` state: `{ visible: false, booking: null }`
3. Add `handleResendMessage(row)` — sets `popupResend` visible
4. Add `confirmResend()` — calls new `resendNotification(booking_id)` service function, shows success/error alert, resets popup
5. Add `Send` icon button in `ActionButtons` component
6. Add `NotificationPopup` for resend confirmation: *"Resend Telegram notification for [Customer Name]?"*

**New service function** in `frontend/src/services/bookingServices.js`:
```js
resendNotification(bookingId) -> POST /bookings/resend-notification/{bookingId}
```

## User Flow
1. Staff sees today's bookings table
2. Clicks the Send icon on a row
3. Confirmation popup appears
4. On confirm → API call → success alert "Notification sent!"
5. On cancel → popup closes, nothing happens
