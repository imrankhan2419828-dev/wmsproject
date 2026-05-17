//export default purchaseReturnApi;

import axiosClient from "./axiosClient";

const API_URL = "/PurchaseReturn";

const purchaseReturnApi = {
    getAll: () => axiosClient.get(`${API_URL}/all`),

    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    create: (data) => axiosClient.post(API_URL, data),

    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    getPurchasesForReturn: () => axiosClient.get(`${API_URL}/for-return`),

    getPurchaseItemsForReturn: (tranNumb) =>
        axiosClient.get(`${API_URL}/purchase/${tranNumb}`),

    getNextBill: () => axiosClient.get(`${API_URL}/next-bill`),

    // Add this method to your API
    getReturnsByPurchase: (purchaseTranNumb) => axiosClient.get(`/purchasereturn/by-purchase/${purchaseTranNumb}`),
};

export default purchaseReturnApi;





