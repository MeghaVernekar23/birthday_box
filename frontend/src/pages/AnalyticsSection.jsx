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
    const [y, m] = b.event_date.split("-");
    const key = `${y}-${m}`;
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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingsByFilter("all")
      .then((data) => setBookings(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch((err) => { console.error("Analytics fetch error", err); setError("Failed to load analytics."); })
      .finally(() => setLoading(false));
  }, []);

  const monthlyData = useMemo(() => getMonthlyData(bookings), [bookings]);
  const statusData = useMemo(() => getStatusData(bookings), [bookings]);
  const celebrationData = useMemo(() => getCelebrationData(bookings), [bookings]);
  const packageData = useMemo(() => getPackageData(bookings), [bookings]);

  const { totalBilled, totalCollected } = useMemo(
    () =>
      bookings.reduce(
        (acc, b) => ({
          totalBilled: acc.totalBilled + (b.payment_total || 0),
          totalCollected: acc.totalCollected + (b.payment_paid || 0),
        }),
        { totalBilled: 0, totalCollected: 0 }
      ),
    [bookings]
  );
  const totalPending = Math.max(0, totalBilled - totalCollected);

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

  if (error) {
    return (
      <div className="dashboard-grid-analytics">
        <div className="analytics-card">
          <p style={{ color: "#e8603c", margin: 0 }}>{error}</p>
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
                {celebrationData.map((entry, i) => (
                  <Cell key={entry.name} fill={BAR_COLORS[i % BAR_COLORS.length]} />
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
                {packageData.map((entry, i) => (
                  <Cell key={entry.name} fill={BAR_COLORS[i % BAR_COLORS.length]} />
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