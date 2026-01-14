import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Trophy, Wind, Save, CheckCircle, Info, PersonStanding, MapPin, Footprints } from 'lucide-react';

const CooperTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const setHeaderTitle = useStore((state) => state.setHeaderTitle);

    useEffect(() => {
        setHeaderTitle('Test de Cooper');
        return () => setHeaderTitle('');
    }, []);

    // Stages: 'intro', 'input'
    const [stage, setStage] = useState('intro');

    // Input: Distance in meters
    const [distance, setDistance] = useState('');

    const calculateVO2 = () => {
        // Cooper Formula: VO2_max = (Distance(m) - 504.9) / 44.73
        if (!distance) return null;

        const distM = parseFloat(distance);
        const vo2 = (distM - 504.9) / 44.73;

        return Math.max(0, vo2).toFixed(1);
    };

    const handleSave = () => {
        const vo2 = calculateVO2();

        setTestResult('cardio', 'cooper', {
            distance: parseInt(distance),
            vo2: vo2 || 'N/A',
            manual: true
        });
        navigate('/results');
    };

    if (stage === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">

                    {/* Visual Aid */}
                    <div className="w-full relative aspect-video bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                            <Footprints size={64} className="text-blue-200" />
                        </div>
                        <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 p-2 rounded-full">
                            <Wind size={20} />
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Resistencia Aeróbica Avanzada</p>

                    {/* Disclaimer */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 mb-6 text-left flex gap-3">
                        <Info className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="font-bold mb-1">Modo Manual</p>
                            <p className="opacity-90 leading-tight">La integración GPS está en desarrollo. Mide tu distancia con un reloj o pista.</p>
                        </div>
                    </div>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-blue-500" /> Protocolo (12 Min)
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-blue-500 marker:font-bold">
                            <li>Corre la <strong>mayor distancia posible</strong> en 12 minutos.</li>
                            <li>Mantén un ritmo constante y exigente.</li>
                            <li>Al terminar, anota la distancia en metros.</li>
                        </ul>
                    </div>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto bg-slate-50/90 backdrop-blur-sm">
                    <button
                        onClick={() => setStage('input')}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Ingresar Resultados
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'input') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 animate-in slide-in-from-right bg-slate-50 overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-900">Resultados</h2>
                <p className="text-slate-500 text-sm">Introduce la distancia total recorrida.</p>

                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6 text-left">

                    {/* Distance Input */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 block flex items-center gap-2">
                            <MapPin size={16} /> Distancia (Metros)
                        </label>
                        <input
                            type="number"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            placeholder="Ej. 2400"
                            className="w-full text-4xl font-black p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none text-center"
                            autoFocus
                        />
                        <p className="text-center text-xs text-slate-400 font-bold mt-2 uppercase">Metros recorridos</p>
                    </div>

                </div>

                <div className="pt-4 pb-8 w-full mt-auto">
                    <button
                        onClick={handleSave}
                        disabled={!distance}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> Guardar Resultado
                    </button>
                    {!distance && (
                        <button
                            onClick={() => setStage('intro')}
                            className="w-full py-4 text-slate-400 font-bold hover:text-slate-600"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default CooperTest;
