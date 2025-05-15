import { apiRequest } from "../utils/APIrequest";

export const fetchBookingsByFilter = async (filter, token) => {
    try {
        const data = await apiRequest({
            url: `http://127.0.0.1:8000/bookings/by-filter?filter=${filter}`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (err) {
        console.error(`Failed to fetch booking details for filter: ${filter}`, err);
        throw err;
    }
};

export const fetchCelebrationType = async (token) => {
    try {
        const data = await apiRequest({
            url: `http://127.0.0.1:8000/celebration-type`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (err) {
        console.error("Failed to fetch celebration Type details:", err);
    }
};

export const fetchPackage = async (token) => {
    try {
        const data = await apiRequest({
            url: `http://127.0.0.1:8000/package`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (err) {
        console.error("Failed to fetch package details:", err);
    }
};

export const submitBooking = async (formData, token) => {
    try {


        await apiRequest({
            url: "http://127.0.0.1:8000/submitBookings",
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            data: formData,
        });

        return { success: true };
    } catch (error) {
        console.error("Booking failed in service:", error);
        throw error;
    }
};
