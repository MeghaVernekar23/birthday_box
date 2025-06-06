import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import BirthdayLogo from "../images/logo.jpg";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <div className="container-fluid h-100">
        <div className="row">
          <nav
            className="navbar navbar-expand-md"
            style={{ backgroundColor: "white", borderBottom: "1px solid #ddd" }}
          >
            <div className="container-fluid">
              <a className="navbar-brand" href="#"></a>
              <img
                src={BirthdayLogo}
                alt="Logo"
                style={{
                  height: "60px",
                  objectFit: "contain",
                  marginLeft: "-10px",
                }}
              />
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      onClick={() => {
                        localStorage.clear();
                        navigate("/");
                      }}
                    >
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar + Main Content */}
        <div className="row">
          {/* Sidebar */}
          <div
            className={`p-3 ${
              collapsed ? "col-md-1" : "col-md-2"
            } transition-all`}
            style={{
              backgroundColor: "white",
              minHeight: "calc(100vh - 70px)",
              borderRight: "1px solid #ddd",
              transition: "all 0.3s ease",
            }}
          >
            {" "}
            <div className="d-flex flex-column align-items-start mb-4">
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary"
                  onClick={toggleSidebar}
                  title="Toggle Sidebar"
                >
                  ☰
                </button>
              </div>
            </div>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <button
                  className={`nav-link ${
                    location.pathname === "/dashboard" ? "active" : ""
                  }`}
                  title="Dashboard"
                  onClick={() => navigate("/dashboard")}
                >
                  {collapsed ? "🏠" : "Dashboard"}
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link ${
                    location.pathname === "/customers" ? "active" : ""
                  }`}
                  title="Customer Details"
                  onClick={() => navigate("/customers")}
                >
                  {collapsed ? "👥" : "Customer Details"}
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link ${
                    location.pathname === "/bookings" ? "active" : ""
                  }`}
                  title="Booking Details"
                  onClick={() => navigate("/bookings")}
                >
                  {collapsed ? "👥" : "Booking Details"}
                </button>
              </li>
              <li className="nav-item mb-2">
                <button
                  className={`nav-link ${
                    location.pathname === "/addbooking" ? "active" : ""
                  }`}
                  title="Add Booking"
                  onClick={() => navigate("/addbooking")}
                >
                  {collapsed ? "👥" : "Add Booking"}
                </button>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className={`${collapsed ? "col-md-11" : "col-md-10"} p-4`}>
            <main>
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
