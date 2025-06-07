import React, { useState, useEffect } from "react";

import "../css/Dashboard.css";
import BirthdayLogo from "../images/logo.jpg";
import { Edit, Trash2, Search } from "lucide-react";
import DataTable from "../components/Datatable";
import NotificationPopup from "../components/NotificationPopup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BookingFormModal from "../components/BookingFormModal";

import {
  fetchBookingsByFilter,
  fetchCelebrationType,
  fetchPackage,
  submitBooking,
  deleteBooking,
  fetchBookingById,
  updateBooking,
} from "../services/bookingServices";
import { getCustomerByPhone } from "../services/CustomerService";

function Bookings() {
  const user = localStorage.getItem("current_user");

  const [showModal, setShowModal] = useState(false);

  const [bookingDate, setBookingDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [todayBookingData, setTodaysBookings] = useState([]);

  const [celebrationOptions, setcelebrationOptions] = useState([]);

  const [packageOptions, setpackageOptions] = useState([]);

  const [bookedSlots, setBookedSlots] = useState([]);

  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [customerChecked, setCustomerChecked] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const [editingBookingId, setEditingBookingId] = useState(null);

  const [popup, setPopup] = useState({ visible: false, booking: null });

  const [checkMessage, setCheckMessage] = useState("");

  const [formData, setFormData] = useState({
    customer_name: "",
    phone_number: "",
    email: "",
    address: "",
    event_date: "",
    time_slot: "",
    celebration_id: "",
    package_id: "",
    addons_note: "",
    updated_by: "",
    created_by: "",
    status: "",
    created_at: "",
    updated_at: "",
  });

  const emptyForm = {
    customer_name: "",
    phone_number: "",
    email: "",
    address: "",
    event_date: "",
    time_slot: "",
    celebration_id: "",
    package_id: "",
    addons_note: "",
    updated_by: "",
    created_by: "",
    status: "",
  };

  const columns = [
    { key: "customer_name", label: "Customer Name" },
    { key: "phone_number", label: "Number" },
    { key: "event_date", label: "Event Date" },
    { key: "time_slot", label: "Time Slot" },
    { key: "celebration_name", label: "Celebration Type" },
    { key: "package_name", label: "Package" },
    { key: "status", label: "Status" },
    { key: "updated_by", label: "Updated By" },
  ];

  const ActionEdit = ({ row }) => (
    <Edit
      className="action-icon text-primary"
      size={18}
      onClick={() => handleEditBooking(row)}
    />
  );

  const ActionDelete = ({ row }) => (
    <Trash2
      className="action-icon text-danger"
      size={18}
      onClick={() => handleDeleteBooking(row)}
    />
  );

  useEffect(() => {
    fetchTodaysBookings();
  }, []);

  const fetchTodaysBookings = async () => {
    const data = await fetchBookingsByFilter("today");
    console.log("data::", data);
    setTodaysBookings(data);
  };

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");

      const fetchModalData = async () => {
        try {
          const [bookings, celebrations, packages] = await Promise.all([
            fetchBookingsByFilter("all"),
            fetchCelebrationType(),
            fetchPackage(),
          ]);
          setBookedSlots(bookings);
          setcelebrationOptions(celebrations);
          setpackageOptions(packages);
        } catch (err) {
          console.error("Error fetching modal data", err);
        }
      };
      fetchModalData();
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  const submitBookingDetails = async (formValues) => {
    try {
      const username = JSON.parse(user).username;
      const updatedForm = {
        ...formValues,
        updated_by: username,
        booking_id: editingBookingId,
      };

      if (isEditMode) {
        await updateBooking(editingBookingId, updatedForm);
        alert("Booking updated successfully!");
      } else {
        updatedForm.created_by = username;
        updatedForm.status = "pending";
        await submitBooking(updatedForm);
        alert("Booking created successfully!");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error("Submit failed:", error);
    }
  };

  const checkCustomerByPhone = async () => {
    try {
      const data = await getCustomerByPhone(formData.phone_number);
      console.log("data ", data);
      setIsExistingCustomer(true);
      setFormData({
        ...formData,
        customer_name: data.name,
        email: data.email,
        address: data.address,
      });
      setCheckMessage("Customer details found");
    } catch (error) {
      console.log("error ", error);
      setIsExistingCustomer(false);
      setFormData({ ...formData, customer_name: "", email: "", address: "" });
      setCheckMessage("Customer details not found");
    } finally {
      setCustomerChecked(true);
      setTimeout(() => setCheckMessage(""), 3000);
    }
  };

  const handleEditBooking = async (booking) => {
    try {
      const fullBooking = await fetchBookingById(booking.booking_id);

      setFormData({
        customer_name: fullBooking.customer_name,
        phone_number: fullBooking.phone_number,
        email: fullBooking.email,
        address: fullBooking.address,
        event_date: fullBooking.event_date,
        time_slot: fullBooking.time_slot,
        celebration_id: String(fullBooking.celebration_id),
        package_id: String(fullBooking.package_id),
        addons_note: fullBooking.addons_note,
        updated_by: fullBooking.updated_by,
        created_by: fullBooking.created_by,
        status: fullBooking.status,
        created_at: fullBooking.created_at,
        updated_at: fullBooking.updated_at,
      });

      if (fullBooking.event_date) {
        setBookingDate(new Date(fullBooking.event_date));
      } else {
        console.warn("Invalid event_date", fullBooking.event_date);
      }
      setSelectedTime(fullBooking.time_slot);
      setIsEditMode(true);
      setEditingBookingId(fullBooking.booking_id);
      setCustomerChecked(true);

      setShowModal(true);
    } catch (error) {
      console.error("Error fetching booking for edit:", error);
      alert("Failed to load booking details for editing.");
    }
  };

  const handleDeleteBooking = (booking) => {
    setPopup({ visible: true, booking });
  };

  const confirmDelete = async () => {
    try {
      await deleteBooking(popup.booking.booking_id);
      setPopup({ visible: false, booking: null });
      alert("Booking deleted successfully!");
      fetchTodaysBookings();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete the booking. Please try again.");
      setPopup({ visible: false, booking: null });
    }
  };

  const cancelDelete = () => {
    setPopup({ visible: false, booking: null });
  };

  return (
    <div>
      <DataTable
        title="Today's Bookings"
        columns={columns}
        data={todayBookingData}
        actions={[ActionEdit, ActionDelete]}
        collapseId="todayTable"
      />

      <div className="mb-5"></div>

      {popup.visible && (
        <NotificationPopup
          message={`Are you sure you want to delete the booking for ${popup.booking.customer_name}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {showModal && (
        <BookingFormModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setFormData(emptyForm);

            setCustomerChecked(false);
          }}
          onSubmit={async (formValues) => {
            await submitBookingDetails(formValues);
            setShowModal(false);
            setFormData(emptyForm);

            setCustomerChecked(false);
            setIsEditMode(false);
            setEditingBookingId(null);
            fetchTodaysBookings();
          }}
          isEditMode={isEditMode}
          initialData={formData}
          celebrationOptions={celebrationOptions}
          packageOptions={packageOptions}
          bookedSlots={bookedSlots}
          checkCustomerByPhone={checkCustomerByPhone}
          customerChecked={customerChecked}
          isExistingCustomer={isExistingCustomer}
          checkMessage={checkMessage}
          fetchModalData={async () => {
            const [bookings, celebrations, packages] = await Promise.all([
              fetchBookingsByFilter("all"),
              fetchCelebrationType(),
              fetchPackage(),
            ]);
            setBookedSlots(bookings);
            setcelebrationOptions(celebrations);
            setpackageOptions(packages);
          }}
        />
      )}
    </div>
  );
}

export default Bookings;
