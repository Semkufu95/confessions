import * as axios from "axios";


export const api = axios.default.create({
    baseURL:  import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    // baseURL: "/api" in production
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});