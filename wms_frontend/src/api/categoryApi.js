
//export default categoryApi;
import axiosClient from "./axiosClient";

const categoryApi = {
    getAll: () => axiosClient.get("/CatgFile"),
    getById: (id) => axiosClient.get(`/CatgFile/${id}`),
    create: (data) => axiosClient.post("/CatgFile", data),
    update: (id, data) => axiosClient.put(`/CatgFile/${id}`, data),
    delete: (id) => axiosClient.delete(`/CatgFile/${id}`)
};

export default categoryApi;