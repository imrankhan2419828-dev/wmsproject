import axiosClient from "./axiosClient";

// Trial Balance
export const getTrialBalance = (asOnDate = null, includeZeroBalances = false, level = null) => {
    let url = "/FinancialReport/trialbalance";
    const params = new URLSearchParams();
    if (asOnDate) params.append("asOnDate", asOnDate);
    params.append("includeZeroBalances", includeZeroBalances);
    if (level !== null) params.append("level", level);
    if (params.toString()) url += `?${params.toString()}`;
    return axiosClient.get(url);
};

// Trial Balance Hierarchy
export const getTrialBalanceHierarchy = (asOnDate = null) => {
    let url = "/FinancialReport/trialbalance/hierarchy";
    if (asOnDate) url += `?asOnDate=${asOnDate}`;
    return axiosClient.get(url);
};

// Profit & Loss
export const getProfitLoss = (startDate, endDate, includeBudget = false) => {
    return axiosClient.get(`/FinancialReport/profitloss`, {
        params: { startDate, endDate, includeBudget }
    });
};

// Comparative Profit & Loss
export const getComparativeProfitLoss = (currentStartDate, currentEndDate, previousStartDate = null, previousEndDate = null) => {
    const params = { currentStartDate, currentEndDate };
    if (previousStartDate) params.previousStartDate = previousStartDate;
    if (previousEndDate) params.previousEndDate = previousEndDate;
    return axiosClient.get(`/FinancialReport/profitloss/comparative`, { params });
};

// Balance Sheet
export const getBalanceSheet = (asOnDate, includePreviousYear = false) => {
    return axiosClient.get(`/FinancialReport/balancesheet`, {
        params: { asOnDate, includePreviousYear }
    });
};

// Vertical Balance Sheet
export const getVerticalBalanceSheet = (asOnDate) => {
    return axiosClient.get(`/FinancialReport/balancesheet/vertical`, {
        params: { asOnDate }
    });
};

// Cash Flow Statement
export const getCashFlowStatement = (startDate, endDate) => {
    return axiosClient.get(`/FinancialReport/cashflow`, {
        params: { startDate, endDate }
    });
};

// General Ledger
export const getGeneralLedger = (accountId, fromDate, toDate) => {
    return axiosClient.get(`/FinancialReport/generalledger/${accountId}`, {
        params: { fromDate, toDate }
    });
};

// Account Statement
export const getAccountStatement = (accountId, fromDate, toDate) => {
    return axiosClient.get(`/FinancialReport/accountstatement/${accountId}`, {
        params: { fromDate, toDate }
    });
};

// Net Profit/Loss
export const getNetProfitLoss = (startDate, endDate) => {
    return axiosClient.get(`/FinancialReport/netprofit`, {
        params: { startDate, endDate }
    });
};