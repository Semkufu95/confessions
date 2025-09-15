import React from "react";
import {useApp} from "../../context/AppContext.tsx";
import {useLocation} from "react-router-dom";
import {Navigation} from "./Navigation.tsx";
import {Footer} from "./Footer.tsx";

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const { darkMode } = useApp();
    const location = useLocation();

    const isAuthPage = location.pathname === '/login' || location.pathname === 'signup';
    const showNavigation = !isAuthPage;

    return (
        <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200 flex flex-col">
                <Navigation />
                <main className={` ${showNavigation ? 'md:ml-64 pb-20 md:pb-0' : ''} flex-1`}>
                    {children}
                </main>

                {!isAuthPage && <Footer/>}
            </div>
        </div>
    )
}