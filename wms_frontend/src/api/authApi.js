//import axiosClient from "./axiosClient";

//const authApi = {
//    login: (payload) => axiosClient.post("Auth/login", payload),
//};

//export default authApi;
import axiosClient from "./axiosClient";

export const loginApi = async (username, password) => {
    const res = await axiosClient.post("/auth/login", {
        userName: username,
        password: password,
    });
    return res.data;
};
