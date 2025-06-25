import { apiRequest } from "../utils/APIrequest";

const BASE_URL = "http://127.0.0.1:8000";


export const fetchAllCustomers = () => {
    return apiRequest({
        url: `${BASE_URL}/customers/`,
    });
};

export const getCustomerByPhone = (phoneNumber) => {
    return apiRequest({
        url: `${BASE_URL}/customers/details/${phoneNumber}`,
    });
};



export const submitCustomer = (formData) => {
    return apiRequest({
        url: `${BASE_URL}/customers/submit`,
        method: "POST",
        data: formData,
    });
};

export const updateCustomer = (customer_id, formData) => {
    return apiRequest({
        url: `${BASE_URL}/customers/update/${customer_id}`,
        method: "PUT",
        data: formData,
    });
};

export const deleteCustomer = (customer_Id) => {
    return apiRequest({
        url: `${BASE_URL}/customers/delete/${customer_Id}`,
        method: "DELETE",
    });
};