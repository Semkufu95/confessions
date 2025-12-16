
import { motion } from 'framer-motion';
import { User, Bell, Shield, LogOut } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export function Profile() {
    const { user, logout } = useAuth();

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
                            {[
                                'Push notifications',
                                'Email notifications',
                                'Comment replies',
                                'New followers',
                            ].map((setting, index) => (
                                <div key={setting} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 tracking-tight">
                    {setting}
                  </span>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${index % 2 === 0 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                    `}
                                    >
                                        <motion.span
                                            className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition
                        ${index % 2 === 0 ? 'translate-x-6' : 'translate-x-1'}
                      `}
                                        />
                                    </motion.button>
                                </div>
                            ))}
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

                    {/* Sign Out */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="danger"
                            onClick={logout}
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