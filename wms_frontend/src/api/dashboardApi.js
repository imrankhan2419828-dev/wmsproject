import axiosClient from "./axiosClient";

const API_URL = "/Dashboard";

const dashboardApi = {
    // Financial APIs - Updated with new response structure
    getPurchaseSummary: (branchId) => {
        const params = branchId ? { branchId } : {};
        return axiosClient.get(`${API_URL}/financial/purchase-summary`, { params });
    },
    getPurchaseReturnSummary: (branchId) => {
        const params = branchId ? { branchId } : {};
        return axiosClient.get(`${API_URL}/financial/purchase-return-summary`, { params });
    },
    getSaleSummary: (branchId) => {
        const params = branchId ? { branchId } : {};
        return axiosClient.get(`${API_URL}/financial/sale-summary`, { params });
    },
    getSaleReturnSummary: (branchId) => {
        const params = branchId ? { branchId } : {};
        return axiosClient.get(`${API_URL}/financial/sale-return-summary`, { params });
    },
    getPaymentSummary: (branchId) => {
        const params = branchId ? { branchId } : {};
        return axiosClient.get(`${API_URL}/financial/payment-summary`, { params });
    },
    getReceivingSummary: (branchId) => {
        const params = branchId ? { branchId } : {};
        return axiosClient.get(`${API_URL}/financial/receiving-summary`, { params });
    },
    getJobCardSummary: (branchId) => {
        const params = branchId ? { branchId } : {};
        return axiosClient.get(`${API_URL}/workshop/jobcard-summary`, { params });
    },
    getBookingSummary: (branchId) => {
        const params = branchId ? { branchId } : {};
        return axiosClient.get(`${API_URL}/workshop/booking-summary`, { params });
    },
    getTechnicianWorkload: (branchId) => {
        const params = branchId ? { branchId } : {};
        return axiosClient.get(`${API_URL}/workshop/technician-workload`, { params });
    },
    getAllDashboardData: (branchId) => {
        const params = branchId ? { branchId } : {};
        return axiosClient.get(`${API_URL}/all`, { params });
    }
};

export default dashboardApi;