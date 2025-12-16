
import React, {createContext, useState, useContext, useEffect} from "react";
import type {User} from "../types";

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, username: string) =>  Promise<void>;
    logout: () => void;
    isLoading: boolean;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children } : AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });

            if (!response.ok) throw new Error("Invalid login credentials");

            const data = await response.json();

            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem("token", data.access_token);
        } catch (error: any) {
            console.error("Login Failed:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (email: string, password: string, username: string) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password, username}),
            });
            if (!response.ok) throw new Error("Invalid signup credentials");
            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem("token", data.access_token);
        } catch (error: any) {
            console.error("Failed to sign up:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const value = {
        user,
        login,
        signup,
        logout,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}