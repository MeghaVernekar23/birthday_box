

import { apiRequest } from "../utils/APIrequest";

const BASE_URL = "http://127.0.0.1:8000";


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

export const fetchNextBooking = () => {
    return apiRequest({
        url: `${BASE_URL}/bookings/next-booking`,
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




