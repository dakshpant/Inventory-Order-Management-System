import { api } from "./api";
api.interceptors.request.use((config) => {
    return config;
}, (error) => Promise.reject(error));
api.interceptors.response.use((response) => response, (error) => {
    const message = error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Request failed";
    return Promise.reject(new Error(message));
});
export default api;
