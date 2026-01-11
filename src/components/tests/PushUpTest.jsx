import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { ArrowUp, CheckCircle, Save, Timer } from 'lucide-react';

const PushUpTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const user = useStore((state) => state.user);

    const isAdapted = user.level === 'adapted';
    const TEST_NAME = isAdapted ? 'Flexiones en Pared' : 'Test de Flexiones';

    // Stages: 'intro', 'ready', 'countdown', 'testing', 'input'
    const [stage, setStage] = useState('intro');
    const [timeLeft, setTimeLeft] = useState(60);
    const [countdown, setCountdown] = useState(3);
    const [reps, setReps] = useState('');

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
        setTestResult('strength', 'pushup', { reps: parseInt(reps), time: 60 });
        navigate('/results');
    };

    if (stage === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">

                    {/* Visual Aid Image */}
                    <div className="w-full relative aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                        <img
                            src={isAdapted ? "/exercises/wall_pushup.png" : "/exercises/pushup.png"}
                            alt={isAdapted ? "Flexiones en Pared" : "Flexiones Estándar"}
                            className="w-full h-full object-contain p-4 mix-blend-multiply"
                        />
                        <div className="absolute top-2 right-2 bg-purple-100 text-purple-600 p-2 rounded-full">
                            <ArrowUp size={20} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-2">{TEST_NAME}</h2>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Fuerza Tren Superior</p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-purple-500" /> Protocolo (60s)
                        </h3>
                        {isAdapted ? (
                            <>
                                <p className="text-sm text-slate-600 mb-2 font-medium">Realizar flexiones apoyado en la pared.</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-purple-500 marker:font-bold">
                                    <li>Pies a <strong>un paso grande de distancia</strong> de la pared.</li>
                                    <li>Manos a la altura de los hombros en la pared.</li>
                                    <li>Flexiona hasta acercar el pecho a la pared y empuja.</li>
                                </ul>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-slate-600 mb-2 font-medium">Realizar el máximo número de flexiones en 1 minuto.</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-purple-500 marker:font-bold">
                                    <li>Pecho hasta casi tocar suelo (o botella de agua).</li>
                                    <li>Extensión completa de brazos arriba.</li>
                                    <li>Rodillas apoyadas si eres principiante.</li>
                                </ul>
                            </>
                        )}
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
                <h2 className="text-3xl font-bold">¿Preparado?</h2>
                <div className="text-slate-400 text-center max-w-xs">
                    {isAdapted
                        ? "Pies alejados. Espalda recta. Prepárate en la pared."
                        : "Manos a la anchura de hombros. Cuerpo en bloque."}
                </div>
                <button
                    onClick={() => { setCountdown(3); setStage('countdown'); }}
                    className="w-40 h-40 rounded-full bg-green-500 text-white text-2xl font-bold shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-pulse"
                >
                    START
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

    if (stage === 'testing') {
        return (
            <div className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6">
                <p className="text-slate-400 uppercase tracking-widest font-bold mb-8">Tiempo Restante</p>
                <div className={`text-9xl font-black font-mono ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timeLeft}
                </div>
                <p className="mt-8 text-xl font-medium animate-bounce text-purple-400">¡Fuerza!</p>
            </div>
        );
    }

    if (stage === 'input') {
        return (
            <div className="flex flex-col h-full p-6 items-center justify-center space-y-6 animate-in zoom-in duration-300">
                <h2 className="text-2xl font-bold">¡Tiempo!</h2>
                <p className="text-slate-600">¿Cuántas flexiones completas?</p>

                <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder="0"
                    className="w-full max-w-[200px] text-center text-6xl font-black p-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-purple-500"
                    autoFocus
                />

                <button
                    onClick={handleSave}
                    disabled={!reps}
                    className="w-full bg-purple-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                    <Save size={20} /> Guardar Resultado
                </button>
                <button
                    onClick={() => { setStage('intro'); setTimeLeft(60); setReps(''); }}
                    className="text-slate-500 font-semibold"
                >
                    Repetir Test
                </button>
            </div>
        );
    }

    return null;
};

export default PushUpTest;
