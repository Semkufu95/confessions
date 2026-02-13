import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Lock, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';

interface CreateConfessionProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: string, category: string, isAnonymous: boolean) => Promise<void>;
}

export function CreateConfession({ isOpen, onClose, onSubmit }: CreateConfessionProps) {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
        { value: 'love', label: 'Love', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
        { value: 'friendship', label: 'Friendship', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
        { value: 'work', label: 'Work', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
        { value: 'family', label: 'Family', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content, category, isAnonymous);
            setContent('');
            setCategory('general');
            setIsAnonymous(true);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

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

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 sm:inset-8 md:inset-0 md:flex md:items-center md:justify-center md:p-8 z-50"
                    >
                        <Card className="h-full md:h-auto md:w-full md:max-w-2xl md:max-h-[90vh] md:overflow-y-auto p-4 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
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
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="What's on your mind? Share your thoughts anonymously..."
                                    rows={4}
                                    className="resize-none"
                                    required
                                />

                                {/* Character Count */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {content.length}/1000 characters
                  </span>
                                    {content.length > 800 && (
                                        <span className="text-orange-600 dark:text-orange-400">
                      {1000 - content.length} remaining
                    </span>
                                    )}
                                </div>

                                {/* Category Selection */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 tracking-tight">
                                        Category
                                    </label>
                                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <motion.button
                                                key={cat.value}
                                                type="button"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setCategory(cat.value)}
                                                className={`
                          px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 text-center
                          ${category === cat.value
                                                    ? `${cat.color} ring-2 ring-blue-500`
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }
                        `}
                                            >
                                                {cat.label}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Privacy Toggle */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                    <div className="flex items-center space-x-3 flex-1">
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
                                                    : 'Posted with your username'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsAnonymous(!isAnonymous)}
                                        className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${isAnonymous ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                    `}
                                    >
                                        <motion.span
                                            className="inline-block h-4 w-4 transform rounded-full bg-white transition"
                                            animate={{ x: isAnonymous ? 24 : 4 }}
                                        />
                                    </motion.button>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={onClose}
                                        className="w-full sm:flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={isSubmitting}
                                        disabled={!content.trim() || content.length > 1000}
                                        className="w-full sm:flex-1 flex items-center justify-center space-x-2"
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
    );
}
