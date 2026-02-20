import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, UserCheck, UserRoundX, Users } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatTimeAgo } from "../utils/dateUtils";

export function Friends() {
    const { user } = useAuth();
    const { friends, pendingFriendRequests, refreshFriends, respondToFriendRequest } = useApp();
    const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
    const [requestError, setRequestError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        void refreshFriends();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleRequestAction = async (requestId: string, action: "accept" | "decline") => {
        setProcessingRequestId(requestId);
        setRequestError(null);
        try {
            await respondToFriendRequest(requestId, action);
        } catch (error: unknown) {
            const message =
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                typeof (error as { response?: { data?: { error?: unknown } } }).response?.data?.error === "string"
                    ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
                    : "Failed to update request. Try again.";
            setRequestError(message || "Failed to update request. Try again.");
        } finally {
            setProcessingRequestId(null);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Users size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                        Sign in to view friend requests
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 tracking-tight">
                        Your pending requests and friends list appear here after login.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        Friends
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 tracking-tight">
                        Manage incoming connection requests and your accepted friends.
                    </p>
                </motion.div>

                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                            Pending Requests
                        </h2>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{pendingFriendRequests.length}</span>
                    </div>

                    {pendingFriendRequests.length === 0 ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400 tracking-tight">No pending requests.</p>
                    ) : (
                        <div className="space-y-3">
                            {pendingFriendRequests.map((request) => (
                                <div
                                    key={request.requestId}
                                    className="rounded-xl border border-gray-200 dark:border-gray-700 p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                                @{request.username}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 tracking-tight">
                                                {request.email}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 tracking-tight">
                                                On: {request.connectionTitle}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 tracking-tight">
                                                {formatTimeAgo(request.requestedAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                className="flex items-center gap-1"
                                                loading={processingRequestId === request.requestId}
                                                disabled={!!processingRequestId}
                                                onClick={() => void handleRequestAction(request.requestId, "accept")}
                                            >
                                                <Check size={14} />
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex items-center gap-1 text-red-600 dark:text-red-400"
                                                disabled={!!processingRequestId}
                                                onClick={() => void handleRequestAction(request.requestId, "decline")}
                                            >
                                                <UserRoundX size={14} />
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {requestError && <p className="text-sm text-red-600 dark:text-red-400 mt-3">{requestError}</p>}
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                            Friends List
                        </h2>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{friends.length}</span>
                    </div>

                    {friends.length === 0 ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400 tracking-tight">No friends yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {friends.map((friend) => (
                                <div
                                    key={`${friend.senderId}-${friend.followedAt}`}
                                    className="rounded-xl border border-gray-200 dark:border-gray-700 p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                                @{friend.username}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 tracking-tight">
                                                {friend.email}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 tracking-tight">
                                                Latest: {friend.latestConnectionTitle}
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-300">
                                            <UserCheck size={13} />
                                            Connected
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
