import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Play, RotateCcw, CheckCircle, Target, Timer } from 'lucide-react';
import clsx from 'clsx';

const HandTappingTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const setHeaderTitle = useStore((state) => state.setHeaderTitle);

    // Stages: 'intro', 'ready', 'countdown', 'testing', 'rest', 'completed'
    const [stage, setStage] = useState('intro');
    const [currentHand, setCurrentHand] = useState('right'); // 'right' or 'left'

    useEffect(() => {
        setHeaderTitle('Plate Tapping');
        return () => setHeaderTitle('');
    }, []);

    // Timers
    const [timeLeft, setTimeLeft] = useState(10);
    const [countdown, setCountdown] = useState(3);
    const [isCooldown, setIsCooldown] = useState(false); // For button safety

    // Data
    const [taps, setTaps] = useState(0);
    const [results, setResults] = useState({ right: 0, left: 0 });

    // Refs
    // we use refs for intervals to clear them easily
    const intervalRef = useRef(null);
    const lastTapTime = useRef(0);

    // --- COOLDOWN EFFECT ---
    // Whenever we enter 'rest' or 'completed', enforce a small cooldown
    useEffect(() => {
        if (stage === 'rest' || stage === 'completed') {
            setIsCooldown(true);
            const timer = setTimeout(() => setIsCooldown(false), 2000); // 2s safety
            return () => clearTimeout(timer);
        } else {
            setIsCooldown(false);
        }
    }, [stage]);

    // --- COUNTDOWN LOGIC ---
    useEffect(() => {
        if (stage === 'countdown') {
            setCountdown(3);
            intervalRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        beginTesting();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [stage]);

    // --- TESTING TIMER LOGIC ---
    useEffect(() => {
        if (stage === 'testing') {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0) { // Should be caught by effect below, but safety
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [stage]);

    // Watcher for TimeLeft Finish
    useEffect(() => {
        if (stage === 'testing' && timeLeft < 0) { // < 0 to ensure 0 is shown
            // logic moved to check <= 0 in effect? 
            // Better: if timeLeft touches 0, wait a tick or execute immediately.
            // Let's rely on <=0 trigger
            finishPhase();
        } else if (stage === 'testing' && timeLeft === 0) {
            finishPhase();
        }
    }, [timeLeft, stage]);


    const beginTesting = () => {
        setTaps(0);
        setTimeLeft(10);
        setStage('testing');
    };

    const finishPhase = () => {
        clearInterval(intervalRef.current);
        const finalTaps = taps; // Current state measure is fine here as this runs on render cycle

        // Save current hand score locally
        const updatedResults = { ...results, [currentHand]: finalTaps };
        setResults(updatedResults);

        if (currentHand === 'right') {
            // Prepare for Left
            setStage('rest');
        } else {
            // Done
            setStage('completed');

            // Final Save to Global Store
            const asymmetry = Math.abs(updatedResults.right - updatedResults.left);
            const score = asymmetry <= 5 ? 'Excelente' : asymmetry <= 10 ? 'Bueno' : 'Mejorable';

            setTestResult('agility', 'tapping', {
                right: updatedResults.right,
                left: updatedResults.left,
                asymmetry,
                score
            });
        }
    };

    const handleStartClick = () => {
        setStage('countdown');
    };

    const handleTap = (e) => {
        if (e) e.preventDefault();

        const now = Date.now();
        // Debounce: Ignore touches within 80ms of the last one to prevent multi-finger accidental counting
        if (now - lastTapTime.current < 80) return;

        if (stage === 'testing') {
            lastTapTime.current = now;
            setTaps(prev => prev + 1);

            // Haptic feedback if available (Mobile only)
            if (navigator.vibrate) navigator.vibrate(5);
        }
    };

    const startLeftHand = () => {
        if (isCooldown) return;
        setCurrentHand('left');
        setStage('ready');
    };

    const resetTest = () => {
        if (isCooldown) return;
        setStage('intro');
        setCurrentHand('right');
        setResults({ right: 0, left: 0 });
        setTaps(0);
    };

    // --- RENDERERS ---

    if (stage === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">

                    {/* Visual Aid Image */}
                    <div className="w-full relative aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                        <img
                            src="/exercises/tapping.png"
                            alt="Demonstración de Plate Tapping"
                            className="w-full h-full object-contain p-4 mix-blend-multiply"
                        />
                        <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 p-2 rounded-full">
                            <Target size={20} />
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Test de Control</p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-blue-500" /> Protocolo
                        </h3>
                        <ol className="list-decimal pl-5 space-y-3 text-slate-600 text-sm marker:text-blue-500 marker:font-bold">
                            <li>Siéntate con los pies separados.</li>
                            <li><strong>Mano DERECHA (Test):</strong> Móvil en rodilla IZQUIERDA (sujétalo con mano izquierda).</li>
                            <li>Toca la pantalla y tu rodilla DERECHA alternativamente.</li>
                            <li>Repite con la otra mano (cruzado).</li>
                        </ol>
                    </div>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto bg-slate-50/90 backdrop-blur-sm">
                    <button
                        onClick={() => setStage('ready')}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Entendido, Continuar
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'ready') {
        const isRight = currentHand === 'right';
        return (
            <div className="flex flex-col h-full items-center justify-center p-6 space-y-8 animate-in slide-in-from-right bg-slate-50">
                <div className="text-center space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">PREPARACIÓN</div>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight">
                        {isRight ? 'Mano Derecha' : 'Mano Izquierda'}
                    </h2>
                    <p className="text-slate-500 font-medium">Mano que realiza el test</p>
                </div>

                <div className="card-base p-8 w-full max-w-xs text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 animate-pulse">
                        <Timer size={32} />
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">
                        Coloca el móvil en tu rodilla <strong className="text-blue-600">{isRight ? 'IZQUIERDA' : 'DERECHA'}</strong>.
                        <br /><span className="text-sm text-slate-400 mt-2 block">Sujétalo con la mano {isRight ? 'izquierda' : 'derecha'}.</span>
                    </p>
                </div>

                <button
                    onClick={handleStartClick}
                    className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3"
                >
                    <Play size={24} fill="currentColor" />
                    EMPEZAR
                </button>
            </div>
        );
    }

    if (stage === 'countdown') {
        return (
            <div className="flex flex-col h-full items-center justify-center bg-slate-900 text-white">
                <div className="text-[180px] font-black leading-none animate-bounce text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-600">
                    {countdown > 0 ? countdown : 'GO!'}
                </div>
                <p className="text-slate-400 font-bold tracking-[0.5em] mt-8">PREPÁRATE</p>
            </div>
        );
    }

    if (stage === 'testing') {
        return (
            <div className="flex flex-col h-full bg-slate-900 select-none overflow-hidden touch-manipulation relative">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[100px]"></div>
                </div>

                <header className="relative z-10 flex justify-between items-center p-8">
                    <div className="glass-dark px-4 py-2 rounded-full">
                        <span className="text-blue-300 font-bold text-xs uppercase tracking-wider">
                            {currentHand === 'right' ? 'Mano Derecha' : 'Mano Izquierda'}
                        </span>
                    </div>
                    <div className={clsx("text-5xl font-mono font-black tracking-tighter", timeLeft <= 3 ? "text-red-500" : "text-white")}>
                        00:{timeLeft.toString().padStart(2, '0')}
                    </div>
                </header>

                <button
                    className="relative z-10 flex-1 w-full flex flex-col items-center justify-center outline-none active:scale-[0.98] transition-transform cursor-pointer"
                    onPointerDown={handleTap}
                >
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 group-active:opacity-40 transition-opacity"></div>
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-72 h-72 rounded-full flex flex-col items-center justify-center shadow-[0_0_80px_rgba(37,99,235,0.3)] border-4 border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent)] opacity-0 active:opacity-100 transition-opacity"></div>
                            <span className="text-blue-100/60 text-lg font-bold uppercase mb-2 tracking-widest">TAP</span>
                            <span className="text-9xl font-black text-white leading-none tracking-tighter">{taps}</span>
                        </div>
                    </div>
                    <p className="text-slate-400 mt-12 font-medium text-sm border border-white/10 px-6 py-2 rounded-full bg-white/5 backdrop-blur-sm">
                        Pantalla ↔ Rodilla
                    </p>
                </button>
            </div>
        );
    }

    if (stage === 'rest') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6 animate-in zoom-in bg-slate-50">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">¡Tiempo!</h2>
                    <p className="text-slate-500 font-medium">Cambia de mano para continuar.</p>
                </div>

                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 w-full max-w-xs block">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Resultado Mano Derecha</p>
                    <div className="text-6xl font-black text-slate-900 leading-none">{results.right}</div>
                    <p className="text-sm font-medium text-slate-400 mt-2">Toques</p>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto">
                    <button
                        onClick={startLeftHand}
                        disabled={isCooldown}
                        className={clsx(
                            "btn-primary w-full py-5 text-lg",
                            isCooldown && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isCooldown ? "Descansa un momento..." : "Iniciar Mano Izquierda"}
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'completed') {
        const asymmetry = Math.abs(results.right - results.left);
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 animate-in zoom-in bg-slate-50">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-blue-600" />
                </div>

                <h2 className="text-3xl font-black text-slate-900">¡Test Completado!</h2>

                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 w-full max-w-sm relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">VELOCIDAD (Suma)</h2>
                    <div className="flex justify-center items-end gap-2 mb-6">
                        <div className="text-6xl font-black text-slate-900">{results.right + results.left}</div>
                        <div className="text-slate-400 font-bold mb-2 text-xl">toques</div>
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className={clsx(
                            "px-4 py-2 rounded-xl text-sm font-bold border transition-colors",
                            asymmetry > 10 ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                        )}>
                            {asymmetry > 10 ? `⚠️ Asimetría: ${asymmetry}%` : `✅ Asimetría: ${asymmetry}%`}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <ResultCard label="Derecha" value={results.right} />
                        <ResultCard label="Izquierda" value={results.left} />
                    </div>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto space-y-3">
                    <button
                        onClick={resetTest}
                        disabled={isCooldown}
                        className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <RotateCcw size={20} /> Repetir Test
                        </div>
                    </button>
                    <button
                        onClick={() => navigate('/results')}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Finalizar
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

const ResultCard = ({ label, value }) => (
    <div className="bg-slate-50 rounded-2xl p-4">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">{label}</span>
        <div className="text-3xl font-black text-slate-800">{value}</div>
    </div>
);

export default HandTappingTest;
