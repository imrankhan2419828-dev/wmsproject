import axiosClient from "../../../api/axiosClient";

export const getSalesReport = async (fromDate, toDate, customerId, itemId) => {
    try {
        const response = await axiosClient.get("/reports/sales", {
            params: { fromDate, toDate, customerId, itemId }
        });
        return response.data;
    } catch (error) {
        console.error("Error in getSalesReport:", error);
        throw error;
    }
};

export const getCustomers = async () => {
    try {
        const response = await axiosClient.get("/reports/sales/customers");
        return response.data;
    } catch (error) {
        console.error("Error in getCustomers:", error);
        return [];
    }
};

export const getItems = async () => {
    try {
        const response = await axiosClient.get("/reports/sales/items");
        return response.data;
    } catch (error) {
        console.error("Error in getItems:", error);
        return [];
    }
};