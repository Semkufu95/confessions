import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Share2, Star, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CommentCard } from '../components/confessions/CommentCard';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { formatTimeAgo } from '../utils/dateUtils';

export function ConfessionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { confessions, toggleStar, toggleLike, addComment, toggleCommentLike } = useApp();
    const [newComment, setNewComment] = useState('');

    const confession = confessions.find(c => c.id === id);

    if (!confession) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                        Confession not found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 tracking-tight mb-4">
                        This confession may have been deleted or doesn't exist.
                    </p>
                    <Button onClick={() => navigate('/')}>
                        Go back home
                    </Button>
                </div>
            </div>
        );
    }

    const handleAction = (action: () => void) => {
        if (!user) {
            navigate('/login');
            return;
        }
        action();
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        addComment(confession.id, newComment);
        setNewComment('');
    };

    const handleReply = (commentId: string, content: string) => {
        if (!user) return;
        console.log('Adding reply to comment:', commentId, content);
    };

    const handleCommentLike = (commentId: string, type: 'like' | 'boo' = 'like') => {
        if (!user) return;
        toggleCommentLike(confession.id, commentId, type);
    };

    const handleCommentBoo = (commentId: string) => {
        handleCommentLike(commentId, 'boo');
    };

    const categoryColors = {
        love: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        friendship: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        work: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        family: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };

    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-4"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </Button>
                </motion.div>

                {/* Confession Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card hover={false} className="p-6">
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-medium">A</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                            Anonymous
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatTimeAgo(confession.timeStamp)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {confession.trending && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                      Trending
                    </span>
                                    )}
                                    {confession.category && (
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[confession.category]}`}>
                      {confession.category}
                    </span>
                                    )}

                                    <Button variant="ghost" size="sm" className="p-2">
                                        <MoreHorizontal size={16} />
                                    </Button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                                <p className="text-gray-900 dark:text-gray-100 leading-relaxed tracking-tight text-lg">
                                    {confession.content}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center space-x-1">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleAction(() => toggleLike(confession.id, 'like'))}
                                        className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors
                      ${confession.isLiked
                                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                        }
                      ${!user ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                                        disabled={!user}
                                    >
                                        <ThumbsUp size={18} />
                                        <span>{confession.likes}</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleAction(() => toggleLike(confession.id, 'boo'))}
                                        className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors
                      ${confession.isBooed
                                            ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                        }
                      ${!user ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                                        disabled={!user}
                                    >
                                        <ThumbsDown size={18} />
                                        <span>{confession.boos}</span>
                                    </motion.button>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleAction(() => toggleStar(confession.id))}
                                        className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors
                      ${confession.isStarred
                                            ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                        }
                      ${!user ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                                        disabled={!user}
                                    >
                                        <Star size={18} fill={confession.isStarred ? 'currentColor' : 'none'} />
                                        <span>{confession.stars}</span>
                                    </motion.button>

                                    <Button
                                        variant="ghost"
                                        className="flex items-center space-x-2 px-4 py-2"
                                        disabled={!user}
                                    >
                                        <Share2 size={18} />
                                        <span>{confession.shares}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Comment Form */}
                {user && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="p-6">
                            <form onSubmit={handleCommentSubmit} className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                                    </div>
                                    <div className="flex-1">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 tracking-tight"
                        rows={3}
                    />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={!newComment.trim()}>
                                        Post Comment
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}

                {/* Comments Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <div className="flex items-center space-x-2">
                        <MessageSquare size={20} className="text-gray-600 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                            Comments ({confession.comments.length})
                        </h2>
                    </div>

                    {confession.comments.length === 0 ? (
                        <Card className="p-8 text-center">
                            <MessageSquare size={32} className="mx-auto text-gray-400 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                                No comments yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 tracking-tight">
                                {user ? 'Be the first to share your thoughts!' : 'Sign in to join the conversation.'}
                            </p>
                            {!user && (
                                <Button
                                    className="mt-4"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign in to comment
                                </Button>
                            )}
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {confession.comments.map((comment, index) => (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <CommentCard
                                        comment={comment}
                                        onReply={handleReply}
                                        onLike={handleCommentLike}
                                        onBoo={handleCommentBoo}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {!user && confession.comments.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
                    >
                        <div className="text-center">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
                                Sign in to comment and join the conversation
                            </p>
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => navigate('/login')}
                            >
                                Sign in
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}