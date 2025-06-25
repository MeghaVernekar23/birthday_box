import React, { useEffect, useState } from "react";
import {
  fetchCelebrationType,
  fetchPackage,
} from "../services/bookingServices";
import "../css/Dashboard.css";

const CelebrationAndPackage = () => {
  const [celebrations, setCelebrations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const celebrationData = await fetchCelebrationType();
        const packageData = await fetchPackage();
        console.log(" celebrationData ", celebrationData);
        console.log(" packageData ", packageData);
        setCelebrations(celebrationData);
        setPackages(packageData);
      } catch (err) {
        console.error("Error loading data", err);
      }
    };

    loadData();
  }, []);

  return (
    <div className="pending-payment-card shadow-sm">
      <div className="card-content">
        <div className="card-header">
          <h6 className="label">Celebrations & Packages</h6>
        </div>

        <div className="justify-content-between mt-2">
          <div>
            <button
              className="view-all-btn"
              onClick={() => setShowCelebrationModal(true)}
            >
              View Celebration Types <i className="bi bi-arrow-right" />
            </button>
          </div>
          <div>
            <button
              className="view-all-btn"
              onClick={() => setShowPackageModal(true)}
            >
              View Package Types <i className="bi bi-arrow-right" />
            </button>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebrationModal && (
        <div className="ps-modal-overlay">
          <div className="ps-modal-box">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Available Celebration Types</h5>
              <button
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowCelebrationModal(false)}
                style={{
                  fontSize: "1.2rem",
                  border: "none",
                  background: "transparent",
                }}
              >
                &times;
              </button>
            </div>
            <ul className="holiday-list">
              {celebrations.map((c) => (
                <li key={c.celebration_id} className="holiday-item">
                  {c.celebration_name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {showPackageModal && (
        <div className="ps-modal-overlay">
          <div className="ps-modal-box">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Available Package Types</h5>
              <button
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowPackageModal(false)}
                style={{
                  fontSize: "1.2rem",
                  border: "none",
                  background: "transparent",
                }}
              >
                &times;
              </button>
            </div>
            <ul className="holiday-list">
              {packages.map((p) => (
                <li key={p.package_id} className="holiday-item">
                  {p.package_name} {p.description} – ₹{p.price}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CelebrationAndPackage;
