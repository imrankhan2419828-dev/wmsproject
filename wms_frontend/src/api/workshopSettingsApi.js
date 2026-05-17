import axiosClient from "./axiosClient";

const API_URL = "/WorkshopSettings";

const workshopSettingsApi = {
    // Get settings for current branch
    getSettings: () => axiosClient.get(API_URL),

    // Create settings
    createSettings: (data) => axiosClient.post(API_URL, data),

    // Update settings
    updateSettings: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    // Check booking capacity
    checkCapacity: (date) => axiosClient.get(`${API_URL}/check-capacity?date=${date}`),

    // Check technician availability
    checkTechnicianAvailability: (technicianId, date) =>
        axiosClient.get(`${API_URL}/check-technician/${technicianId}?date=${date}`)
};

export default workshopSettingsApi;