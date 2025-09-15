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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        //TODO: Replace mockUser with api call
        const mockUser: User = {
            id: '1',
            username: email.split('@')[0],
            email,
            createdAt: new Date().toISOString(),
        };

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setIsLoading(false);
    };

    const signup = async (email: string, password: string, username: string) => {
        setIsLoading(true);
        // TODO: Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser: User = {
            id: Math.random().toString(36),
            username,
            email,
            createdAt: new Date().toISOString(),
        };

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const value = {
        user,
        login,
        signup,
        logout,
        isLoading,
    };

    return (
        <AuthContext.Provider value={ value }>
            {children}
        </AuthContext.Provider>
    );
}