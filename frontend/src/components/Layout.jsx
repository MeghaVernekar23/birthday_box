import { Outlet, useNavigate, useLocation } from "react-router-dom";
import React, { useState } from "react";
import BirthdayLogo from "../images/logo.jpg";
import "../css/Layout.css";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "bi bi-speedometer2" },
  { label: "Customer Details", path: "/customers", icon: "bi bi-people" },
  { label: "Add Booking", path: "/addbooking", icon: "bi bi-calendar-plus" },
  {
    label: "Booking Details",
    icon: "bi bi-calendar2-week",
    children: [
      { label: "Today's Booking", path: "/bookings/today" },
      { label: "Upcoming Booking", path: "/bookings/upcoming" },
      { label: "Older Booking", path: "/bookings/older" },
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
                  <i className={item.icon} />
                  <span>{item.label}</span>
                  <i
                    className={`bi bi-chevron-${
                      bookingOpen ? "up" : "down"
                    } sidebar-nav-item__chevron`}
                  />
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
                        <i className="bi bi-dot" />
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
                <i className={item.icon} />
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
            <i className="bi bi-box-arrow-left" />
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
