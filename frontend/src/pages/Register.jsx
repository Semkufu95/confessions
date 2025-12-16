import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Register() {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await API.post("/register", form);
            localStorage.setItem("token", res.data.token);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Register</h2>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Username" required
                       className="w-full border p-2 rounded"
                       onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <input type="email" placeholder="Email" required
                       className="w-full border p-2 rounded"
                       onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input type="password" placeholder="Password" required
                       className="w-full border p-2 rounded"
                       onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
                    Register
                </button>
            </form>
        </div>
    );
}
