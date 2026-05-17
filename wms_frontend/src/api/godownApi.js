import axiosClient from "./axiosClient";

const API_URL = "/Godown";

const godownApi = {
    getAll: () => axiosClient.get(API_URL),
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),
    create: (data) => axiosClient.post(API_URL, data),
    update: (data) => axiosClient.put(API_URL, data),
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),
};

export default godownApi;