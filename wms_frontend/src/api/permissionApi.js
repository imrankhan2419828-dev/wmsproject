//export default permissionApi;
import axiosClient from "./axiosClient";

const permissionApi = {
    // Get all permissions
    getAll: () => axiosClient.get("/RolePermission"),

    // Get permissions by role
    getRolePermissions: (roleId) => axiosClient.get(`/RolePermission/role/${roleId}`),

    // Save single permission
    saveRolePermission: (data) => axiosClient.post("/RolePermission", data),

    // Save bulk permissions
    saveBulkPermissions: async (data) => {
        try {
            console.log("API - Sending data:", data);
            const response = await axiosClient.post("/RolePermission/save-bulk", data);
            console.log("API - Response:", response);
            return response;
        } catch (error) {
            console.error("API Error in saveBulkPermissions:", error);
            console.error("API Error response:", error.response);
            console.error("API Error data:", error.response?.data);
            console.error("Request data was:", data);

            throw {
                ...error,
                response: {
                    ...error.response,
                    data: error.response?.data || { message: "Unknown error occurred" }
                }
            };
        }
    },

    // Delete all permissions for a role
    deleteRolePermissions: (roleId, branchId) =>
        axiosClient.delete(`/RolePermission/role/${roleId}/branch/${branchId}`)
};

export default permissionApi;