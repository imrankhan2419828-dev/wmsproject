import axiosClient from "./axiosClient";

const API_URL = "/Notification";

const notificationApi = {
    // ========== Notifications ==========
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

    send: (id) => axiosClient.post(`${API_URL}/${id}/send`),

    resend: (id) => axiosClient.post(`${API_URL}/${id}/resend`),

    cancel: (id) => axiosClient.post(`${API_URL}/${id}/cancel`),

    getStats: (fromDate, toDate) => {
        let url = `${API_URL}/stats`;
        const params = [];
        if (fromDate) params.push(`fromDate=${fromDate}`);
        if (toDate) params.push(`toDate=${toDate}`);
        if (params.length) url += `?${params.join('&')}`;
        return axiosClient.get(url);
    },

    // ========== Templates ==========
    getTemplates: () => axiosClient.get(`${API_URL}/templates`),

    getTemplateById: (id) => axiosClient.get(`${API_URL}/templates/${id}`),

    createTemplate: (data) => axiosClient.post(`${API_URL}/templates`, data),

    updateTemplate: (id, data) => axiosClient.put(`${API_URL}/templates/${id}`, data),

    deleteTemplate: (id) => axiosClient.delete(`${API_URL}/templates/${id}`),

    // ========== Customer Preferences ==========
    getPreferences: (customerId) => axiosClient.get(`${API_URL}/preferences/${customerId}`),

    updatePreferences: (data) => axiosClient.put(`${API_URL}/preferences`, data),

    createDefaultPreferences: (customerId) =>
        axiosClient.post(`${API_URL}/preferences/${customerId}/default`),

    // ========== Auto Notifications ==========
    sendJobCreated: (jobCardId) => axiosClient.post(`${API_URL}/job-created/${jobCardId}`),

    sendJobReady: (jobCardId) => axiosClient.post(`${API_URL}/job-ready/${jobCardId}`),

    sendJobDelivered: (jobCardId) => axiosClient.post(`${API_URL}/job-delivered/${jobCardId}`),

    // ========== Bulk Operations ==========
    sendBulk: (data) => axiosClient.post(`${API_URL}/bulk`, data),

    processPending: () => axiosClient.post(`${API_URL}/process-pending`)
};

export default notificationApi;