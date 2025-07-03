import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow-sm py-3 px-4 mb-6 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
                Confessify
            </Link>
            <div className="space-x-4">
                {!token ? (
                    <>
                        <Link to="/login" className="text-gray-700 hover:text-blue-500">Login</Link>
                        <Link to="/register" className="text-gray-700 hover:text-blue-500">Register</Link>
                    </>
                ) : (
                    <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
                )}
            </div>
        </nav>
    );
}
