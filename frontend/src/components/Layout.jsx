import { Outlet, useNavigate } from "react-router-dom";
import React from "react";
import BirthdayLogo from "../images/logo.jpg";

const Layout = () => {
  const navigate = useNavigate();

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "auto" }}>
      <div className="container-fluid h-100">
        <div className="row">
          <nav className="navbar navbar-expand-lg navbar-light">
            <div className="container-fluid">
              <img src={BirthdayLogo} alt="Logo" width="120" height="70" />
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNavDropdown"
                aria-controls="navbarNavDropdown"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNavDropdown">
                <ul className="navbar-nav" style={{ marginLeft: "30px" }}>
                  <li className="nav-item">
                    <a
                      className="nav-link active"
                      href="#"
                      onClick={() => {
                        navigate("/dashboard");
                      }}
                    >
                      Dashboard
                    </a>
                  </li>
                  <li className="nav-item" style={{ marginLeft: "10px" }}>
                    <a
                      className="nav-link"
                      href="#"
                      onClick={() => {
                        navigate("/customers");
                      }}
                    >
                      Customer Details
                    </a>
                  </li>
                  <li className="nav-item" style={{ marginLeft: "10px" }}>
                    <a
                      className="nav-link"
                      href="#"
                      onClick={() => {
                        navigate("/addbooking");
                      }}
                    >
                      Add Booking
                    </a>
                  </li>
                  <li
                    className="nav-item dropdown"
                    style={{ marginLeft: "10px" }}
                  >
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      id="navbarDropdownMenuLink"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Booking Details
                    </a>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="navbarDropdownMenuLink"
                    >
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={() => navigate("/bookings/today")}
                        >
                          Today's Booking
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={() => navigate("/bookings/upcoming")}
                        >
                          Upcoming Booking
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={() => navigate("/bookings/older")}
                        >
                          Older Booking
                        </a>
                      </li>
                    </ul>
                  </li>

                  <li className="nav-item" style={{ marginLeft: "10px" }}>
                    <a
                      className="nav-link"
                      href="#"
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

        <div className="row">
          {/* Main Content */}
          <div>
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
