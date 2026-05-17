import axiosClient from "./axiosClient";

const API_URL = "/Inspection";

const inspectionApi = {
    // ========== Templates ==========
    getTemplates: () => axiosClient.get(`${API_URL}/templates`),
    getTemplateById: (id) => axiosClient.get(`${API_URL}/templates/${id}`),
    createTemplate: (data) => axiosClient.post(`${API_URL}/templates`, data),
    updateTemplate: (id, data) => axiosClient.put(`${API_URL}/templates/${id}`, data),
    deleteTemplate: (id) => axiosClient.delete(`${API_URL}/templates/${id}`),

    // ========== Inspection Items ==========
    getItemsByTemplate: (templateId) =>
        axiosClient.get(`${API_URL}/templates/${templateId}/items`),
    getItemById: (id) => axiosClient.get(`${API_URL}/items/${id}`),
    createItem: (data) => axiosClient.post(`${API_URL}/items`, data),
    updateItem: (id, data) => axiosClient.put(`${API_URL}/items/${id}`, data),
    deleteItem: (id) => axiosClient.delete(`${API_URL}/items/${id}`),

    // ========== Job Inspections ==========
    getInspectionsByJob: (jobCardId) =>
        axiosClient.get(`${API_URL}/job/${jobCardId}`),
    getInspectionById: (id) => axiosClient.get(`${API_URL}/${id}`),
    createInspection: (data) => axiosClient.post(API_URL, data),
    startInspection: (id) => axiosClient.post(`${API_URL}/${id}/start`),
    submitInspection: (id, data) => axiosClient.post(`${API_URL}/${id}/submit`, data),
    updateInspectionStatus: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),
    deleteInspection: (id) => axiosClient.delete(`${API_URL}/${id}`),

    // ========== Results ==========
    getResultsByInspection: (inspectionId) =>
        axiosClient.get(`${API_URL}/${inspectionId}/results`),
    submitResult: (data) => axiosClient.post(`${API_URL}/results`, data),

    // ========== Reports ==========
    generateReport: (id) => axiosClient.get(`${API_URL}/${id}/report`, {
        responseType: 'blob'
    })
};

export default inspectionApi;