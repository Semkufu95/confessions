
import { motion } from "framer-motion";
import { MessageSquare, Users, Heart, Star, Shield} from 'lucide-react';

export function Banner() {
    const features = [
        { icon: Shield, text: 'Anonymous', delay: 0.1 },
        { icon: Heart, text: 'Safe Space', delay: 0.2 },
        { icon: Users, text: 'Community', delay: 0.3 },
        { icon: Star, text: 'Authentic', delay: 0.4},
    ];

    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
        <motion.div
        initial={{ opacity: 0, y: 20}}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8 overflow-hidden relative"
        >
            { /* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 left-4 w-8 h-8 border-2 border-blue-600 rounded-full"></div>
                <div className="absolute top-8 right-8 w-4 h-4 bg-blue-600 rounded-full"></div>
                <div className="absolute bottom-6 left-8 w-6 h-6 border border-blue-600 rounded-1g rotate-45"></div>
                <div className="absolute bottom-4 right-4 w-3 h-3 bg-blue-600 rounded-full"></div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <motion.div
                        initial={{ scale: 0.8}}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center space-x-3"
                    >
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <MessageSquare size={24} className="text-white"/>
                    </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                Share your truth anonymously
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 tracking-tight">
                                We listen, We don't judge
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="text-2xl"
                    >
                        💭
                    </motion.div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {
                        features.map(({ icon: Icon, text, delay }) => (
                            <motion.div
                                key={text}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay }}
                                whileHover={{ scale:1.05, y: -2 }}
                                className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer transition-all duration-200"
                            >
                                <Icon size={16} className="text-blue-600" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 tracking-tight">
                                    {text}
                                </span>
                            </motion.div>
                        ))
                    }
                </div>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 1}}
                    className="h-1 bg-blue-600 rounded-full mt-4 opacity-20"
                />
            </div>
        </motion.div>
    );
}