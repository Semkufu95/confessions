
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Clock, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function ComingSoon() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="relative"
                    >
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6">
                            <Send size={32} className="text-white" />
                        </div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                        >
                            <Zap size={16} className="text-yellow-900" />
                        </motion.div>
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight"
                        >
                            Direct Messages
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-gray-600 dark:text-gray-400 tracking-tight"
                        >
                            Coming Soon
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 space-y-3"
                        >
                            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                                <Clock size={20} className="text-blue-500" />
                                <span className="text-sm tracking-tight">We're working hard to bring you private messaging</span>
                            </div>

                            <div className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <p className="tracking-tight">✨ End-to-end encrypted conversations</p>
                                <p className="tracking-tight">🔒 Anonymous messaging options</p>
                                <p className="tracking-tight">📱 Real-time notifications</p>
                                <p className="tracking-tight">🎯 Connect with confession authors</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4"
                    >
                        <Button
                            onClick={() => navigate(-1)}
                            variant="primary"
                            className="w-full flex items-center justify-center space-x-2"
                        >
                            <ArrowLeft size={16} />
                            <span>Go Back</span>
                        </Button>

                        <Button
                            onClick={() => navigate('/')}
                            variant="ghost"
                            className="w-full"
                        >
                            Return to Home
                        </Button>
                    </motion.div>

                    {/* Progress Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="pt-4"
                    >
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="tracking-tight">Development in progress</span>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}