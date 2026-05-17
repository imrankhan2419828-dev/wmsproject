//export const saveToken = (token) => localStorage.setItem("token", token);
//export const getToken = () => localStorage.getItem("token");
//export const removeToken = () => localStorage.removeItem("token");

//export const saveUser = (data) =>
//    localStorage.setItem("user", JSON.stringify(data));

//export const getUser = () =>
//    JSON.parse(localStorage.getItem("user") || "{}");

//export const removeUser = () => localStorage.removeItem("user");
export const setToken = (token) => {
    localStorage.setItem("wms_token", token);
};

export const getToken = () => {
    return localStorage.getItem("wms_token");
};

export const clearToken = () => {
    localStorage.removeItem("wms_token");
};
