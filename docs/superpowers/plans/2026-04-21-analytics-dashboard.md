# Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an analytics section to the dashboard showing monthly bookings trend, revenue stats, booking status breakdown, and celebration/package popularity — all derived from existing booking data.

**Architecture:** A new `AnalyticsSection` component fetches all bookings once via `fetchBookingsByFilter("all")`, computes all metrics with `useMemo`, and renders recharts charts. It is appended below the existing dashboard grid in `Dashboard.jsx`. No backend changes required.

**Tech Stack:** React 19, recharts, existing `bookingServices.js` fetch, CSS grid layout.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/src/pages/AnalyticsSection.jsx` | Create | All analytics charts and revenue cards |
| `frontend/src/pages/Dashboard.jsx` | Modify | Import and render `<AnalyticsSection />` |
| `frontend/src/css/Dashboard.css` | Modify | Layout styles for analytics section |
| `frontend/package.json` | Modify | Add `recharts` dependency |

---

### Task 1: Install recharts

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install recharts**

Run from `frontend/` directory:
```bash
npm install recharts
```

Expected output: recharts added to `node_modules`, `package.json` updated with `"recharts": "^2.x.x"`.

- [ ] **Step 2: Verify install**

```bash
grep recharts package.json
```

Expected: line like `"recharts": "^2.15.0"` (version may vary).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install recharts for analytics charts"
```

---

### Task 2: Add analytics CSS styles

**Files:**
- Modify: `frontend/src/css/Dashboard.css`

- [ ] **Step 1: Append analytics styles to Dashboard.css**

Open `frontend/src/css/Dashboard.css` and append at the end:

```css
/* ===== Analytics Section ===== */
.dashboard-grid-analytics {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analytics-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

.analytics-card h6 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 16px;
}

.analytics-revenue-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.analytics-revenue-card {
  background: #f8f9ff;
  border-radius: 12px;
  padding: 18px 20px;
  border-left: 4px solid transparent;
}

.analytics-revenue-card--green  { border-left-color: #2bba8f; }
.analytics-revenue-card--blue   { border-left-color: #4f8ef7; }
.analytics-revenue-card--amber  { border-left-color: #f5a623; }

.analytics-revenue-card .rev-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 6px;
  font-weight: 500;
}

.analytics-revenue-card .rev-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a2e;
}

.analytics-charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .analytics-charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .analytics-revenue-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .analytics-charts-grid,
  .analytics-revenue-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/css/Dashboard.css
git commit -m "style: add analytics section layout styles"
```

---

### Task 3: Create AnalyticsSection component

**Files:**
- Create: `frontend/src/pages/AnalyticsSection.jsx`

- [ ] **Step 1: Create the component**

Create `frontend/src/pages/AnalyticsSection.jsx` with this content:

```jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { fetchBookingsByFilter } from "../services/bookingServices";
import "../css/Dashboard.css";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_COLORS = {
  confirmed: "#2bba8f",
  pending: "#f5a623",
  cancelled: "#e8603c",
};

const BAR_COLORS = ["#4f8ef7","#7c5cbf","#2bba8f","#f5a623","#e8603c","#a0c4ff"];

function getMonthlyData(bookings) {
  const now = new Date();
  const counts = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    counts[key] = { label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, count: 0 };
  }
  bookings.forEach((b) => {
    if (!b.event_date) return;
    const d = new Date(b.event_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (counts[key]) counts[key].count += 1;
  });
  return Object.values(counts);
}

function getStatusData(bookings) {
  const counts = {};
  bookings.forEach((b) => {
    const s = (b.status || "unknown").toLowerCase();
    counts[s] = (counts[s] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function getCelebrationData(bookings) {
  const counts = {};
  bookings.forEach((b) => {
    const name = b.celebration_name || "Unknown";
    counts[name] = (counts[name] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function getPackageData(bookings) {
  const counts = {};
  bookings.forEach((b) => {
    const name = b.package_name || "Unknown";
    counts[name] = (counts[name] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function formatCurrency(val) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

const AnalyticsSection = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingsByFilter("all")
      .then(setBookings)
      .catch((err) => console.error("Analytics fetch error", err))
      .finally(() => setLoading(false));
  }, []);

  const monthlyData = useMemo(() => getMonthlyData(bookings), [bookings]);
  const statusData = useMemo(() => getStatusData(bookings), [bookings]);
  const celebrationData = useMemo(() => getCelebrationData(bookings), [bookings]);
  const packageData = useMemo(() => getPackageData(bookings), [bookings]);

  const totalBilled = useMemo(
    () => bookings.reduce((sum, b) => sum + (b.payment_total || 0), 0),
    [bookings]
  );
  const totalCollected = useMemo(
    () => bookings.reduce((sum, b) => sum + (b.payment_paid || 0), 0),
    [bookings]
  );
  const totalPending = totalBilled - totalCollected;

  if (loading) {
    return (
      <div className="dashboard-grid-analytics">
        <div className="analytics-card">
          <div className="card-spinner-wrapper">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-grid-analytics">
      {/* Monthly Bookings */}
      <div className="analytics-card">
        <h6>Monthly Bookings</h6>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" name="Bookings" fill="#4f8ef7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Cards */}
      <div className="analytics-card">
        <h6>Revenue Overview</h6>
        <div className="analytics-revenue-grid">
          <div className="analytics-revenue-card analytics-revenue-card--green">
            <div className="rev-label">Total Billed</div>
            <div className="rev-value">{formatCurrency(totalBilled)}</div>
          </div>
          <div className="analytics-revenue-card analytics-revenue-card--blue">
            <div className="rev-label">Total Collected</div>
            <div className="rev-value">{formatCurrency(totalCollected)}</div>
          </div>
          <div className="analytics-revenue-card analytics-revenue-card--amber">
            <div className="rev-label">Pending</div>
            <div className="rev-value">{formatCurrency(totalPending)}</div>
          </div>
        </div>
      </div>

      {/* Bottom row: Status + Celebrations + Packages */}
      <div className="analytics-charts-grid">
        {/* Booking Status Donut */}
        <div className="analytics-card">
          <h6>Booking Status</h6>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] || BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend
                formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Celebrations */}
        <div className="analytics-card">
          <h6>Top Celebrations</h6>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={celebrationData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" name="Bookings" radius={[0, 4, 4, 0]}>
                {celebrationData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Package Popularity */}
        <div className="analytics-card">
          <h6>Package Popularity</h6>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={packageData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" name="Bookings" radius={[0, 4, 4, 0]}>
                {packageData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
```

- [ ] **Step 2: Verify no import errors by checking recharts exports match usage**

The imports used:
`BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend`

All are standard recharts v2 exports — no issues expected.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/AnalyticsSection.jsx
git commit -m "feat: add AnalyticsSection component with charts"
```

---

### Task 4: Wire AnalyticsSection into Dashboard

**Files:**
- Modify: `frontend/src/pages/Dashboard.jsx`

- [ ] **Step 1: Add import to Dashboard.jsx**

Open `frontend/src/pages/Dashboard.jsx`. After the existing imports (line 8, after `import "../css/Dashboard.css";`), add:

```jsx
import AnalyticsSection from "./AnalyticsSection";
```

- [ ] **Step 2: Add AnalyticsSection to JSX**

After the closing `</div>` of `dashboard-grid-bottom` (currently line 70), add:

```jsx
      <div className="dashboard-grid-analytics">
        <AnalyticsSection />
      </div>
```

The full `Dashboard` return should now end with:

```jsx
      <div className="dashboard-grid-bottom">
        <div className="dashboard-card-col">
          <AvailableSlots />
        </div>
      </div>

      <div className="dashboard-grid-analytics">
        <AnalyticsSection />
      </div>
    </div>
  );
```

- [ ] **Step 3: Start dev server and verify**

```bash
cd frontend && npm run dev
```

Open browser at `http://localhost:5173`. Navigate to dashboard. Confirm:
- Monthly bookings bar chart renders below AvailableSlots
- Revenue cards show 3 values
- Status donut, celebrations bar, packages bar render in bottom row
- No console errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Dashboard.jsx
git commit -m "feat: wire AnalyticsSection into Dashboard"
```
