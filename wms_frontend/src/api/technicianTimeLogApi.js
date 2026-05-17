import axiosClient from "./axiosClient";

const API_URL = "/TechnicianTimeLog";

const technicianTimeLogApi = {
    // Get all time logs
    getAll: (date) => {
        const url = date ? `${API_URL}?date=${date}` : API_URL;
        return axiosClient.get(url);
    },

    // Get time log by ID
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    // Clock in
    clockIn: (data) => axiosClient.post(`${API_URL}/clockin`, data),

    // Clock out
    clockOut: (id) => axiosClient.post(`${API_URL}/${id}/clockout`),

    // Start break
    startBreak: (id) => axiosClient.post(`${API_URL}/${id}/break/start`),

    // End break
    endBreak: (id) => axiosClient.post(`${API_URL}/${id}/break/end`),

    // Get technician workload
    getWorkload: (date) => {
        const url = date ? `${API_URL}/workload?date=${date}` : `${API_URL}/workload`;
        return axiosClient.get(url);
    },

    // Get current status for technician
    getCurrentStatus: (technicianId) =>
        axiosClient.get(`${API_URL}/current/${technicianId}`),

    // Get technician logs
    getTechnicianLogs: (technicianId, fromDate, toDate) => {
        let url = `${API_URL}/technician/${technicianId}`;
        const params = [];
        if (fromDate) params.push(`fromDate=${fromDate}`);
        if (toDate) params.push(`toDate=${toDate}`);
        if (params.length) url += `?${params.join('&')}`;
        return axiosClient.get(url);
    },
    // Get technician engagement status
    getEngagementStatus: () => axiosClient.get(`${API_URL}/engagement-status`),
    // Update time log
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    // Delete time log
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`)
};

export default technicianTimeLogApi;