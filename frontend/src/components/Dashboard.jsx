import { useState, React, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";
import BirthdayLogo from "../images/logo.jpg";
import { Edit, Trash2, Search } from "lucide-react";
import { apiRequest } from "../utils/Apirequest";
import DataTable from "../utils/Datatable";

function Dashboard() {
  console.log("entered dashboard");
  const navigate = useNavigate();
  const user = localStorage.getItem("current_user");
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
  });

  const columns = [
    { key: "customer_name", label: "Customer Name" },
    { key: "phone_number", label: "Number" },
    { key: "event_date", label: "Event Date" },
    { key: "time_slot", label: "Time Slot" },
    { key: "package_name", label: "Package" },
    { key: "status", label: "Status" },
    { key: "updated_by", label: "Updated By" },
  ];
  const ActionEdit = ({ row }) => (
    <Edit
      className="action-icon text-primary"
      size={18}
      onClick={() => console.log("Edit", row)}
    />
  );

  const ActionDelete = ({ row }) => (
    <Trash2
      className="action-icon text-danger"
      size={18}
      onClick={() => console.log("Delete", row)}
    />
  );

  const [todayBookingData, setTodaysBookings] = useState([]);
  const [upcomingBookingData, setUpcomingBookings] = useState([]);
  const [olderBookingData, setOlderBookings] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    fetchTodaysBookings();
    fetchUpcomingBookings();
    fetchOlderBookings();
  }, []);

  const fetchTodaysBookings = async () => {
    try {
      let filter = "today";

      const data = await apiRequest({
        url: `http://127.0.0.1:8000/bookings/by-filter?filter=${filter}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodaysBookings(data);
    } catch (err) {
      console.error("Failed to fetch booking details:", err);
    }
  };

  const fetchUpcomingBookings = async () => {
    try {
      let filter = "future";

      const data = await apiRequest({
        url: `http://127.0.0.1:8000/bookings/by-filter?filter=${filter}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUpcomingBookings(data);
    } catch (err) {
      console.error("Failed to fetch booking details:", err);
    }
  };

  const fetchOlderBookings = async () => {
    try {
      let filter = "past";

      const data = await apiRequest({
        url: `http://127.0.0.1:8000/bookings/by-filter?filter=${filter}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOlderBookings(data);
    } catch (err) {
      console.error("Failed to fetch booking details:", err);
    }
  };

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <nav className="navbar navbar-expand-md custom-navbar">
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
                <a className="nav-link" onClick={handleLogout}>
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="mb-3"></div>

      <div className="d-flex justify-content-end align-items-center px-4 my-3">
        <button className="btn btn-pink" onClick={() => setShowModal(true)}>
          Add Booking
        </button>
      </div>
      <div className="mb-3"></div>
      <DataTable
        title="Today's Bookings"
        columns={columns}
        data={todayBookingData}
        actions={[ActionEdit, ActionDelete]}
        collapseId="todayTable"
      />

      <div className="mb-5"></div>

      <DataTable
        title="Upcoming Bookings"
        columns={columns}
        data={upcomingBookingData}
        actions={[ActionEdit, ActionDelete]}
        collapseId="upcomingTable"
      />

      <div className="mb-5"></div>
      <DataTable
        title="Older Bookings"
        columns={columns}
        data={olderBookingData}
        actions={[ActionEdit, ActionDelete]}
        collapseId="olderTable"
      />
      {showModal && (
        <>
          <div
            className="custom-modal-overlay"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="custom-modal">
            <div className="modal-header">
              <h5
                className="modal-title"
                style={{ marginLeft: "10px", margin: "0 auto" }}
              >
                Add Booking
              </h5>
            </div>
            <div className="stepper">
              <div className={`step ${step === 1 ? "active" : ""}`}>
                <div className="step-number">1</div>
                Customer Details
              </div>
              <div className={`step ${step === 2 ? "active" : ""}`}>
                <div className="step-number">2</div>
                Date & Time
              </div>
              <div className={`step ${step === 3 ? "active" : ""}`}>
                <div className="step-number">3</div>
                Celebration Type
              </div>
              <div className={`step ${step === 4 ? "active" : ""}`}>
                <div className="step-number">4</div>
                Package
              </div>
              <div className={`step ${step === 5 ? "active" : ""}`}>
                <div className="step-number">5</div>
                Add-ons
              </div>
              <div className={`step ${step === 6 ? "active" : ""}`}>
                <div className="step-number">6</div>
                Review
              </div>
            </div>

            <div className="modal-body ">
              {step === 1 && (
                <div className="form-step-wrapper text-center">
                  <h6 className="mb-3">Customer Details</h6>
                  <div className="input-group-wrapper">
                    <input
                      className="form-control mb-3"
                      placeholder="Customer Name"
                      value={formData.customer_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer_name: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      className="form-control mb-3"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />

                    <input
                      className="form-control mb-3"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />

                    <input
                      className="form-control mb-3"
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-pink"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-pink"
                onClick={() => {
                  if (step === 1) {
                    if (
                      formData.customer_name.trim() === "" ||
                      formData.phone.trim() === ""
                    ) {
                      alert("Customer name and phone number are required.");
                      return;
                    }
                  }
                  setStep(step + 1);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
