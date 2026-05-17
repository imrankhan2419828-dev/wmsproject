import axiosClient from "./axiosClient";

const API_URL = "/Voucher";

const voucherApi = {
    // Get all vouchers with filters
    getAll: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.vochType) queryParams.append("vochType", params.vochType);
        if (params.fromDate) queryParams.append("fromDate", params.fromDate);
        if (params.toDate) queryParams.append("toDate", params.toDate);

        const url = queryParams.toString() ? `${API_URL}?${queryParams}` : API_URL;
        return axiosClient.get(url);
    },
    // Get accounts for voucher dropdown
    getAccounts: () => axiosClient.get(`${API_URL}/accounts`),
    // Get single voucher by ID
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    // Create manual journal voucher
    createManualJournal: (data) => axiosClient.post(`${API_URL}/manual-journal`, data),

    // Post voucher to ledger
    postToLedger: (id) => axiosClient.post(`${API_URL}/${id}/post`),

    // Reverse posting
    reversePosting: (id) => axiosClient.post(`${API_URL}/${id}/reverse`),
    deleteVoucher: (id) => axiosClient.delete(`${API_URL}/${id}`),
    // Print voucher
    printVoucher: (id) => axiosClient.get(`${API_URL}/${id}/print`, { responseType: 'blob' })
};

export default voucherApi;