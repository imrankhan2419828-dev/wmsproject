// File: src/api/subcategoryApi.js

import axiosClient from "./axiosClient";

const API_URL = "/Subcategory";

const subcategoryApi = {
    getAll: () => {
        console.log("Calling API: GET /Subcategory/all");
        return axiosClient.get(`${API_URL}/all`);
    },
    getByCategory: (catgId) => axiosClient.get(`${API_URL}/by-category/${catgId}`),
    create: (data) => axiosClient.post(API_URL, data),
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`)
};

export default subcategoryApi;