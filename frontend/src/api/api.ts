import axios from "axios";


const API = axios.default.create({
    baseURL: API_BASE_URL,
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

export default API;
