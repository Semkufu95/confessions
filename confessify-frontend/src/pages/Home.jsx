import { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";

export default function Home() {
    const [confessions, setConfessions] = useState([]);
    const [newConfession, setNewConfession] = useState("");

    const fetchConfessions = async () => {
        const res = await API.get("/confessions");
        setConfessions(res.data);
    };

    const postConfession = async (e) => {
        e.preventDefault();
        if (!newConfession.trim()) return;

        await API.post("/confessions", { content: newConfession });
        setNewConfession("");
        fetchConfessions(); // refresh list
    };

    useEffect(() => {
        fetchConfessions();
    }, []);

    return (
        <div className="space-y-6">
            <form onSubmit={postConfession} className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-2">Post a Confession</h2>
                <textarea
                    className="w-full border rounded p-2"
                    rows="3"
                    value={newConfession}
                    onChange={(e) => setNewConfession(e.target.value)}
                    placeholder="Write your secret..."
                />
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Submit
                </button>
            </form>

            <div className="space-y-4">
                {confessions.map((conf) => (
                    <Link
                        key={conf.id}
                        to={`/confessions/${conf.id}`}
                        className="block bg-white p-4 rounded shadow hover:bg-gray-50"
                    >
                        <p>{conf.content}</p>
                        <small className="text-gray-500">{new Date(conf.created_at).toLocaleString()}</small>
                    </Link>
                ))}
            </div>
        </div>
    );
}
