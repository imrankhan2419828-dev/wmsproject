import axiosClient from "../../../api/axiosClient";

// SUMMARY
export const getPurchaseSummary = async (fromDate, toDate) => {
    const response = await axiosClient.get("/reports/purchase/summary", {
        params: { fromDate, toDate }
    });
    return response.data;
};

// DETAIL
export const getPurchaseDetail = async (
    fromDate,
    toDate,
    supplierId,
    itemId
) => {
    const response = await axiosClient.get("/reports/purchase/detail", {
        params: { fromDate, toDate, supplierId, itemId }
    });
    return response.data;
};

export const getSuppliers = async (branchId) => {
    const response = await axiosClient.get("/reports/purchase/suppliers", {
        params: { branchId }
    });
    return response.data;
};

export const getItems = async (branchId) => {
    const response = await axiosClient.get("/reports/purchase/items", {
        params: { branchId }
    });
    return response.data;
};


// PDF
export const downloadPurchaseSummaryPDF = async (fromDate, toDate) => {
    const response = await axiosClient.get("/reports/purchase/summary", {
        params: { fromDate, toDate, ispdf: true },
        responseType: "blob"
    });

    const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
        "download",
        `PurchaseSummary_${fromDate}_to_${toDate}.pdf`
    );

    document.body.appendChild(link);
    link.click();
    link.remove();
};


