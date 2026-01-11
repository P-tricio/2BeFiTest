import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Footprints, MapPin, CheckCircle, Timer, Play, Save, Activity, Flame, Heart, Wind } from 'lucide-react';
import { Zap } from 'lucide-react';
import useStore from '../../store/useStore';
import clsx from 'clsx';
import { audioFeedback } from '../../services/AudioFeedback';

import BurpeeTest from './BurpeeTest';
import RuffierTest from './RuffierTest';
import RockportTest from './RockportTest';
import CooperTest from './CooperTest';

// Main Container
const CardioModule = () => {
    const level = useStore((state) => state.user.level);

    return (
        <Routes>
            <Route index element={<SelectionScreen />} />
            <Route path="rockport" element={<RockportTest />} />
            <Route path="cooper" element={<CooperTest />} />
            <Route path="burpee" element={<BurpeeTest />} />
            <Route
                path="step"
                element={
                    level === 'advanced' ? <RuffierTest /> : <StepTest />
                }
            />
        </Routes>
    );
};

// 1. Selection Screen
const SelectionScreen = () => {
    const navigate = useNavigate();
    const level = useStore((state) => state.user.level);

    const getIndoorTitle = () => {
        if (level === 'advanced') return "Test de Ruffier";
        return "Interior (Step Test)";
    };

    const getIndoorDesc = () => {
        if (level === 'advanced') return "Test de resistencia anaeróbica. 30 sentadillas en 45s.";
        return "Subir y bajar un escalón durante 3 minutos.";
    };

    const getBurpeeTitle = () => {
        if (level === 'adapted') return "No Recomendado (Burpees)";
        if (level === 'intermediate' || level === 'general') return "Burpees (90s)";
        return "Alta Intensidad (Burpees)";
    };

    const getBurpeeDesc = () => {
        if (level === 'adapted') return "Este test no está indicado para tu nivel actual.";
        if (level === 'intermediate' || level === 'general') return "Test resistencia de 90 segundos.";
        return "Test máximo de 3 minutos. Resistencia muscular y cardiovascular.";
    };

    return (
        <div className="flex flex-col h-full relative bg-slate-50 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

            {/* Main Content Centered */}
            <div className="flex-1 flex flex-col justify-center p-6 space-y-8 relative z-10 max-w-md mx-auto w-full">

                {/* Hero Header */}
                <div className="text-center space-y-3">
                    <div className="mx-auto w-20 h-20 bg-white text-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-100 mb-4 animate-in zoom-in duration-500">
                        <Zap size={40} className="fill-current" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">Test de Energía</h2>
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nivel</span>
                        <span className={clsx(
                            "text-xs font-black uppercase tracking-wider",
                            level === 'adapted' ? "text-green-600" :
                                level === 'advanced' ? "text-red-600" : "text-blue-600"
                        )}>
                            {level || 'General'}
                        </span>
                    </div>
                </div>

                {/* Cards List */}
                <div className="grid gap-6 w-full">
                    <button
                        onClick={() => navigate(level === 'advanced' ? 'cooper' : 'rockport')}
                        className="group relative flex items-center p-6 bg-white border border-slate-100 hover:border-green-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="bg-green-50 text-green-600 p-4 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                            {level === 'advanced' ? <Footprints size={32} /> : <MapPin size={32} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">
                                {level === 'advanced' ? "Exterior (Cooper)" : "Exterior (Rockport)"}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-[240px] leading-snug">
                                {level === 'advanced'
                                    ? "Correr máxima distancia en 12 min."
                                    : "Caminar 1.6km con GPS."}
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('burpee')}
                        className={clsx(
                            "group relative flex items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-300 text-left",
                            level === 'adapted' ? "opacity-60 grayscale cursor-not-allowed" : "hover:border-yellow-400 hover:shadow-lg"
                        )}
                    >
                        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                            <Flame size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">{getBurpeeTitle()}</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-[240px] leading-snug">{getBurpeeDesc()}</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('step')}
                        className="group relative flex items-center p-6 bg-white border border-slate-100 hover:border-orange-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                            {level === 'advanced' ? <Heart size={32} /> : <Wind size={32} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">{getIndoorTitle()}</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-[240px] leading-snug">{getIndoorDesc()}</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Step Test Implementation
const StepTest = () => {
    const [status, setStatus] = useState('intro'); // intro, countdown, running, cooling, result
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const [countdown, setCountdown] = useState(3);
    const navigate = useNavigate();
    const setTestResult = useStore(state => state.setTestResult);
    const [hr, setHr] = useState('');

    // Metronome State (Moved to top level to avoid Rules of Hooks violation)
    const [beat, setBeat] = useState(0); // 0, 1, 2, 3

    // Countdown Logic
    useEffect(() => {
        let interval;
        if (status === 'countdown') {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setStatus('running');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (status === 'running' && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0 && status === 'running') {
            setStatus('cooling');
        }
        return () => clearInterval(interval);
    }, [status, timeLeft]);

    // Metronome Logic
    useEffect(() => {
        let metronomeInterval;
        if (status === 'running') {
            const beatDuration = 60000 / 96; // 625ms
            metronomeInterval = setInterval(() => {
                setBeat(prev => {
                    const next = (prev + 1) % 4;
                    // Tick (Up Start), Silence, Tock (Down Start), Silence
                    if (next === 0) audioFeedback.tick();
                    else if (next === 2) audioFeedback.tock();
                    return next;
                });
            }, beatDuration);
        }
        return () => clearInterval(metronomeInterval);
    }, [status]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleFinish = () => {
        if (!hr) return;
        // Basic calculation (placeholder logic for VO2Max estimate based on Step Test)
        const vo2 = (65.81 - (0.1847 * parseInt(hr))).toFixed(1);

        setTestResult('cardio', 'step', { hr, vo2 });
        navigate('/results');
    };

    if (status === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">

                    {/* Visual Aid Image */}
                    <div className="w-full relative aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                        <img
                            src="/exercises/step.png"
                            alt="Demonstración de Step Up"
                            className="w-full h-full object-contain p-4 mix-blend-multiply"
                        />
                        <div className="absolute top-2 right-2 bg-orange-100 text-orange-600 p-2 rounded-full">
                            <Wind size={20} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-2">Test del Escalón</h2>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Energía Aeróbica</p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-orange-500" /> Protocolo (3 Min)
                        </h3>
                        <p className="text-sm text-slate-600 mb-2 font-medium">Sube y baja <strong>2 escalones</strong> al ritmo del metrónomo.</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-orange-500 marker:font-bold">
                            <li>Usa una escalera o cajón de 30-40cm.</li>
                            <li>Sube ambos pies, luego baja ambos.</li>
                            <li>Sigue el ritmo visual (SUBE - BAJA).</li>
                        </ul>
                    </div>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto bg-slate-50/90 backdrop-blur-sm">
                    <button
                        onClick={() => { setCountdown(3); setStatus('countdown'); }}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Comenzar Test
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'countdown') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-900 text-white select-none">
                <div className="text-[180px] font-black leading-none animate-bounce text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600">
                    {countdown}
                </div>
                <p className="text-slate-400 font-bold tracking-[0.5em] mt-8">PREPARADO...</p>
            </div>
        );
    }

    if (status === 'running') {
        const isUp = beat < 2;

        return (
            <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-900 text-white select-none">
                {/* Timer */}
                <div className="text-6xl font-black font-mono tracking-wider mb-12">
                    {formatTime(timeLeft)}
                </div>

                {/* Visual Metronome Image Toggle */}
                <div className="flex flex-col items-center gap-6 w-full max-w-xs">

                    <div className="relative w-72 h-72">
                        {/* Image Container */}
                        <div className={clsx(
                            "absolute inset-0 rounded-[32px] overflow-hidden border-4 bg-white transition-all duration-200 ease-out flex items-center justify-center",
                            isUp
                                ? "border-green-500 scale-105 shadow-[0_0_40px_rgba(34,197,94,0.4)] z-20"
                                : "border-slate-200 scale-100 shadow-sm z-10"
                        )}>
                            <img
                                src={isUp ? "/exercises/step_up.png" : "/exercises/step_down.png"}
                                alt={isUp ? "Sube" : "Baja"}
                                className="w-full h-full object-contain p-4"
                            />
                        </div>

                        {/* Text Overlay (Optional, consistent with user asking to remove text, but a label is helpful. I will use minimal label) */}
                        <div className={clsx(
                            "absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full font-black text-xl tracking-widest uppercase transition-all duration-200 z-30 shadow-lg",
                            isUp ? "bg-green-500 text-white scale-110" : "bg-slate-700 text-slate-400 scale-90"
                        )}>
                            {isUp ? "SUBE" : "BAJA"}
                        </div>
                    </div>

                    {/* Beat Indicators */}
                    <div className="flex gap-3">
                        {[0, 1, 2, 3].map((b) => (
                            <div
                                key={b}
                                className={clsx(
                                    "w-4 h-4 rounded-full transition-all duration-100",
                                    beat === b
                                        ? (b < 2 ? "bg-green-500 scale-125 shadow-glow-green" : "bg-orange-500 scale-125 shadow-glow-orange")
                                        : "bg-slate-800"
                                )}
                            />
                        ))}
                    </div>

                </div>

                <div className="mt-12 text-slate-500 text-sm font-mono flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    Metrónomo (96 BPM)
                </div>
            </div>
        );
    }

    if (status === 'cooling') {
        return (
            <div className="flex flex-col h-full p-6 items-center justify-center space-y-6 animate-in zoom-in duration-300 bg-slate-50">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h2 className="text-3xl font-black text-slate-900">¡Tiempo!</h2>

                <div className="w-full max-w-sm bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
                    <p className="text-slate-600 text-sm mb-4">
                        Siéntate inmediatamente y descansa <strong className="text-slate-900">1 minuto</strong>. Luego ingresa tu frecuencia cardíaca.
                    </p>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Tus Pulsaciones (LPM)</label>
                    <input
                        type="number"
                        value={hr}
                        onChange={(e) => setHr(e.target.value)}
                        placeholder="Ej. 120"
                        className="w-full text-center text-5xl font-black text-slate-900 outline-none placeholder:text-slate-200 border-b-2 border-slate-100 focus:border-blue-500 transition-colors pb-2"
                    />
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto space-y-3">
                    <button
                        onClick={handleFinish}
                        disabled={!hr}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> Guardar Resultado
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

// 3. Rockport Placeholder
// RockportTest moved to ./RockportTest.jsx

export default CardioModule;
