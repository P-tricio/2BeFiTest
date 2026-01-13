import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import clsx from 'clsx';

const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    // Check if dismissed previously
    const [isDismissed, setIsDismissed] = useState(() => {
        return localStorage.getItem('pwa_install_dismissed') === 'true';
    });

    useEffect(() => {
        // 1. Check for Android/Desktop native install prompt
        const handler = (e) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // 2. Check for iOS (Safari doesn't support beforeinstallprompt)
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isIosDevice && !isStandalone) {
            setIsIOS(true);
            setSupportsPWA(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = (e) => {
        e.preventDefault();
        if (promptInstall) {
            // Android/Desktop: Trigger native prompt
            promptInstall.prompt();
            promptInstall.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    dismissBanner(); // Installed!
                }
            });
        } else if (isIOS) {
            // iOS: Show manual instructions
            setShowInstructions(true);
        }
    };

    const dismissBanner = () => {
        setIsDismissed(true);
        localStorage.setItem('pwa_install_dismissed', 'true');
        setShowInstructions(false);
    };

    if (!supportsPWA || isDismissed) return null;

    return (
        <>
            {/* Main Floating Banner */}
            {/* Hidden if iOS instructions are open to avoid clutter */}
            {!showInstructions && (
                <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom fade-in duration-500">
                    <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-xl">
                                <Download size={20} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Instalar App</h4>
                                <p className="text-xs text-slate-300">Mejor experiencia a pantalla completa</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleInstallClick}
                                className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                            >
                                Instalar
                            </button>
                            <button
                                onClick={dismissBanner}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* iOS Instructions Modal */}
            {isIOS && showInstructions && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowInstructions(false)} />

                    <div className="bg-white w-full max-w-sm m-4 rounded-[2rem] p-6 pointer-events-auto relative animate-in slide-in-from-bottom duration-300">
                        <button
                            onClick={() => setShowInstructions(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 mb-2">Instalar en iPhone</h3>
                            <p className="text-slate-500 text-sm">iOS no permite instalación automática, pero es muy fácil:</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <Share className="text-blue-500 flex-shrink-0" size={24} />
                                <p className="text-sm text-slate-700">1. Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.</p>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <PlusSquare className="text-blue-500 flex-shrink-0" size={24} />
                                <p className="text-sm text-slate-700">2. Busca y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">¡Y listo!</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InstallPWA;
