import { useEffect, useState } from "react";
import DataTable from "../components/Datatable";
import {
  fetchAllCustomers,
  submitCustomer,
  updateCustomer,
  getCustomerByPhone,
  deleteCustomer,
} from "../services/CustomerService";
import { Edit, Trash2 } from "lucide-react";
import NotificationPopup from "../components/NotificationPopup";

const CustomerDetails = () => {
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [customerChecked, setCustomerChecked] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [popup, setPopup] = useState({ visible: false, customer: null });

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
    address: "",
  });

  const emptyForm = {
    name: "",
    phone_number: "",
    email: "",
    address: "",
  };

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
    setIsSaveDisabled(true);
    setShowModal(true);
  };

  const checkCustomerByPhone = async () => {
    try {
      const data = await getCustomerByPhone(formData.phone_number);
      console.log("data ", data);
      if (data) {
        setIsExistingCustomer(true);
        setFormData({
          ...formData,
          name: data.name,
          email: data.email,
          address: data.address,
        });
        setCheckMessage("Customer exists. Please use Edit instead.");
        setIsSaveDisabled(true);
      } else {
        setIsExistingCustomer(false);
        setCheckMessage("No customer found. You can add now.");
        setIsSaveDisabled(false);
      }
    } catch (error) {
      setIsExistingCustomer(false);
      setCheckMessage("No customer found. You can add now.");
      setFormData({ ...formData, name: "", email: "", address: "" });
      setIsSaveDisabled(false);
    } finally {
      setCustomerChecked(true);
      setTimeout(() => setCheckMessage(""), 3000);
    }
  };

  const submitCustomerDetails = async () => {
    const updatedForm = {
      ...formData,

      customer_id: editingCustomerId,
    };
    try {
      if (!isEditMode && isExistingCustomer) {
        alert(
          "This phone number is already linked to a customer. Please use Edit instead."
        );
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

      setShowModal(false);
      setFormData(emptyForm);
      setIsEditMode(false);
      setEditingCustomerId(null);
      setCustomerChecked(false);
      fetchCustomerData();
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error("Submit failed:", error);
    }
  };

  const columns = [
    { key: "name", label: "Customer Name" },
    { key: "phone_number", label: "Phone Number" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
  ];

  const ActionEdit = ({ row }) => (
    <Edit
      className="action-icon text-primary"
      size={18}
      onClick={() => handleEditCustomer(row)}
    />
  );

  const ActionDelete = ({ row }) => (
    <Trash2
      className="action-icon text-danger"
      size={18}
      onClick={() => handleDeleteCustomer(row)}
    />
  );

  const handleDeleteCustomer = (customer) => {
    setPopup({ visible: true, customer });
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

  const cancelDelete = () => {
    setPopup({ visible: false, customer: null });
  };

  return (
    <div>
      <div className="mb-3"></div>
      <div className="d-flex justify-content-end">
        <button className="btn btn-pink" onClick={handleAddCustomer}>
          Add Customer
        </button>
      </div>

      <div className="mb-3"></div>

      <DataTable
        title="All Customers"
        columns={columns}
        data={customers}
        actions={[ActionEdit, ActionDelete]}
      />

      {popup.visible && (
        <NotificationPopup
          message={`Are you sure you want to delete the customer for ${popup.customer.name}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

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
                {isEditMode ? "Edit Customer" : "Add Customer"}
              </h5>
              <button
                className="btn-close-modal"
                onClick={() => {
                  setShowModal(false);
                  setFormData(emptyForm);
                  setIsEditMode(false);
                  setCustomerChecked(false);
                  setIsSaveDisabled(true);
                }}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="form-step-wrapper text-center">
                <div className="input-group-wrapper text-start">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-control mb-3"
                    placeholder="Enter Phone Number"
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

                  {!isEditMode && (
                    <>
                      <button
                        className="btn btn-pink mb-3"
                        onClick={checkCustomerByPhone}
                        disabled={
                          !formData.phone_number ||
                          formData.phone_number.length < 7
                        }
                      >
                        Check
                      </button>
                      {checkMessage && (
                        <div
                          className="form-label"
                          style={{ fontSize: "1rem" }}
                        >
                          {checkMessage}
                        </div>
                      )}
                    </>
                  )}

                  {(isEditMode || (!isExistingCustomer && customerChecked)) && (
                    <>
                      <div className="mb-1"></div>
                      <label className="form-label">Customer Name</label>
                      <input
                        className="form-control mb-3"
                        placeholder="Enter Customer Name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        disabled={isExistingCustomer && !isEditMode}
                      />

                      <label className="form-label">Email</label>
                      <input
                        className="form-control mb-3"
                        placeholder="Enter Email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={isExistingCustomer && !isEditMode}
                      />

                      <label className="form-label">Address</label>
                      <input
                        className="form-control mb-3"
                        placeholder="Enter Address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        disabled={isExistingCustomer && !isEditMode}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-pink"
                onClick={() => {
                  const nameRegex = /^[A-Za-z\s]+$/;
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (formData.name.trim() === "") {
                    alert("Customer details are required.");
                    return;
                  }
                  if (!nameRegex.test(formData.name.trim())) {
                    alert(
                      "Customer name should contain only alphabets and spaces."
                    );
                    return;
                  }
                  if (
                    formData.email.trim() &&
                    !emailRegex.test(formData.email)
                  ) {
                    alert("Please enter a valid email address.");
                    return;
                  }
                  submitCustomerDetails();
                }}
                disabled={!isEditMode && isSaveDisabled}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerDetails;
