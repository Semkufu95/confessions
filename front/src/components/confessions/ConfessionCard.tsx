import type {Confession} from "../../types";
import {useAuth} from "../../context/AuthContext.tsx";
import {useApp} from "../../context/AppContext.tsx";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {Card} from "../ui/Card.tsx";
import {Button} from "../ui/Button.tsx";
import {MessageSquare, MoreHorizontal, Share, Star, ThumbsDown, ThumbsUp} from "lucide-react";
import {formatTimeAgo} from "../../utils/dateUtils.tsx";
import { motion } from "framer-motion";

interface ConfessionCardProps {
    confession: Confession;
    onClick?: () => void;
}

export function ConfessionCard({ confession, onClick }: ConfessionCardProps) {
    const { user } = useAuth();
    const { toggleStar, toggleLike } = useApp();
    const navigate = useNavigate();
    const [showActions, setShowActions] = useState<boolean>(false);

    const handleAction = (action: () => void) => {
        if (!user) {
            navigate('/login');
            return
        }
        action();
    };
    const handleCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // Don't trigger card click if clicking on buttons
        if ((e.target as HTMLElement).closest('button')) return;
        onClick?.();
    };

    const categoryColors = {
        love: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        friendship: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        work: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        family: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        general: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    };

    // @ts-ignore
    return (
        <Card
            hover={!!onClick}
            className="p-6 cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">A</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                Anonymous
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(confession.timestamp)}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                        {confession.trending && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                            >
                                Trending
                            </span>
                            )}
                        {confession.category && (
                            <span className={
                                `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[confession.category]}`
                            }>
                                {confession.category}
                            </span>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            onClick={() => setShowActions(!showActions)}
                        >
                            <MoreHorizontal size={16} />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed tracking-tight">
                        {confession.content}
                    </p>
                </div>

                {/* Actions*/}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center space-x-1">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction(() => toggleLike(confession.id,'like'))}
                            className={
                            `flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors 
                            ${confession.isLiked
                              ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-900/20'
                            }
                            ${!user ? 'cursor-not-allowed opacity-50' : ''}
                            `}
                            disabled={!user}
                        >
                            <ThumbsUp size={16} />
                            <span>{confession.likes}</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction(() => toggleLike(confession.id,'boo'))}
                            className={
                                `flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors 
                            ${confession.isBooed
                                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-400-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-900/20'
                                }
                            ${!user ? 'cursor-not-allowed opacity-50' : ''}
                            `}
                            disabled={!user}
                        >
                            <ThumbsDown size={16} />
                            <span>{confession.boos}</span>
                        </motion.button>
                    </div>
                    {/* Starred */}
                    <div className="flex items-center space-x-1">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction(() => toggleStar(confession.id))}
                            className={
                                `flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors 
                            ${confession.isLiked
                                    ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-900/20'
                                }
                            ${!user ? 'cursor-not-allowed opacity-50' : ''}
                            `}
                            disabled={!user}
                        >
                            <Star size={16} fill={confession.isStarred ? 'currentColor' : 'none'} />
                            <span>{confession.stars}</span>
                        </motion.button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-2 px-3 py-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onClick) onClick();
                            }}
                        >
                            <MessageSquare size={16} />
                            <span>{confession.comments.length}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-2 px-3 py-2"
                            disabled={!user}
                        >
                            <Share size={16} />
                            <span>{confession.shares}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}