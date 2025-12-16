<<<<<<< HEAD
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MoreHorizontal, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatTimeAgo } from '../../utils/dateUtils';

interface CommentCardProps {
    comment: Comment;
    onReply?: (commentId: string, content: string) => void;
    onLike?: (commentId: string) => void;
    onBoo?: (commentId: string) => void;
}

export function CommentCard({ comment, onReply, onLike, onBoo }: CommentCardProps) {
    const { user } = useAuth();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showReplies, setShowReplies] = useState(false);

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !user) return;

        onReply?.(comment.id, replyContent);
        setReplyContent('');
        setShowReplyForm(false);
        setShowReplies(true);
    };

    const handleLike = () => {
        if (!user) return;
        onLike?.(comment.id);
    };

    const handleBoo = () => {
        if (!user) return;
        onBoo?.(comment.id);
    };

    const authorInitial = comment?.author?.username?.[0]?.toUpperCase() ?? 'U';
    const authorUsername = comment?.author?.username ?? 'Unknown';
    const replies = comment?.replies ?? [];

    return (
        <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {authorInitial}
              </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                @{authorUsername}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(comment?.timeStamp ?? new Date().toISOString())}
                            </p>
                        </div>
                    </div>

                    <Button variant="ghost" size="sm" className="p-1">
                        <MoreHorizontal size={14} />
                    </Button>
                </div>

                {/* Comment Content */}
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed tracking-tight mb-3">
                    {comment?.content}
                </p>

                {/* Comment Actions */}
                <div className="flex items-center space-x-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLike}
                        className={`
              flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors
              ${comment.isLiked
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }
              ${!user ? 'cursor-not-allowed opacity-50' : ''}
            `}
                        disabled={!user}
                    >
                        <ThumbsUp size={12} />
                        <span>{comment?.likes ?? 0}</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBoo}
                        className={`
              flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors
              text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
              ${!user ? 'cursor-not-allowed opacity-50' : ''}
            `}
                        disabled={!user}
                    >
                        <ThumbsDown size={12} />
                    </motion.button>

                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        disabled={!user}
                    >
                        <MessageSquare size={12} />
                        <span>Reply</span>
                    </button>

                    {replies.length > 0 && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                        >
                            {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                    )}
                </div>

                {/* Reply Form */}
                {showReplyForm && user && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleReplySubmit}
                        className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex space-x-3">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                            </div>
                            <div className="flex-1 space-y-2">
                <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-tight"
                    rows={2}
                />
                                <div className="flex items-center space-x-2">
                                    <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                                        Reply
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowReplyForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.form>
                )}
            </div>

            {/* Replies */}
            {showReplies && replies.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-6 space-y-2"
                >
                    {replies.map((reply) => {
                        const replyInitial = reply?.author?.username?.[0]?.toUpperCase() ?? 'U';
                        const replyUsername = reply?.author?.username ?? 'Unknown';
                        return (
                            <div key={reply.id} className="bg-gray-25 dark:bg-gray-800/25 rounded-xl p-3">
                                <div className="flex items-start space-x-2">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">
                      {replyInitial}
                    </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                                @{replyUsername}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatTimeAgo(reply?.timeStamp ?? new Date().toISOString())}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight mb-2">
                                            {reply?.content}
                                        </p>
                                        <button
                                            className={`
                        flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors
                        ${reply?.isLiked
                                                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                            }
                      `}
                                        >
                                            <ThumbsUp size={10} />
                                            <span>{reply?.likes ?? 0}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
=======
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MoreHorizontal, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '../ui/Button';
import type {Comment} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatTimeAgo } from '../../utils/dateUtils';

interface CommentCardProps {
    comment: Comment;
    onReply?: (commentId: string, content: string) => void;
    onLike?: (commentId: string) => void;
    onBoo?: (commentId: string) => void;
}

export function CommentCard({ comment, onReply, onLike, onBoo }: CommentCardProps) {
    const { user } = useAuth();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showReplies, setShowReplies] = useState(false);

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !user) return;

        onReply?.(comment.id, replyContent);
        setReplyContent('');
        setShowReplyForm(false);
        setShowReplies(true);
    };

    const handleLike = () => {
        if (!user) return;
        onLike?.(comment.id);
    };

    const handleBoo = () => {
        if (!user) return;
        onBoo?.(comment.id);
    };

    return (
        <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {comment.author.username.charAt(0).toUpperCase()}
              </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                @{comment.author.username}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(comment.timeStamp)}
                            </p>
                        </div>
                    </div>

                    <Button variant="ghost" size="sm" className="p-1">
                        <MoreHorizontal size={14} />
                    </Button>
                </div>

                {/* Comment Content */}
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed tracking-tight mb-3">
                    {comment.content}
                </p>

                {/* Comment Actions */}
                <div className="flex items-center space-x-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLike}
                        className={`
              flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors
              ${comment.isLiked
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }
              ${!user ? 'cursor-not-allowed opacity-50' : ''}
            `}
                        disabled={!user}
                    >
                        <ThumbsUp size={12} />
                        <span>{comment.likes}</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBoo}
                        className={`
              flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors
              text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
              ${!user ? 'cursor-not-allowed opacity-50' : ''}
            `}
                        disabled={!user}
                    >
                        <ThumbsDown size={12} />
                    </motion.button>

                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        disabled={!user}
                    >
                        <MessageSquare size={12} />
                        <span>Reply</span>
                    </button>

                    {comment.replies.length > 0 && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                        >
                            {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                    )}
                </div>

                {/* Reply Form */}
                {showReplyForm && user && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleReplySubmit}
                        className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex space-x-3">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                            </div>
                            <div className="flex-1 space-y-2">
                <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-tight"
                    rows={2}
                />
                                <div className="flex items-center space-x-2">
                                    <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                                        Reply
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowReplyForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.form>
                )}
            </div>

            {/* Replies */}
            {showReplies && comment.replies.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-6 space-y-2"
                >
                    {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-25 dark:bg-gray-800/25 rounded-xl p-3">
                            <div className="flex items-start space-x-2">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">
                    {reply.author.username.charAt(0).toUpperCase()}
                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                            @{reply.author.username}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatTimeAgo(reply.timeStamp)}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight mb-2">
                                        {reply.content}
                                    </p>
                                    <button
                                        className={`
                      flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors
                      ${reply.isLiked
                                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                        }
                    `}
                                    >
                                        <ThumbsUp size={10} />
                                        <span>{reply.likes}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
>>>>>>> 8a7c502 (Added ConfessionService in front, modified the front)
