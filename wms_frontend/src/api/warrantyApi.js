import axiosClient from "./axiosClient";

const API_URL = "/Warranty";

const warrantyApi = {
    // ========== Warranty Claims ==========
    getAll: (status, fromDate, toDate) => {
        let url = API_URL;
        const params = [];
        if (status) params.push(`status=${status}`);
        if (fromDate) params.push(`fromDate=${fromDate}`);
        if (toDate) params.push(`toDate=${toDate}`);
        if (params.length) url += `?${params.join('&')}`;
        return axiosClient.get(url);
    },

    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    create: (data) => axiosClient.post(API_URL, data),

    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    updateStatus: (id, data) => axiosClient.patch(`${API_URL}/${id}/status`, data),

    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    getByJob: (jobCardId) => axiosClient.get(`${API_URL}/job/${jobCardId}`),

    getBySupplier: (supplierId) => axiosClient.get(`${API_URL}/supplier/${supplierId}`),

    // ========== Attachments ==========
    getAttachments: (claimId) => axiosClient.get(`${API_URL}/${claimId}/attachments`),

    addAttachment: (data) => axiosClient.post(`${API_URL}/attachments`, data),

    deleteAttachment: (attachmentId) => axiosClient.delete(`${API_URL}/attachments/${attachmentId}`),

    // ========== History ==========
    getHistory: (claimId) => axiosClient.get(`${API_URL}/${claimId}/history`),

    // ========== Supplier Warranties ==========
    getAllSupplierWarranties: () => axiosClient.get(`${API_URL}/supplier-warranties`),

    getSupplierWarrantyById: (id) => axiosClient.get(`${API_URL}/supplier-warranties/${id}`),

    createSupplierWarranty: (data) => axiosClient.post(`${API_URL}/supplier-warranties`, data),

    updateSupplierWarranty: (id, data) => axiosClient.put(`${API_URL}/supplier-warranties/${id}`, data),

    deleteSupplierWarranty: (id) => axiosClient.delete(`${API_URL}/supplier-warranties/${id}`),

    getWarrantiesBySupplier: (supplierId) => axiosClient.get(`${API_URL}/supplier/${supplierId}/warranties`),

    getWarrantiesByItem: (itemId) => axiosClient.get(`${API_URL}/item/${itemId}/warranties`),

    // ========== Reports & Summary ==========
    getSummary: (fromDate, toDate) => {
        let url = `${API_URL}/summary`;
        const params = [];
        if (fromDate) params.push(`fromDate=${fromDate}`);
        if (toDate) params.push(`toDate=${toDate}`);
        if (params.length) url += `?${params.join('&')}`;
        return axiosClient.get(url);
    },

    generateReport: (fromDate, toDate) => {
        let url = `${API_URL}/report`;
        const params = [];
        if (fromDate) params.push(`fromDate=${fromDate}`);
        if (toDate) params.push(`toDate=${toDate}`);
        if (params.length) url += `?${params.join('&')}`;
        return axiosClient.get(url, { responseType: 'blob' });
    },

    generateClaimReport: (claimId) =>
        axiosClient.get(`${API_URL}/${claimId}/report`, { responseType: 'blob' })
};

export default warrantyApi;