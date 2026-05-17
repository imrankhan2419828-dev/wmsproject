import axiosClient from "./axiosClient";

const API_URL = "/Department";

const departmentApi = {
    // ========== Department CRUD ==========
    getAll: (isActive) => {
        const url = isActive !== undefined ? `${API_URL}?isActive=${isActive}` : API_URL;
        return axiosClient.get(url);
    },

    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    create: (data) => axiosClient.post(API_URL, data),

    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    toggleStatus: (id, isActive) => axiosClient.patch(`${API_URL}/${id}/toggle`, { isActive }),

    // ========== Job Department Assignment ==========
    getJobDepartments: (jobCardId) => axiosClient.get(`${API_URL}/job/${jobCardId}`),

    assignJobToDepartment: (data) => axiosClient.post(`${API_URL}/job/assign`, data),

    completeJobDepartment: (jobCardId, departmentId) =>
        axiosClient.post(`${API_URL}/job/complete?jobCardId=${jobCardId}&departmentId=${departmentId}`),

    getJobsByDepartment: (departmentId, status) => {
        const url = status ? `${API_URL}/department/${departmentId}/jobs?status=${status}` : `${API_URL}/department/${departmentId}/jobs`;
        return axiosClient.get(url);
    },

    // ========== Technician Department Assignment ==========
    getTechnicianDepartments: (technicianId) =>
        axiosClient.get(`${API_URL}/technician/${technicianId}`),

    getDepartmentTechnicians: (departmentId) =>
        axiosClient.get(`${API_URL}/department/${departmentId}/technicians`),

    assignTechnicianToDepartment: (data) =>
        axiosClient.post(`${API_URL}/technician/assign`, data),

    removeTechnicianFromDepartment: (technicianId, departmentId) =>
        axiosClient.delete(`${API_URL}/technician/remove?technicianId=${technicianId}&departmentId=${departmentId}`),

    setPrimaryDepartment: (technicianId, departmentId) =>
        axiosClient.post(`${API_URL}/technician/primary?technicianId=${technicianId}&departmentId=${departmentId}`),

    // ========== Department Services ==========
    getDepartmentServices: (departmentId) =>
        axiosClient.get(`${API_URL}/${departmentId}/services`),

    assignServiceToDepartment: (data) =>
        axiosClient.post(`${API_URL}/services/assign`, data),

    removeServiceFromDepartment: (departmentId, serviceId) =>
        axiosClient.delete(`${API_URL}/services/remove?departmentId=${departmentId}&serviceId=${serviceId}`),

    updateServiceAvailability: (departmentId, serviceId, isAvailable) =>
        axiosClient.patch(`${API_URL}/services/availability?departmentId=${departmentId}&serviceId=${serviceId}&isAvailable=${isAvailable}`),

    // ========== Department Parts ==========
    getDepartmentParts: (departmentId) =>
        axiosClient.get(`${API_URL}/${departmentId}/parts`),

    assignPartToDepartment: (data) =>
        axiosClient.post(`${API_URL}/parts/assign`, data),

    removePartFromDepartment: (departmentId, itemId) =>
        axiosClient.delete(`${API_URL}/parts/remove?departmentId=${departmentId}&itemId=${itemId}`),

    updatePartMinStock: (departmentId, itemId, minStock) =>
        axiosClient.patch(`${API_URL}/parts/minstock?departmentId=${departmentId}&itemId=${itemId}&minStock=${minStock}`),

    // ========== Department Transfers ==========
    getTransfers: (status) => {
        const url = status ? `${API_URL}/transfers?status=${status}` : `${API_URL}/transfers`;
        return axiosClient.get(url);
    },

    createTransfer: (data) => axiosClient.post(`${API_URL}/transfers`, data),

    receiveTransfer: (transferId, data) =>
        axiosClient.post(`${API_URL}/transfers/${transferId}/receive`, data),

    cancelTransfer: (transferId) =>
        axiosClient.post(`${API_URL}/transfers/${transferId}/cancel`),

    // ========== Dashboard & Reports ==========
    getDashboard: () => axiosClient.get(`${API_URL}/dashboard`),

    getSummary: (fromDate, toDate) => {
        let url = `${API_URL}/summary`;
        const params = [];
        if (fromDate) params.push(`fromDate=${fromDate}`);
        if (toDate) params.push(`toDate=${toDate}`);
        if (params.length) url += `?${params.join('&')}`;
        return axiosClient.get(url);
    },

    generateReport: (departmentId, fromDate, toDate) => {
        let url = `${API_URL}/${departmentId}/report`;
        const params = [];
        if (fromDate) params.push(`fromDate=${fromDate}`);
        if (toDate) params.push(`toDate=${toDate}`);
        if (params.length) url += `?${params.join('&')}`;
        return axiosClient.get(url, { responseType: 'blob' });
    }
};

export default departmentApi;