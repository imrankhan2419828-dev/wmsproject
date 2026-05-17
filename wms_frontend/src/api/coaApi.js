import axiosClient from "./axiosClient";

// ====================================================================
// TREE ENDPOINTS
// ====================================================================

export const getCoaTree = () => {
    return axiosClient.get("/Coa/tree");
};

export const getAccountById = (id) => {
    return axiosClient.get(`/Coa/${id}`);
};

// ====================================================================
// CRUD ENDPOINTS
// ====================================================================

export const createCoa = (data) => {
    return axiosClient.post("/Coa", data);
};

export const updateCoa = (data) => {
    return axiosClient.put("/Coa", data);
};

export const deleteCoa = (id) => {
    return axiosClient.delete(`/Coa/${id}`);
};

// ====================================================================
// STEP CONFIGURATION ENDPOINTS
// ====================================================================

export const getStepConfig = (step, parentCode = null) => {
    let url = `/Coa/step-config?step=${step}`;
    if (parentCode) url += `&parentCode=${parentCode}`;
    return axiosClient.get(url);
};

export const getParentOptions = (level = null, acctType = null, category = null) => {
    let url = "/Coa/parent-options";
    const params = new URLSearchParams();
    if (level !== null && level !== undefined) params.append("level", level);
    if (acctType) params.append("acctType", acctType);
    if (category) params.append("category", category);
    if (params.toString()) url += `?${params.toString()}`;
    return axiosClient.get(url);
};

// ====================================================================
// CATEGORY ENDPOINTS (For dropdowns)
// ====================================================================

export const getCustomers = () => {
    return axiosClient.get("/Coa/customers");
};

export const getSuppliers = () => {
    return axiosClient.get("/Coa/suppliers");
};

export const getBankAccounts = () => {
    return axiosClient.get("/Coa/banks");
};

export const getExpenseAccounts = () => {
    return axiosClient.get("/Coa/expenses");
};

export const getOtherAccounts = () => {
    return axiosClient.get("/Coa/other");
};

// ====================================================================
// VALIDATION ENDPOINTS
// ====================================================================

export const validateAccountCode = (acctCode) => {
    return axiosClient.get(`/Coa/validate/code?acctCode=${acctCode}`);
};

export const validateAccountName = (parentCode, acctName, excludeId = null) => {
    let url = `/Coa/validate/name?parentCode=${parentCode || ''}&acctName=${acctName}`;
    if (excludeId) url += `&excludeId=${excludeId}`;
    return axiosClient.get(url);
};

// ====================================================================
// HELPER ENDPOINTS
// ====================================================================

export const getControlAccountsByLevel = (level) => {
    return axiosClient.get(`/Coa/control-accounts/${level}`);
};
