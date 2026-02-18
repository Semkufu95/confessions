import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
    baseURL: apiBaseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((request) => {
    const token = localStorage.getItem("token");
    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("auth:logout"));
            }
        }
        return Promise.reject(error);
    }
);
