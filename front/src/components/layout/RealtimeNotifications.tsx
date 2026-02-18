import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bell, CheckCircle2, Info, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

const variantStyles = {
    info: {
        icon: Info,
        border: "border-blue-200 dark:border-blue-800/60",
        iconColor: "text-blue-600 dark:text-blue-400",
    },
    success: {
        icon: CheckCircle2,
        border: "border-green-200 dark:border-green-800/60",
        iconColor: "text-green-600 dark:text-green-400",
    },
    warning: {
        icon: AlertTriangle,
        border: "border-amber-200 dark:border-amber-800/60",
        iconColor: "text-amber-600 dark:text-amber-400",
    },
};

export function RealtimeNotifications() {
    const { notifications, dismissNotification } = useApp();

    return (
        <div className="fixed top-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))] space-y-3 pointer-events-none">
            <AnimatePresence initial={false}>
                {notifications.map((notification) => {
                    const variant = variantStyles[notification.variant];
                    const Icon = variant.icon;

                    return (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                            className={`pointer-events-auto rounded-2xl border ${variant.border} bg-white/95 dark:bg-gray-900/95 shadow-lg backdrop-blur p-4`}
                            role="status"
                            aria-live="polite"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Icon size={18} className={variant.iconColor} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
                                        <Bell size={13} className="text-gray-500 dark:text-gray-400" />
                                        {notification.title}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed tracking-tight break-words">
                                        {notification.message}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => dismissNotification(notification.id)}
                                    className="rounded-lg p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                                    aria-label="Dismiss notification"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
