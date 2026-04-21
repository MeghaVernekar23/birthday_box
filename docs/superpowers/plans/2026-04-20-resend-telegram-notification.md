# Resend Telegram Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Resend Message" button in Today's Bookings that re-sends a Telegram notification about a booking to owners/admins.

**Architecture:** New backend endpoint fetches the booking and fires a Telegram message using the existing `telegram_service.py`. The frontend adds a Send icon button, a confirmation popup, and a service call — all following the same pattern as the existing Edit/Delete/View actions.

**Tech Stack:** FastAPI (Python), React (JSX), lucide-react icons, existing telegram_service.py

---

## File Map

| File | Change |
|------|--------|
| `backend/api/bookings.py` | Add `POST /bookings/resend-notification/{booking_id}` endpoint |
| `frontend/src/services/bookingServices.js` | Add `resendNotification(bookingId)` service function |
| `frontend/src/pages/TodaysBookings.jsx` | Add Send icon, `popupResend` state, handler, and confirmation popup |

---

### Task 1: Backend — Add resend-notification endpoint

**Files:**
- Modify: `backend/api/bookings.py`

- [ ] **Step 1: Add the import for telegram service at the top of bookings.py**

Open `backend/api/bookings.py`. After the existing imports, add:

```python
from services.telegram_service import build_booking_message, _send_message_sync
```

- [ ] **Step 2: Add the endpoint at the bottom of bookings.py**

Append this after the last existing route in `backend/api/bookings.py`:

```python
@bookings_router.post(
    "/resend-notification/{booking_id}",
    description="Resend Telegram notification for a booking to owners.",
)
def resend_booking_notification(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        booking = get_booking_details_by_id(booking_id=booking_id, db=db)
    except BookingDetailsNotFoundException:
        raise HTTPException(status_code=404, detail=f"Booking {booking_id} not found.")

    booking_dict = {
        "customer_name": booking.customer_name,
        "phone_number": booking.phone_number,
        "event_date": str(booking.event_date),
        "time_slot": booking.time_slot,
        "package_name": booking.package_name,
        "celebration_name": booking.celebration_name,
        "addons_note": booking.addons_note,
        "status": booking.status,
        "payment_paid": booking.payment_paid,
    }

    message = build_booking_message(booking_dict, label="🔁 Booking Reminder")
    _send_message_sync(message)

    return {"success": True}
```

- [ ] **Step 3: Verify the server starts without errors**

Run from `backend/` directory:
```bash
uvicorn main:app --reload
```
Expected: server starts, no import errors. Check `GET /docs` shows the new `POST /bookings/resend-notification/{booking_id}` endpoint listed.

- [ ] **Step 4: Commit**

```bash
git add backend/api/bookings.py
git commit -m "feat: add resend-notification endpoint for Telegram"
```

---

### Task 2: Frontend — Add resendNotification service function

**Files:**
- Modify: `frontend/src/services/bookingServices.js`

- [ ] **Step 1: Add the service function**

In `frontend/src/services/bookingServices.js`, append before the final blank lines:

```js
export const resendNotification = (bookingId) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/resend-notification/${bookingId}`,
        method: "POST",
    });
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/bookingServices.js
git commit -m "feat: add resendNotification service function"
```

---

### Task 3: Frontend — Wire up the Send button in TodaysBookings

**Files:**
- Modify: `frontend/src/pages/TodaysBookings.jsx`

- [ ] **Step 1: Add Send to the lucide-react import**

Find line 4 in `TodaysBookings.jsx`:
```js
import { Edit, Trash2, Eye } from "lucide-react";
```
Change to:
```js
import { Edit, Trash2, Eye, Send } from "lucide-react";
```

- [ ] **Step 2: Add resendNotification to the service imports**

Find the import block that includes `deleteBooking`, `fetchBookingById`, etc. Add `resendNotification`:
```js
import {
  fetchBookingsByFilter,
  fetchCelebrationType,
  fetchPackage,
  deleteBooking,
  fetchBookingById,
  updateBooking,
  fetchUpcomingHoliday,
  resendNotification,
} from "../services/bookingServices";
```

- [ ] **Step 3: Add popupResend state**

After the existing `popupView` state declaration (around line 47), add:
```js
const [popupResend, setPopupResend] = useState({ visible: false, booking: null });
```

- [ ] **Step 4: Add handler functions**

After `handleViewBooking` function (around line 266), add:

```js
const handleResendMessage = (booking) => {
  setPopupResend({ visible: true, booking });
};

const confirmResend = async () => {
  try {
    await resendNotification(popupResend.booking.booking_id);
    alert("Telegram notification sent successfully!");
  } catch (error) {
    console.error("Resend failed:", error);
    alert("Failed to send notification. Please try again.");
  } finally {
    setPopupResend({ visible: false, booking: null });
  }
};

const cancelResend = () => {
  setPopupResend({ visible: false, booking: null });
};
```

- [ ] **Step 5: Add Send icon button to ActionButtons**

Find the `ActionButtons` component (around line 104). Add the Send button after the Eye span:

```jsx
const ActionButtons = ({ row }) => (
  <div className="d-flex justify-content-center gap-3">
    <span title="Edit Customer">
      <Edit
        className="action-icon text-primary"
        size={18}
        onClick={() => handleEditBooking(row)}
      />
    </span>
    <span title="Delete Customer">
      <Trash2
        className="action-icon text-danger"
        size={18}
        onClick={() => handleDeleteBooking(row)}
      />
    </span>
    <span title="View Bookings">
      <Eye
        className="action-icon text-info"
        size={18}
        onClick={() => handleViewBooking(row)}
      />
    </span>
    <span title="Resend Telegram Notification">
      <Send
        className="action-icon text-success"
        size={18}
        onClick={() => handleResendMessage(row)}
      />
    </span>
  </div>
);
```

- [ ] **Step 6: Add the confirmation popup for resend**

In the JSX return block, after the `{popupEdit.visible && ...}` block (around line 296), add:

```jsx
{popupResend.visible && (
  <NotificationPopup
    message={`Resend Telegram notification for ${popupResend.booking.customer_name}?`}
    onConfirm={confirmResend}
    onCancel={cancelResend}
  />
)}
```

- [ ] **Step 7: Test in browser**

Start the dev server:
```bash
cd frontend && npm run dev
```
1. Navigate to Today's Bookings
2. Verify a green Send icon appears in each row's action column
3. Click it — confirm popup appears with the customer name
4. Click Cancel — popup closes, nothing sent
5. Click Send icon again, click Confirm — success alert appears (or error if Telegram not configured locally)

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/TodaysBookings.jsx
git commit -m "feat: add resend Telegram notification button to Today's Bookings"
```
