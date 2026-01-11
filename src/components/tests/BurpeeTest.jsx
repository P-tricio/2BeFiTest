import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Flame, CheckCircle, Save, Play } from 'lucide-react';
import clsx from 'clsx';

const BurpeeTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const user = useStore((state) => state.user);

    // Level Logic
    const isAdapted = user.level === 'adapted';
    // 'general' level should also use the 90s duration (mapped to intermediate logic)
    const isIntermediate = user.level === 'intermediate' || user.level === 'general';
    const DURATION = isIntermediate ? 90 : 180;

    // Stages: 'intro', 'ready', 'countdown', 'testing', 'input'
    const [stage, setStage] = useState('intro');
    const [timeLeft, setTimeLeft] = useState(DURATION);
    const [countdown, setCountdown] = useState(3);
    const [reps, setReps] = useState('');

    useEffect(() => {
        setTimeLeft(DURATION);
    }, [DURATION]);

    // ... timer effects ... (keeping existing logic, just verifying timeLeft init)

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
        setTestResult('cardio', 'burpee', { reps: parseInt(reps), time: DURATION });
        navigate('/results');
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (isAdapted) {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 bg-slate-50 justify-center">
                <div className="bg-red-100 p-6 rounded-3xl mx-auto text-red-600">
                    <Zap size={48} className="mx-auto mb-4" />
                    <h2 className="text-xl font-black mb-2">Test No Recomendado</h2>
                    <p className="font-medium text-sm">
                        Para tu nivel actual (Adaptado), el Burpee Test no es seguro.
                        Te recomendamos realizar el <strong>Test de Pasos (Step Test)</strong> o consultar a tu entrenador.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/tests/cardio')}
                    className="btn-primary w-full"
                >
                    Volver
                </button>
            </div>
        );
    }

    if (stage === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">

                    {/* Visual Aid Image */}
                    <div className="w-full relative aspect-video bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                        <img
                            src="/exercises/burpee.png"
                            alt="Demonstración de Burpee"
                            className="w-full h-full object-contain p-1 mix-blend-multiply"
                        />
                        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-600 p-2 rounded-full">
                            <Flame size={20} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-2">Test de Burpees</h2>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Resistencia de Alta Intensidad</p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-yellow-500" /> Protocolo ({DURATION / 60} Min)
                        </h3>
                        <p className="text-sm text-slate-600 mb-2 font-medium">Máximos burpees en {DURATION} segundos.</p>
                        <ol className="list-decimal pl-5 space-y-2 text-slate-600 text-sm marker:text-yellow-500 marker:font-bold">
                            <li>De pie, baja a posición de flexión (pecho al suelo).</li>
                            <li>Sube y salta dando una palmada por encima de la cabeza.</li>
                            <li>Mantén un ritmo constante. ¡Es duro!</li>
                        </ol>
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
                <h2 className="text-3xl font-bold">¿Listo para sufrir?</h2>
                <div className="text-slate-400 text-center max-w-xs">
                    Respira hondo. {DURATION / 60} {DURATION / 60 === 1 ? 'minuto es' : 'minutos son'} más largo de lo que parece.
                </div>
                <button
                    onClick={() => { setCountdown(3); setStage('countdown'); }}
                    className="w-40 h-40 rounded-full bg-yellow-500 text-white text-2xl font-bold shadow-[0_0_30px_rgba(234,179,8,0.5)] animate-pulse"
                >
                    START
                </button>
            </div>
        );
    }

    if (stage === 'countdown') {
        return (
            <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6">
                <div className="text-[180px] font-black leading-none animate-bounce text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-600">
                    {countdown}
                </div>
            </div>
        );
    }

    if (stage === 'testing') {
        return (
            <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6">
                <p className="text-slate-400 uppercase tracking-widest font-bold mb-8">Tiempo Restante</p>
                <div className={clsx("text-8xl font-black font-mono", timeLeft <= 30 ? "text-red-500 animate-pulse" : "text-white")}>
                    {formatTime(timeLeft)}
                </div>
                <div className="mt-12 w-full max-w-xs bg-slate-800 rounded-full h-4 overflow-hidden">
                    <div className="h-full bg-yellow-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / DURATION) * 100}%` }}></div>
                </div>
            </div>
        );
    }

    if (stage === 'input') {
        return (
            <div className="flex flex-col h-full p-6 items-center justify-center space-y-6 animate-in zoom-in duration-300">
                <h2 className="text-2xl font-bold">¡SE ACABÓ!</h2>
                <p className="text-slate-600">¿Cuántos burpees completaste?</p>

                <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder="0"
                    className="w-full max-w-[200px] text-center text-6xl font-black p-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-yellow-500"
                    autoFocus
                />

                <button
                    onClick={handleSave}
                    disabled={!reps}
                    className="w-full bg-yellow-500 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                    <Save size={20} /> Guardar Resultado
                </button>
            </div>
        );
    }

    return null;
};

export default BurpeeTest;
