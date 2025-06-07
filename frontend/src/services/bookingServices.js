

import { apiRequest } from "../utils/APIrequest";

const BASE_URL = "http://18.153.92.37:8000";


export const fetchBookingsByFilter = (filter) => {
    return apiRequest({
        url: `${BASE_URL}/bookings/by-filter?filter=${filter}`,
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



