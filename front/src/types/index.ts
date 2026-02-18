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
    commentsCount: number;
    isLiked?: boolean;
    isBooed?: boolean;
    isStarred?: boolean;
    category?: string;
    trending?: boolean;
}

export interface Comment {
    id: string;
    content: string;
    author: User;
    timeStamp: string;
    likes: number;
    boos?: number;
    replies: Reply[];
    isLiked?: boolean;
    isBooed?: boolean;
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

export interface ConnectionRequestResult {
    status: string;
    message: string;
}

export interface ConnectionProfile {
    id: string;
    username: string;
    createdAt: string;
    connectionsPosted: number;
    categories: string[];
    recentConnections: Array<{
        id: string;
        title: string;
        category: string;
        createdAt: string;
    }>;
}

export interface FriendFollower {
    senderId: string;
    username: string;
    email: string;
    followedAt: string;
    latestConnectionId: string;
    latestConnectionTitle: string;
}

export interface CreateConnectionInput {
    title: string;
    description: string;
    category: "love" | "friendship";
    location?: string;
    age?: number;
    interests: string[];
}

export interface UserSettings {
    pushNotifications: boolean;
    emailNotifications: boolean;
    commentReplies: boolean;
    newFollowers: boolean;
    updatedAt?: string;
}
