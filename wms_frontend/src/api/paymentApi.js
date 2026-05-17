import axiosClient from "./axiosClient";

const API_URL = "/Payment";

const paymentApi = {
    // Get all payments
    getAll: () => axiosClient.get(`${API_URL}/list`),

    // Get single payment by ID
    getById: (paymentId) => axiosClient.get(`${API_URL}/${paymentId}`),

    // Create new payment
    create: (payload) => axiosClient.post(API_URL, payload),

    // Update payment
    update: (paymentId, payload) => axiosClient.put(`${API_URL}/${paymentId}`, payload),

    // Delete payment
    delete: (paymentId) => axiosClient.delete(`${API_URL}/${paymentId}`),

    // Get accounts by type
    getAccounts: (type) => axiosClient.get(`${API_URL}/accounts/${type}`),

    // Get bank accounts
    getBankAccounts: () => axiosClient.get(`${API_URL}/bank-accounts`),

    // 🔥 NEW: Get parties (Customers + Suppliers)
    getParties: () => axiosClient.get(`${API_URL}/parties`),

    // 🔥 NEW: Get next voucher number
    getNextVoucher: () => axiosClient.get(`${API_URL}/next-voucher`),
};

export default paymentApi;