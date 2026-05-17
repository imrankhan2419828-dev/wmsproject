import axiosClient from "./axiosClient";

const API_URL = "/SaleReturn";

const salesReturnApi = {
    getAll: () => axiosClient.get(`${API_URL}/all`),

    getByReturnTranNumb: (returnTranNumb) =>
        axiosClient.get(`${API_URL}/${returnTranNumb}`),

    getSaleItemsForReturn: (saleTranNumb) =>
        axiosClient.get(`${API_URL}/sale-items/${saleTranNumb}`),

    // ✅ NEW: Get all returns for a specific sale
    getReturnsBySale: (saleTranNumb) =>
        axiosClient.get(`${API_URL}/by-sale/${saleTranNumb}`),

    getOpenSales: () => axiosClient.get(`${API_URL}/open-sales`),

    getNextBill: () => axiosClient.get(`${API_URL}/next-bill`),

    create: (data) => axiosClient.post(API_URL, data),

    delete: (returnTranNumb) =>
        axiosClient.delete(`${API_URL}/${returnTranNumb}`),
};

export default salesReturnApi;