// src/api/stockApi.js
import axiosClient from "./axiosClient";

const API_URL = "/Stock";

const stockApi = {
    // Get current stock for an item (branch from token)
    getCurrent: (itemId) => axiosClient.get(`${API_URL}/current/${itemId}`),

    // Get current stock for an item with specific branch
    getCurrentWithBranch: (itemId, branchId) =>
        axiosClient.get(`${API_URL}/current/${itemId}/${branchId}`),

    // Get bulk stock for multiple items
    getBulkStock: (itemIds) =>
        axiosClient.post(`${API_URL}/current/bulk`, itemIds),

    // Get stock ledger for an item
    getLedger: (itemId) => axiosClient.get(`${API_URL}/ledger/${itemId}`)


};

export default stockApi;