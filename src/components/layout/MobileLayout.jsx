import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, User, Zap, Dumbbell, Shuffle, Orbit, Activity, X, PersonStanding, Menu } from 'lucide-react';
import clsx from 'clsx';
import InstallPWA from '../common/InstallPWA';

import SidebarMenu from './SidebarMenu';
import useStore from '../../store/useStore';

const MobileLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Close menu when route changes
    React.useEffect(() => {
        setIsMenuOpen(false);
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // ... (rest of logic) ...
    // Note: I need to wrap the return carefully.

    // Semicircle Configuration
    const radius = 130;
    const menuItems = [
        { to: "/strength", icon: Dumbbell, label: "Fuerza", color: "bg-purple-500", angle: -60, zIndex: 10 },
        { to: "/cardio", icon: Zap, label: "Energía", color: "bg-orange-500", angle: -30, zIndex: 20 },
        { to: "/body-comp", icon: PersonStanding, label: "Cuerpo", color: "bg-teal-500", angle: 0, zIndex: 30 },
        { to: "/agility", icon: Orbit, label: "Control", color: "bg-blue-500", angle: 30, zIndex: 40 },
        { to: "/mobility", icon: Shuffle, label: "Movilidad", color: "bg-pink-500", angle: 60, zIndex: 10 },
    ];

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 relative overflow-hidden shadow-2xl">
            {/* Top Left Logo Home Link */}
            <NavLink
                to="/"
                className="fixed top-4 left-4 z-[60] active:scale-95 transition-all w-12 h-12 flex items-center justify-center"
            >
                <img src="/brand-compact.png" alt="Antigravity" className="w-8 h-8 object-contain" />
            </NavLink>

            {/* Top Right Menu Trigger */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed top-4 right-4 z-[60] text-slate-900 hover:text-emerald-600 active:scale-95 transition-all w-12 h-12 flex items-center justify-center"
            >
                <Menu size={32} />
            </button>

            {/* Dynamic Header Title */}
            <div className="fixed top-0 left-0 right-0 h-20 flex items-center justify-center z-[50] pointer-events-none">
                <h1 className="text-lg font-black uppercase tracking-wider text-slate-900 animate-in fade-in slide-in-from-top-4 duration-500">
                    {useStore((state) => state.headerTitle)}
                </h1>
            </div>

            {/* Main Content Area */}
            {/* Main Content Area */}
            <main className={clsx(
                "flex-1 overflow-y-auto relative z-0",
                useStore((state) => state.headerTitle) ? "pt-20" : "pt-0"
            )}>
                <div className="h-full">
                    <Outlet />
                </div>
            </main>

            {/* Dark Overlay when menu is open */}
            <div
                onClick={() => setIsMenuOpen(false)}
                className={clsx(
                    "absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 z-40",
                    isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            />

            {/* Floating Navigation Dock */}
            <nav className="absolute bottom-6 left-0 right-0 z-50 flex justify-center items-end pointer-events-none">
                {/* ... (existing nav content) ... */}
                <div className="relative flex items-center justify-center mb-0">

                    {/* Navbar Pill */}
                    <div className={clsx(
                        "glass px-6 py-2 rounded-[2rem] shadow-2xl shadow-emerald-900/30 flex items-center gap-6 border border-white/80 bg-white/95 backdrop-blur-xl pointer-events-auto relative z-50 transition-all duration-500",
                        (!isMenuOpen && (location.pathname.startsWith('/strength') ||
                            location.pathname.startsWith('/cardio') ||
                            location.pathname.startsWith('/agility') ||
                            location.pathname.startsWith('/mobility') ||
                            location.pathname.startsWith('/body-comp') ||
                            location.pathname.startsWith('/onboarding')))
                            ? "opacity-0 translate-y-10 scale-90 pointer-events-none"
                            : "opacity-100 translate-y-0 scale-100"
                    )}>
                        <NavItem to="/" icon={Home} label="Inicio" />
                        <div className="w-16"></div>
                        <NavItem to="/results" icon={User} label="Perfil" />
                    </div>

                    {/* Central Action Button */}
                    <div className={clsx(
                        "absolute w-16 h-16 z-50 pointer-events-auto flex items-center justify-center transition-all duration-500 ease-in-out",
                        (!isMenuOpen && (location.pathname.startsWith('/strength') ||
                            location.pathname.startsWith('/cardio') ||
                            location.pathname.startsWith('/agility') ||
                            location.pathname.startsWith('/mobility') ||
                            location.pathname.startsWith('/body-comp') ||
                            location.pathname.startsWith('/onboarding')))
                            ? "left-[20px] bottom-[20px] translate-x-0"
                            : "left-1/2 bottom-[2px] -translate-x-1/2"
                    )}>
                        {location.pathname === '/' && !isMenuOpen && (
                            <div
                                onClick={() => setIsMenuOpen(true)}
                                className="absolute -top-14 left-1/2 -translate-x-1/2 w-max cursor-pointer z-0 group"
                            >
                                <div className="flex flex-col items-center justify-center animate-bounce group-hover:scale-105 transition-transform">
                                    <span className="text-slate-400 text-sm font-bold mb-1 whitespace-nowrap bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm group-hover:text-emerald-600 transition-colors">Comenzar Evaluación</span>
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-300/50 group-hover:border-t-emerald-400"></div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={clsx(
                                "w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/40 transition-all duration-500 border-[4px] border-slate-50 relative z-50",
                                isMenuOpen ? "bg-slate-800 rotate-180 scale-110 opacity-100" : "bg-emerald-600 hover:scale-105 active:scale-95",
                                (!isMenuOpen && (location.pathname.startsWith('/strength') ||
                                    location.pathname.startsWith('/cardio') ||
                                    location.pathname.startsWith('/agility') ||
                                    location.pathname.startsWith('/mobility') ||
                                    location.pathname.startsWith('/body-comp') ||
                                    location.pathname.startsWith('/onboarding'))) && "opacity-40 hover:opacity-100"
                            )}
                        >
                            {isMenuOpen ? <X className="text-white" size={30} /> : <Activity className="text-white" size={30} />}
                        </button>

                        {/* Semicircle Menu Items */}
                        <div className={clsx(
                            "absolute top-1/2 left-1/2 w-0 h-0 transition-all duration-300 z-10",
                            isMenuOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-50 pointer-events-none"
                        )}>
                            {menuItems.map((item, index) => {
                                const angleRad = (item.angle - 90) * (Math.PI / 180);
                                const x = radius * Math.cos(angleRad);
                                const y = radius * Math.sin(angleRad);

                                return (
                                    <div
                                        key={index}
                                        className="absolute transition-all duration-500"
                                        style={{
                                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                            transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                                            zIndex: item.zIndex
                                        }}
                                    >
                                        <MenuOption {...item} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav>
            <InstallPWA />
            <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
    );
};

const MenuOption = ({ to, icon: Icon, label, color }) => (
    <NavLink
        to={to}
        className="flex flex-col items-center gap-2 group"
    >
        <div className={clsx(
            "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl border-[3px] border-white/20 transition-transform duration-200 active:scale-90 group-hover:scale-110",
            color
        )}>
            <Icon size={24} />
        </div>
        {/* Updated Label Style: No background, bold white text with shadow */}
        <span className="text-xs font-black text-white drop-shadow-md tracking-wide uppercase">
            {label}
        </span>
    </NavLink>
);

const NavItem = ({ to, icon: Icon, label }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                clsx(
                    "flex flex-col items-center justify-center relative group transition-all duration-300 w-20",
                    isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
                )
            }
        >
            {({ isActive }) => (
                <>
                    <Icon
                        size={26}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={clsx("transition-all duration-300", isActive && "scale-110")}
                    />
                </>
            )}
        </NavLink>
    );
};

export default MobileLayout;
