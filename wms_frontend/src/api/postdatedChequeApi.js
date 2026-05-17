//import axiosClient from "./axiosClient";

//const API_URL = "/PostdatedCheque";

//const postdatedChequeApi = {
//    // GET all cheques (with optional status filter)
//    getAll: (status = '') => {
//        const url = status ? `${API_URL}?status=${status}` : API_URL;
//        return axiosClient.get(url);
//    },

//    // GET cheque by ID
//    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

//    // CREATE new cheque
//    create: (data) => axiosClient.post(API_URL, data),

//    // UPDATE status
//    updateStatus: (id, data) => axiosClient.put(`${API_URL}/${id}/status`, data),

//    // DEPOSIT cheque
//    deposit: (id, depositDate) => axiosClient.post(`${API_URL}/${id}/deposit`, depositDate),

//    // CLEAR cheque
//    clear: (id) => axiosClient.post(`${API_URL}/${id}/clear`),

//    // BOUNCE cheque
//    bounce: (id, reason) => axiosClient.post(`${API_URL}/${id}/bounce`, reason),

//    // CANCEL cheque
//    cancel: (id, reason) => axiosClient.post(`${API_URL}/${id}/cancel`, reason),

//    // DELETE cheque
//    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

//    // PROCESS due cheques
//    processDue: () => axiosClient.post(`${API_URL}/process-due`),

//    // GET summary
//    getSummary: () => axiosClient.get(`${API_URL}/summary`),

//    // GET by date range
//    getByDateRange: (fromDate, toDate) =>
//        axiosClient.get(`${API_URL}/by-date-range?fromDate=${fromDate}&toDate=${toDate}`),

//    getAccountsByType: (type) => axiosClient.get(`${API_URL}/accounts/${type}`),

//    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

//    // GET by source
//    getBySource: (sourceType, sourceId) =>
//        axiosClient.get(`${API_URL}/by-source/${sourceType}/${sourceId}`)
//};

//export default postdatedChequeApi;

import axiosClient from "./axiosClient";

const API_URL = "/PostdatedCheque";

const postdatedChequeApi = {
    // GET all cheques (with optional status filter)
    getAll: (status = '') => {
        const url = status ? `${API_URL}?status=${status}` : API_URL;
        return axiosClient.get(url);
    },

    // GET cheque by ID
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    // CREATE new cheque
    create: (data) => axiosClient.post(API_URL, data),

    // UPDATE entire cheque
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    // UPDATE status
    updateStatus: (id, data) => axiosClient.put(`${API_URL}/${id}/status`, data),

    // DEPOSIT cheque
    deposit: (id, depositDate) => axiosClient.post(`${API_URL}/${id}/deposit`, depositDate),

    // CLEAR cheque
    clear: (id) => axiosClient.post(`${API_URL}/${id}/clear`),

    // BOUNCE cheque
    bounce: (id, reason) => axiosClient.post(`${API_URL}/${id}/bounce`, reason),

    // CANCEL cheque
    cancel: (id, reason) => axiosClient.post(`${API_URL}/${id}/cancel`, reason),

    // DELETE cheque
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    // PROCESS due cheques
    processDue: () => axiosClient.post(`${API_URL}/process-due`),

    // GET summary
    getSummary: () => axiosClient.get(`${API_URL}/summary`),

    // GET by date range
    getByDateRange: (fromDate, toDate) =>
        axiosClient.get(`${API_URL}/by-date-range?fromDate=${fromDate}&toDate=${toDate}`),

    // GET accounts by type
    getAccountsByType: (type) => axiosClient.get(`${API_URL}/accounts/${type}`),

    // GET by source
    getBySource: (sourceType, sourceId) =>
        axiosClient.get(`${API_URL}/by-source/${sourceType}/${sourceId}`)
};

export default postdatedChequeApi;