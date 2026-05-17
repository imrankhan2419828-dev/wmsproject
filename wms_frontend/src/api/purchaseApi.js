import axiosClient from "./axiosClient";

const purchaseApi = {
    // Main CRUD
    create: (data) => axiosClient.post("/purchase", data),
    update: (id, data) => axiosClient.put(`/purchase/${id}`, data),
    delete: (id) => axiosClient.delete(`/purchase/${id}`),
    getAll: () => axiosClient.get("/purchase"),
    getById: (id) => axiosClient.get(`/purchase/${id}`),

    // 🔥 NEW: Dropdown data
    getSuppliers: () => axiosClient.get("/purchase/suppliers"),
    getItems: () => axiosClient.get("/purchase/items"),
    getNextBill: () => axiosClient.get("/purchase/next-bill"),
};

export default purchaseApi;