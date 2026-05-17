//import axiosClient from "./axiosClient";

//export const getTrialBalance = () => {
//    return axiosClient.get("/TrialBalance");
//};
import axiosClient from "./axiosClient";

const API_URL = "/TrialBalance";

export const getTrialBalance = () => {
    return axiosClient.get(API_URL);
};

// ❌ Remove these - they don't exist in backend
// export const getTrialBalanceByDate = (fromDate, toDate) => {
//     return axiosClient.get(`${API_URL}/by-date?fromDate=${fromDate}&toDate=${toDate}`);
// };
// 
// export const getTrialBalanceSummary = () => {
//     return axiosClient.get(`${API_URL}/summary`);
// };

const trialBalanceApi = {
    getTrialBalance
};

export default trialBalanceApi;