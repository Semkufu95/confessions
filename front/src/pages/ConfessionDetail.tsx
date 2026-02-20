import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    MessageSquare,
    Share2,
    Star,
    ThumbsUp,
    ThumbsDown,
    MoreHorizontal,
    Pencil,
    Trash2,
    X,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { TextArea } from "../components/ui/TextArea";
import { CommentCard } from "../components/confessions/CommentCard";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { formatTimeAgo } from "../utils/dateUtils";
import { SafeMultilineText } from "../components/ui/SafeMultilineText";
import { ConfessionService } from "../services/ConfessionService";

const CONFESSION_CATEGORIES = ["general", "love", "friendship", "work", "family"];

export function ConfessionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        confessions,
        toggleStar,
        toggleLike,
        addComment,
        toggleCommentLike,
        getConfessionById,
        updateConfession,
        deleteConfession,
    } = useApp();
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentSort, setCommentSort] = useState<"newest" | "oldest">("newest");
    const [showActions, setShowActions] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [shareFeedback, setShareFeedback] = useState<string | null>(null);

    const confession = confessions.find((c) => c.id === id);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        void getConfessionById(id).finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const sortedComments = useMemo(() => {
        const source = [...(confession?.comments || [])];
        source.sort((a, b) => {
            const left = new Date(a.timeStamp).getTime();
            const right = new Date(b.timeStamp).getTime();
            return commentSort === "newest" ? right - left : left - right;
        });
        return source;
    }, [commentSort, confession?.comments]);

    if (isLoading && !confession) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading confession...</p>
            </div>
        );
    }

    if (!confession) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                        Confession not found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 tracking-tight mb-4">
                        This confession may have been deleted or does not exist.
                    </p>
                    <Button onClick={() => navigate("/")}>Go back home</Button>
                </div>
            </div>
        );
    }

    const handleAction = async (action: () => Promise<void>) => {
        if (!user) {
            navigate("/login");
            return;
        }
        await action();
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || isSubmittingComment) return;

        setIsSubmittingComment(true);
        try {
            await addComment(confession.id, newComment);
            await getConfessionById(confession.id);
            setNewComment("");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleReply = (commentId: string, content: string) => {
        if (!user) return;
        console.log("Adding reply to comment:", commentId, content);
    };

    const handleCommentLike = async (commentId: string, type: "like" | "boo" = "like") => {
        if (!user) return;
        await toggleCommentLike(confession.id, commentId, type);
        await getConfessionById(confession.id);
    };

    const openEditModal = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        setEditContent(confession.content);
        setEditCategory(confession.category || "");
        setFormError(null);
        setShowActions(false);
        setShowEditModal(true);
    };

    const submitEdit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editContent.trim()) {
            setFormError("Confession content is required.");
            return;
        }

        setIsSavingEdit(true);
        setFormError(null);
        try {
            await updateConfession(confession.id, editContent.trim(), editCategory || undefined);
            setShowEditModal(false);
        } catch (error: unknown) {
            const message =
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                typeof (error as { response?: { data?: { error?: unknown } } }).response?.data?.error === "string"
                    ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
                    : undefined;
            setFormError(typeof message === "string" ? message : "Failed to update confession.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDelete = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        const approved = window.confirm("Delete this confession permanently?");
        if (!approved) return;

        await deleteConfession(confession.id);
        navigate("/");
    };

    const handleShare = async () => {
        if (isSharing) return;
        setIsSharing(true);
        setShareFeedback(null);
        try {
            const fallbackURL = `${window.location.origin}/confession/${confession.id}`;
            const result = await ConfessionService.share(confession.id).catch(() => ({
                shareUrl: fallbackURL,
                confession,
            }));
            const shareURL = result.shareUrl || fallbackURL;

            if (navigator.share) {
                await navigator.share({
                    title: "Confession",
                    text: "Check out this confession",
                    url: shareURL,
                });
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareURL);
                setShareFeedback("Link copied");
            } else {
                setShareFeedback(shareURL);
            }
        } catch {
            setShareFeedback("Share canceled");
        } finally {
            setIsSharing(false);
        }
    };

    const categoryColors: Record<string, string> = {
        love: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
        friendship: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        work: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
        family: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
        general: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };
    const normalizedCategory = confession.category?.trim().toLowerCase();
    const categoryColor =
        normalizedCategory && categoryColors[normalizedCategory]
            ? categoryColors[normalizedCategory]
            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    const categoryLabel = normalizedCategory
        ? normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)
        : "";

    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-2xl mx-auto space-y-6">
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

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card hover={false} className="p-6">
                        <div className="space-y-4">
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

                                <div className="relative flex items-center space-x-2">
                                    {confession.trending && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                            Trending
                                        </span>
                                    )}
                                    {normalizedCategory && (
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                                            {categoryLabel}
                                        </span>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-2"
                                        onClick={() => setShowActions((prev) => !prev)}
                                    >
                                        <MoreHorizontal size={16} />
                                    </Button>

                                    {showActions && (
                                        <div className="absolute right-0 top-10 z-10 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                            <button
                                                type="button"
                                                onClick={openEditModal}
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                            >
                                                <Pencil size={14} />
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void handleDelete()}
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="prose prose-gray dark:prose-invert max-w-none">
                                <SafeMultilineText
                                    text={confession.content}
                                    paragraphClassName="text-gray-900 dark:text-gray-100 leading-relaxed tracking-tight text-lg"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center space-x-1">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => void handleAction(() => toggleLike(confession.id, "like"))}
                                        className={`
                                            flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors
                                            ${confession.isLiked
                                                ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                                                : "text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            }
                                            ${!user ? "cursor-not-allowed opacity-50" : ""}
                                        `}
                                        disabled={!user}
                                    >
                                        <ThumbsUp size={18} />
                                        <span>{confession.likes}</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => void handleAction(() => toggleLike(confession.id, "boo"))}
                                        className={`
                                            flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors
                                            ${confession.isBooed
                                                ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                                                : "text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            }
                                            ${!user ? "cursor-not-allowed opacity-50" : ""}
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
                                        onClick={() => void handleAction(() => toggleStar(confession.id))}
                                        className={`
                                            flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors
                                            ${confession.isStarred
                                                ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400"
                                                : "text-gray-600 dark:text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                            }
                                            ${!user ? "cursor-not-allowed opacity-50" : ""}
                                        `}
                                        disabled={!user}
                                    >
                                        <Star size={18} fill={confession.isStarred ? "currentColor" : "none"} />
                                        <span>{confession.stars}</span>
                                    </motion.button>

                                    <Button
                                        variant="ghost"
                                        className="flex items-center space-x-2 px-4 py-2"
                                        disabled={isSharing}
                                        onClick={() => void handleShare()}
                                    >
                                        <Share2 size={18} />
                                        <span>{confession.shares}</span>
                                    </Button>
                                </div>
                            </div>
                            {shareFeedback && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">{shareFeedback}</p>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {user && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="p-6">
                            <form onSubmit={handleCommentSubmit} className="space-y-3">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-medium">
                                            {user.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <TextArea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Share your thoughts..."
                                            rows={3}
                                            maxLength={600}
                                            className="resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{newComment.length}/600</p>
                                    <Button type="submit" disabled={!newComment.trim()} loading={isSubmittingComment}>
                                        Post Comment
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <Card className="p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-2">
                                <MessageSquare size={20} className="text-gray-600 dark:text-gray-400" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                                    Comments ({confession.commentsCount ?? confession.comments.length})
                                </h2>
                            </div>
                            {(confession.comments?.length ?? 0) > 1 && (
                                <div className="flex items-center rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setCommentSort("newest")}
                                        className={`rounded-lg px-3 py-1 text-xs sm:text-sm ${
                                            commentSort === "newest"
                                                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-300"
                                                : "text-gray-600 dark:text-gray-300"
                                        }`}
                                    >
                                        Newest
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCommentSort("oldest")}
                                        className={`rounded-lg px-3 py-1 text-xs sm:text-sm ${
                                            commentSort === "oldest"
                                                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-300"
                                                : "text-gray-600 dark:text-gray-300"
                                        }`}
                                    >
                                        Oldest
                                    </button>
                                </div>
                            )}
                        </div>
                    </Card>

                    {sortedComments.length === 0 ? (
                        <Card className="p-8 text-center">
                            <MessageSquare size={32} className="mx-auto text-gray-400 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                                No comments yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 tracking-tight">
                                {user ? "Be the first to share your thoughts." : "Sign in to join the conversation."}
                            </p>
                            {!user && (
                                <Button className="mt-4" onClick={() => navigate("/login")}>
                                    Sign in to comment
                                </Button>
                            )}
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {sortedComments.map((comment, index) => (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * index }}
                                >
                                    <CommentCard
                                        comment={comment}
                                        onReply={handleReply}
                                        onLike={(commentId) => void handleCommentLike(commentId, "like")}
                                        onBoo={(commentId) => void handleCommentLike(commentId, "boo")}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {!user && sortedComments.length > 0 && (
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
                            <Button size="sm" className="w-full" onClick={() => navigate("/login")}>
                                Sign in
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {showEditModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/40"
                            onClick={() => setShowEditModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.98 }}
                            className="fixed inset-x-4 top-20 z-50 mx-auto w-auto max-w-2xl"
                        >
                            <Card className="p-4 sm:p-6">
                                <form className="space-y-4" onSubmit={submitEdit}>
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                                            Edit Confession
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="p-2"
                                            onClick={() => setShowEditModal(false)}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>

                                    <TextArea
                                        value={editContent}
                                        onChange={(event) => setEditContent(event.target.value)}
                                        rows={5}
                                        maxLength={1000}
                                        required
                                    />

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 tracking-tight">
                                            Category
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {CONFESSION_CATEGORIES.map((category) => {
                                                const active = editCategory === category;
                                                return (
                                                    <button
                                                        key={category}
                                                        type="button"
                                                        onClick={() => setEditCategory(category)}
                                                        className={`rounded-xl px-3 py-2 text-xs sm:text-sm font-medium ${
                                                            active
                                                                ? "bg-blue-100 text-blue-700 ring-2 ring-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                                                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                                        }`}
                                                    >
                                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>{editContent.length}/1000</span>
                                        <button
                                            type="button"
                                            onClick={() => setEditCategory("")}
                                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                        >
                                            Clear category
                                        </button>
                                    </div>

                                    {formError && (
                                        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                                            {formError}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 pt-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="flex-1"
                                            onClick={() => setShowEditModal(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                            loading={isSavingEdit}
                                            disabled={!editContent.trim()}
                                        >
                                            Save changes
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
