import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Play, CheckCircle, ArrowUpCircle, Timer } from 'lucide-react';
import clsx from 'clsx';

const SideHopTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const user = useStore((state) => state.user);

    const isAdapted = user.level === 'adapted';
    const TEST_NAME = isAdapted ? 'Pasos Laterales' : 'Saltos Laterales';
    const ACTION_VERB = isAdapted ? 'desplaza' : 'salta';

    // Stages: 'intro', 'ready', 'countdown', 'testing', 'completed'
    const [stage, setStage] = useState('intro');
    const [timeLeft, setTimeLeft] = useState(30);
    const [countdown, setCountdown] = useState(3);
    const [jumps, setJumps] = useState(''); // Input value

    // Countdown Timer
    useEffect(() => {
        let interval;
        if (stage === 'countdown') {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setStage('testing');
                        return 0; // or 3 for reset, doesn't matter as stage changes
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [stage]);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (stage === 'testing' && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        } else if (stage === 'testing' && timeLeft === 0) {
            setStage('completed');
        }
        return () => clearInterval(interval);
    }, [stage, timeLeft]);

    const handleStartSequence = () => {
        setCountdown(3);
        setStage('countdown');
    };

    const handleStart = () => {
        setStage('testing');
        setTimeLeft(30);
    };

    const handleSave = () => {
        if (!jumps) return;

        // Scoring Logic (Simplified for MVP)
        // Men <30: >50 Excellent
        // Women <30: >40 Excellent
        // Generalizing: >40 Excellent, 30-40 Good, <30 Average
        const scoreVal = parseInt(jumps);
        let rating = 'Promedio';
        if (scoreVal > 50) rating = 'Atleta Élite';
        else if (scoreVal > 40) rating = 'Excelente';
        else if (scoreVal > 30) rating = 'Bueno';

        setTestResult('agility', 'hops', {
            count: scoreVal,
            rating
        });
        navigate('/results');
    };

    if (stage === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">

                    {/* Visual Aid Image */}
                    <div className="w-full relative aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                        <img
                            src="/exercises/side_hop.png"
                            alt="Demonstración de Saltos Laterales"
                            className="w-full h-full object-contain p-4 mix-blend-multiply"
                        />
                        <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-600 p-2 rounded-full">
                            <ArrowUpCircle size={20} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-2">{TEST_NAME}</h2>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Test de Coordinación</p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-indigo-500" /> Protocolo (30s)
                        </h3>
                        <ol className="list-decimal pl-5 space-y-3 text-slate-600 text-sm marker:text-indigo-500 marker:font-bold">
                            <li>Marca una línea en el suelo (cinta o referencia visual).</li>
                            <li>Ponte de pie con los pies juntos a un lado de la línea.</li>
                            <li>{isAdapted ? 'Desplázate' : 'Salta'} de lado a lado sobre la línea lo más rápido posible.</li>
                            <li>Cada toque de suelo cuenta como 1 repetición.</li>
                        </ol>
                        {!isAdapted && (
                            <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-xl font-medium border border-blue-100">
                                💡 Si no puedes saltar, realiza un paso lateral rápido (uno y otro pie) sobre la línea.
                            </div>
                        )}
                    </div>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto bg-slate-50/90 backdrop-blur-sm">
                    <button onClick={() => setStage('ready')} className="btn-primary w-full py-4 text-lg">
                        Entendido, Continuar
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
                    <h2 className="text-5xl font-black text-slate-900">30 Segundos</h2>
                    <p className="text-slate-500 font-medium">Máxima velocidad</p>
                </div>

                <div className="card-base p-8 w-full max-w-xs text-center space-y-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600 animate-pulse">
                        <Timer size={32} />
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">
                        ¿Tienes la línea marcada y espacio libre a los lados?
                    </p>
                </div>

                <button
                    onClick={handleStartSequence}
                    className="btn-primary w-full max-w-xs py-5 shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3"
                >
                    <Play size={24} fill="currentColor" />
                    EMPEZAR TEST
                </button>
            </div>
        );
    }

    if (stage === 'countdown') {
        return (
            <div className="flex flex-col h-full items-center justify-center bg-slate-900 text-white">
                <div className="text-[180px] font-black leading-none animate-bounce text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-600">
                    {countdown}
                </div>
                <p className="text-slate-400 font-bold tracking-[0.5em] mt-8">LISTO...</p>
            </div>
        );
    }

    if (stage === 'testing') {
        return (
            <div className="flex flex-col h-full bg-slate-900 select-none overflow-hidden items-center justify-center relative">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[100px] animate-pulse"></div>
                </div>

                <div className="text-center relative z-10">
                    <p className="text-slate-400 font-bold tracking-widest uppercase mb-4">Tiempo Restante</p>
                    <div className={clsx("text-[120px] font-black leading-none font-mono", timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white")}>
                        {timeLeft}
                    </div>
                    <p className="text-white/60 mt-8 font-medium animate-bounce max-w-[200px] mx-auto text-sm bg-white/10 py-2 px-4 rounded-full backdrop-blur-sm">
                        ¡SALTA! ¡SALTA! ¡SALTA!
                    </p>
                </div>
            </div>
        );
    }

    if (stage === 'completed') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 animate-in zoom-in bg-slate-50">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h2 className="text-3xl font-black text-slate-900">¡Tiempo Terminado!</h2>
                <p className="text-slate-500 text-center max-w-xs">
                    Introduce el número total de saltos que has realizado.
                </p>

                <div className="w-full max-w-xs space-y-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Total Saltos</label>
                        <input
                            type="number"
                            value={jumps}
                            onChange={(e) => setJumps(e.target.value)}
                            placeholder="0"
                            className="w-full text-center text-5xl font-black text-slate-900 outline-none placeholder:text-slate-200"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto space-y-3">
                    <button
                        onClick={handleSave}
                        disabled={!jumps}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Guardar Resultado
                    </button>

                    <button
                        onClick={() => setStage('ready')}
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

export default SideHopTest;
