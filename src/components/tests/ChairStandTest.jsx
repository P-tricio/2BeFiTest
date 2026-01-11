import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Play, Save, CheckCircle, Timer, ArrowDown } from 'lucide-react';
import VisualMetronome from '../common/VisualMetronome';

const ChairStandTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);

    const [stage, setStage] = useState('intro'); // intro, ready, countdown, testing, input
    const [timeLeft, setTimeLeft] = useState(30);
    const [countdown, setCountdown] = useState(3);
    const [reps, setReps] = useState('');

    // Countdown
    useEffect(() => {
        let interval;
        if (stage === 'countdown') {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setStage('testing');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [stage]);

    // Timer
    useEffect(() => {
        let interval;
        if (stage === 'testing' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && stage === 'testing') {
            setStage('input');
        }
        return () => clearInterval(interval);
    }, [stage, timeLeft]);

    const handleSave = () => {
        if (!reps) return;
        setTestResult('strength', 'squat', { reps: parseInt(reps), time: 30, type: 'chair_stand' });
        navigate('/results');
    };

    if (stage === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">
                    <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4">
                        <ArrowDown className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Sentadilla en Silla</h2>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Fuerza Adaptada</p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" /> Protocolo (30s)
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-green-500 marker:font-bold">
                            <li>Usa una silla estable apoyada en la pared.</li>
                            <li>Cruza los brazos sobre el pecho.</li>
                            <li>Siéntate y levántate completamente.</li>
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
            <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6 space-y-8">
                <h2 className="text-3xl font-bold">¿Listo?</h2>
                <div className="text-slate-400 text-center max-w-xs">
                    Sentado en la silla, brazos cruzados.
                </div>
                <button
                    onClick={() => { setCountdown(3); setStage('countdown'); }}
                    className="w-40 h-40 rounded-full bg-green-500 text-white text-2xl font-bold shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-pulse"
                >
                    EMPEZAR
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
            </div>
        );
    }

    if (stage === 'testing') {
        return (
            <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-between p-6 py-12">
                <div className="text-center space-y-2">
                    <p className="text-slate-400 uppercase tracking-widest font-bold text-sm">Tiempo Restante</p>
                    <div className="text-8xl font-black font-mono">{timeLeft}</div>
                </div>

                {/* Optional: Visual Metronome for Pacing if needed, or just encouragement */}
                <div className="w-full max-w-xs bg-slate-800/50 p-6 rounded-[32px] backdrop-blur-sm border border-white/10 text-center">
                    <p className="text-xl font-bold text-green-400 animate-pulse">
                        ¡Levántate y Siéntate!
                    </p>
                </div>
            </div>
        );
    }

    if (stage === 'input') {
        return (
            <div className="flex flex-col h-full p-6 items-center justify-center space-y-6 animate-in zoom-in duration-300">
                <h2 className="text-2xl font-bold">¡Tiempo!</h2>
                <p className="text-slate-600">¿Cuántas repeticiones completas hiciste?</p>

                <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder="0"
                    className="w-full max-w-[200px] text-center text-6xl font-black p-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-green-500"
                    autoFocus
                />

                <button
                    onClick={handleSave}
                    disabled={!reps}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                    <Save size={20} /> Guardar Resultado
                </button>
            </div>
        );
    }

    return null;
};

export default ChairStandTest;
