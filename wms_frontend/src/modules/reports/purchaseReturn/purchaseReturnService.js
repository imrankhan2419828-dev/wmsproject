import axiosClient from "../../../api/axiosClient";

export const getPurchaseReturnReport = async (fromDate, toDate, supplierId, itemId) => {
    try {
        const response = await axiosClient.get("/reports/purchase-return", {
            params: { fromDate, toDate, supplierId, itemId }
        });
        return response.data;
    } catch (error) {
        console.error("Report API error:", error);
        throw error;
    }
};

export const getSuppliers = async () => {
    try {
        console.log("🔵 Fetching suppliers...");
        const response = await axiosClient.get("/reports/purchase-return/suppliers");
        console.log("🟢 Suppliers response:", response);
        console.log("🟢 Suppliers data:", response.data);
        return response.data;
    } catch (error) {
        console.error("🔴 Suppliers API error:", error);
        console.error("Error response:", error.response);
        console.error("Error data:", error.response?.data);
        return [];
    }
};

export const getItems = async () => {
    try {
        console.log("🔵 Fetching items...");
        console.log("Full URL:", axiosClient.defaults.baseURL + "/reports/purchase-return/items");

        const response = await axiosClient.get("/reports/purchase-return/items");

        console.log("🟢 Items response:", response);
        console.log("🟢 Items data:", response.data);
        console.log("🟢 Items data type:", typeof response.data);
        console.log("🟢 Is array:", Array.isArray(response.data));

        return response.data;
    } catch (error) {
        console.error("🔴 Items API error:", error);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        console.error("Error headers:", error.response?.headers);
        return [];
    }
};