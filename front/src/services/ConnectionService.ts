import { api } from "../api/api";
import type { Connection, ConnectionProfile, ConnectionRequestResult, CreateConnectionInput, User } from "../types";

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

type BackendConnectionRequest = {
    status?: string;
};

type BackendConnectResponse = {
    message?: string;
    request?: BackendConnectionRequest;
};

type BackendConnectionPreview = {
    id?: string;
    title?: string;
    category?: string;
    created_at?: string;
    createdAt?: string;
};

type BackendConnectionProfile = {
    id?: string;
    username?: string;
    created_at?: string;
    createdAt?: string;
    connections_posted?: number;
    connectionsPosted?: number;
    categories?: string[];
    recent_connections?: BackendConnectionPreview[];
    recentConnections?: BackendConnectionPreview[];
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

function normalizeConnectionProfile(profile: BackendConnectionProfile): ConnectionProfile {
    const recent = profile.recent_connections || profile.recentConnections || [];
    return {
        id: profile.id || "",
        username: profile.username || "Unknown",
        createdAt: profile.created_at || profile.createdAt || new Date().toISOString(),
        connectionsPosted: profile.connections_posted || profile.connectionsPosted || 0,
        categories: Array.isArray(profile.categories) ? profile.categories : [],
        recentConnections: recent.map((item) => ({
            id: item.id || "",
            title: item.title || "Untitled",
            category: item.category || "friendship",
            createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        })),
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

    async connect(connectionId: string): Promise<ConnectionRequestResult> {
        const res = await api.post<BackendConnectResponse>(`/connections/${connectionId}/connect`);
        return {
            status: res.data?.request?.status || "pending",
            message: res.data?.message || "Connection request sent",
        };
    },

    async getProfile(connectionId: string): Promise<ConnectionProfile> {
        const res = await api.get<BackendConnectionProfile>(`/connections/${connectionId}/profile`);
        return normalizeConnectionProfile(res.data);
    },
};
