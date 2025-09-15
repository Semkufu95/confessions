
import {Card} from "../ui/Card.tsx";
import {Lock, Send, Users, X} from "lucide-react";
import React from "react";
import {Button} from "../ui/Button.tsx";
import {TextArea} from "../ui/TextArea.tsx";
import {AnimatePresence, motion} from "framer-motion";

interface CreateConfessionProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: string, category: string, isAnonymous: boolean) => void;
}

export function CreateConfession({isOpen, onClose, onSubmit}: CreateConfessionProps) {
    const [content, setContent] = React.useState('');
    const [category, setCategory] = React.useState('general');
    const [isAnonymous, setIsAnonymous] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const categories = [
        { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
        { value: 'love', label: 'Love', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
        { value: 'friendship', label: 'friendship', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
        { value: 'work', label: 'work', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/200 dark:text-blue-300' },
        { value: 'family', label: 'family', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/200 dark:text-purple-300' },
    ];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // TODO: Simulate API call
        onSubmit(content, category, isAnonymous);
        setContent('');
        setCategory('general');
        setIsAnonymous(true);
        setIsSubmitting(false);
        onClose();
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    {/* Modal*/}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:ma-w-2xl z-50"
                    >
                        <Card className="h-full md:h-auto p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                        Share Your Confession
                                    </h2>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClose}
                                        className="p-2"
                                    >
                                        <X size={20} />
                                    </Button>
                                </div>
                                {/* Content */}
                                <TextArea
                                    value={content}
                                    onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setContent(e.target.value)}
                                    placeholder="What's on your mind? Share your thoughts anonymously..."
                                    rows={6}
                                    className="resize-none"
                                    required
                                />
                                {/* Character Count */}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {content.length}/1000 characters
                                    </span>
                                    {content.length > 800 && (
                                        <span className="text-orange-600 dark:text-orange-400">
                                            {1000 - content.length} remaining
                                        </span>
                                    )}
                                </div>

                                {/* Category Selection*/}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 tracking-tight">
                                        Category
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <motion.button
                                              key={cat.value}
                                              type="button"
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => setCategory(cat.value)}
                                              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                              ${category === cat.value
                                                  ? `${cat.value} ring-2 ring-blue-500`
                                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 '
                                              }
                                             `}
                                            >
                                                {cat.label}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                                {/* Privacy Toggle*/}
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                    <div className="flex items-center space-x-3">
                                        {isAnonymous ? (
                                            <Lock size={20} className="text-blue-600" />
                                        ) : (
                                            <Users size={20} className="text-gray-600 dark:text-gray-400" />
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                                {isAnonymous ? 'Anonymous' : 'Public'}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 tracking-tight">
                                                {isAnonymous
                                                ? 'Your identity will be hidden'
                                                : 'Your username will be seen public'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        type='button'
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsAnonymous(!isAnonymous)}
                                        className={`relative inline-flex h-16 w-11 items-center rounded-full transition-colors
                                            ${isAnonymous ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                                            `}
                                        >
                                        <motion.span
                                            className="inline-block h-4 w-4 transform rounded-r-full bg-white transition"
                                            animate={{ x: isAnonymous ? 24 : 4 }}
                                            />
                                    </motion.button>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center space-x-3 pt-4">
                                    <Button
                                        type='button'
                                        variant="ghost"
                                        onClick={onClose}
                                        className="flex"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={isSubmitting}
                                        disabled={!content.trim() || content.length > 1000}
                                        className="flex-1 flex items-center justify-center space-x-2"
                                    >
                                        <Send size={16} />
                                        <span>Share Confession</span>
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                </>

            )}
        </AnimatePresence>
    )
}