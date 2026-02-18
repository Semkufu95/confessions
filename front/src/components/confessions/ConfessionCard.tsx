import type { Confession } from "../../types";
import { useAuth } from "../../context/AuthContext.tsx";
import { useApp } from "../../context/AppContext.tsx";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { Card } from "../ui/Card.tsx";
import { Button } from "../ui/Button.tsx";
import {
    MessageSquare,
    MoreHorizontal,
    Pencil,
    Share,
    Star,
    ThumbsDown,
    ThumbsUp,
    Trash2,
    X,
} from "lucide-react";
import { formatTimeAgo } from "../../utils/dateUtils.tsx";
import { AnimatePresence, motion } from "framer-motion";
import { SafeMultilineText } from "../ui/SafeMultilineText.tsx";
import { TextArea } from "../ui/TextArea.tsx";

interface ConfessionCardProps {
    confession: Confession;
    onClick?: () => void;
}

const CONFESSION_CATEGORIES = ["general", "love", "friendship", "work", "family"];

export function ConfessionCard({ confession, onClick }: ConfessionCardProps) {
    const { user } = useAuth();
    const { toggleStar, toggleLike, updateConfession, deleteConfession } = useApp();
    const navigate = useNavigate();

    const [showActions, setShowActions] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loadingAction, setLoadingAction] = useState<null | string>(null);
    const [editContent, setEditContent] = useState(confession.content || "");
    const [editCategory, setEditCategory] = useState(confession.category || "");
    const [formError, setFormError] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!showActions) return;
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (menuRef.current && !menuRef.current.contains(target)) {
                setShowActions(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [showActions]);

    const handleAction = async (actionName: string, action: () => Promise<void>) => {
        if (!user) {
            navigate("/login");
            return;
        }

        setLoadingAction(actionName);
        try {
            await action();
        } catch (error) {
            console.error(`${actionName} failed:`, error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoadingAction(null);
        }
    };

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const target = e.target as HTMLElement;
        if (target.closest("button")) return;
        onClick?.();
    };

    const openEditModal = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        setEditContent(confession.content || "");
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

        setFormError(null);
        setLoadingAction("edit");
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
            setLoadingAction(null);
        }
    };

    const confirmDelete = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        const approved = window.confirm("Delete this confession permanently?");
        if (!approved) return;

        setShowActions(false);
        await handleAction("delete", async () => {
            await deleteConfession(confession.id);
        });
    };

    const categoryColors: Record<string, string> = {
        love: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
        friendship: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        work: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
        family: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
        general: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
    };

    const normalizedCategory = confession.category?.trim().toLowerCase();
    const categoryColor =
        normalizedCategory && categoryColors[normalizedCategory]
            ? categoryColors[normalizedCategory]
            : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";

    const categoryLabel = normalizedCategory
        ? normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)
        : "";

    return (
        <>
            <Card hover={!!onClick} className="relative p-6 cursor-pointer" onClick={handleCardClick}>
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">A</span>
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                <p>Anonymous</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatTimeAgo(confession.timeStamp)}
                                </p>
                            </div>
                        </div>

                        <div className="relative flex items-center space-x-2" ref={menuRef}>
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
                                aria-label="Show confession options"
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
                                        onClick={() => void confirmDelete()}
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
                            text={confession.content || ""}
                            paragraphClassName="text-gray-900 dark:text-gray-100 leading-relaxed tracking-tight"
                            emptyFallback="No content available."
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center space-x-1">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                    handleAction("like", async () => toggleLike(confession.id, "like"))
                                }
                                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    confession.isLiked
                                        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-900/20"
                                } ${!user ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled={!user || loadingAction === "like"}
                                aria-label="Like confession"
                            >
                                <ThumbsUp size={16} />
                                <span>{confession.likes}</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                    handleAction("boo", async () => toggleLike(confession.id, "boo"))
                                }
                                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    confession.isBooed
                                        ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-900/20"
                                } ${!user ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled={!user || loadingAction === "boo"}
                                aria-label="Dislike confession"
                            >
                                <ThumbsDown size={16} />
                                <span>{confession.boos}</span>
                            </motion.button>
                        </div>

                        <div className="flex items-center space-x-1">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                    handleAction("star", async () => toggleStar(confession.id))
                                }
                                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    confession.isStarred
                                        ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-900/20"
                                } ${!user ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled={!user || loadingAction === "star"}
                                aria-label="Star confession"
                            >
                                <Star
                                    size={16}
                                    fill={confession.isStarred ? "currentColor" : "none"}
                                />
                                <span>{confession.stars}</span>
                            </motion.button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center space-x-2 px-3 py-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClick?.();
                                }}
                                aria-label="View comments"
                            >
                                <MessageSquare size={16} />
                                <span>{confession.commentsCount ?? confession.comments?.length ?? 0}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center space-x-2 px-3 py-2"
                                disabled={!user}
                                aria-label="Share confession"
                            >
                                <Share size={16} />
                                <span>{confession.shares}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

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
                                            loading={loadingAction === "edit"}
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
        </>
    );
}
