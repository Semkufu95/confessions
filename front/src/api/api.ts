<<<<<<< HEAD
import * as axios from "axios";


const api = axios.default.create({
    baseURL:  import.meta.env.VITE_API_URL || "http://localhost:5000/api",
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

=======
import * as axios from "axios";


const api = axios.default.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
});

api.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

>>>>>>> 8a7c502 (Added ConfessionService in front, modified the front)
export default api;