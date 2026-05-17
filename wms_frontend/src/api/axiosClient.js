//import axios from "axios";

//const axiosClient = axios.create({
//    baseURL: "https://localhost:44331/api",
//    headers: {
//        "Content-Type": "application/json",
//    },
//});

//axiosClient.interceptors.request.use(
//    (config) => {
//        const token = localStorage.getItem("token");
//        if (token) {
//            config.headers.Authorization = `Bearer ${token}`;
//        }
//        return config;
//    },
//    (error) => Promise.reject(error)
//);

//export default axiosClient;
import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://localhost:44331/api",
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        const selectedBranch = localStorage.getItem("selectedBranch");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 👇 Add branch header for all requests
        if (selectedBranch) {
            config.headers["X-Branch-ID"] = selectedBranch;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosClient;