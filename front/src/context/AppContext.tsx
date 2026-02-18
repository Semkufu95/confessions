import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Comment, Confession, Connection, CreateConnectionInput } from "../types";
import { ConfessionService } from "../services/ConfessionService";
import { ConnectionService } from "../services/ConnectionService";

export interface RealtimeNotification {
    id: string;
    title: string;
    message: string;
    variant: "info" | "success" | "warning";
}

interface AppContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
    confessions: Confession[];
    starredConfessions: Confession[];
    connections: Connection[];
    notifications: RealtimeNotification[];
    isLoadingConfessions: boolean;
    confessionsError: string | null;
    refreshConfessions: () => Promise<void>;
    toggleStar: (confessionId: string) => Promise<void>;
    toggleLike: (confessionId: string, type: "like" | "boo") => Promise<void>;
    toggleCommentLike: (confessionId: string, commentId: string, type: "like" | "boo") => Promise<void>;
    addConfession: (content: string, category: string, isAnonymous: boolean) => Promise<void>;
    addConnection: (input: CreateConnectionInput) => Promise<void>;
    addComment: (confessionId: string, content: string) => Promise<void>;
    getConfessionById: (confessionId: string) => Promise<Confession | null>;
    dismissNotification: (notificationId: string) => void;
}

interface RealtimeEvent {
    channel: string;
    payload: Record<string, unknown>;
}

const MAX_NOTIFICATIONS = 4;
const AUTO_DISMISS_MS = 6000;
const NOTIFICATION_FILTER_STORAGE_KEY = "realtimeNotificationChannels";
const DEFAULT_NOTIFICATION_CHANNELS = [
    "confessions:confession:created",
    "confessions:comment:created",
];

function getEnabledNotificationChannels(): Set<string> {
    const defaults = new Set(DEFAULT_NOTIFICATION_CHANNELS);

    if (typeof window === "undefined") {
        return defaults;
    }

    try {
        const raw = localStorage.getItem(NOTIFICATION_FILTER_STORAGE_KEY);
        if (!raw) return defaults;

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return defaults;

        const values = parsed.filter((item): item is string => typeof item === "string" && item.trim() !== "");
        if (values.length === 0) return defaults;
        return new Set(values);
    } catch {
        return defaults;
    }
}

function shorten(value: string | undefined, maxLength = 120): string {
    if (!value) return "";
    const compact = value.replace(/\s+/g, " ").trim();
    if (compact.length <= maxLength) return compact;
    return `${compact.slice(0, maxLength - 1)}...`;
}

function parseRealtimeEvent(raw: string): RealtimeEvent | null {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as {
            channel?: string;
            payload?: Record<string, unknown>;
        };

        if (parsed?.channel && typeof parsed.channel === "string" && parsed.payload && typeof parsed.payload === "object") {
            return {
                channel: parsed.channel,
                payload: parsed.payload,
            };
        }

        // Backward compatibility for older websocket payloads.
        if (parsed && typeof parsed === "object") {
            if ("confession_id" in parsed && "content" in parsed) {
                return { channel: "confessions:comment:created", payload: parsed as Record<string, unknown> };
            }
            if ("confession_id" in parsed || "comment_id" in parsed) {
                return { channel: "confessions:reaction:updated", payload: parsed as Record<string, unknown> };
            }
            if ("content" in parsed) {
                return { channel: "confessions:confession:updated", payload: parsed as Record<string, unknown> };
            }
            if ("id" in parsed) {
                return { channel: "confessions:confession:deleted", payload: parsed as Record<string, unknown> };
            }
        }
    } catch {
        return null;
    }
    return null;
}

function buildNotification(event: RealtimeEvent): Omit<RealtimeNotification, "id"> | null {
    const content = typeof event.payload.content === "string" ? event.payload.content : undefined;
    const snippet = shorten(content);

    switch (event.channel) {
        case "confessions:confession:created":
            return {
                title: "New confession",
                message: snippet || "A new confession was posted.",
                variant: "success",
            };
        case "confessions:confession:updated":
            return {
                title: "Confession updated",
                message: snippet || "A confession was edited.",
                variant: "info",
            };
        case "confessions:confession:deleted":
            return {
                title: "Confession removed",
                message: "A confession was deleted.",
                variant: "warning",
            };
        case "confessions:comment:created":
            return {
                title: "New comment",
                message: snippet || "Someone commented on a confession.",
                variant: "success",
            };
        case "confessions:comment:updated":
            return {
                title: "Comment updated",
                message: snippet || "A comment was edited.",
                variant: "info",
            };
        case "confessions:comment:deleted":
            return {
                title: "Comment removed",
                message: "A comment was deleted.",
                variant: "warning",
            };
        case "confessions:confession:starred":
            return {
                title: "Confession starred",
                message: "A confession just received a star.",
                variant: "info",
            };
        case "confessions:reaction:updated":
            return {
                title: "New reaction",
                message: "Someone reacted to a confession or comment.",
                variant: "info",
            };
        case "confessions:reaction:removed":
            return {
                title: "Reaction removed",
                message: "A reaction was removed.",
                variant: "info",
            };
        default:
            return null;
    }
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

export function AppProvider({ children }: AppProviderProps) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("darkMode");
        return saved ? JSON.parse(saved) : false;
    });
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [isLoadingConfessions, setIsLoadingConfessions] = useState(false);
    const [confessionsError, setConfessionsError] = useState<string | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
    const [starredIds, setStarredIds] = useState<string[]>(() => {
        const saved = localStorage.getItem("starredConfessionIds");
        return saved ? JSON.parse(saved) : [];
    });
    const notificationTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const enabledNotificationChannels = useMemo(() => getEnabledNotificationChannels(), []);

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        localStorage.setItem("darkMode", JSON.stringify(next));
    };

    const dismissNotification = (notificationId: string) => {
        const timer = notificationTimers.current[notificationId];
        if (timer) {
            clearTimeout(timer);
            delete notificationTimers.current[notificationId];
        }
        setNotifications((previous) => previous.filter((item) => item.id !== notificationId));
    };

    const pushNotification = (input: Omit<RealtimeNotification, "id">) => {
        const id = typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const nextNotification: RealtimeNotification = {
            id,
            ...input,
        };

        setNotifications((previous) => [nextNotification, ...previous].slice(0, MAX_NOTIFICATIONS));

        notificationTimers.current[id] = setTimeout(() => {
            dismissNotification(id);
        }, AUTO_DISMISS_MS);
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

    const refreshConnections = async () => {
        try {
            const data = await ConnectionService.getAll();
            setConnections(data);
        } catch (error) {
            console.error("Failed to fetch connections:", error);
            setConnections([]);
        }
    };

    useEffect(() => {
        void refreshConfessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        void refreshConnections();
    }, []);

    useEffect(() => {
        return () => {
            Object.values(notificationTimers.current).forEach((timer) => clearTimeout(timer));
            notificationTimers.current = {};
        };
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
        socket.onmessage = (event) => {
            const parsed = parseRealtimeEvent(typeof event.data === "string" ? event.data : "");
            if (!parsed) return;

            void refreshConfessions();

            if (!enabledNotificationChannels.has(parsed.channel)) {
                return;
            }

            const notification = buildNotification(parsed);
            if (notification) {
                pushNotification(notification);
            }
        };
        socket.onerror = () => {
            // Keep UI functional even when websocket is unavailable.
        };

        return () => {
            socket.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabledNotificationChannels]);

    const addConfession = async (content: string, category: string, isAnonymous: boolean) => {
        try {
            const created = await ConfessionService.create(content, category, isAnonymous);
            setConfessions((prev) => [created, ...prev]);
        } catch (error) {
            console.error("Failed to create confession:", error);
            throw error;
        }
    };

    const addConnection = async (input: CreateConnectionInput) => {
        try {
            const created = await ConnectionService.create(input);
            setConnections((prev) => [created, ...prev]);
        } catch (error) {
            console.error("Failed to create connection:", error);
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
        notifications,
        isLoadingConfessions,
        confessionsError,
        refreshConfessions,
        toggleStar,
        toggleLike,
        toggleCommentLike,
        addConfession,
        addConnection,
        addComment,
        getConfessionById,
        dismissNotification,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
