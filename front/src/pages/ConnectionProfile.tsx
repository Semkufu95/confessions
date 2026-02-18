import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Layers, User } from "lucide-react";
import type { ConnectionProfile } from "../types";
import { ConnectionService } from "../services/ConnectionService";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { formatTimeAgo } from "../utils/dateUtils";

export function ConnectionProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<ConnectionProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Invalid connection id.");
            setIsLoading(false);
            return;
        }

        let mounted = true;
        const load = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await ConnectionService.getProfile(id);
                if (mounted) {
                    setProfile(result);
                }
            } catch (requestError: unknown) {
                if (!mounted) return;
                const message = (
                    typeof requestError === "object" &&
                    requestError !== null &&
                    "response" in requestError &&
                    typeof (requestError as { response?: { data?: { error?: unknown } } }).response?.data?.error === "string"
                        ? (requestError as { response?: { data?: { error?: string } } }).response?.data?.error
                        : "Could not load profile."
                ) || "Could not load profile.";
                setError(message);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void load();
        return () => {
            mounted = false;
        };
    }, [id]);

    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center space-x-2">
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </Button>
                </motion.div>

                {isLoading && (
                    <Card className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading profile...</p>
                    </Card>
                )}

                {error && !isLoading && (
                    <Card className="p-6">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </Card>
                )}

                {!isLoading && !error && profile && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                                        <span className="text-white text-xl font-semibold">
                                            {profile.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                            @{profile.username}
                                        </h1>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 tracking-tight">
                                            Member since {new Date(profile.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            <Card className="p-5">
                                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                                    <Layers size={16} />
                                    <span className="text-sm">Connections posted</span>
                                </div>
                                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    {profile.connectionsPosted}
                                </p>
                            </Card>
                            <Card className="p-5">
                                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                                    <User size={16} />
                                    <span className="text-sm">Categories</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                                    {profile.categories.length > 0 ? profile.categories.join(", ") : "No categories yet"}
                                </p>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="p-6 space-y-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                                    Recent Connections
                                </h2>

                                {profile.recentConnections.length === 0 ? (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">No recent connections.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {profile.recentConnections.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-xl border border-gray-100 dark:border-gray-800 p-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                                            {item.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize mt-1">
                                                            {item.category}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <CalendarDays size={12} />
                                                        <span>{formatTimeAgo(item.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
