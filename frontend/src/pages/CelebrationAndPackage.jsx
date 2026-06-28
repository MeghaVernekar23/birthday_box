import React, { useEffect, useState } from "react";
import { fetchCelebrationType, fetchPackage } from "../services/bookingServices";
import "../css/Dashboard.css";

const CelebrationAndPackage = () => {
  const [celebrations, setCelebrations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [celebrationData, packageData] = await Promise.all([
          fetchCelebrationType(),
          fetchPackage(),
        ]);
        setCelebrations(celebrationData);
        setPackages(packageData);
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div>
      <div className="dashboard-card dashboard-card--teal shadow-sm">
        {loading ? (
          <div className="card-spinner-wrapper">
            <div className="spinner-border" style={{ color: "#2bba8f" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="card-content">
            <div className="card-header">
              <h6 className="label">Celebrations & Packages</h6>
            </div>
            <div className="mt-2">
              <div>
                <button className="view-all-btn" onClick={() => setShowCelebrationModal(true)}>
                  View Celebration Types <i className="bi bi-arrow-right" />
                </button>
              </div>
              <div className="mt-2">
                <button className="view-all-btn" onClick={() => setShowPackageModal(true)}>
                  View Package Types <i className="bi bi-arrow-right" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCelebrationModal && (
        <div className="ps-modal-overlay">
          <div className="ps-modal-box">
            <h5 className="mb-3">Available Celebration Types</h5>
            <div className="modal-close-icon" onClick={() => setShowCelebrationModal(false)}>
              ×
            </div>
            <ul className="celebration-package-list">
              {celebrations.map((c) => (
                <li key={c.celebration_id} className="celebration-package-item">
                  {c.celebration_name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showPackageModal && (
        <div className="ps-modal-overlay">
          <div className="ps-modal-box">
            <h5 className="mb-3">Available Package Types</h5>
            <div className="modal-close-icon" onClick={() => setShowPackageModal(false)}>
              ×
            </div>
            <ul className="celebration-package-list">
              {packages.map((p) => (
                <li key={p.package_id} className="celebration-package-item">
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
