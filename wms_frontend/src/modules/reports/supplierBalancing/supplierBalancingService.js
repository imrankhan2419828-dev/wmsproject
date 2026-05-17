import axiosClient from "../../../api/axiosClient";

export const getSupplierBalancing = async (
    fromDate,
    toDate,
    supplierId,
    branchId
) => {
    try {
        const response = await axiosClient.get(
            "/reports/supplier-balancing",
            {
                params: {
                    fromDate,
                    toDate,
                    supplierId,
                    branchId
                }
            }
        );

        return response.data; // { transactions: [], openingBalance: 0 }
    } catch (error) {
        console.error("Error in getSupplierBalancing:", error);
        throw error;
    }
};

export const getSuppliers = async (branchId) => {
    try {
        const response = await axiosClient.get(
            "/reports/supplier-balancing/suppliers",
            { params: { branchId } }
        );
        return response.data;
    } catch (error) {
        console.error("Error in getSuppliers:", error);
        throw error;
    }
};