import axiosClient from "./axiosClient";

const API_URL = "/VochType";

const vochTypeApi = {
    getAll: () => axiosClient.get(API_URL),
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),
    create: (data) => axiosClient.post(API_URL, data),
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`)
};

export default vochTypeApi;