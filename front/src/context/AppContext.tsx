import type {Confession} from "../types";
import React, {createContext, useContext, useState} from "react";

interface AppContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
    confessions: Confession[];
    starredConfessions: Confession[];
    connections: Connection[];
    toggleStar: (confessionId: string) => void;
    toggleLike: (confessionId: string, type: 'like' | 'boo') => void;
    addConfession: (content: string, category: string, isAnonymous: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

interface AppProviderProps {
    children: React.ReactNode;
}
// Mock data
const mockConfessions: Confession[] = [
    {
        id: '1',
        content: "I've been pretending to understand crypto for 3 years. Every time someone mentions Bitcoin, I nod and say 'interesting' while having no clue what they're talking about.",
        author: null,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 127,
        boos: 8,
        stars: 34,
        shares: 12,
        comments: [
            {
                id: 'c1',
                content: "Honestly, same here! I just smile and nod whenever crypto comes up in conversation. The FOMO is real but so is the confusion.",
                author: {
                    id: 'u1',
                    username: 'cryptonoob',
                    email: 'crypto@example.com',
                    createdAt: new Date().toISOString(),
                },
                timeStamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                likes: 23,
                replies: [
                    {
                        id: 'r1',
                        content: "At least we're honest about not knowing! Better than pretending to be experts.",
                        author: {
                            id: 'u2',
                            username: 'honestperson',
                            email: 'honest@example.com',
                            createdAt: new Date().toISOString(),
                        },
                        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                        likes: 8,
                    }
                ],
            },
            {
                id: 'c2',
                content: "You should try learning the basics! Start with understanding what blockchain actually is. There are some great beginner-friendly resources out there.",
                author: {
                    id: 'u3',
                    username: 'cryptoteacher',
                    email: 'teacher@example.com',
                    createdAt: new Date().toISOString(),
                },
                timeStamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                likes: 15,
                replies: [],
            }
        ],
        category: 'work',
        trending: true,
    },
    {
        id: '2',
        content: "I matched with my ex on a dating app and we both swiped right. We've been texting for a week and neither of us has mentioned that we dated for 2 years.",
        author: null,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 89,
        boos: 15,
        stars: 67,
        shares: 23,
        comments: [
            {
                id: 'c3',
                content: "This is like a romantic comedy waiting to happen! You should definitely bring it up - could be a funny story to tell later.",
                author: {
                    id: 'u4',
                    username: 'romanticadvice',
                    email: 'romantic@example.com',
                    createdAt: new Date().toISOString(),
                },
                timeStamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                likes: 12,
                replies: [],
            }
        ],
        category: 'love',
    },
    {
        id: '3',
        content: "I told my boss I needed time off for a 'family emergency' but really I just wanted to play the new video game that came out. Spent 12 hours straight playing and it was worth every lie.",
        author: null,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        likes: 156,
        boos: 42,
        stars: 28,
        shares: 5,
        comments: [],
        category: 'work',
        trending: true,
    },
];

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
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        category: 'friendship',
        location: 'Downtown',
        age: 28,
        interests: ['fitness', 'running', 'healthy living'],
    },
    {
        id: '2',
        title: 'Coffee dates and deep conversations',
        description: 'Looking for someone who enjoys meaningful conversations over good coffee. Love discussing books, philosophy, and life.',
        author: {
            id: '3',
            username: 'BookLover',
            email: 'books@example.com',
            createdAt: new Date().toISOString(),
        },
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        category: 'love',
        age: 25,
        interests: ['reading', 'philosophy', 'coffee', 'art'],
    },
];


export function AppProvider({ children }: AppProviderProps) {
    const [ darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });
    // TODO: remove mockData and replace with API call
    const [ confessions, setConfessions ] = useState<Confession[]>(mockConfessions);
    const [ starredConfessions, setStarredConfessions ] = useState<Confession[]>([]);
    const [ connections ] = useState<Connection[]>(mockConnections);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    }

    const addConfession = (content: string, category: string, isAnonymous: boolean) => {
        const newConfession: Confession = {
            id: Math.random().toString(36).substring(2, 9),
            content,
            author: isAnonymous ? null: {
                id: 'current-user',
                username: 'You',
                email: 'user@example.com',
                createdAt: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
            likes: 0,
            boos: 0,
            stars: 0,
            shares: 0,
            comments: [],
            category: category as 'love' | 'friendship' | 'work' | 'family' | 'general',
            trending: false,
        };
        setConfessions(prev => [newConfession, ...prev]);
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

    const toggleLike = (confessionId: string, type: 'like' | 'boo') => {
        setConfessions(prev =>
            prev.map(confession => {
                if (confession.id === confessionId) {
                    if (type === 'like') {
                        return {
                            ...confession,
                            isLiked: !confession.isLiked,
                            likes: confession.likes + (confession.isLiked ? -1 : 1),
                            isBooed: false, // Remove boo if liking.
                            boos: confession.isBooed ? confession.boos - 1 : confession.boos,
                        };
                    } else {
                        return {
                            ...confession,
                            isBooed: !confession.isBooed,
                            boos: confession.boos + (confession.isBooed ? -1 : 1),
                            isLiked: false, // Remove like if booing.
                            likes: confession.isLiked ? confession.likes - 1 : confession.likes,
                        };
                    }
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
        addConfession,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}