import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Play, Save, ArrowDown, CheckCircle, Trophy } from 'lucide-react';

const SquatTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const user = useStore((state) => state.user);
    const setHeaderTitle = useStore((state) => state.setHeaderTitle);

    const isAdvanced = user.level === 'advanced';
    const TEST_NAME = isAdvanced ? 'Sentadillas con Salto' : 'Test de Sentadillas';

    useEffect(() => {
        setHeaderTitle(TEST_NAME);
        return () => setHeaderTitle('');
    }, [TEST_NAME]);

    // Stages: 'intro', 'ready', 'countdown', 'testing', 'input'
    const [stage, setStage] = useState('intro');
    const [timeLeft, setTimeLeft] = useState(60);
    const [countdown, setCountdown] = useState(3);
    const [reps, setReps] = useState('');

    // Countdown Logic
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
                setTimeLeft((prev) => {
                    const newTime = prev - 1;
                    if (newTime <= 3 && newTime > 0) {
                        import('../../services/AudioFeedback').then(m => m.audioFeedback.countdown(newTime));
                    }
                    return newTime;
                });
            }, 1000);
        } else if (timeLeft === 0 && stage === 'testing') {
            import('../../services/AudioFeedback').then(m => m.audioFeedback.complete());
            setStage('input');
        }
        return () => clearInterval(interval);
    }, [stage, timeLeft]);

    const handleStartSequence = () => {
        setCountdown(3);
        setStage('countdown');
    };

    const handleSave = () => {
        if (!reps) return;
        setTestResult('strength', 'squat', { reps: parseInt(reps), time: 60 });
        navigate('/results'); // Or go back to menu
    };

    if (stage === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">

                    {/* Visual Aid Image */}
                    <div className="w-full relative aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                        <img
                            src="/exercises/squat.png"
                            alt="Demonstración de Sentadilla"
                            className="w-full h-full object-contain p-4 mix-blend-multiply"
                        />
                        <div className="absolute top-2 right-2 bg-purple-100 text-purple-600 p-2 rounded-full">
                            <ArrowDown size={20} />
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Fuerza Tren Inferior</p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-purple-600" /> Protocolo (60s)
                        </h3>
                        {isAdvanced ? (
                            <>
                                <p className="text-sm text-slate-600 mb-2 font-medium">Realizar sentadillas seguidas de un salto vertical.</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-purple-500 marker:font-bold">
                                    <li>Baja a sentadilla profunda.</li>
                                    <li>Sube explosivamente y <strong>salta</strong> despegando los pies.</li>
                                    <li>Amortigua la caída y repite.</li>
                                </ul>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-slate-600 mb-2 font-medium">Realizar el máximo número de sentadillas completas en 1 minuto.</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-purple-500 marker:font-bold">
                                    <li>Baja hasta que los muslos estén paralelos al suelo.</li>
                                    <li>Sube hasta extender completamente las piernas.</li>
                                    <li>Mantén la espalda recta.</li>
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
                <div className="text-slate-400 text-center max-w-xs mb-4">
                    {isAdvanced ? 'Impulsa con fuerza. Salta alto.' : 'Mantén el ritmo. Técnica correcta.'}
                </div>
                <button
                    onClick={handleStartSequence}
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
                <p className="mt-8 text-xl font-medium animate-bounce">¡Vamos! ¡Más rápido!</p>
            </div>
        );
    }

    if (stage === 'input') {
        return (
            <div className="flex flex-col h-full p-6 items-center justify-center space-y-6 animate-in zoom-in duration-300">
                <h2 className="text-2xl font-bold">¡Tiempo!</h2>
                <p className="text-slate-600">¿Cuántas lograste hacer?</p>

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

export default SquatTest;
