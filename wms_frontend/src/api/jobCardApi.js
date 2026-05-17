import axiosClient from "./axiosClient";

const API_URL = "/JobCard";

const jobCardApi = {
    // Get all job cards
    getAll: (status) => {
        const url = status ? `${API_URL}?status=${status}` : API_URL;
        return axiosClient.get(url);
    },

    // Get job card by ID
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    // Create new job card
    create: (data) => axiosClient.post(API_URL, data),

    // Update job card
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    // Update status
    updateStatus: (id, data) => axiosClient.patch(`${API_URL}/${id}/status`, data),

    // Delete job card
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    // Get by vehicle
    getByVehicle: (vehicleId) => axiosClient.get(`${API_URL}/vehicle/${vehicleId}`),

    // Get by customer
    getByCustomer: (customerId) => axiosClient.get(`${API_URL}/customer/${customerId}`),

    // Get by date range
    getByDateRange: (fromDate, toDate) =>
        axiosClient.get(`${API_URL}/date-range?fromDate=${fromDate}&toDate=${toDate}`),

    // Add service to job
    addService: (jobId, data) => axiosClient.post(`${API_URL}/${jobId}/services`, data),

    // Remove service from job
    removeService: (jobId, serviceId) =>
        axiosClient.delete(`${API_URL}/${jobId}/services/${serviceId}`),

    // Add part to job
    addPart: (jobId, data) => axiosClient.post(`${API_URL}/${jobId}/parts`, data),

    // Remove part from job
    removePart: (jobId, partId) =>
        axiosClient.delete(`${API_URL}/${jobId}/parts/${partId}`),

    // Generate PDF
    generatePdf: (jobId) => axiosClient.get(`${API_URL}/${jobId}/pdf`, {
        responseType: 'blob'
    })
};

export default jobCardApi;