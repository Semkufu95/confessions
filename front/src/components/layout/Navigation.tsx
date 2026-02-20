
import { Home, HomeIcon, MessageSquare, Send, User, UserPlus, Users } from "lucide-react";
import {useAuth} from "../../context/AuthContext.tsx";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../../context/AppContext.tsx";

const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/friends', icon: UserPlus, label: 'Friends' },
    { to: '/connections', icon: Users, label: "Connections" },
    { to: '/messages', icon: Send, label: "Messages" },
    { to: '/profile', icon: User, label: 'Profile'}
];

export function Navigation() {
    const { user } = useAuth();
    const { pendingFriendRequests } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const pendingRequestsCount = pendingFriendRequests.length;

    if (location.pathname === '/login' || location.pathname === '/signup') {
        return null;
    }

    // show limited Navigation for Non-Authenticated users
    const navigationItems = user ? navItems : [
        { to: '/', icon: HomeIcon, label: 'Home' },
        { to: '/connections', icon: Users, label: "Connections" },
        { to: '/messages', icon: Send, label: "Messages" },
    ];
    return (
        <>
            {/* Mobile Bottom navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 z-50">
                <div className="flex items-center justify-around px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-1.5">
                    {navigationItems.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to}>
                            {({ isActive}) => (
                                <motion.div
                                 whileTap={{ scale: 0.95 }}
                                 className={`
                                    relative flex flex-col items-center justify-center px-2 py-1.5 rounded-xl min-w-14
                                    transition-colors duration-200 tracking-tight
                                    ${isActive
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }
                                 `}
                                >
                                    <Icon size={18}/>
                                    <span className="text-[10px] mt-1 font-medium leading-none">{label}</span>
                                    {to === '/friends' && pendingRequestsCount > 0 && (
                                        <span className="absolute -top-0.5 right-1.5 inline-flex min-w-4 h-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white">
                                            {pendingRequestsCount > 9 ? "9+" : pendingRequestsCount}
                                        </span>
                                    )}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl -z-10"
                                        />
                                    )}
                                </motion.div>
                            )}
                        </NavLink>
                    ))}

                    {!user && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/login')}
                            className="flex flex-col items-center justify-center px-2 py-1.5 rounded-xl min-w-14 text-gray-500 dark:text-gray-400
                            hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 tracking-tight"
                        >
                            <User size={18}/>
                            <span className="text-[10px] mt-1 font-medium leading-none">Sign In</span>
                        </motion.button>
                    )}
                </div>
            </nav>

            {/* Desktop site navigation */}
            <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r
             border-gray-200 dark:border-gray-700 z-40">
                <div className="flex flex-col w-full p-6">
                    <div className="flex items-center space-x-2 mb-8">
                        <MessageSquare className="w-8 h-8 text-blue-600"/>
                        <span className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                            Confessions
                        </span>
                    </div>

                    <div className="space-y-2">
                        {navigationItems.map(({ to, icon: Icon, label }) => (
                            <NavLink key={to} to={to}>
                                {({ isActive }) => (
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={
                                        `relative flex items-center space-x-3 p-3 rounded-2xl transition-colors duration-200 tracking-tight
                                        ${isActive
                                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }
                                        `}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{label}</span>
                                        {to === '/friends' && pendingRequestsCount > 0 && (
                                            <span className="ml-auto inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-semibold text-white">
                                                {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
                                            </span>
                                        )}
                                        {isActive && (
                                            <motion.div
                                                layoutId="desktopActiveTab"
                                                className="absolute right-2 w-1 h-6 bg-blue-600 rounded-full"
                                            />
                                        )}
                                    </motion.div>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {!user && (
                        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
                            <p className='text-sm text-gray-700 dark:text-gray-300 mb-3 tracking-tight'>
                                Sign in to like, star and comment on confessions
                            </p>
                            <motion.button
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/login')}
                                className="w-full flex items-center space-x-3 p-3 rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 tracking-tight font-medium"
                            >
                                <User size={20} />
                                <span>Sign In</span>
                            </motion.button>
                        </div>
                    )}

                </div>
            </nav>
        </>
    )
}
