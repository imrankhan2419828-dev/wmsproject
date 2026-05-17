import axiosClient from "./axiosClient";

const API_URL = "/Receiving";

const receivingApi = {
    // Get all receipts
    getAll: () => axiosClient.get(`${API_URL}/all`),

    // Get by ID
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    // Create receipt
    create: (data) => axiosClient.post(API_URL, data),

    // Update receipt
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    // Delete receipt
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    // Get accounts by type (CUSTOMER, BANK, SUPPLIER)
    getAccountsByType: (type) => axiosClient.get(`${API_URL}/accounts/${type}`),

    // Get customers
    getCustomers: () => axiosClient.get(`${API_URL}/customers`),

    // Get bank/cash accounts
    getBankCashAccounts: () => axiosClient.get(`${API_URL}/bank-accounts`),

    // Get next voucher number
    getNextVoucher: () => axiosClient.get(`${API_URL}/next-voucher`),
};

export default receivingApi;