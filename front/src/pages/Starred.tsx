
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';
import { ConfessionCard } from '../components/confessions/ConfessionCard';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export function Starred() {
    const { starredConfessions } = useApp();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Star size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                        Sign in to view starred confessions
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 tracking-tight">
                        Your starred confessions will appear here once you sign in.
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
                    className="flex items-center space-x-3"
                >
                    <div className="w-10 h-10 bg-yellow-500 rounded-2xl flex items-center justify-center">
                        <Star size={20} className="text-white" fill="white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                            Starred Confessions
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 tracking-tight">
                            Your saved confessions
                        </p>
                    </div>
                </motion.div>

                {/* Starred Confessions List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {starredConfessions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
                                <Heart size={24} className="text-yellow-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                                No starred confessions yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 tracking-tight">
                                Star confessions you want to save for later by clicking the star icon.
                            </p>
                        </div>
                    ) : (
                        starredConfessions.map((confession, index) => (
                            <motion.div
                                key={confession.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <ConfessionCard
                                    confession={confession}
                                    onClick={() => navigate(`/confession/${confession.id}`)}
                                />
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    );
}