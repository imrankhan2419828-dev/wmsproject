import axiosClient from "./axiosClient";

const API_URL = "/Sales";

const salesApi = {
    getAll: () => axiosClient.get(`${API_URL}/all`),
    create: (data) => axiosClient.post(API_URL, data),
    getByTranNumb: (tranNumb) => axiosClient.get(`${API_URL}/${tranNumb}`),
    delete: (tranNumb) => axiosClient.delete(`${API_URL}/${tranNumb}`),
    update: (tranNumb, data) => axiosClient.put(`${API_URL}/${tranNumb}`, data),
    getNextInvoice: () => axiosClient.get(`${API_URL}/next-invoice`),  // NEW
    getCustomers: () => axiosClient.get(`${API_URL}/customers`),       // NEW
    getItems: () => axiosClient.get(`${API_URL}/items`)                // NEW
};

export default salesApi;