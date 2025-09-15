// import React, { useState } from "react";
import {motion} from "framer-motion";
import {Banner} from "../components/home/Banner.tsx";
import {ChevronDown, Clock, Filter, Plus, TrendingUp} from "lucide-react";
import {useAuth} from "../context/AuthContext.tsx";
import {useApp} from "../context/AppContext.tsx";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import { Button } from "../components/ui/Button.tsx";
import { CreateConfession } from "../components/confessions/CreateConfession.tsx";
import {ConfessionCard} from "../components/confessions/ConfessionCard.tsx";


export function Home() {
    const {user} = useAuth();
    const {confessions, addConfession} = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'today' | 'trending'>('today');
    const [showNewConfession, setShowNewConfession] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const confessionsPerPage = 10;

    const todayConfessions = confessions.filter(confession => {
        const confessionDate = new Date(confession.timestamp);
        const today = new Date();
        return confessionDate.toDateString() === today.toDateString()
    });

    const trendingConfessions = confessions.filter(confession => confession.trending);

    const allConfessions = activeTab === 'today' ? todayConfessions : trendingConfessions;
    const totalPages = Math.ceil(allConfessions.length / confessionsPerPage);
    const startIndex = (currentPage - 1) * confessionsPerPage;
    const displayedConfessions = allConfessions.slice(0, startIndex + confessionsPerPage);

    const handleCreateConfession = (content: string, category: string, isAnonymous: boolean) => {
        addConfession(category, content, isAnonymous);
    }
    const loadMore = async () => {
        if(currentPage >= totalPages) {
            return;
        }
        setIsLoading(true);
        // simulate Loading delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentPage(prev => prev + 1);
        setIsLoading(false);
    }

    return (
        <div className="min-h-screen p-4 md:p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Banner */}
                <Banner/>
                {/* Header */}
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    className={"flex items-center justify-between"}
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                            Confessions
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 tracking-tight">
                            Share your truth anonymously
                        </p>
                    </div>

                    {user && (
                        <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                            <button
                                onClick={() => setShowNewConfession(true)}
                                className='flex items-center space-x-2'
                            >
                                <Plus size={16}/>
                                <span className='hidden sm:inline'>New Confession</span>
                            </button>
                        </motion.div>
                    )}
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.1}}
                    className='flex items-center justify-between'
                >
                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
                        <button
                            onClick={() => setActiveTab('today')}
                            className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors tracking-tight
                                ${activeTab === 'today'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }
                            `}
                        >
                            <Clock size={16}/>
                            <span>Today</span>
                            {activeTab === 'today' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-sm"
                                    style={{zIndex: -1}}
                                />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('trending')}
                            className={
                            `relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors tracking-tight
                                ${activeTab === 'trending'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }
                         `}
                        >
                            <TrendingUp size={16}/>
                            <span>Trending</span>
                            {activeTab === 'trending' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className='absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-sm'
                                style={{zIndex: -1}}
                                />
                            )}
                        </button>
                    </div>

                    <Button variant='ghost' size='sm' className="flex items-center space-x-2">
                        <Filter size={16}/>
                        <span className="hidden sm:inline">Filter</span>
                    </Button>
                </motion.div>

                {/* Confessions List*/}
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.2}}
                    className="space-y-6"
                >
                    {allConfessions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                {activeTab === 'today' ? <Clock size={24}/> : <TrendingUp size={24}/>}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                                No Confessions {activeTab === 'today' ? 'today' : 'trending'}
                            </h3>
                            <p className='text-gray-600 dark:text-gray-400 tracking-tight'>
                                {activeTab === 'today'
                                ? 'Be the first to share something today!'
                                : 'Check back later for trending confessions.'
                                }
                            </p>
                        </div>
                    ) : (
                        displayedConfessions.map((confession, index) => (
                            <motion.div
                                key={confession.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index}}
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
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        className="flex justify-center pt-6"
                    >
                        <Button
                            onClick={loadMore}
                            loading={isLoading}
                            variant='ghost'
                            className='flex items-center space-x-2'
                        >
                            <ChevronDown size={16} />
                            <span>Load More Confessions</span>
                        </Button>
                    </motion.div>
                )}

                {/* Pagination */}
                {allConfessions.length > 0 && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 tracking-tight">
                        Showing {displayedConfessions.length} of {allConfessions.length} confessions
                    </div>
                )}





                {/* Create Confession model */}
                <CreateConfession
                    isOpen={showNewConfession}
                    onClose={() => setShowNewConfession(false)}
                    onSubmit={handleCreateConfession}
                    />
            </div>
        </div>
    )
}