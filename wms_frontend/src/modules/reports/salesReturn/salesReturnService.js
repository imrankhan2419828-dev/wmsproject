import axiosClient from "../../../api/axiosClient";

export const getSalesReturnReport = async (fromDate, toDate, customerId, itemId) => {
    try {
        const response = await axiosClient.get("/reports/sales-return", {
            params: { fromDate, toDate, customerId, itemId }
        });
        return response.data;
    } catch (error) {
        console.error("Error in getSalesReturnReport:", error);
        throw error;
    }
};

export const getCustomers = async () => {
    try {
        const response = await axiosClient.get("/reports/sales-return/customers");
        return response.data;
    } catch (error) {
        console.error("Error in getCustomers:", error);
        return [];
    }
};

export const getItems = async () => {
    try {
        const response = await axiosClient.get("/reports/sales-return/items");
        return response.data;
    } catch (error) {
        console.error("Error in getItems:", error);
        return [];
    }
};