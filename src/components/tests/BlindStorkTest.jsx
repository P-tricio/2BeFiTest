import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Shuffle, EyeOff, Save, CheckCircle, Anchor } from 'lucide-react';
import clsx from 'clsx';

const BlindStorkTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const user = useStore((state) => state.user);
    const setHeaderTitle = useStore((state) => state.setHeaderTitle);

    // Level Check
    const isAdvanced = user.level === 'advanced';
    const eyesOpen = !isAdvanced;

    useEffect(() => {
        setHeaderTitle('Test de la Cigüeña');
        return () => setHeaderTitle('');
    }, []);

    // Stages: 'intro', 'ready', 'testing', 'input', 'rest', 'completed'
    const [stage, setStage] = useState('intro');
    const [currentLeg, setCurrentLeg] = useState('right'); // 'right' or 'left' (Leg supporting weight)

    // Timer & Results
    const [startTime, setStartTime] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [results, setResults] = useState({ right: 0, left: 0 });
    const [manualTime, setManualTime] = useState(''); // Used for input correction

    useEffect(() => {
        let interval;
        if (stage === 'testing') {
            interval = setInterval(() => {
                setElapsed((Date.now() - startTime) / 1000);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [stage, startTime]);

    const startTest = () => {
        setStartTime(Date.now());
        setStage('testing');
    };

    const stopTest = () => {
        setStage('input');
        setManualTime(elapsed.toFixed(1));
    };

    const confirmResult = () => {
        const time = parseFloat(manualTime);
        const newResults = { ...results, [currentLeg]: time };
        setResults(newResults);

        if (currentLeg === 'right') {
            setStage('rest');
        } else {
            setStage('completed');
        }
    };

    const startLeftLeg = () => {
        setCurrentLeg('left');
        setElapsed(0);
        setManualTime('');
        setStage('ready');
    };

    const handleSave = () => {
        const bestTime = Math.max(results.right, results.left);
        const asymmetry = Math.abs(results.right - results.left).toFixed(1);

        setTestResult('agility', 'blindStork', {
            time: bestTime,
            right: results.right,
            left: results.left,
            asymmetry: parseFloat(asymmetry)
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
                            src="/exercises/blind_stork.png"
                            alt="Demonstración de la Cigüeña"
                            className="w-full h-full object-contain p-6 mix-blend-multiply"
                        />
                        <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-600 p-2 rounded-full">
                            <Anchor size={20} />
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">
                        Equilibrio {eyesOpen ? '(Ojos Abiertos)' : '(Ojos Cerrados)'}
                    </p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-indigo-500" /> Protocolo Unilateral
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-indigo-500 marker:font-bold">
                            <li>Realizarás el test <strong>dos veces</strong> (una con cada pierna).</li>
                            <li><strong>Pierna de Apoyo:</strong> La que soSTIENE tu peso.</li>
                            <li>El otro pie se coloca contra la rodilla interna.</li>
                            <li>Manos en las caderas.</li>
                            {eyesOpen ? (
                                <li><strong>Mantén la vista en un punto fijo.</strong></li>
                            ) : (
                                <li><strong>Cierra los ojos</strong> y aguanta.</li>
                            )}
                        </ul>
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
        const isRight = currentLeg === 'right';
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-8 animate-in slide-in-from-right bg-slate-50 pt-10">
                <div className="text-center space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">PREPARACIÓN</div>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight">
                        Pierna {isRight ? 'Derecha' : 'Izquierda'}
                    </h2>
                    <p className="text-slate-500 font-medium">Pierna de apoyo</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm text-left space-y-4">
                    <p className="text-slate-600 font-medium">
                        1. Apóyate sobre tu pierna <strong>{isRight ? 'DERECHA' : 'IZQUIERDA'}</strong>.<br />
                        2. Coloca el pie {isRight ? 'izquierdo' : 'derecho'} en la rodilla interna.<br />
                        3. Pulsa "Comenzar" y adopta la postura.<br />
                        {eyesOpen ? '4. Si pierdes el equilibrio, toca la pantalla.' : '4. Cierra los ojos. Si fallas, toca la pantalla.'}
                    </p>
                </div>

                <button
                    onClick={startTest}
                    className="w-full h-32 rounded-3xl bg-indigo-600 text-white text-2xl font-bold shadow-xl flex items-center justify-center animate-pulse mt-auto hover:scale-[1.02] transition-transform"
                >
                    COMENZAR
                </button>
            </div>
        );
    }

    if (stage === 'testing') {
        return (
            <div
                onPointerDown={stopTest}
                className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6 cursor-pointer touch-manipulation select-none"
            >
                {eyesOpen ? <Shuffle className="w-20 h-20 text-indigo-400 mb-8 animate-pulse" /> : <EyeOff className="w-20 h-20 text-indigo-400 mb-8 animate-pulse" />}
                <div className="text-7xl font-black font-mono">
                    {elapsed.toFixed(1)}s
                </div>
                <div className="mt-8 text-center space-y-2">
                    <p className="text-indigo-200 font-bold uppercase tracking-widest">
                        Pierna {currentLeg === 'right' ? 'Derecha' : 'Izquierda'}
                    </p>
                    <p className="text-white/60 text-sm">
                        Toca la pantalla al perder el equilibrio
                    </p>
                </div>
            </div>
        );
    }

    if (stage === 'input') {
        return (
            <div className="flex flex-col h-full p-6 items-center justify-center space-y-6 animate-in zoom-in duration-300 bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-900">Resultado {currentLeg === 'right' ? 'Derecha' : 'Izquierda'}</h2>
                <p className="text-slate-600">Tiempo registrado:</p>

                <input
                    type="number"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full max-w-[200px] text-center text-6xl font-black p-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-indigo-500 bg-white"
                />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Segundos</span>

                <button
                    onClick={confirmResult}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 mt-8"
                >
                    <CheckCircle size={20} /> Confirmar
                </button>
            </div>
        );
    }

    if (stage === 'rest') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6 animate-in zoom-in bg-slate-50">
                <div className="card-base p-8 w-full max-w-xs text-center space-y-4">
                    <p className="text-slate-500 font-medium">Resultado Pierna Derecha:</p>
                    <div className="text-5xl font-black text-slate-900">{results.right}s</div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Cambio de Pierna</h2>
                    <p className="text-slate-600">Prepárate para usar la pierna IZQUIERDA.</p>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto">
                    <button
                        onClick={startLeftLeg}
                        className="btn-primary w-full py-5 text-lg"
                    >
                        Continuar con Izquierda
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'completed') {
        const bestTime = Math.max(results.right, results.left);
        const asymmetry = Math.abs(results.right - results.left).toFixed(1);

        return (
            <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 animate-in zoom-in bg-slate-50">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                    <Anchor className="w-10 h-10 text-indigo-600" />
                </div>

                <h2 className="text-3xl font-black text-slate-900">Test Completado</h2>

                <div className="w-full max-w-sm space-y-4">
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">MEJOR TIEMPO</p>
                        <div className="text-6xl font-black text-slate-900">{bestTime}s</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Derecha</span>
                            <span className="text-2xl font-bold text-slate-800">{results.right}s</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Izquierda</span>
                            <span className="text-2xl font-bold text-slate-800">{results.left}s</span>
                        </div>
                    </div>

                    {parseFloat(asymmetry) > 5 && (
                        <div className="bg-orange-50 text-orange-700 p-4 rounded-2xl text-sm font-medium border border-orange-100 text-center">
                            ⚠️ Diferencia de {asymmetry}s entre piernas.
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto">
                    <button
                        onClick={handleSave}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Guardar Resultados
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default BlindStorkTest;
