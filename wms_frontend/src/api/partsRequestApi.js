import axiosClient from "./axiosClient";

const API_URL = "/PartsRequest";

const partsRequestApi = {
    // Get all parts requests
    getAll: (status) => {
        const url = status ? `${API_URL}?status=${status}` : API_URL;
        return axiosClient.get(url);
    },

    // Get request by ID
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    // Create new request
    create: (data) => axiosClient.post(API_URL, data),

    // Update request
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    // Approve request
    approve: (id, data) => axiosClient.post(`${API_URL}/${id}/approve`, data),

    // Receive parts
    receive: (id, actualCost) =>
        axiosClient.post(`${API_URL}/${id}/receive`, { actualCost }),

    // Cancel request
    cancel: (id, reason) =>
        axiosClient.post(`${API_URL}/${id}/cancel`, { reason }),

    // Delete request
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    // Get low stock alerts
    getLowStockAlerts: (status) => {
        const url = status ? `${API_URL}/low-stock?status=${status}` : `${API_URL}/low-stock`;
        return axiosClient.get(url);
    },

    // Get requests by job card
    getByJobCard: (jobCardId) =>
        axiosClient.get(`${API_URL}/jobcard/${jobCardId}`),

    // Link to purchase order
    linkToPurchaseOrder: (id, purchaseOrderId) =>
        axiosClient.post(`${API_URL}/${id}/link-purchase`, { purchaseOrderId })
};

export default partsRequestApi;