import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/api";
import type { User } from "../types";

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, username: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

type AuthResponse = {
    user: {
        id: string;
        username: string;
        email: string;
        created_at?: string;
        createdAt?: string;
    };
    access_token: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

function normalizeUser(user: AuthResponse["user"]): User {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at || user.createdAt || new Date().toISOString(),
    };
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("user");
            }
        }
    }, []);

    useEffect(() => {
        const handleForcedLogout = () => {
            setUser(null);
        };
        window.addEventListener("auth:logout", handleForcedLogout);
        return () => {
            window.removeEventListener("auth:logout", handleForcedLogout);
        };
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.post<AuthResponse>("/login", { email, password });
            const nextUser = normalizeUser(response.data.user);
            setUser(nextUser);
            localStorage.setItem("user", JSON.stringify(nextUser));
            localStorage.setItem("token", response.data.access_token);
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (email: string, password: string, username: string) => {
        setIsLoading(true);
        try {
            const response = await api.post<AuthResponse>("/register", { email, password, username });
            const nextUser = normalizeUser(response.data.user);
            setUser(nextUser);
            localStorage.setItem("user", JSON.stringify(nextUser));
            localStorage.setItem("token", response.data.access_token);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (localStorage.getItem("token")) {
                await api.post("/logout");
            }
        } catch {
            // Always clear client auth state even if network logout fails.
        } finally {
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("auth:logout"));
            }
        }
    };

    const value = useMemo(
        () => ({
            user,
            login,
            signup,
            logout,
            isLoading,
        }),
        [user, isLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
