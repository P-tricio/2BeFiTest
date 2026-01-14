import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Activity, Heart, Timer, CheckCircle, Save } from 'lucide-react';
import VisualMetronome from '../common/VisualMetronome';
import clsx from 'clsx';

const RuffierTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const user = useStore((state) => state.user);
    const setHeaderTitle = useStore((state) => state.setHeaderTitle);

    useEffect(() => {
        setHeaderTitle('Test de Ruffier');
        return () => setHeaderTitle('');
    }, []);

    // Stages: 'intro', 'p0_input', 'ready', 'exercise', 'p1_input', 'rest', 'p2_input', 'result'
    const [stage, setStage] = useState('intro');
    const [timeLeft, setTimeLeft] = useState(0);
    const [p0, setP0] = useState(user.restingHeartRate || '');
    const [p1, setP1] = useState('');
    const [p2, setP2] = useState('');

    // Timer Logic
    useEffect(() => {
        let interval;
        if (timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (stage === 'exercise') setStage('p1_input');
            if (stage === 'rest') setStage('p2_input');
        }
        return () => clearInterval(interval);
    }, [timeLeft, stage]);

    const calculateRuffier = () => {
        const index = ((parseInt(p0) + parseInt(p1) + parseInt(p2)) - 200) / 10;
        return index.toFixed(1);
    };

    const getRuffierLabel = (score) => {
        const val = parseFloat(score);
        if (val < 0) return { label: 'Corazón de Atleta', color: 'text-emerald-500' };
        if (val < 5) return { label: 'Excelente', color: 'text-green-500' };
        if (val < 10) return { label: 'Bueno', color: 'text-blue-500' };
        if (val < 15) return { label: 'Medio', color: 'text-orange-500' };
        return { label: 'Insuficiente', color: 'text-red-500' };
    };

    const handleSave = () => {
        const score = calculateRuffier();
        const { label } = getRuffierLabel(score);
        // Saving interpretation as well for easy display
        setTestResult('cardio', 'ruffier', { p0, p1, p2, score, label });
        navigate('/results');
    };

    // Helper Component for Pulse Timer
    const PulseTimer = () => {
        const [timer, setTimer] = useState(0);
        const [active, setActive] = useState(false);

        useEffect(() => {
            let interval;
            if (active && timer > 0) {
                interval = setInterval(() => setTimer(t => t - 1), 1000);
            } else if (timer === 0 && active) {
                setActive(false);
                // Optional: Play beep
            }
            return () => clearInterval(interval);
        }, [active, timer]);

        const startTimer = () => {
            setTimer(15);
            setActive(true);
        };

        return (
            <button
                onClick={startTimer}
                disabled={active}
                className={clsx(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all w-full",
                    active ? "bg-rose-50 border-rose-200" : "bg-white border-slate-100 hover:border-slate-300"
                )}
            >
                {active ? (
                    <div className="text-4xl font-black font-mono text-rose-500 animate-pulse">
                        {timer}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <Timer size={20} />
                        <span>Usar Cronómetro (15s)</span>
                    </div>
                )}
                <span className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wide">
                    {active ? "Contando..." : "Multiplica x4 al finalizar"}
                </span>
            </button>
        );
    };

    // 1. INTRO
    if (stage === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">
                    <div className="bg-rose-100 p-4 rounded-full text-rose-600 mb-4">
                        <Heart className="w-10 h-10" />
                    </div>

                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Resistencia Cardíaca Avanzada</p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-rose-500" /> Protocolo
                        </h3>
                        <ol className="list-decimal pl-5 space-y-2 text-slate-600 text-sm marker:text-rose-500 marker:font-bold">
                            <li>Toma tu pulso en reposo (P0).</li>
                            <li>Realiza <strong>30 sentadillas en 45 segundos</strong>.</li>
                            <li>Toma tu pulso inmediatamente (P1).</li>
                            <li>Descansa 1 minuto exacto.</li>
                            <li>Toma tu pulso final (P2).</li>
                        </ol>
                    </div>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto bg-slate-50/90 backdrop-blur-sm">
                    <button
                        onClick={() => setStage('p0_input')}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Comenzar
                    </button>
                </div>
            </div>
        );
    }

    // 2. INPUT P0
    if (stage === 'p0_input') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-8 animate-in slide-in-from-right bg-slate-50 pt-20">
                <Heart className="w-16 h-16 text-slate-300 mx-auto" />
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Pulso en Reposo (P0)</h2>
                    <p className="text-slate-500">Si ya lo conoces, ingrésalo ahora.</p>
                </div>
                <input
                    type="number"
                    value={p0}
                    onChange={(e) => setP0(e.target.value)}
                    className="text-5xl font-black text-center bg-transparent border-b-2 border-slate-200 focus:border-rose-500 outline-none p-4"
                    placeholder="0"
                />
                <button
                    onClick={() => setStage('ready')}
                    disabled={!p0}
                    className="btn-primary w-full py-4 mt-auto"
                >
                    Confirmar P0
                </button>
            </div>
        );
    }

    // 3. READY
    if (stage === 'ready') {
        return (
            <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6 space-y-8">
                <h2 className="text-3xl font-bold text-center">¡Prepárate!</h2>
                <div className="text-slate-400 text-sm text-center max-w-xs">
                    Sigue el ritmo del metrónomo visual.
                    <br /> <strong className="text-white">30 Sentadillas en 45s</strong>.
                </div>
                <button
                    onClick={() => { setTimeLeft(45); setStage('exercise'); }}
                    className="w-40 h-40 rounded-full bg-rose-500 text-white text-2xl font-bold shadow-[0_0_30px_rgba(244,63,94,0.5)] animate-pulse"
                >
                    GO!
                </button>
            </div>
        );
    }

    if (stage === 'exercise') {
        return (
            <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center gap-16 p-6 pb-32">
                <div className="text-center space-y-2">
                    <p className="text-slate-400 uppercase tracking-widest font-bold text-sm">Tiempo Restante</p>
                    <div className="text-8xl font-black font-mono">{timeLeft}</div>
                </div>

                <VisualMetronome
                    bpm={40} // 30 reps / 45 sec = 0.66 reps/sec = 40 reps/min
                    isPlaying={true}
                    color="orange"
                    labelUp="SUBE"
                    labelDown="BAJA"
                />
            </div>
        );
    }

    // 5. INPUT P1
    if (stage === 'p1_input') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 animate-in zoom-in bg-slate-50 pt-10">
                <Activity className="w-16 h-16 text-rose-500 mx-auto animate-pulse" />
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">¡Pulso Inmediato! (P1)</h2>
                    <p className="text-slate-500">Tómate el pulso AHORA MISMO.</p>
                </div>

                <PulseTimer />

                <input
                    type="number"
                    value={p1}
                    onChange={(e) => setP1(e.target.value)}
                    className="text-5xl font-black text-center bg-transparent border-b-2 border-slate-200 focus:border-rose-500 outline-none p-4"
                    placeholder="0"
                    autoFocus
                />
                <button
                    onClick={() => { setTimeLeft(60); setStage('rest'); }}
                    disabled={!p1}
                    className="btn-primary w-full py-4 mt-auto"
                >
                    Iniciar Descanso (1 min)
                </button>
            </div>
        );
    }

    // 6. REST
    if (stage === 'rest') {
        return (
            <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6 text-center">
                <Timer className="w-16 h-16 text-blue-400 mb-8 animate-spin-slow" />
                <p className="text-slate-400 uppercase tracking-widest font-bold mb-4">Descansa Sentado</p>
                <div className="text-9xl font-black font-mono text-blue-400">
                    {timeLeft}
                </div>
            </div>
        );
    }

    // 7. INPUT P2
    if (stage === 'p2_input') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 animate-in zoom-in bg-slate-50 pt-10">
                <Heart className="w-16 h-16 text-blue-500 mx-auto" />
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Pulso Final (P2)</h2>
                    <p className="text-slate-500">Tómate el pulso tras el descanso.</p>
                </div>

                <PulseTimer />

                <input
                    type="number"
                    value={p2}
                    onChange={(e) => setP2(e.target.value)}
                    className="text-5xl font-black text-center bg-transparent border-b-2 border-slate-200 focus:border-blue-500 outline-none p-4"
                    placeholder="0"
                    autoFocus
                />
                <button
                    onClick={handleSave}
                    disabled={!p2}
                    className="btn-primary w-full py-4 mt-auto flex items-center justify-center gap-2"
                >
                    <Save size={20} /> Guardar Resultado
                </button>
            </div>
        );
    }

    return null;
};

export default RuffierTest;
