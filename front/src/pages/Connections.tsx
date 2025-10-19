import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Heart, UserPlus, Filter } from 'lucide-react';
// @ts-ignore
import { ConnectionCard } from '../components/connections/ConnectionCard';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export function Connections() {
    const { connections } = useApp();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'all' | 'love' | 'friendship'>('all');

    const filteredConnections = connections.filter(connection => {
        if (activeTab === 'all') return true;
        return connection.category === activeTab;
    });

    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
                            <Users size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                Connections
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 tracking-tight">
                                Find friends, lovers, and meaningful connections
                            </p>
                        </div>
                    </div>

                    {user && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button className="flex items-center space-x-2">
                                <UserPlus size={16} />
                                <span className="hidden sm:inline">Create Connection</span>
                            </Button>
                        </motion.div>
                    )}
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`
                relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors tracking-tight
                ${activeTab === 'all'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }
              `}
                        >
                            <Users size={16} />
                            <span>All</span>
                            {activeTab === 'all' && (
                                <motion.div
                                    layoutId="connectionTab"
                                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-sm"
                                    style={{ zIndex: -1 }}
                                />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('love')}
                            className={`
                relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors tracking-tight
                ${activeTab === 'love'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }
              `}
                        >
                            <Heart size={16} />
                            <span>Love</span>
                            {activeTab === 'love' && (
                                <motion.div
                                    layoutId="connectionTab"
                                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-sm"
                                    style={{ zIndex: -1 }}
                                />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('friendship')}
                            className={`
                relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors tracking-tight
                ${activeTab === 'friendship'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }
              `}
                        >
                            <Users size={16} />
                            <span>Friends</span>
                            {activeTab === 'friendship' && (
                                <motion.div
                                    layoutId="connectionTab"
                                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-sm"
                                    style={{ zIndex: -1 }}
                                />
                            )}
                        </button>
                    </div>

                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                        <Filter size={16} />
                        <span className="hidden sm:inline">Filter</span>
                    </Button>
                </motion.div>

                {/* Connections Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {filteredConnections.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Users size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                                No connections found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 tracking-tight">
                                Be the first to create a connection in this category!
                            </p>
                        </div>
                    ) : (
                        filteredConnections.map((connection, index) => (
                            <motion.div
                                key={connection.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <ConnectionCard connection={connection} />
                            </motion.div>
                        ))
                    )}
                </motion.div>

                {!user && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
                    >
                        <div className="text-center">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
                                Sign in to create connections and connect with others
                            </p>
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => navigate('/login')}
                            >
                                Sign in
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}