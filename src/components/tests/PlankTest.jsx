import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Play, Square, Save, Clock, CheckCircle, Timer } from 'lucide-react';

const PlankTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const setHeaderTitle = useStore((state) => state.setHeaderTitle);

    useEffect(() => {
        setHeaderTitle('Test de Plancha');
        return () => setHeaderTitle('');
    }, []);

    // Stages: 'intro', 'ready', 'countdown', 'running', 'result'
    const [stage, setStage] = useState('intro');
    const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
    const [countdown, setCountdown] = useState(3);

    const timerRef = useRef(null);

    // Countdown Logic
    useEffect(() => {
        let interval;
        if (stage === 'countdown') {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setStage('running');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [stage]);

    useEffect(() => {
        if (stage === 'running') {
            const startTime = Date.now() - (timeElapsed * 1000);
            timerRef.current = setInterval(() => {
                setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 100);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [stage]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleStop = () => {
        setStage('result');
    };

    const handleSave = () => {
        setTestResult('strength', 'plank', { time: timeElapsed });
        navigate('/results');
    };

    if (stage === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">

                    {/* Visual Aid Image */}
                    <div className="w-full relative aspect-video bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                        <img
                            src="/exercises/plank.png"
                            alt="Demonstración de Plancha"
                            className="w-full h-full object-contain p-4 mix-blend-multiply"
                        />
                        <div className="absolute top-2 right-2 bg-purple-100 text-purple-600 p-2 rounded-full">
                            <Clock size={20} />
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Fuerza Core</p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-purple-500" /> Protocolo (Resistencia)
                        </h3>
                        <p className="text-sm text-slate-600 mb-2 font-medium">Mantener la posición el mayor tiempo posible.</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-purple-500 marker:font-bold">
                            <li>Codos apoyados bajo los hombros.</li>
                            <li>Cuerpo alineado de cabeza a pies.</li>
                            <li>Detén el tiempo si pierdes la postura.</li>
                        </ul>
                    </div>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto bg-slate-50/90 backdrop-blur-sm">
                    <button
                        onClick={() => setStage('ready')}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'ready') {
        return (
            <div className="flex flex-col h-full items-center justify-center p-6 space-y-8 animate-in slide-in-from-right bg-slate-50">
                <div className="text-center space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">PREPARACIÓN</div>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight">Posición de Plancha</h2>
                    <p className="text-slate-500 font-medium max-w-[200px] mx-auto">Colócate en el suelo</p>
                </div>

                <div className="card-base p-8 w-full max-w-xs text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600 animate-pulse">
                        <Timer size={32} />
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">
                        Dale a Iniciar cuando estés en posición estable.
                    </p>
                </div>

                <button
                    onClick={() => { setCountdown(3); setStage('countdown'); }}
                    className="w-full max-w-xs bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-xl transition-all shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-3"
                >
                    <Play size={24} fill="currentColor" />
                    EMPEZAR TEST
                </button>
            </div>
        );
    }

    if (stage === 'countdown') {
        return (
            <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6">
                <div className="text-[180px] font-black leading-none animate-bounce text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-emerald-600">
                    {countdown}
                </div>
                <p className="text-slate-400 font-bold tracking-[0.5em] mt-8">PREPARADO...</p>
            </div>
        );
    }

    if (stage === 'running') {
        return (
            <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6">
                <p className="text-slate-400 uppercase tracking-widest font-bold mb-8">Tiempo Transcurrido</p>
                <div className="text-8xl font-black font-mono text-white mb-12">
                    {formatTime(timeElapsed)}
                </div>

                <button
                    onClick={handleStop}
                    className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white font-bold py-8 rounded-2xl shadow-lg text-2xl flex items-center justify-center gap-3"
                >
                    <Square size={24} fill="currentColor" />
                    DETENER
                </button>
                <p className="text-sm text-slate-500 mt-4">Pulsa cuando no puedas mantener la postura</p>
            </div>
        );
    }

    if (stage === 'result') {
        return (
            <div className="flex flex-col h-full p-6 items-center justify-center space-y-6 animate-in zoom-in duration-300 bg-slate-50">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h2 className="text-3xl font-black text-slate-900">¡Prueba Finalizada!</h2>

                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 w-full max-w-xs text-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">TIEMPO TOTAL</span>
                    <span className="text-5xl font-black text-slate-900">{formatTime(timeElapsed)}</span>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto space-y-3">
                    <button
                        onClick={handleSave}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> Guardar Resultado
                    </button>
                    <button
                        onClick={() => { setStage('intro'); setTimeElapsed(0); }}
                        className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                    >
                        Repetir Test
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default PlankTest;
