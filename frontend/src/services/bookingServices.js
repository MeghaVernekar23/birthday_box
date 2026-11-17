

import { apiRequest } from "../utils/APIrequest";
import { BASE_URL } from "../services/utils"

export const fetchBookingsByFilter = (filter) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/by-filter?filter=${filter}`,
    });
};

export const fetchBookingByDate = (date) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/by-date?date=${date}`,
    });
};

export const submitBooking = (formData) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/submit`,
        method: "POST",
        data: formData,
    });
};

export const updateBooking = (bookingId, formData) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/update/${bookingId}`,
        method: "PUT",
        data: formData,
    });
};

export const updatePayment = (bookingId, formData) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/update-payment/${bookingId}`,
        method: "PUT",
        data: formData,
    });
};

export const deleteBooking = (bookingId) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/delete/${bookingId}`,
        method: "DELETE",
    });
};

export const fetchBookingById = (bookingId) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/${bookingId}`,
    });
};

export const fetchBookingsByCustomer = (customer_id) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/by-customer-id/${customer_id}`,
    });
};


export const fetchCelebrationType = () => {
    return apiRequest({
        url: `${BASE_URL}/bookings/celebration-type`,
    });
};


export const fetchPackage = () => {
    return apiRequest({
        url: `${BASE_URL}/bookings/package`,
    });
};

export const updatePackage = (packageId, formData) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/package/${packageId}`,
        method: "PUT",
        data: formData,
    });
};

export const deletePackage = (packageId) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/package/${packageId}`,
        method: "DELETE",
    });
};

export const fetchNextBooking = () => {
    return apiRequest({
        url: `${BASE_URL}/bookings/next-booking`,
    });
};


export const sendTelegramMessage = (bookingId) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/${bookingId}/send-telegram`,
        method: "POST",
    });
};

export const fetchUpcomingHoliday = () => {
    return apiRequest({
        url: `${BASE_URL}/holidays/`,
    });
};


export const addHoliday = (formData) => {
    return apiRequest({
        url: `${BASE_URL}/holidays/submit`,
        method: "POST",
        data: formData,
    });
};


export const deleteHoliday = (holidayId) => {
    return apiRequest({
        url: `${BASE_URL}/holidays/${holidayId}`,
        method: "DELETE",
    });
};





// Owner reactivates an unconfirmed booking (it becomes confirmed again).
export const reactivateBooking = (bookingId) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/${bookingId}/reactivate`,
        method: "PUT",
    });
};

// Staff unconfirm a booking: no Telegram reminders, excluded from dashboard figures.
export const unconfirmBooking = (bookingId) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/${bookingId}/unconfirm`,
        method: "PUT",
    });
};

// Read-only list of scheduled Telegram messages (admin only).
export const fetchScheduledMessages = () => {
    return apiRequest({
        url: `${BASE_URL}/scheduler/messages`,
    });
};
