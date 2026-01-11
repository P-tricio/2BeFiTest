import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Zap, Ruler, Save, CheckCircle } from 'lucide-react';

const BroadJumpTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const user = useStore((state) => state.user);
    const setUser = useStore((state) => state.setUser);

    const [stage, setStage] = useState('intro'); // intro, height_input, jump_input, result
    const [height, setHeight] = useState(user.height || ''); // cm
    const [distance, setDistance] = useState(''); // cm

    const calculateRatio = () => {
        if (!height || !distance) return 0;
        return (parseFloat(distance) / parseFloat(height)).toFixed(2);
    };

    const handleSave = () => {
        const ratio = calculateRatio();
        // Update user profile if height wasn't there
        if (!user.height && height) {
            setUser({ height });
        }
        setTestResult('power', 'broadJump', { distance, ratio });
        navigate('/results');
    };

    if (stage === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">
                    <div className="bg-yellow-100 p-4 rounded-full text-yellow-600 mb-4">
                        <Zap className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Salto Horizontal</h2>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Potencia de Piernas</p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-yellow-500" /> Protocolo
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-yellow-500 marker:font-bold">
                            <li>Coloca una cinta métrica en el suelo.</li>
                            <li>Pies juntos detrás de la línea de cero.</li>
                            <li>Salta hacia adelante lo más lejos posible.</li>
                            <li>Mide la distancia hasta el talón más atrasado.</li>
                        </ul>
                    </div>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto bg-slate-50/90 backdrop-blur-sm">
                    <button
                        onClick={() => setStage(user.height ? 'jump_input' : 'height_input')}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'height_input') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-8 animate-in slide-in-from-right bg-slate-50 pt-20">
                <div className="w-full max-w-xs mx-auto">
                    <h2 className="text-2xl font-bold mb-2">¿Cuánto mides?</h2>
                    <p className="text-slate-500 mb-8">Necesitamos tu altura para calcular tu potencia relativa.</p>

                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="cm"
                        className="w-full text-center text-5xl font-black p-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-yellow-500"
                        autoFocus
                    />
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Centímetros</p>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto">
                    <button
                        onClick={() => { if (height) setUser({ height }); setStage('jump_input'); }}
                        disabled={!height}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'jump_input') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-8 animate-in slide-in-from-right bg-slate-50 pt-20">
                <div className="w-full max-w-xs mx-auto">
                    <Ruler className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-2">Distancia Saltada</h2>
                    <p className="text-slate-500 mb-8">Ingresa tu mejor marca en centímetros.</p>

                    <input
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        placeholder="0"
                        className="w-full text-center text-5xl font-black p-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-yellow-500"
                        autoFocus
                    />
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Centímetros</p>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto">
                    <button
                        onClick={handleSave}
                        disabled={!distance}
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

export default BroadJumpTest;
