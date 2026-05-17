import axiosClient from "./axiosClient";

const API_URL = "/ServiceCatalog";

const serviceCatalogApi = {
    // Get all services
    getAll: () => axiosClient.get(API_URL),

    // Get service by ID
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    // Create new service
    create: (data) => axiosClient.post(API_URL, data),

    // Update service
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    // Delete service
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    // Get services by category
    getByCategory: (category) => axiosClient.get(`${API_URL}/category/${category}`),

    // Search services
    search: (term) => axiosClient.get(`${API_URL}/search?term=${term}`),

    // Get all categories
    getCategories: () => axiosClient.get(`${API_URL}/categories`)
};

export default serviceCatalogApi;