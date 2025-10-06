import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import API from "../api/api";

export default function ConfessionPage() {
    const { id } = useParams();
    const [confession, setConfession] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const postComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await API.post(`/api/confessions/${id}/comments`, {
                content: newComment,
            });
            setNewComment("");
            // Refresh comments after posting
            fetchConfessionData();
        } catch (error) {
            console.error("Failed to post comment", error);
        }
    };

    const fetchConfessionData = useCallback( async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await API.get(`/api/confessions/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setConfession(res.data.confession);
            setComments(res.data.comments);
        } catch (err) {
            console.error("Failed to load confession", err);
        }
    }, [id]);

    useEffect(() => {
        fetchConfessionData();
    }, [fetchConfessionData]);

    if (!confession) return <p className="text-center">Loading...</p>;

    return (
        <div className="space-y-6 max-w-2xl mx-auto mt-8">
            {/* Confession Box */}
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold">Anonymous Confession</h2>
                <p className="mt-2">{confession.content}</p>
                <small className="text-gray-500 block mt-2">
                    {new Date(confession.created_at).toLocaleString()}
                </small>
            </div>

            {/* Comment Form */}
            <div className="bg-white p-4 rounded shadow">
                <form onSubmit={postComment}>
                    <textarea
                        className="w-full border p-2 rounded"
                        rows="2"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Post Comment
                    </button>
                </form>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="bg-white p-3 rounded shadow"
                        >
                            <p>{comment.content}</p>
                            <small className="text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                            </small>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm">No comments yet.</p>
                )}
            </div>
        </div>
    );
}