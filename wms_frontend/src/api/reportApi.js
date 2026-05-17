import axiosClient from "./axiosClient";

const API_URL = "/Report";

const reportApi = {
    getGeneralLedger: (params) => {
        const queryParams = new URLSearchParams();
        if (params.fromDate) queryParams.append("fromDate", params.fromDate);
        if (params.toDate) queryParams.append("toDate", params.toDate);
        if (params.accountId) queryParams.append("accountId", params.accountId);
        if (params.voucherType) queryParams.append("voucherType", params.voucherType);

        const url = queryParams.toString() ? `${API_URL}/general-ledger?${queryParams}` : `${API_URL}/general-ledger`;
        return axiosClient.get(url);
    },

    getCustomerStatement: (fromDate, toDate, customerId = null) => {
        let url = `${API_URL}/customer-statement?fromDate=${fromDate}&toDate=${toDate}`;
        if (customerId) url += `&customerId=${customerId}`;
        return axiosClient.get(url);
    },


    getSupplierStatement: (fromDate, toDate, supplierId = null) => {
        let url = `${API_URL}/supplier-statement?fromDate=${fromDate}&toDate=${toDate}`;
        if (supplierId) url += `&supplierId=${supplierId}`;
        return axiosClient.get(url);
    },

    getPurchaseReport: (fromDate, toDate, supplierId = null, itemId = null) => {
        let url = `${API_URL}/purchase-report?fromDate=${fromDate}&toDate=${toDate}`;
        if (supplierId) url += `&supplierId=${supplierId}`;
        if (itemId) url += `&itemId=${itemId}`;
        return axiosClient.get(url);
    },

    getPurchaseReturnReport: (fromDate, toDate, supplierId = null, itemId = null) => {
        let url = `${API_URL}/purchase-return-report?fromDate=${fromDate}&toDate=${toDate}`;
        if (supplierId) url += `&supplierId=${supplierId}`;
        if (itemId) url += `&itemId=${itemId}`;
        return axiosClient.get(url);
    },

    getSaleReport: (fromDate, toDate, customerId = null, itemId = null) => {
        let url = `${API_URL}/sale-report?fromDate=${fromDate}&toDate=${toDate}`;
        if (customerId) url += `&customerId=${customerId}`;
        if (itemId) url += `&itemId=${itemId}`;
        return axiosClient.get(url);
    },

    getSaleReturnReport: (fromDate, toDate, customerId = null, itemId = null) => {
        let url = `${API_URL}/sale-return-report?fromDate=${fromDate}&toDate=${toDate}`;
        if (customerId) url += `&customerId=${customerId}`;
        if (itemId) url += `&itemId=${itemId}`;
        return axiosClient.get(url);
    },

    getStockReport: (fromDate, toDate, itemId = null, companyId = null, categoryId = null, subcategoryId = null, godownId = null, showRateValue = true) => {
        let url = `${API_URL}/stock-report?fromDate=${fromDate}&toDate=${toDate}`;
        if (itemId) url += `&itemId=${itemId}`;
        if (companyId) url += `&companyId=${companyId}`;
        if (categoryId) url += `&categoryId=${categoryId}`;
        if (subcategoryId) url += `&subcategoryId=${subcategoryId}`;
        if (godownId) url += `&godownId=${godownId}`;
        url += `&showRateValue=${showRateValue}`;
        return axiosClient.get(url);
    },

    getProfitLoss: (fromDate, toDate) => axiosClient.get(`${API_URL}/profit-loss?fromDate=${fromDate}&toDate=${toDate}`),

    getBankStatement: (fromDate, toDate, bankAccountId = null) => {
        let url = `${API_URL}/bank-statement?fromDate=${fromDate}&toDate=${toDate}`;
        if (bankAccountId) url += `&bankAccountId=${bankAccountId}`;
        return axiosClient.get(url);
    },


    getTrialBalance: (fromDate, toDate) => {
        return axiosClient.get(`${API_URL}/trial-balance?fromDate=${fromDate}&toDate=${toDate}`);
    }
};

export default reportApi;