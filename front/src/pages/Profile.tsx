import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, LogOut, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SettingsService } from '../services/SettingsService';
import type { UserSettings } from '../types';
import { formatTimeAgo } from '../utils/dateUtils';

type SettingToggleKey = 'pushNotifications' | 'emailNotifications' | 'commentReplies' | 'newFollowers';

export function Profile() {
    const { user, logout } = useAuth();
    const { friends, refreshFriends } = useApp();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [settingsError, setSettingsError] = useState<string | null>(null);
    const [savingKey, setSavingKey] = useState<SettingToggleKey | null>(null);

    useEffect(() => {
        if (!user) return;

        let mounted = true;
        const loadSettings = async () => {
            try {
                const data = await SettingsService.getMine();
                if (mounted) {
                    setSettings(data);
                    setSettingsError(null);
                }
            } catch {
                if (mounted) {
                    setSettingsError('Failed to load settings.');
                }
            }
        };
        void loadSettings();
        return () => {
            mounted = false;
        };
    }, [user]);

    useEffect(() => {
        if (!user) return;
        void refreshFriends();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const toggleSetting = async (key: SettingToggleKey) => {
        if (!settings || savingKey) return;
        const nextValue = !settings[key];
        const optimistic = { ...settings, [key]: nextValue };
        setSettings(optimistic);
        setSavingKey(key);
        setSettingsError(null);
        try {
            const updated = await SettingsService.updateMine({ [key]: nextValue });
            setSettings(updated);
        } catch {
            setSettings(settings);
            setSettingsError('Failed to save settings. Please try again.');
        } finally {
            setSavingKey(null);
        }
    };

    const settingsRows: Array<{ key: SettingToggleKey; label: string }> = [
        { key: 'pushNotifications', label: 'Push notifications' },
        { key: 'emailNotifications', label: 'Email notifications' },
        { key: 'commentReplies', label: 'Comment replies' },
        { key: 'newFollowers', label: 'New followers' },
    ];

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <User size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                        Sign in to view your profile
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 tracking-tight">
                        Access your settings and preferences once you sign in.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-4"
                >
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </span>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                            {user.username}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 tracking-tight">
                            {user.email}
                        </p>
                    </div>
                </motion.div>

                {/* Settings Sections */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    {/* Notifications */}
                    <Card className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                                Notifications
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {settingsRows.map((row) => (
                                <div key={row.key} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 tracking-tight">
                    {row.label}
                  </span>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => void toggleSetting(row.key)}
                                        disabled={!settings || !!savingKey}
                                        className={`
                       relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                       ${settings?.[row.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                       ${savingKey ? 'opacity-70 cursor-not-allowed' : ''}
                     `}
                                    >
                                        <motion.span
                                            className={`
                         inline-block h-4 w-4 transform rounded-full bg-white transition
                         ${settings?.[row.key] ? 'translate-x-6' : 'translate-x-1'}
                       `}
                                        />
                                    </motion.button>
                                </div>
                            ))}
                            {settingsError && (
                                <p className="text-sm text-red-600 dark:text-red-400 tracking-tight">{settingsError}</p>
                            )}
                        </div>
                    </Card>

                    {/* Privacy & Security */}
                    <Card className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Shield size={20} className="text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                                Privacy & Security
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {[
                                'Change password',
                                'Two-factor authentication',
                                'Data export',
                                'Delete account',
                            ].map((option) => (
                                <button
                                    key={option}
                                    className="w-full text-left px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors tracking-tight"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Followers / Friends */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <Users size={20} className="text-gray-600 dark:text-gray-400" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                                    Friends / Followers
                                </h2>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {friends.length}
                            </span>
                        </div>

                        {friends.length === 0 ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400 tracking-tight">
                                No followers yet.
                            </p>
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
                                            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {formatTimeAgo(friend.followedAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Sign Out */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="danger"
                            onClick={() => void logout()}
                            className="w-full flex items-center justify-center space-x-2"
                        >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
