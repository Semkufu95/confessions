import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Comment, Confession, Connection } from "../types";
import { ConfessionService } from "../services/ConfessionService";

interface AppContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
    confessions: Confession[];
    starredConfessions: Confession[];
    connections: Connection[];
    isLoadingConfessions: boolean;
    confessionsError: string | null;
    refreshConfessions: () => Promise<void>;
    toggleStar: (confessionId: string) => Promise<void>;
    toggleLike: (confessionId: string, type: "like" | "boo") => Promise<void>;
    toggleCommentLike: (confessionId: string, commentId: string, type: "like" | "boo") => Promise<void>;
    addConfession: (content: string, category: string, isAnonymous: boolean) => Promise<void>;
    addComment: (confessionId: string, content: string) => Promise<void>;
    getConfessionById: (confessionId: string) => Promise<Confession | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}

interface AppProviderProps {
    children: React.ReactNode;
}

const mockConnections: Connection[] = [
    {
        id: "1",
        title: "Looking for a gym buddy",
        description:
            "Hey! I just moved to the city and looking for someone to workout with. I usually go early mornings around 6 AM.",
        author: {
            id: "2",
            username: "FitnessFan",
            email: "fitness@example.com",
            createdAt: new Date().toISOString(),
        },
        timeStamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        category: "friendship",
        location: "Downtown",
        age: 28,
        interests: ["fitness", "running", "healthy living"],
    },
];

export function AppProvider({ children }: AppProviderProps) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("darkMode");
        return saved ? JSON.parse(saved) : false;
    });
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [isLoadingConfessions, setIsLoadingConfessions] = useState(false);
    const [confessionsError, setConfessionsError] = useState<string | null>(null);
    const [connections] = useState<Connection[]>(mockConnections);
    const [starredIds, setStarredIds] = useState<string[]>(() => {
        const saved = localStorage.getItem("starredConfessionIds");
        return saved ? JSON.parse(saved) : [];
    });

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        localStorage.setItem("darkMode", JSON.stringify(next));
    };

    const refreshConfessions = async () => {
        setIsLoadingConfessions(true);
        setConfessionsError(null);
        try {
            const data = await ConfessionService.getAll();
            setConfessions((previous) => {
                const previousById = new Map(previous.map((item) => [item.id, item]));
                return data.map((item) => {
                    const prev = previousById.get(item.id);
                    return {
                        ...item,
                        isStarred: starredIds.includes(item.id),
                        isLiked: prev?.isLiked ?? false,
                        isBooed: prev?.isBooed ?? false,
                    };
                });
            });
        } catch (error) {
            console.error("Failed to fetch confessions:", error);
            setConfessionsError("Could not load confessions. Please try again.");
        } finally {
            setIsLoadingConfessions(false);
        }
    };

    useEffect(() => {
        void refreshConfessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        let wsURL: string;
        try {
            const httpURL = new URL(apiUrl);
            wsURL = `${httpURL.protocol === "https:" ? "wss" : "ws"}://${httpURL.host}/ws`;
        } catch {
            wsURL = "ws://localhost:5000/ws";
        }

        const socket = new WebSocket(wsURL);
        socket.onmessage = () => {
            void refreshConfessions();
        };
        socket.onerror = () => {
            // Keep UI functional even when websocket is unavailable.
        };

        return () => {
            socket.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addConfession = async (content: string, category: string, isAnonymous: boolean) => {
        try {
            const created = await ConfessionService.create(content, category, isAnonymous);
            setConfessions((prev) => [created, ...prev]);
        } catch (error) {
            console.error("Failed to create confession:", error);
            throw error;
        }
    };

    const addComment = async (confessionId: string, content: string) => {
        try {
            const comment = await ConfessionService.comment(confessionId, content);
            setConfessions((prev) =>
                prev.map((confession) =>
                    confession.id === confessionId
                        ? {
                              ...confession,
                              commentsCount: confession.commentsCount + 1,
                              comments: [comment, ...confession.comments],
                          }
                        : confession
                )
            );
        } catch (error) {
            console.error("Failed to add comment:", error);
            throw error;
        }
    };

    const toggleLike = async (confessionId: string, type: "like" | "boo") => {
        try {
            const updated = await ConfessionService.reactConfession(confessionId, type);
            setConfessions((prev) =>
                prev.map((confession) =>
                    confession.id === confessionId
                        ? {
                              ...confession,
                              likes: updated.likes,
                              boos: updated.boos,
                              isLiked: type === "like",
                              isBooed: type === "boo",
                          }
                        : confession
                )
            );
        } catch (error) {
            console.error("Failed to react to confession:", error);
            throw error;
        }
    };

    const toggleCommentLike = async (confessionId: string, commentId: string, type: "like" | "boo") => {
        try {
            const updated = await ConfessionService.reactComment(commentId, type);
            setConfessions((prev) =>
                prev.map((confession) => {
                    if (confession.id !== confessionId) return confession;
                    const comments = confession.comments.map((comment: Comment) =>
                        comment.id === commentId
                            ? {
                                  ...comment,
                                  likes: updated.likes,
                                  boos: updated.boos || 0,
                                  isLiked: type === "like",
                                  isBooed: type === "boo",
                              }
                            : comment
                    );
                    return { ...confession, comments };
                })
            );
        } catch (error) {
            console.error("Failed to react to comment:", error);
            throw error;
        }
    };

    const toggleStar = async (confessionId: string) => {
        try {
            const updated = await ConfessionService.star(confessionId);
            setConfessions((prev) =>
                prev.map((confession) =>
                    confession.id === confessionId
                        ? {
                              ...confession,
                              stars: updated.stars,
                              isStarred: true,
                          }
                        : confession
                )
            );
            setStarredIds((prev) => {
                if (prev.includes(confessionId)) return prev;
                const next = [...prev, confessionId];
                localStorage.setItem("starredConfessionIds", JSON.stringify(next));
                return next;
            });
        } catch (error) {
            console.error("Failed to star confession:", error);
            throw error;
        }
    };

    const getConfessionById = async (confessionId: string) => {
        try {
            const detailed = await ConfessionService.getWithComments(confessionId);
            detailed.isStarred = starredIds.includes(confessionId);
            setConfessions((prev) =>
                prev.map((item) =>
                    item.id === confessionId
                        ? {
                              ...item,
                              ...detailed,
                              isLiked: item.isLiked,
                              isBooed: item.isBooed,
                              isStarred: detailed.isStarred,
                          }
                        : item
                )
            );
            return detailed;
        } catch (error) {
            console.error("Failed to fetch confession detail:", error);
            return null;
        }
    };

    const starredConfessions = useMemo(
        () => confessions.filter((confession) => starredIds.includes(confession.id)),
        [confessions, starredIds]
    );

    const value = {
        darkMode,
        toggleDarkMode,
        confessions,
        starredConfessions,
        connections,
        isLoadingConfessions,
        confessionsError,
        refreshConfessions,
        toggleStar,
        toggleLike,
        toggleCommentLike,
        addConfession,
        addComment,
        getConfessionById,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
