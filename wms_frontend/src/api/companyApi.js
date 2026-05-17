//export default companyApi;
import axiosClient from "./axiosClient";

const COMPANY_API = "/CompFile";

const companyApi = {
    getAll: () => axiosClient.get(COMPANY_API),
    getById: (id) => axiosClient.get(`${COMPANY_API}/${id}`),
    create: (data) => axiosClient.post(COMPANY_API, data),
    update: (id, data) => axiosClient.put(`${COMPANY_API}/${id}`, data),
    delete: (id) => axiosClient.delete(`${COMPANY_API}/${id}`),
};

export default companyApi;