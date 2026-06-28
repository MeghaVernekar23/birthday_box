# Bookings Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Today's, Upcoming, and Older Bookings pages from plain table wrappers into card-based layouts with page headers, stat chips, hover action bars, loading spinners, and a responsive modal.

**Architecture:** Extend `DataTable` with a `viewMode="card"` + `cardTemplate` prop so search/pagination stay centralized; each booking page defines its own `BookingCard` local component and switches to card mode. Shared card styles live in `BookingCards.css`; per-page header/chip styles in page-specific CSS files.

**Tech Stack:** React 18, Bootstrap 5, Lucide React icons, CSS custom properties, `npm run build` for verification.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/components/Datatable.jsx` | Modify | Add `viewMode` + `cardTemplate` props; render card grid when `viewMode="card"` |
| `frontend/src/css/Datatable.css` | Modify | Fix hover color `#520a6c` → `#eef2ff` |
| `frontend/src/css/BookingCards.css` | Create | Shared booking card styles (card base, accent variants, pill, action bar, date badge) |
| `frontend/src/css/TodaysBookings.css` | Create | Page header + stat chip styles for Today's page |
| `frontend/src/css/UpcomingBookings.css` | Create | Page header + stat chip styles for Upcoming page |
| `frontend/src/css/OlderBookings.css` | Create | Page header + stat chip styles for Older page |
| `frontend/src/pages/TodaysBookings.jsx` | Modify | Page header, stat chips, card mode, spinner, remove console.log |
| `frontend/src/pages/UpcomingBookings.jsx` | Modify | Page header, stat chips, card mode, spinner |
| `frontend/src/pages/OlderBookings.jsx` | Modify | Page header, stat chip, card mode, spinner, remove dead code |
| `frontend/src/css/Booking.css` | Modify | Responsive modal width + mobile stepper collapse |

---

### Task 1: DataTable — card mode + hover color fix

**Files:**
- Modify: `frontend/src/components/Datatable.jsx`
- Modify: `frontend/src/css/Datatable.css`

- [ ] **Step 1: Fix hover color in Datatable.css**

Open `frontend/src/css/Datatable.css`. Find:
```css
.table tbody tr:hover {
  background-color: #520a6c;
  transition: background-color 0.2s ease-in-out;
}
```
Replace with:
```css
.table tbody tr:hover {
  background-color: #eef2ff;
  transition: background-color 0.2s ease-in-out;
}
```

Also add at the bottom of the file (before the `@media` block):
```css
/* Card grid layout (used when viewMode="card") */
.datatable-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 4px 0 8px;
}
```

- [ ] **Step 2: Add viewMode + cardTemplate props to DataTable.jsx**

Open `frontend/src/components/Datatable.jsx`. Replace the component signature:
```jsx
const DataTable = ({
  title,
  columns,
  data,
  actions = [],
  searchableFields = [],
  rowClassName,
  actionButton,
}) => {
```
With:
```jsx
const DataTable = ({
  title,
  columns,
  data,
  actions = [],
  searchableFields = [],
  rowClassName,
  actionButton,
  viewMode = "table",
  cardTemplate,
}) => {
```

- [ ] **Step 3: Add card grid render branch in DataTable.jsx**

Find the `<div className="table-wrapper">` block. Replace it entirely with:
```jsx
      <div className="table-wrapper">
        {viewMode === "card" ? (
          <div className="datatable-card-grid">
            {paginatedData.length === 0 ? (
              <p className="text-center text-muted py-4">No results found</p>
            ) : (
              paginatedData.map((row, index) => (
                <div key={row.booking_id || row.id || index}>
                  {cardTemplate(row)}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="table-body-scroll">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="text-center">
                      {col.label}
                    </th>
                  ))}
                  {actions.length > 0 && <th className="text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                      className="text-center"
                    >
                      No results found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={
                        typeof rowClassName === "function"
                          ? rowClassName(row)
                          : ""
                      }
                    >
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render ? col.render(row) : row[col.key] ?? "--"}
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td>
                          {actions.map((ActionBtn, i) => (
                            <ActionBtn key={i} row={row} />
                          ))}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination-bar">
```

Note: keep everything after `<div className="pagination-bar">` exactly as it was. Only wrap the existing table in the `else` branch.

- [ ] **Step 4: Verify build passes**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && npm run build 2>&1 | tail -20
```
Expected: `✓ built in` with no errors.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && git add src/components/Datatable.jsx src/css/Datatable.css && git commit -m "feat: add card mode to DataTable; fix hover color"
```

---

### Task 2: BookingCards.css — shared card styles

**Files:**
- Create: `frontend/src/css/BookingCards.css`

- [ ] **Step 1: Create the file**

Create `frontend/src/css/BookingCards.css` with:
```css
/* ===== Booking Card Base ===== */
.booking-card {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  border-left-width: 4px;
  border-left-color: transparent;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  min-height: 180px;
}

.booking-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* ===== Accent Variants ===== */
.booking-card--blue  { border-left-color: #4f8ef7; }
.booking-card--purple { border-left-color: #7c5cbf; }
.booking-card--gray  { border-left-color: #8a9bb0; }

/* ===== Card Header ===== */
.booking-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #f0f4ff;
}

.booking-card__name {
  font-weight: 600;
  font-size: 0.97rem;
  color: #213547;
  flex: 1;
  margin-right: 8px;
}

.booking-card__date-badge {
  background: #eef2ff;
  color: #3b5bdb;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ===== Card Body ===== */
.booking-card__body {
  padding: 10px 16px 48px; /* bottom padding reserves space for action bar */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
  flex: 1;
}

.booking-card__field {
  font-size: 0.84rem;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== Payment Status Pill ===== */
.booking-card__pill {
  grid-column: 1 / -1;
  display: inline-flex;
  align-self: start;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  width: fit-content;
}

.booking-card__pill--paid    { background: #2bba8f; color: #fff; }
.booking-card__pill--partial { background: #f5a623; color: #fff; }
.booking-card__pill--unpaid  { background: #e8603c; color: #fff; }

/* ===== Hover Action Bar ===== */
.booking-card__actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.97);
  border-top: 1px solid #f0f4ff;
  transform: translateY(100%);
  transition: transform 0.2s ease;
}

.booking-card:hover .booking-card__actions {
  transform: translateY(0);
}

.booking-card__actions .btn {
  font-size: 0.78rem;
  padding: 4px 12px;
  border-radius: 6px;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .booking-card__body {
    grid-template-columns: 1fr;
  }

  .booking-card__actions {
    transform: translateY(0); /* always visible on mobile (no hover) */
    position: static;
    border-top: 1px solid #f0f4ff;
    padding: 8px 14px;
  }

  .booking-card {
    min-height: unset;
  }
}
```

- [ ] **Step 2: Verify build**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && npm run build 2>&1 | tail -5
```
Expected: no errors (file not imported anywhere yet — that's fine).

- [ ] **Step 3: Commit**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && git add src/css/BookingCards.css && git commit -m "feat: add BookingCards.css shared card styles"
```

---

### Task 3: Page CSS files — headers and stat chips

**Files:**
- Create: `frontend/src/css/TodaysBookings.css`
- Create: `frontend/src/css/UpcomingBookings.css`
- Create: `frontend/src/css/OlderBookings.css`

- [ ] **Step 1: Create TodaysBookings.css**

```css
/* ===== Today's Bookings Page ===== */
.bookings-page-wrapper {
  padding: 0;
}

.bookings-page-header {
  background: #ffffff;
  border-bottom: 1px solid #e0e6f1;
  padding: 18px 0 14px;
  margin-bottom: 20px;
}

.bookings-page-header h4 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #213547;
  margin: 0 0 4px;
}

.bookings-page-header .page-date {
  font-size: 0.85rem;
  color: #6b7a8d;
  margin: 0;
}

.bookings-stat-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #ffffff;
  border: 1px solid #e0e6f1;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 0.82rem;
  color: #4a5568;
  font-weight: 500;
}

.stat-chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-chip__dot--blue   { background: #4f8ef7; }
.stat-chip__dot--green  { background: #2bba8f; }
.stat-chip__dot--amber  { background: #f5a623; }
.stat-chip__dot--purple { background: #7c5cbf; }
.stat-chip__dot--gray   { background: #8a9bb0; }

.bookings-spinner-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

@media (max-width: 768px) {
  .bookings-stat-chips {
    gap: 8px;
  }
  .stat-chip {
    font-size: 0.78rem;
    padding: 4px 10px;
  }
}
```

- [ ] **Step 2: Create UpcomingBookings.css**

```css
/* ===== Upcoming Bookings Page ===== */
.bookings-page-wrapper {
  padding: 0;
}

.bookings-page-header {
  background: #ffffff;
  border-bottom: 1px solid #e0e6f1;
  padding: 18px 0 14px;
  margin-bottom: 20px;
}

.bookings-page-header h4 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #213547;
  margin: 0 0 4px;
}

.bookings-page-header .page-date {
  font-size: 0.85rem;
  color: #6b7a8d;
  margin: 0;
}

.bookings-stat-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #ffffff;
  border: 1px solid #e0e6f1;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 0.82rem;
  color: #4a5568;
  font-weight: 500;
}

.stat-chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-chip__dot--blue   { background: #4f8ef7; }
.stat-chip__dot--green  { background: #2bba8f; }
.stat-chip__dot--amber  { background: #f5a623; }
.stat-chip__dot--purple { background: #7c5cbf; }
.stat-chip__dot--gray   { background: #8a9bb0; }

.bookings-spinner-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

@media (max-width: 768px) {
  .bookings-stat-chips {
    gap: 8px;
  }
  .stat-chip {
    font-size: 0.78rem;
    padding: 4px 10px;
  }
}
```

- [ ] **Step 3: Create OlderBookings.css**

```css
/* ===== Older Bookings Page ===== */
.bookings-page-wrapper {
  padding: 0;
}

.bookings-page-header {
  background: #ffffff;
  border-bottom: 1px solid #e0e6f1;
  padding: 18px 0 14px;
  margin-bottom: 20px;
}

.bookings-page-header h4 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #213547;
  margin: 0 0 4px;
}

.bookings-stat-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #ffffff;
  border: 1px solid #e0e6f1;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 0.82rem;
  color: #4a5568;
  font-weight: 500;
}

.stat-chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-chip__dot--blue   { background: #4f8ef7; }
.stat-chip__dot--green  { background: #2bba8f; }
.stat-chip__dot--amber  { background: #f5a623; }
.stat-chip__dot--purple { background: #7c5cbf; }
.stat-chip__dot--gray   { background: #8a9bb0; }

.bookings-spinner-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

@media (max-width: 768px) {
  .bookings-stat-chips {
    gap: 8px;
  }
  .stat-chip {
    font-size: 0.78rem;
    padding: 4px 10px;
  }
}
```

- [ ] **Step 4: Commit**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && git add src/css/TodaysBookings.css src/css/UpcomingBookings.css src/css/OlderBookings.css && git commit -m "feat: add page-level CSS for booking pages"
```

---

### Task 4: TodaysBookings.jsx — cards, header, spinner, fix console.log

**Files:**
- Modify: `frontend/src/pages/TodaysBookings.jsx`

Context: The file is ~1156 lines. It has a 7-step edit modal, delete confirmation, view popup, and a DataTable. We add: two CSS imports, `loading` state, helper functions, a `BookingCard` component, stat chip computation, and change the return JSX wrapper. The modal JSX is untouched.

- [ ] **Step 1: Add CSS imports**

Find the existing import at the top:
```jsx
import "../css/Booking.css";
```
Replace with:
```jsx
import "../css/Booking.css";
import "../css/TodaysBookings.css";
import "../css/BookingCards.css";
```

- [ ] **Step 2: Remove console.log**

Find at line ~167:
```jsx
  const submitBookingDetails = async (formValues) => {
    console.log("entered edit booking submission", formValues);
```
Remove only the `console.log` line, leaving the function otherwise unchanged:
```jsx
  const submitBookingDetails = async (formValues) => {
```

- [ ] **Step 3: Add loading state**

Find the existing state declarations block. After:
```jsx
  const [holidayDates, setHolidayDates] = useState([]);
```
Add:
```jsx
  const [loading, setLoading] = useState(true);
```

- [ ] **Step 4: Add loading to fetchTodaysBookings**

Find:
```jsx
  const fetchTodaysBookings = async () => {
    const data = await fetchBookingsByFilter("today");
    setTodaysBookings(data);
  };
```
Replace with:
```jsx
  const fetchTodaysBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchBookingsByFilter("today");
      setTodaysBookings(data);
    } finally {
      setLoading(false);
    }
  };
```

- [ ] **Step 5: Add helper functions and BookingCard component**

Add these functions directly before the `return (` statement of the `Bookings` component:

```jsx
  const getPaymentStatus = (row) => {
    const total = Number(row.payment_total) || 0;
    const paid = Number(row.payment_paid) || 0;
    if (total > 0 && paid >= total) return { key: "paid", label: "Paid" };
    if (paid > 0 && paid < total) return { key: "partial", label: "Partial" };
    return { key: "unpaid", label: "Unpaid" };
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getTodayStats = () => {
    const total = todayBookingData.length;
    const confirmed = todayBookingData.filter(
      (b) => (b.status || "").toLowerCase() === "confirmed"
    ).length;
    const pendingPayment = todayBookingData.filter((b) => {
      const total = Number(b.payment_total) || 0;
      const paid = Number(b.payment_paid) || 0;
      return total > 0 && paid < total;
    }).length;
    return { total, confirmed, pendingPayment };
  };

  const BookingCard = ({ row }) => {
    const ps = getPaymentStatus(row);
    return (
      <div className="booking-card booking-card--blue">
        <div className="booking-card__header">
          <span className="booking-card__name">{row.customer_name || "—"}</span>
          <span className="booking-card__date-badge">{formatEventDate(row.event_date)}</span>
        </div>
        <div className="booking-card__body">
          <div className="booking-card__field">🕐 {row.time_slot || "—"}</div>
          <div className="booking-card__field">📦 {row.package_name || "—"}</div>
          <div className="booking-card__field">🎉 {row.celebration_name || "—"}</div>
          <div className="booking-card__field">👤 {row.updated_by || "—"}</div>
          <span className={`booking-card__pill booking-card__pill--${ps.key}`}>{ps.label}</span>
        </div>
        <div className="booking-card__actions">
          <button className="btn btn-sm btn-primary" onClick={() => handleEditBooking(row)}>Edit</button>
          <button className="btn btn-sm btn-secondary" onClick={() => handleViewBooking(row)}>View</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBooking(row)}>Delete</button>
        </div>
      </div>
    );
  };
```

- [ ] **Step 6: Replace return JSX wrapper**

Find the return statement. It currently starts with:
```jsx
  return (
    <div>
```
or similar top-level wrapper. Look for the structure:
```jsx
      <div className="container">
        <DataTable
          title="Today's Bookings"
          columns={columns}
          data={todayBookingData}
          actions={[ActionButtons]}
          searchableFields={["customer_name", "phone_number"]}
        />
```

Replace the `<div className="container">` wrapper and its `<DataTable>` call with:

```jsx
  const stats = getTodayStats();

  return (
    <div className="bookings-page-wrapper">
      <div className="bookings-page-header">
        <h4>Today's Bookings</h4>
        <p className="page-date">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <div className="bookings-stat-chips">
          <span className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--blue" />
            Total Today: {stats.total}
          </span>
          <span className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--green" />
            Confirmed: {stats.confirmed}
          </span>
          <span className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--amber" />
            Pending Payment: {stats.pendingPayment}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bookings-spinner-wrapper">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <DataTable
          title=""
          columns={columns}
          data={todayBookingData}
          actions={[ActionButtons]}
          searchableFields={["customer_name", "phone_number"]}
          viewMode="card"
          cardTemplate={(row) => <BookingCard row={row} />}
        />
      )}
```

**Important:** Keep all the existing modal JSX that follows (popupDelete, popupEdit, popupView, showModal). Only change the wrapper `<div className="container">` and the DataTable call. The closing `</div>` of the old container becomes the closing `</div>` of `.bookings-page-wrapper`.

- [ ] **Step 7: Verify build**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && npm run build 2>&1 | tail -20
```
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && git add src/pages/TodaysBookings.jsx && git commit -m "feat: TodaysBookings — card layout, page header, spinner, remove console.log"
```

---

### Task 5: UpcomingBookings.jsx — cards, header, spinner

**Files:**
- Modify: `frontend/src/pages/UpcomingBookings.jsx`

Context: Nearly identical structure to TodaysBookings. Fetches `future` bookings. State variable is `upcomingBookingData`. Same 7-step modal. Accent color: purple. Stat chips: Total Upcoming, This Week, This Month.

- [ ] **Step 1: Add CSS imports**

Find:
```jsx
import "../css/Booking.css";
```
Replace with:
```jsx
import "../css/Booking.css";
import "../css/UpcomingBookings.css";
import "../css/BookingCards.css";
```

- [ ] **Step 2: Add loading state**

After the last `useState` declaration, add:
```jsx
  const [loading, setLoading] = useState(true);
```

- [ ] **Step 3: Add loading to fetchUpcomingBookings**

Find:
```jsx
  const fetchUpcomingBookings = async () => {
    const data = await fetchBookingsByFilter("future");
    setUpcomingBookings(data);
  };
```
Replace with:
```jsx
  const fetchUpcomingBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchBookingsByFilter("future");
      setUpcomingBookings(data);
    } finally {
      setLoading(false);
    }
  };
```

- [ ] **Step 4: Add helper functions and BookingCard component**

Add directly before `return (`:

```jsx
  const getPaymentStatus = (row) => {
    const total = Number(row.payment_total) || 0;
    const paid = Number(row.payment_paid) || 0;
    if (total > 0 && paid >= total) return { key: "paid", label: "Paid" };
    if (paid > 0 && paid < total) return { key: "partial", label: "Partial" };
    return { key: "unpaid", label: "Unpaid" };
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getUpcomingStats = () => {
    const total = upcomingBookingData.length;
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const thisWeek = upcomingBookingData.filter((b) => {
      if (!b.event_date) return false;
      const d = new Date(b.event_date);
      return d >= now && d <= weekEnd;
    }).length;
    const thisMonth = upcomingBookingData.filter((b) => {
      if (!b.event_date) return false;
      const d = new Date(b.event_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total, thisWeek, thisMonth };
  };

  const BookingCard = ({ row }) => {
    const ps = getPaymentStatus(row);
    return (
      <div className="booking-card booking-card--purple">
        <div className="booking-card__header">
          <span className="booking-card__name">{row.customer_name || "—"}</span>
          <span className="booking-card__date-badge">{formatEventDate(row.event_date)}</span>
        </div>
        <div className="booking-card__body">
          <div className="booking-card__field">🕐 {row.time_slot || "—"}</div>
          <div className="booking-card__field">📦 {row.package_name || "—"}</div>
          <div className="booking-card__field">🎉 {row.celebration_name || "—"}</div>
          <div className="booking-card__field">👤 {row.updated_by || "—"}</div>
          <span className={`booking-card__pill booking-card__pill--${ps.key}`}>{ps.label}</span>
        </div>
        <div className="booking-card__actions">
          <button className="btn btn-sm btn-primary" onClick={() => handleEditBooking(row)}>Edit</button>
          <button className="btn btn-sm btn-secondary" onClick={() => handleViewBooking(row)}>View</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBooking(row)}>Delete</button>
        </div>
      </div>
    );
  };
```

- [ ] **Step 5: Replace return JSX wrapper**

Find the `<div className="container">` wrapper and its DataTable. Replace with:

```jsx
  const stats = getUpcomingStats();

  return (
    <div className="bookings-page-wrapper">
      <div className="bookings-page-header">
        <h4>Upcoming Bookings</h4>
        <p className="page-date">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <div className="bookings-stat-chips">
          <span className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--purple" />
            Total Upcoming: {stats.total}
          </span>
          <span className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--blue" />
            This Week: {stats.thisWeek}
          </span>
          <span className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--amber" />
            This Month: {stats.thisMonth}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bookings-spinner-wrapper">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <DataTable
          title=""
          columns={columns}
          data={upcomingBookingData}
          actions={[ActionButtons]}
          searchableFields={["customer_name", "phone_number"]}
          viewMode="card"
          cardTemplate={(row) => <BookingCard row={row} />}
        />
      )}
```

Keep all modal JSX unchanged. Close with `</div>` for `.bookings-page-wrapper`.

- [ ] **Step 6: Verify build**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && npm run build 2>&1 | tail -20
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && git add src/pages/UpcomingBookings.jsx && git commit -m "feat: UpcomingBookings — card layout, page header, spinner"
```

---

### Task 6: OlderBookings.jsx — cards, header, spinner, remove dead code

**Files:**
- Modify: `frontend/src/pages/OlderBookings.jsx`

Context: Simpler ~220-line file. View-only (Eye icon only). Has stale `showModal` state and a `useEffect` that calls `fetchBookingsByFilter("todayandfuture")` unnecessarily — remove both. Accent color: gray. Single stat chip: Total Records.

- [ ] **Step 1: Replace imports**

Find:
```jsx
import "../css/Booking.css";
```
Replace with:
```jsx
import "../css/Booking.css";
import "../css/OlderBookings.css";
import "../css/BookingCards.css";
```

- [ ] **Step 2: Remove dead state and dead useEffect**

Remove these two lines:
```jsx
  const [showModal, setShowModal] = useState(false);
```

And remove the entire `useEffect` block that depends on `showModal`:
```jsx
  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");

      const fetchModalData = async () => {
        try {
          fetchBookingsByFilter("todayandfuture");
        } catch (err) {
          console.error("Error fetching modal data", err);
        }
      };
      fetchModalData();
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);
```

- [ ] **Step 3: Add loading state**

After:
```jsx
  const [olderBookingData, setOlderBookings] = useState([]);
```
Add:
```jsx
  const [loading, setLoading] = useState(true);
```

- [ ] **Step 4: Add loading to fetchOlderBookings**

Find:
```jsx
  const fetchOlderBookings = async () => {
    const data = await fetchBookingsByFilter("past");
    setOlderBookings(data);
  };
```
Replace with:
```jsx
  const fetchOlderBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchBookingsByFilter("past");
      setOlderBookings(data);
    } finally {
      setLoading(false);
    }
  };
```

- [ ] **Step 5: Add helper functions and BookingCard component**

Add directly before `return (`:

```jsx
  const getPaymentStatus = (row) => {
    const total = Number(row.payment_total) || 0;
    const paid = Number(row.payment_paid) || 0;
    if (total > 0 && paid >= total) return { key: "paid", label: "Paid" };
    if (paid > 0 && paid < total) return { key: "partial", label: "Partial" };
    return { key: "unpaid", label: "Unpaid" };
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const BookingCard = ({ row }) => {
    const ps = getPaymentStatus(row);
    return (
      <div className="booking-card booking-card--gray">
        <div className="booking-card__header">
          <span className="booking-card__name">{row.customer_name || "—"}</span>
          <span className="booking-card__date-badge">{formatEventDate(row.event_date)}</span>
        </div>
        <div className="booking-card__body">
          <div className="booking-card__field">🕐 {row.time_slot || "—"}</div>
          <div className="booking-card__field">📦 {row.package_name || "—"}</div>
          <div className="booking-card__field">🎉 {row.celebration_name || "—"}</div>
          <div className="booking-card__field">👤 {row.updated_by || "—"}</div>
          <span className={`booking-card__pill booking-card__pill--${ps.key}`}>{ps.label}</span>
        </div>
        <div className="booking-card__actions">
          <button className="btn btn-sm btn-secondary" onClick={() => handleViewBooking(row)}>View</button>
        </div>
      </div>
    );
  };
```

- [ ] **Step 6: Replace return JSX wrapper**

The current return is:
```jsx
  return (
    <div className="container">
      <DataTable
        title="Older Bookings"
        columns={columns}
        data={olderBookingData}
        actions={[ActionView]}
        searchableFields={["customer_name", "phone_number"]}
      />

      {popupView.visible && popupView.booking && (
        ...view modal JSX...
      )}
    </div>
  );
```

Replace with:
```jsx
  return (
    <div className="bookings-page-wrapper">
      <div className="bookings-page-header">
        <h4>Older Bookings</h4>
        <div className="bookings-stat-chips">
          <span className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--gray" />
            Total Records: {olderBookingData.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bookings-spinner-wrapper">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <DataTable
          title=""
          columns={columns}
          data={olderBookingData}
          actions={[ActionView]}
          searchableFields={["customer_name", "phone_number"]}
          viewMode="card"
          cardTemplate={(row) => <BookingCard row={row} />}
        />
      )}

      {popupView.visible && popupView.booking && (
        <div className="modal-overlay">
          ...keep existing view modal JSX exactly as-is...
        </div>
      )}
    </div>
  );
```

Keep the view popup modal JSX exactly as it was — only the outer wrapper and DataTable call change.

- [ ] **Step 7: Verify build**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && npm run build 2>&1 | tail -20
```
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && git add src/pages/OlderBookings.jsx && git commit -m "feat: OlderBookings — card layout, page header, spinner, remove dead code"
```

---

### Task 7: Booking.css — responsive modal

**Files:**
- Modify: `frontend/src/css/Booking.css`

- [ ] **Step 1: Fix modal-box width**

Find:
```css
.modal-box {
  position: relative;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  height: 70vh;
  max-height: 70vh; 
  width: 90%;
  max-width: 1000px;
```
Replace with:
```css
.modal-box {
  position: relative;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  height: 70vh;
  max-height: 70vh;
  width: 90%;
  max-width: min(95vw, 900px);
```

- [ ] **Step 2: Add mobile stepper collapse**

Find the existing `@media (max-width: 768px)` block in Booking.css:
```css
@media (max-width: 768px) {
  .step {
    font-size: 0.75rem;
    min-width: 90px;
  }
  .step-number {
    height: 28px;
    width: 28px;
    line-height: 28px;
    font-size: 0.9rem;
  }
}
```
Replace with:
```css
@media (max-width: 768px) {
  .modal-box {
    padding: 14px;
  }

  /* Collapse stepper labels on small screens */
  .step {
    font-size: 0;     /* hide label text */
    min-width: 36px;
  }
  .step-number {
    height: 28px;
    width: 28px;
    line-height: 28px;
    font-size: 0.85rem;
  }

  /* Show compact step indicator above stepper */
  .stepper::before {
    content: attr(data-step-label);
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #213547;
    margin-bottom: 8px;
    white-space: nowrap;
  }
}
```

Note: The `data-step-label` attribute approach requires the stepper `<div>` in TodaysBookings/UpcomingBookings to have `data-step-label={`Step ${step} of 7`}`. Add that attribute to the stepper div in both files.

- [ ] **Step 3: Add data-step-label to stepper in TodaysBookings.jsx**

In `TodaysBookings.jsx`, find the stepper div (search for `className="stepper"`):
```jsx
<div className="stepper">
```
Replace with:
```jsx
<div className="stepper" data-step-label={`Step ${step} of 7`}>
```

- [ ] **Step 4: Add data-step-label to stepper in UpcomingBookings.jsx**

Same change in `UpcomingBookings.jsx`:
```jsx
<div className="stepper">
```
Replace with:
```jsx
<div className="stepper" data-step-label={`Step ${step} of 7`}>
```

- [ ] **Step 5: Verify build**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && npm run build 2>&1 | tail -20
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
cd /c/Users/nikhi/Desktop/birthday_box/frontend && git add src/css/Booking.css src/pages/TodaysBookings.jsx src/pages/UpcomingBookings.jsx && git commit -m "feat: responsive modal width and mobile stepper collapse"
```

---

## Self-Review

**Spec coverage check:**
- ✅ DataTable `viewMode="card"` + `cardTemplate` prop — Task 1
- ✅ DataTable hover color fix — Task 1
- ✅ BookingCards.css shared styles — Task 2
- ✅ Card base, accent variants (blue/purple/gray) — Task 2
- ✅ Payment status pill (paid/partial/unpaid logic) — Task 2 + Tasks 4/5/6
- ✅ Date badge, action bar with hover slide-up — Task 2
- ✅ Page CSS files — Task 3
- ✅ Page headers + stat chips — Tasks 4/5/6
- ✅ Today's stat chips: total/confirmed/pending payment — Task 4
- ✅ Upcoming stat chips: total/this week/this month — Task 5
- ✅ Older stat chip: total records — Task 6
- ✅ Loading spinner on all three pages — Tasks 4/5/6
- ✅ Remove console.log from TodaysBookings — Task 4
- ✅ Remove dead showModal + stale useEffect from OlderBookings — Task 6
- ✅ Responsive modal width `min(95vw, 900px)` — Task 7
- ✅ Mobile stepper collapse — Task 7
- ✅ OlderBookings: View only, no Edit/Delete in card — Task 6

**Placeholder scan:** No TBDs, TODOs, or vague steps found.

**Type consistency:** `upcomingBookingData` used in Task 5 matches the state variable name confirmed from reading UpcomingBookings.jsx. `olderBookingData` confirmed from OlderBookings.jsx. `todayBookingData` confirmed from TodaysBookings.jsx. `handleEditBooking`, `handleDeleteBooking`, `handleViewBooking` confirmed present in both TodaysBookings and UpcomingBookings.
