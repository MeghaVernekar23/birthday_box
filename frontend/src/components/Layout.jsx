import { Outlet, useNavigate, useLocation } from "react-router-dom";
import React, { useState } from "react";
import BirthdayLogo from "../images/logo.jpg";
import "../css/Layout.css";
import {
  LayoutDashboard,
  Users,
  CalendarPlus,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  History,
  ChevronDown,
  ChevronUp,
  LogOut,
  Package,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
  { label: "Customer details", path: "/customers", Icon: Users },
  { label: "Packages", path: "/packages", Icon: Package },
  { label: "Add booking", path: "/addbooking", Icon: CalendarPlus },
  {
    label: "Booking details",
    Icon: CalendarDays,
    children: [
      { label: "Today's bookings", path: "/bookings/today", Icon: CalendarCheck },
      { label: "Upcoming bookings", path: "/bookings/upcoming", Icon: CalendarClock },
      { label: "Older bookings", path: "/bookings/older", Icon: History },
    ],
  },
];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="layout-root">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar-logo">
          <img src={BirthdayLogo} alt="Logo" />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  className={`sidebar-nav-item sidebar-nav-item--parent${
                    bookingOpen ? " sidebar-nav-item--expanded" : ""
                  }`}
                  onClick={() => setBookingOpen((o) => !o)}
                >
                  <item.Icon size={17} />
                  <span>{item.label}</span>
                  {bookingOpen ? (
                    <ChevronUp size={14} className="sidebar-nav-item__chevron" />
                  ) : (
                    <ChevronDown size={14} className="sidebar-nav-item__chevron" />
                  )}
                </button>
                {bookingOpen && (
                  <div className="sidebar-submenu">
                    {item.children.map((child) => (
                      <button
                        key={child.path}
                        className={`sidebar-nav-item sidebar-nav-item--child${
                          isActive(child.path) ? " sidebar-nav-item--active" : ""
                        }`}
                        onClick={() => handleNav(child.path)}
                      >
                        <child.Icon size={15} />
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                key={item.path}
                className={`sidebar-nav-item${
                  isActive(item.path) ? " sidebar-nav-item--active" : ""
                }`}
                onClick={() => handleNav(item.path)}
              >
                <item.Icon size={17} />
                <span>{item.label}</span>
              </button>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-nav-item sidebar-logout"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="layout-main">
        {/* Top bar (mobile only) */}
        <header className="layout-topbar">
          <button
            className="topbar-hamburger"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            &#9776;
          </button>
          <img src={BirthdayLogo} alt="Logo" className="topbar-logo" />
        </header>

        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
