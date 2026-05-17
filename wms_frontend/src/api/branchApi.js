//import axiosClient from "./axiosClient";

//const branchApi = {
//    getAll: () => axiosClient.get("/Branch"),
//    getById: (id) => axiosClient.get(`/Branch/${id}`),
//    create: (data) => axiosClient.post("/Branch", data),
//    update: (id, data) => axiosClient.put(`/Branch/${id}`, data),
//    delete: (id) => axiosClient.delete(`/Branch/${id}`)
//};

//export default branchApi;
import axiosClient from "./axiosClient";

const API_URL = "/Branch";

const branchApi = {
    // Get all branches (SuperAdmin sees all, others see only their branch)
    getAll: () => axiosClient.get(API_URL),

    // Get branch by ID
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    // Create branch (SuperAdmin only)
    create: (data) => axiosClient.post(API_URL, data),

    // Update branch (SuperAdmin only)
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    // Delete branch (SuperAdmin only)
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    // Get current user's branch
    getCurrent: () => axiosClient.get(`${API_URL}/current`),

    // Get all branches for dropdown (SuperAdmin only)
    getDropdown: () => axiosClient.get(`${API_URL}/dropdown`)
};

export default branchApi;