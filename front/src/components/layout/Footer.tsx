import { motion } from "framer-motion";
import {Calendar, Clock, Eye, HelpCircle, Mail, Moon, Sun, Users, Zap} from "lucide-react";
import {useApp} from "../../context/AppContext.tsx";
import {useEffect, useState} from "react";

interface userStats {
    currentOnline: number;
    maxVisitors24h: number;
    maxVisitors7d: number;
    maxVisitors1m: number;
    maxVisitors1yr: number;
}

export function Footer() {
    const {darkMode, toggleDarkMode} = useApp();
    const [stats, setStats] = useState<userStats>({
        currentOnline: 0,
        maxVisitors24h: 0,
        maxVisitors7d: 0,
        maxVisitors1m: 0,
        maxVisitors1yr: 0,
    });

    useEffect(() => {
        // TODO: Simulate real-time stats updates
        const updateStats = () => {
            setStats({
                currentOnline: Math.floor(Math.random() * 500) + 150,
                maxVisitors24h: Math.floor(Math.random() * 2000) + 1500,
                maxVisitors7d: Math.floor(Math.random() * 8000) + 6000,
                maxVisitors1m: Math.floor(Math.random() * 25000) + 20000,
                maxVisitors1yr: Math.floor(Math.random() * 200000) + 150000,
            });
        };
        updateStats();
        const interval = setInterval(updateStats, 30000); // update every 30seconds
        return () => clearInterval(interval);
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const statItems = [
        {
            icon: Users,
            label: 'Online Now',
            value: stats.currentOnline,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:text-green-900/20',
        },
        {
            icon: Eye,
            label: '24 Hours',
            value: stats.maxVisitors24h,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            icon: Clock,
            label: '7 Days',
            value: stats.maxVisitors7d,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
        {
            icon: Calendar,
            label: '1 Month',
            value: stats.maxVisitors1m,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        },
        {
            icon: Calendar,
            label: '1 Year',
            value: stats.maxVisitors1yr,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
        },
    ];

    const currentYear =new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py6">
                {/* User statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mb-6'
                >
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                        Community Stats
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {statItems.map((item, index) => (
                            <motion.div
                              key={item.label}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              className='bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center cursor-pointer
                               transition-all duration-200 hover:shadow'
                            >
                                <div className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                    <item.icon size={16} className={item.color} />
                                </div>
                                <div className='space-y-1'>
                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                        {formatNumber(item.value)}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 tracking-tight">
                                        {item.label}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer Links and Info*/}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {/* Theme Toggle*/}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                            Appearance
                        </h4>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={toggleDarkMode}
                            className=" flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium
                            text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors tracking-tight"
                        >
                            {darkMode ? <Sun size={16}/> : <Moon size={16} /> }
                            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        </motion.button>
                    </div>

                    {/* Help & Support*/}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                            Support
                        </h4>
                        <div className="space-y-1">
                            <motion.a
                                href="#"
                                whileHover={{ x: 2 }}
                                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600
                                dark:hover:text-blue-400 transition-colors tracking-tight py-1"
                            >
                                <HelpCircle size={14} />
                                <span>Help Center</span>
                            </motion.a>
                            <motion.a
                                href="#"
                                whileHover={{ x: 2 }}
                                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600
                                dark:hover:text-blue-400 transition-colors tracking-tight py-1"
                            >
                                <Mail size={14} />
                                <span>Contact Us</span>
                            </motion.a>
                        </div>
                    </div>

                    {/* Community Guidelines */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                            Community
                        </h4>
                        <div className="space-y-1">
                            <motion.a
                                href="#"
                                whileHover={{ x: 2 }}
                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-tight py-1"
                            >
                                Community Guidelines
                            </motion.a>
                            <motion.a
                                href="#"
                                whileHover={{ x: 2 }}
                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-tight py-1"
                            >
                                Privacy Policy
                            </motion.a>
                            <motion.a
                                href="#"
                                whileHover={{ x: 2 }}
                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-tight py-1"
                            >
                                Terms of Service
                            </motion.a>
                        </div>
                    </div>
                    {/* Powered By */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                            About
                        </h4>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 rounded-xl text-white text-sm font-medium tracking-tight cursor-pointer"
                        >
                            <Zap size={14} />
                            <span>Powered by Semkufu</span>
                        </motion.div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 tracking-tight">
                            Building the future of anonymous social connections
                        </p>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 tracking-tight">
                        © {currentYear} Confessions. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}