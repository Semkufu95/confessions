export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    isAnonymous?: boolean;
    createdAt: string;
}

export interface Confession {
    id: string;
    content: string;
    author: User | null;
    timeStamp: string;
    likes: number;
    boos: number;
    stars: number;
    shares: number;
    comments: Comment[];
    isLiked?: boolean;
    isBooed?: boolean;
    isStarred?: boolean;
    category?: 'love' | 'friendship' | 'work' | 'family' | 'general';
    trending?: boolean;
}

export interface Comment {
    id: string;
    content: string;
    author: User;
    timeStamp: string;
    likes: number;
    replies: Reply[];
    isLiked?: boolean;
}

export interface Reply {
    id: string;
    content: string;
    author: User;
    timeStamp: string;
    likes: number;
    isLiked?: boolean;
}

export interface Connection {
    id: string;
    title: string;
    description: string;
    author: User;
    timeStamp: string;
    category: 'love' | 'friendship';
    location?: string;
    age?: number;
    interests: string[];
}