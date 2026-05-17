import axiosClient from "./axiosClient";

const API_URL = "/FormDetail";

const formDetailApi = {
    getAll: () => axiosClient.get(API_URL),
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),
    getByCategory: (category) => axiosClient.get(`${API_URL}/by-category/${category}`),
    getMenu: () => axiosClient.get(`${API_URL}/menu`),

    // ✅ Ensure proper JSON headers
    create: (data) => axiosClient.post(API_URL, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    }),

    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    }),

    delete: (id) => axiosClient.delete(`${API_URL}/${id}`)
};

export default formDetailApi;