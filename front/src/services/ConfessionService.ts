import { api } from "../api/api";
import type { Comment, Confession, User } from "../types";

type BackendUser = {
    id: string;
    username: string;
    email?: string;
    created_at?: string;
    createdAt?: string;
};

type BackendComment = {
    id: string;
    content: string;
    likes?: number;
    boos?: number;
    created_at?: string;
    author?: BackendUser;
};

type BackendConfession = {
    id: string;
    content: string;
    likes?: number;
    boos?: number;
    stars?: number;
    comments?: number;
    category?: Confession["category"];
    created_at?: string;
};

function normalizeUser(user?: BackendUser): User {
    return {
        id: user?.id || "anonymous",
        username: user?.username || "Anonymous",
        email: user?.email || "",
        createdAt: user?.created_at || user?.createdAt || new Date().toISOString(),
    };
}

function normalizeComment(comment: BackendComment): Comment {
    return {
        id: comment.id,
        content: comment.content,
        author: normalizeUser(comment.author),
        timeStamp: comment.created_at || new Date().toISOString(),
        likes: comment.likes || 0,
        boos: comment.boos || 0,
        replies: [],
        isLiked: false,
        isBooed: false,
    };
}

function normalizeConfession(confession: BackendConfession, comments: Comment[] = []): Confession {
    return {
        id: confession.id,
        content: confession.content,
        author: null,
        timeStamp: confession.created_at || new Date().toISOString(),
        likes: confession.likes || 0,
        boos: confession.boos || 0,
        stars: confession.stars || 0,
        shares: 0,
        category: confession.category || "general",
        trending: false,
        comments,
        commentsCount: confession.comments ?? comments.length,
        isLiked: false,
        isBooed: false,
        isStarred: false,
    };
}

export const ConfessionService = {
    async getAll(): Promise<Confession[]> {
        const res = await api.get<BackendConfession[]>("/confessions");
        return res.data.map((item) => normalizeConfession(item));
    },

    async getWithComments(id: string): Promise<Confession> {
        const res = await api.get<{ confession: BackendConfession; comments: BackendComment[] }>(`/confessions/${id}/comments`);
        const comments = (res.data.comments || []).map(normalizeComment);
        return normalizeConfession(res.data.confession, comments);
    },

    async create(content: string, category: string, isAnonymous: boolean): Promise<Confession> {
        const res = await api.post<BackendConfession>("/confessions/", { content, category, isAnonymous });
        return normalizeConfession(res.data);
    },

    async star(id: string): Promise<Confession> {
        const res = await api.post<BackendConfession>(`/confessions/${id}/star`);
        return normalizeConfession(res.data);
    },

    async reactConfession(id: string, type: "like" | "boo"): Promise<Confession> {
        const res = await api.post<BackendConfession>(`/confessions/${id}/react`, { type });
        return normalizeConfession(res.data);
    },

    async comment(confessionId: string, content: string): Promise<Comment> {
        const res = await api.post<BackendComment>(`/comments/${confessionId}`, { content });
        return normalizeComment(res.data);
    },

    async reactComment(commentId: string, type: "like" | "boo"): Promise<Comment> {
        const res = await api.post<BackendComment>(`/comments/${commentId}/react`, { type });
        return normalizeComment(res.data);
    },
};
