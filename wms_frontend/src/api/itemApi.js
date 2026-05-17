import axiosClient from "./axiosClient";

const API_URL = "/ItemFile";

const itemApi = {
    // Basic CRUD
    getAll: () => axiosClient.get(API_URL),
    getByBranch: (branchId) => axiosClient.get(`${API_URL}/branch/${branchId}`),
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),
    create: (data) => {
        console.log("Creating item with data:", data);
        return axiosClient.post(API_URL, data);
    },
    update: (data) => {
        console.log("Updating item with data:", data);
        return axiosClient.put(API_URL, data);
    },
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),
    generateName: (modlNumb, compId, catgId, subcatId) => {
        return axiosClient.get(`${API_URL}/generate-name`, {
            params: { modlNumb, compId, catgId, subcatId }
        });
    },

    // Stock
    getStock: (itemId, branchId) => {
        return axiosClient.get(`/stock/current/${itemId}/${branchId}`);
    },

    // Old Price History
    getPriceHistory: (itemId) => axiosClient.get(`${API_URL}/${itemId}/price-history`),
    addPriceHistory: (data) => axiosClient.post(`${API_URL}/price-history`, data),
    updatePriceHistory: (id, price) => axiosClient.put(`${API_URL}/price-history/${id}`, { price }),

    // ✅ NEW: Price Management
    getAllPrices: (itemId) => axiosClient.get(`${API_URL}/${itemId}/prices`),
    getPricesByType: (itemId, priceType) => axiosClient.get(`${API_URL}/${itemId}/prices/${priceType}`),
    getActivePrice: (itemId, priceType) => axiosClient.get(`${API_URL}/${itemId}/active-price/${priceType}`),
    addPrice: (data) => axiosClient.post(`${API_URL}/prices`, data),
    updatePrice: (data) => axiosClient.put(`${API_URL}/prices`, data),
    deletePrice: (priceId) => axiosClient.delete(`${API_URL}/prices/${priceId}`),
    activatePrice: (priceId) => axiosClient.put(`${API_URL}/prices/${priceId}/activate`),
    migratePrices: () => axiosClient.post(`${API_URL}/migrate-prices`),

    // Images
    getItemImages: (itemId) => axiosClient.get(`${API_URL}/${itemId}/images`),
    addItemImages: (itemId, imageUrls) => axiosClient.post(`${API_URL}/${itemId}/images`, imageUrls),
    deleteItemImage: (imageId) => axiosClient.delete(`${API_URL}/images/${imageId}`),

    // Godown Openings
    getGodownOpenings: (itemId) => axiosClient.get(`${API_URL}/${itemId}/godown-openings`),
    saveGodownOpenings: (data) => axiosClient.post(`${API_URL}/godown-openings`, data),

    // ✅ Generic GET/POST/PUT/DELETE methods for flexibility
    get: (url, config) => axiosClient.get(url, config),
    post: (url, data, config) => axiosClient.post(url, data, config),
    put: (url, data, config) => axiosClient.put(url, data, config),
    delete: (url, config) => axiosClient.delete(url, config),
};

export default itemApi;