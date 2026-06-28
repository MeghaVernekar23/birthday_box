import React, { useEffect, useState } from "react";
import DataTable from "../components/Datatable";
import {
  fetchAllCustomers,
  submitCustomer,
  updateCustomer,
  getCustomerByPhone,
  deleteCustomer,
} from "../services/CustomerService";
import { fetchBookingsByCustomer } from "../services/bookingServices";
import { Edit, Trash2, Eye, Plus, X, CalendarX } from "lucide-react";
import NotificationPopup from "../components/NotificationPopup";
import "../css/Customer.css";

const CustomerDetails = () => {
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [customerChecked, setCustomerChecked] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const [checkMessageType, setCheckMessageType] = useState("success");
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [popup, setPopup] = useState({ visible: false, customer: null });

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
    address: "",
  });

  const emptyForm = { name: "", phone_number: "", email: "", address: "" };

  const bookingColumns = [
    { key: "booking_id", label: "Booking ID" },
    { key: "event_date", label: "Date" },
    { key: "package_name", label: "Package" },
    { key: "payment_paid", label: "Payment" },
  ];

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const data = await fetchAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      alert("Failed to load customer details.");
    }
  };

  const handleEditCustomer = (customer) => {
    setFormData({
      name: customer.name,
      phone_number: customer.phone_number,
      email: customer.email,
      address: customer.address,
    });
    setIsEditMode(true);
    setShowModal(true);
    setEditingCustomerId(customer.customer_id);
    setIsSaveDisabled(false);
  };

  const handleAddCustomer = () => {
    setFormData(emptyForm);
    setIsEditMode(false);
    setIsExistingCustomer(false);
    setCustomerChecked(false);
    setCheckMessage("");
    setIsSaveDisabled(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(emptyForm);
    setIsEditMode(false);
    setCustomerChecked(false);
    setCheckMessage("");
    setIsSaveDisabled(true);
  };

  const checkCustomerByPhone = async () => {
    try {
      const data = await getCustomerByPhone(formData.phone_number);
      if (data) {
        setIsExistingCustomer(true);
        setFormData({ ...formData, name: data.name, email: data.email, address: data.address });
        setCheckMessage("Customer already exists. Use Edit instead.");
        setCheckMessageType("warning");
        setIsSaveDisabled(true);
      } else {
        setIsExistingCustomer(false);
        setCheckMessage("No existing customer. You can add now.");
        setCheckMessageType("success");
        setIsSaveDisabled(false);
      }
    } catch {
      setIsExistingCustomer(false);
      setCheckMessage("No existing customer. You can add now.");
      setCheckMessageType("success");
      setFormData({ ...formData, name: "", email: "", address: "" });
      setIsSaveDisabled(false);
    } finally {
      setCustomerChecked(true);
      setTimeout(() => setCheckMessage(""), 3000);
    }
  };

  const submitCustomerDetails = async () => {
    const updatedForm = { ...formData, customer_id: editingCustomerId };
    try {
      if (!isEditMode && isExistingCustomer) {
        alert("This phone number is already linked to a customer. Please use Edit instead.");
        return;
      }
      if (!isEditMode && !customerChecked) {
        alert("Please check the phone number before proceeding.");
        return;
      }
      if (isEditMode) {
        await updateCustomer(editingCustomerId, updatedForm);
        alert("Customer updated successfully!");
      } else {
        await submitCustomer(updatedForm);
        alert("Customer added successfully!");
      }
      closeModal();
      fetchCustomerData();
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error("Submit failed:", error);
    }
  };

  const handleSave = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.name.trim() === "") {
      alert("Customer name is required.");
      return;
    }
    if (!nameRegex.test(formData.name.trim())) {
      alert("Customer name should contain only alphabets and spaces.");
      return;
    }
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    submitCustomerDetails();
  };

  const columns = [
    { key: "name", label: "Customer Name" },
    { key: "phone_number", label: "Phone Number" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
  ];

  const ActionButtons = ({ row }) => (
    <div className="d-flex justify-content-center gap-3">
      <span title="Edit Customer">
        <Edit
          className="action-icon text-primary"
          size={17}
          onClick={() => handleEditCustomer(row)}
        />
      </span>
      <span title="Delete Customer">
        <Trash2
          className="action-icon text-danger"
          size={17}
          onClick={() => handleDeleteCustomer(row)}
        />
      </span>
      <span title="View Bookings">
        <Eye
          className="action-icon text-info"
          size={17}
          onClick={() => handleViewBookings(row)}
        />
      </span>
    </div>
  );

  const handleDeleteCustomer = async (customer) => {
    try {
      const data = await fetchBookingsByCustomer(customer.customer_id);
      if (data.length > 0) {
        alert(`Cannot delete "${customer.name}" – associated bookings exist.`);
      } else {
        setPopup({ visible: true, customer });
      }
    } catch (err) {
      console.error("Error checking bookings:", err);
      alert("Failed to check bookings. Try again later.");
    }
  };

  const handleViewBookings = async (customer) => {
    try {
      const data = await fetchBookingsByCustomer(customer.customer_id);
      setBookingData(data);
      setSelectedCustomerName(customer.name);
      setShowBookingModal(true);
    } catch (err) {
      console.error("Error fetching bookings", err);
      alert("Failed to load bookings");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCustomer(popup.customer.customer_id);
      setPopup({ visible: false, customer: null });
      alert("Customer deleted successfully!");
      fetchCustomerData();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete the customer. Please try again.");
      setPopup({ visible: false, customer: null });
    }
  };

  const cancelDelete = () => setPopup({ visible: false, customer: null });

  return (
    <div className="customer-page">
      <DataTable
        title="Customer Details"
        columns={columns}
        data={customers}
        actions={[ActionButtons]}
        searchableFields={["name", "email", "phone_number", "address"]}
        actionButton={
          <button className="btn-add-customer" onClick={handleAddCustomer}>
            <Plus size={15} />
            Add Customer
          </button>
        }
      />

      {popup.visible && (
        <NotificationPopup
          message={`Are you sure you want to delete ${popup.customer.name}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="customer-modal">
            <div className="customer-modal-header">
              <h5 className="customer-modal-title">
                {isEditMode ? "Edit Customer" : "Add Customer"}
              </h5>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* Phone field */}
            <div className="phone-check-row">
              <div className="field-group">
                <label className="field-label">Phone Number</label>
                <input
                  className="field-input"
                  placeholder="e.g. 03001234567"
                  value={formData.phone_number}
                  maxLength={11}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setFormData({ ...formData, phone_number: value });
                    }
                  }}
                  disabled={isEditMode}
                />
              </div>
              {!isEditMode && (
                <button
                  className="btn-check"
                  onClick={checkCustomerByPhone}
                  disabled={!formData.phone_number || formData.phone_number.length < 7}
                >
                  Check
                </button>
              )}
            </div>

            {checkMessage && (
              <div className={`check-status ${checkMessageType}`}>
                {checkMessage}
              </div>
            )}

            {/* Extra fields */}
            {(isEditMode || (!isExistingCustomer && customerChecked)) && (
              <>
                <div className="field-group">
                  <label className="field-label">Customer Name</label>
                  <input
                    className="field-input"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isExistingCustomer && !isEditMode}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Email</label>
                  <input
                    className="field-input"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isExistingCustomer && !isEditMode}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Address</label>
                  <input
                    className="field-input"
                    placeholder="Street, City"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={isExistingCustomer && !isEditMode}
                  />
                </div>
              </>
            )}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={!isEditMode && isSaveDisabled}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Bookings Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <div className="booking-modal-header">
              <div>
                <p className="booking-modal-title">Booking History</p>
                <p className="booking-modal-subtitle">{selectedCustomerName}</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowBookingModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="booking-modal-body">
              {bookingData.length === 0 ? (
                <div className="no-bookings">
                  <div className="no-bookings-icon">
                    <CalendarX size={22} />
                  </div>
                  <p>No bookings found for this customer.</p>
                </div>
              ) : (
                <DataTable
                  title=""
                  columns={bookingColumns}
                  data={bookingData}
                  searchableFields={[]}
                  actions={[]}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
