import axiosClient from "./axiosClient";

const API_URL = "/Vehicle";

const vehicleApi = {
    // Get all vehicles
    getAll: () => axiosClient.get(API_URL),

    // Get vehicle by ID
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    // Create new vehicle
    create: (data) => axiosClient.post(API_URL, data),

    // Update vehicle
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    // Delete vehicle
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    // Get vehicles by customer
    getByCustomer: (customerId) => axiosClient.get(`${API_URL}/customer/${customerId}`),

    // Search vehicles
    search: (term) => axiosClient.get(`${API_URL}/search?term=${term}`)
};

export default vehicleApi;