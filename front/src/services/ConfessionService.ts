import api from "../api/api.ts";

export const ConfessionService = {
    // Fetch all confessions
    async getAll() {
        const res = await api.get("/confessions");
        return res.data.map((item: any) => ({
            id: item.id,
            content: item.content,
            author: item.author || null,
            timeStamp: item.created_at || item.timeStamp,
            likes: item.likes || 0,
            boos: item.boos || 0,
            stars: item.stars || 0,
            shares: item.shares || 0,
            category: item.category,
            comments: (item.comments || []).map((c: any) => ({
                id: c.id,
                content: c.content,
                author: c.author,
                timeStamp: c.created_at || c.timeStamp,
                likes: c.likes || 0,
                replies: c.replies || [],
            })),
        }));
    },

    // Create a new confession
    async create(content: string, category: string, isAnonymous: boolean) {
        const res = await api.post("/confessions", { content, category, isAnonymous });
        return res.data;
    },

    // React to a confession (like/boo)
    async react(id: string, type: "like" | "boo") {
        const res = await api.post(`/confessions/${id}/react`, { type });
        return res.data;
    },

    // Add a comment to a confession
    async comment(confessionId: string, content: string) {
        const res = await api.post(`/comments/${confessionId}`, { content });
        return res.data;
    },
};
