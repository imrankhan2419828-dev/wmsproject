import axiosClient from "./axiosClient";

const API_URL = "/Technician";

const technicianApi = {
    // Get all technicians
    getAll: () => axiosClient.get(API_URL),

    // Get technician by ID
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    // Create new technician
    create: (data) => axiosClient.post(API_URL, data),

    // Update technician
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    // Delete technician
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    // Get available technicians for date
    getAvailable: (date) => {
        const url = date ? `${API_URL}/available?date=${date}` : `${API_URL}/available`;
        return axiosClient.get(url);
    },

    // Get by specialization
    getBySpecialization: (specialization) =>
        axiosClient.get(`${API_URL}/specialization/${specialization}`),

    // Search technicians
    search: (term) => axiosClient.get(`${API_URL}/search?term=${term}`),

    getAll: () => axiosClient.get("/Technician"),//   ya line baad may add kee hai

    // Get technicians for specific job
    getForJob: (jobId) => axiosClient.get(`${API_URL}/for-job/${jobId}`)
};

export default technicianApi;