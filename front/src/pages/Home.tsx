
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Clock, Filter, ChevronDown, Star } from 'lucide-react';
import { ConfessionCard } from '../components/confessions/ConfessionCard';
import { CreateConfession } from '../components/confessions/CreateConfession';
import { Banner } from '../components/home/Banner';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export function Home() {
    const { confessions, starredConfessions, addConfession, isLoadingConfessions, confessionsError, refreshConfessions } = useApp();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'today' | 'trending' | 'starred'>('today');
    const [showNewConfession, setShowNewConfession] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const confessionsPerPage = 5;

    const todayConfessions = confessions.filter(confession => {
        const confessionDate = new Date(confession.timeStamp);
        const today = new Date();
        return confessionDate.toDateString() === today.toDateString();
    });

    const trendingConfessions = confessions.filter(confession => confession.trending || confession.likes >= 5 || confession.stars >= 3);

    const allConfessions =
        activeTab === 'today' ? todayConfessions : activeTab === 'trending' ? trendingConfessions : starredConfessions;
    const totalPages = Math.ceil(allConfessions.length / confessionsPerPage);
    const startIndex = (currentPage - 1) * confessionsPerPage;
    const displayedConfessions = allConfessions.slice(0, startIndex + confessionsPerPage);

    const handleCreateConfession = async (content: string, category: string, isAnonymous: boolean) => {
        await addConfession(content, category, isAnonymous);
    };

    const loadMore = async () => {
        if (currentPage >= totalPages) return;

        setIsLoading(true);
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentPage(prev => prev + 1);
        setIsLoading(false);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Banner */}
                <Banner />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                            Confessions
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 tracking-tight">
                            Anonymous thoughts from the community
                        </p>
                    </div>

                    {user && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={() => setShowNewConfession(true)}
                                className="flex items-center space-x-2"
                            >
                                <Plus size={16} />
                                <span className="hidden sm:inline">New Confession</span>
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
                            onClick={() => setActiveTab('today')}
                            className={`
                relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors tracking-tight
                ${activeTab === 'today'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }
              `}
                        >
                            <Clock size={16} />
                            <span>Today</span>
                            {activeTab === 'today' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-sm"
                                    style={{ zIndex: -1 }}
                                />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('trending')}
                            className={`
                relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors tracking-tight
                ${activeTab === 'trending'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }
              `}
                        >
                            <TrendingUp size={16} />
                            <span>Trending</span>
                            {activeTab === 'trending' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-sm"
                                    style={{ zIndex: -1 }}
                                />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('starred')}
                            className={`
                relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors tracking-tight
                ${activeTab === 'starred'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }
              `}
                        >
                            <Star size={16} />
                            <span>Starred</span>
                            {activeTab === 'starred' && (
                                <motion.div
                                    layoutId="activeTab"
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

                {/* Confessions List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {isLoadingConfessions && (
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Loading confessions...
                        </div>
                    )}

                    {confessionsError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                            <p>{confessionsError}</p>
                            <Button variant="ghost" size="sm" className="mt-2" onClick={() => void refreshConfessions()}>
                                Retry
                            </Button>
                        </div>
                    )}

                    {allConfessions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                {activeTab === 'today' ? <Clock size={24} /> : activeTab === 'trending' ? <TrendingUp size={24} /> : <Star size={24} />}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                                {activeTab === 'today' && 'No confessions today'}
                                {activeTab === 'trending' && 'No trending confessions'}
                                {activeTab === 'starred' && 'No starred confessions yet'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 tracking-tight">
                                {activeTab === 'today'
                                    ? 'Be the first to share something today!'
                                    : activeTab === 'trending'
                                        ? 'Check back later for trending confessions.'
                                        : 'Star confessions to see them here.'
                                }
                            </p>
                        </div>
                    ) : (
                        displayedConfessions.map((confession, index) => (
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

                {/* Load More Button */}
                {allConfessions.length > 0 && currentPage < totalPages && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center pt-6"
                    >
                        <Button
                            onClick={loadMore}
                            loading={isLoading}
                            variant="ghost"
                            className="flex items-center space-x-2"
                        >
                            <ChevronDown size={16} />
                            <span>Load More Confessions</span>
                        </Button>
                    </motion.div>
                )}

                {/* Pagination Info */}
                {allConfessions.length > 0 && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 tracking-tight">
                        Showing {displayedConfessions.length} of {allConfessions.length} confessions
                    </div>
                )}
                {!user && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
                    >
                        <div className="text-center">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
                                Sign in to like, star, and comment on confessions
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

                {/* Create Confession Modal */}
                <CreateConfession
                    isOpen={showNewConfession}
                    onClose={() => setShowNewConfession(false)}
                    onSubmit={(content, category, isAnonymous) => handleCreateConfession(content, category, isAnonymous)}
                />
            </div>
        </div>
    );
}
