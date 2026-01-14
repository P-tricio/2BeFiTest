import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Instagram, Mail, LogOut, LayoutGrid, ChevronRight, User } from 'lucide-react';
import useStore from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

const SidebarMenu = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { setAuthUser } = useStore();

    const handleLogout = async () => {
        try {
            const { getAuth, signOut } = await import('firebase/auth');
            // Assuming firebase app is initialized and exported as 'auth' or we get it via getAuth()
            // In MobileLayout or others, it imports { auth } from '../../lib/firebase'
            const { auth } = await import('../../lib/firebase');
            await signOut(auth);
            setAuthUser(null);
            navigate('/login');
            onClose();
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Slide-over Menu */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 z-[70] w-80 bg-white shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900 text-lg">2BeTest</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-gray-100 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Menu Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-2">

                            {/* Navigation */}
                            <MenuLink
                                icon={User}
                                label="Mi Perfil"
                                onClick={() => { navigate('/results'); onClose(); }}
                            />

                            <MenuLink
                                icon={Globe}
                                label="Web Oficial"
                                href="https://2befit.vercel.app/"
                            />

                            <MenuLink
                                icon={Instagram}
                                label="@2befit.online"
                                href="https://instagram.com/2befit.online"
                            />

                            <div className="my-4 border-t border-gray-100"></div>

                            {/* Hub Return */}
                            <MenuLink
                                icon={LayoutGrid}
                                label="Volver al Hub"
                                href="https://2befithub.vercel.app/"
                                highlight
                            />

                            {/* Actions */}
                            <div className="mt-auto pt-4">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 group w-full hover:bg-red-50 text-slate-600 hover:text-red-600"
                                >
                                    <div className="flex items-center gap-3">
                                        <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
                                        <span className="font-medium">Cerrar Sesión</span>
                                    </div>
                                    <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 text-red-500 transition-opacity" />
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50 border-t border-gray-100 text-center">
                            <div className="flex justify-center mb-4">
                                <img src="/brand-compact.png" alt="Logo" className="h-6 w-auto opacity-50 grayscale" />
                            </div>
                            <p className="text-xs text-slate-400">
                                © {new Date().getFullYear()} 2BEFIT Ecosystem<br />
                                v2.1.0 Beta
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const MenuLink = ({ icon: Icon, label, href, onClick, highlight }) => {
    const content = (
        <>
            <div className="flex items-center gap-3">
                <Icon size={20} className={highlight ? 'text-[#57B590]' : 'text-slate-400 group-hover:text-slate-900'} />
                <span className={`font-medium ${highlight ? 'font-bold' : ''}`}>{label}</span>
            </div>
            <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${highlight ? 'text-[#57B590]' : 'text-slate-400'}`} />
        </>
    );

    const className = `
      flex items-center justify-between p-4 rounded-xl transition-all duration-200 group w-full cursor-pointer
      ${highlight ? 'bg-[#57B590]/10 text-[#57B590] hover:bg-[#57B590]/20' : 'hover:bg-gray-50 text-slate-600 hover:text-slate-900'}
    `;

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
            </a>
        );
    }

    return (
        <div onClick={onClick} className={className}>
            {content}
        </div>
    );
};

export default SidebarMenu;
