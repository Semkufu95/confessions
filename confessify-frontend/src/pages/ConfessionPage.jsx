import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";

export default function ConfessionPage() {
    const { id } = useParams();
    const [confession, setConfession] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const fetchData = async () => {
        try {
            const res = await API.get(`/confessions/${id}`);
            setConfession(res.data.confession);
            setComments(res.data.comments);
        } catch (err) {
            console.error("Failed to load confession");
        }
    };

    const postComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        await API.post(`/confessions/${id}/comments`, { content: newComment });
        setNewComment("");
        fetchData(); // reload comments
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (!confession) return <p>Loading...</p>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold">Anonymous Confession</h2>
                <p className="mt-2">{confession.content}</p>
                <small className="text-gray-500">{new Date(confession.created_at).toLocaleString()}</small>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <form onSubmit={postComment}>
          <textarea
              className="w-full border p-2 rounded"
              rows="2"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
          />
                    <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Post Comment
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-white p-3 rounded shadow">
                            <p>{comment.content}</p>
                            <small className="text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                            </small>
                        </div>
                    ))
                ) : (
                    <p>No comments yet.</p>
                )}
            </div>
        </div>
    );
}
