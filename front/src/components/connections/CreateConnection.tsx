import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Send, Users, X } from "lucide-react";
import type { CreateConnectionInput } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";

interface CreateConnectionProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (input: CreateConnectionInput) => Promise<void>;
}

export function CreateConnection({ isOpen, onClose, onSubmit }: CreateConnectionProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<"love" | "friendship">("friendship");
    const [location, setLocation] = useState("");
    const [age, setAge] = useState("");
    const [interests, setInterests] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = useMemo(() => title.trim() !== "" && description.trim() !== "", [title, description]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("friendship");
        setLocation("");
        setAge("");
        setInterests("");
        setError(null);
    };

    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!title.trim() || !description.trim()) {
            setError("Title and description are required.");
            return;
        }

        let parsedAge: number | undefined;
        if (age.trim()) {
            const value = Number(age);
            if (!Number.isInteger(value)) {
                setError("Age must be a whole number.");
                return;
            }
            if (value < 18) {
                setError("Age must be at least 18.");
                return;
            }
            parsedAge = value;
        }

        const payload: CreateConnectionInput = {
            title: title.trim(),
            description: description.trim(),
            category,
            location: location.trim() || undefined,
            age: parsedAge,
            interests: interests
                .split(",")
                .map((item) => item.trim())
                .filter((item, index, all) => item !== "" && all.findIndex((value) => value.toLowerCase() === item.toLowerCase()) === index),
        };

        setIsSubmitting(true);
        try {
            await onSubmit(payload);
            resetForm();
            onClose();
        } catch (submitError: unknown) {
            const serverError =
                typeof submitError === "object" &&
                submitError !== null &&
                "response" in submitError &&
                typeof (submitError as { response?: { data?: { error?: unknown } } }).response?.data?.error === "string"
                    ? (submitError as { response?: { data?: { error?: string } } }).response?.data?.error
                    : undefined;
            setError(typeof serverError === "string" ? serverError : "Could not create connection. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 sm:inset-8 md:inset-0 md:flex md:items-center md:justify-center md:p-8 z-50"
                    >
                        <Card className="flex h-full md:h-auto md:w-full md:max-w-2xl md:max-h-[90vh] flex-col p-4 sm:p-6">
                            <form onSubmit={handleSubmit} className="flex h-full flex-col">
                                <div className="flex items-center justify-between pb-2">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                        Create Connection
                                    </h2>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="p-2">
                                        <X size={20} />
                                    </Button>
                                </div>

                                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                                    <Input
                                        label="Title"
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        placeholder="Looking for a hiking buddy"
                                        maxLength={120}
                                        required
                                    />

                                    <TextArea
                                        label="Description"
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        placeholder="Share what kind of connection you are looking for."
                                        rows={4}
                                        maxLength={1200}
                                        required
                                    />

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 tracking-tight">
                                            Category
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setCategory("friendship")}
                                                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                                                    category === "friendship"
                                                        ? "bg-green-100 text-green-700 ring-2 ring-green-400 dark:bg-green-900/30 dark:text-green-300"
                                                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                                }`}
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    <Users size={16} />
                                                    Friendship
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCategory("love")}
                                                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                                                    category === "love"
                                                        ? "bg-red-100 text-red-700 ring-2 ring-red-400 dark:bg-red-900/30 dark:text-red-300"
                                                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                                }`}
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    <Heart size={16} />
                                                    Love
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Input
                                            label="Location (optional)"
                                            value={location}
                                            onChange={(event) => setLocation(event.target.value)}
                                            placeholder="Kampala"
                                            maxLength={80}
                                        />
                                        <Input
                                            label="Age (optional)"
                                            type="number"
                                            min={18}
                                            value={age}
                                            onChange={(event) => setAge(event.target.value)}
                                            placeholder="24"
                                        />
                                    </div>

                                    <Input
                                        label="Interests (optional)"
                                        value={interests}
                                        onChange={(event) => setInterests(event.target.value)}
                                        placeholder="coding, movies, football"
                                    />

                                    {error && (
                                        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <div className="sticky bottom-0 mt-3 flex flex-col sm:flex-row items-center gap-3 border-t border-gray-200 bg-white pt-3 dark:border-gray-700 dark:bg-gray-900">
                                    <Button type="button" variant="ghost" onClick={handleClose} className="w-full sm:flex-1">
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={isSubmitting}
                                        disabled={!canSubmit}
                                        className="w-full sm:flex-1 flex items-center justify-center space-x-2"
                                    >
                                        <Send size={16} />
                                        <span>Post Connection</span>
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
