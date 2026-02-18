import { api } from "../api/api";
import type { Connection, CreateConnectionInput, User } from "../types";

type BackendUser = {
    id?: string;
    username?: string;
    email?: string;
    created_at?: string;
    createdAt?: string;
};

type BackendConnection = {
    id: string;
    title?: string;
    description?: string;
    category?: string;
    location?: string;
    age?: number;
    interests?: string[];
    created_at?: string;
    createdAt?: string;
    author?: BackendUser;
    user?: BackendUser;
};

function normalizeUser(user?: BackendUser): User {
    return {
        id: user?.id || "anonymous",
        username: user?.username || "Anonymous",
        email: user?.email || "",
        createdAt: user?.created_at || user?.createdAt || new Date().toISOString(),
    };
}

function normalizeCategory(category?: string): Connection["category"] {
    return category === "love" ? "love" : "friendship";
}

function normalizeConnection(connection: BackendConnection): Connection {
    return {
        id: connection.id,
        title: connection.title || "Untitled connection",
        description: connection.description || "",
        author: normalizeUser(connection.author || connection.user),
        timeStamp: connection.created_at || connection.createdAt || new Date().toISOString(),
        category: normalizeCategory(connection.category),
        location: connection.location,
        age: connection.age,
        interests: Array.isArray(connection.interests) ? connection.interests : [],
    };
}

export const ConnectionService = {
    async getAll(): Promise<Connection[]> {
        const res = await api.get<BackendConnection[]>("/connections");
        return (res.data || []).map(normalizeConnection);
    },

    async create(input: CreateConnectionInput): Promise<Connection> {
        const payload = {
            title: input.title.trim(),
            description: input.description.trim(),
            category: input.category,
            location: input.location?.trim() || undefined,
            age: input.age,
            interests: input.interests,
        };

        const res = await api.post<BackendConnection>("/connections/", payload);
        return normalizeConnection(res.data);
    },
};
