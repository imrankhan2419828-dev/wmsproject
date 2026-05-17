import axiosClient from "./axiosClient";

// Get all account groups
export const getAllGroups = () => {
    return axiosClient.get("/AccountGroup/groups");
};

// Get group by code
export const getGroupByCode = (groupCode) => {
    return axiosClient.get(`/AccountGroup/group/${groupCode}`);
};

// Get accounts by group
export const getAccountsByGroup = (groupCode) => {
    return axiosClient.get(`/AccountGroup/${groupCode}/accounts`);
};

// Get suppliers
export const getSuppliersDynamic = () => {
    return axiosClient.get("/AccountGroup/suppliers");
};

// Get customers dynamic
export const getCustomersDynamic = () => {
    return axiosClient.get("/AccountGroup/customers");
};

// Get bank accounts dynamic
export const getBankAccountsDynamic = () => {
    return axiosClient.get("/AccountGroup/banks");
};

// Get cash accounts dynamic
export const getCashAccountsDynamic = () => {
    return axiosClient.get("/AccountGroup/cash");
};