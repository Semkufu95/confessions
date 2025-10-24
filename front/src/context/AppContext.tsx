import React, {createContext, useContext, useEffect, useState} from 'react';
import type {Confession, Connection} from '../types';
import {ConfessionService} from "../services/ConfessionService.ts";

interface AppContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
    confessions: Confession[];
    starredConfessions: Confession[];
    connections: Connection[];
    toggleStar: (confessionId: string) => void;
    toggleLike: (confessionId: string, type: 'like' | 'boo') => void;
    toggleCommentLike: (confessionId: string, commentId: string, type: 'like' | 'boo') => void;
    addConfession: (content: string, category: string, isAnonymous: boolean) => void;
    addComment: (confessionId: string, content: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

interface AppProviderProps {
    children: React.ReactNode;
}


const mockConnections: Connection[] = [
    {
        id: '1',
        title: 'Looking for a gym buddy',
        description: 'Hey! I just moved to the city and looking for someone to workout with. I usually go early mornings around 6 AM.',
        author: {
            id: '2',
            username: 'FitnessFan',
            email: 'fitness@example.com',
            createdAt: new Date().toISOString(),
        },
        timeStamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        category: 'friendship',
        location: 'Downtown',
        age: 28,
        interests: ['fitness', 'running', 'healthy living'],
    },
];

export function AppProvider({ children }: AppProviderProps) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });
    const [confessions, setConfessions] = useState<Confession[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const data = await ConfessionService.getAll();
                setConfessions(data);
            } catch (error) {
                console.error("Failed to get confessions", error);
            }
        }) ();
    }, []);

    const [starredConfessions, setStarredConfessions] = useState<Confession[]>([]);
    const [connections] = useState<Connection[]>(mockConnections);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    };

    const addConfession = async (content: string, category: string, isAnonymous: boolean) => {
        try {
            const newConfession = await ConfessionService.create(content, category, isAnonymous);
            setConfessions(prev => [newConfession, ...prev]);
        } catch (err) {
            console.error('Failed to add confession:', err);
        }
    };

    const addComment = async (confessionId: string, content: string) => {
        try {
            const newComment = await ConfessionService.comment(confessionId, content);

            // ✅ Ensure all expected fields exist
            const safeComment = {
                ...newComment,
                replies: newComment.replies ?? [],
                author: newComment.author ?? {
                    id: 'anonymous',
                    username: 'Anonymous',
                },
                likes: newComment.likes ?? 0,
                isLiked: newComment.isLiked ?? false,
                isBooed: newComment.isBooed ?? false,
                timeStamp: newComment.timeStamp ?? new Date().toISOString(),
            };

            // ✅ Prepend new comment to keep latest on top
            setConfessions(prev =>
                prev.map(confession =>
                    confession.id === confessionId
                        ? { ...confession, comments: [safeComment, ...confession.comments] }
                        : confession
                )
            );
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };





    // const toggleLike = async (confessionId: string, type: 'like' | 'boo') => {
    //     setConfessions(prev =>
    //         prev.map(conf => {
    //             if (conf.id !== confessionId) return conf;
    //
    //             // Toggle logic
    //             if (type === 'like') {
    //                 const isLiked = !conf.isLiked;
    //                 const updatedLikes = conf.likes + (isLiked ? 1 : -1);
    //
    //                 return {
    //                     ...conf,
    //                     isLiked,
    //                     likes: updatedLikes,
    //                     // Optional: If user switches from boo to like
    //                     isBooed: false,
    //                     boos: conf.isBooed ? conf.boos - 1 : conf.boos,
    //                 };
    //             } else if (type === 'boo') {
    //                 const isBooed = !conf.isBooed;
    //                 const updatedBoos = conf.boos + (isBooed ? 1 : -1);
    //
    //                 return {
    //                     ...conf,
    //                     isBooed,
    //                     boos: updatedBoos,
    //                     // Optional: If user switches from like to boo
    //                     isLiked: false,
    //                     likes: conf.isLiked ? conf.likes - 1 : conf.likes,
    //                 };
    //             }
    //
    //             return conf;
    //         })
    //     );

        // Send update to backend — errors are logged but won't break UI
    //     try {
    //         await ConfessionService.react(confessionId, type);
    //     } catch (err) {
    //         console.error('Failed to react to confession:', err);
    //         // TODO: Rollback UI here if needed
    //     }
    // };


    const toggleLike = async (confessionId: string, type: 'like' | 'boo') => {
        setConfessions(prev =>
            prev.map(conf => {
                if (conf.id !== confessionId) return conf;

                if (type === 'like') {
                    const isLiked = !conf.isLiked;
                    const updatedLikes = conf.likes + (isLiked ? 1 : -1);

                    return {
                        ...conf,
                        isLiked,
                        likes: updatedLikes,
                        isBooed: false,
                        boos: conf.isBooed ? conf.boos - 1 : conf.boos,
                    };
                } else if (type === 'boo') {
                    const isBooed = !conf.isBooed;
                    const updatedBoos = conf.boos + (isBooed ? 1 : -1);

                    return {
                        ...conf,
                        isBooed,
                        boos: updatedBoos,
                        isLiked: false,
                        likes: conf.isLiked ? conf.likes - 1 : conf.likes,
                    };
                }

                return conf;
            })
        );

        try {
            await ConfessionService.react(confessionId, type);
            const refreshedConfessions = await ConfessionService.getAll(); // refetch fresh data from backend
            setConfessions(refreshedConfessions);
        } catch (err) {
            console.error('Failed to react to confession:', err);
        }
    };


    const toggleCommentLike = (confessionId: string, commentId: string, type: 'like' | 'boo') => {
        setConfessions(prev =>
            prev.map(confession => {
                if (confession.id === confessionId) {
                    return {
                        ...confession,
                        comments: confession.comments.map(comment => {
                            if (comment.id === commentId) {
                                if (type === 'like') {
                                    return {
                                        ...comment,
                                        isLiked: !comment.isLiked,
                                        likes: comment.likes + (comment.isLiked ? -1 : 1),
                                    };
                                }
                                // For 'boo' - we'll use the same as system but could extend later
                                return comment;
                            }
                            return comment;
                        }),
                    };
                }
                return confession;
            })
        );
    };
    const toggleStar = (confessionId: string) => {
        setConfessions(prev =>
            prev.map(confession => {
                if (confession.id === confessionId) {
                    const isStarred = !confession.isStarred;
                    const updatedConfession = {
                        ...confession,
                        isStarred,
                        stars: confession.stars + (isStarred ? 1 : -1),
                    };

                    // Update starred confessions list
                    if (isStarred) {
                        setStarredConfessions(current => [...current, updatedConfession]);
                    } else {
                        setStarredConfessions(current =>
                            current.filter(c => c.id !== confessionId)
                        );
                    }

                    return updatedConfession;
                }
                return confession;
            })
        );
    };


    const value = {
        darkMode,
        toggleDarkMode,
        confessions,
        starredConfessions,
        connections,
        toggleStar,
        toggleLike,
        toggleCommentLike,
        addConfession,
        addComment,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}