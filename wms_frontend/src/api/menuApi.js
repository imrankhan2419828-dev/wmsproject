import axiosClient from "./axiosClient";

const menuApi = {
    getAll: () => axiosClient.get("/FormDetail"),

    getByCategory: (category) => axiosClient.get(`/FormDetail/category/${category}`)
};

export default menuApi;
