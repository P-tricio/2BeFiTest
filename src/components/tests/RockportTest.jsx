import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { MapPin, Wind, Save, CheckCircle, Info, Timer, Heart } from 'lucide-react';
import clsx from 'clsx';

const RockportTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const user = useStore((state) => state.user);
    const setUser = useStore((state) => state.setUser);

    // Stages: 'intro', 'input', 'result'
    const [stage, setStage] = useState('intro');

    // Inputs
    const [minutes, setMinutes] = useState('');
    const [seconds, setSeconds] = useState('');
    const [hr, setHr] = useState('');
    // We might need fresh weight/age if not in profile, but let's assume profile or ask
    const [weight, setWeight] = useState(user.weight || '');
    const [age, setAge] = useState(user.age || '');

    const calculateVO2 = () => {
        // Rockport Formula:
        // VO2 = 132.853 - (0.0769 × Weight[lb]) - (0.3877 × Age) + (6.315 × Gender) - (3.2649 × Time[min]) - (0.1565 × HR)
        // Gender: Male=1, Female=0

        // Check required fields (seconds can be 0 or empty)
        if (!weight || !age || !minutes || !hr) return null;

        const weightLb = parseFloat(weight) * 2.20462;
        const timeMin = parseFloat(minutes) + ((parseFloat(seconds) || 0) / 60);
        const genderFactor = user.gender === 'female' ? 0 : 1;

        const vo2 = 132.853
            - (0.0769 * weightLb)
            - (0.3877 * parseFloat(age))
            + (6.315 * genderFactor)
            - (3.2649 * timeMin)
            - (0.1565 * parseFloat(hr));

        return Math.max(0, vo2).toFixed(1);
    };

    const handleSave = () => {
        // Update profile if new data entered
        if ((!user.weight && weight) || (!user.age && age)) {
            setUser({ ...user, weight, age });
        }

        const vo2 = calculateVO2();

        setTestResult('cardio', 'rockport', {
            time: `${minutes}:${(seconds || '0').toString().padStart(2, '0')}`,
            hr,
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
                        <div className="absolute inset-0 flex items-center justify-center bg-green-50">
                            <MapPin size={64} className="text-green-200" />
                        </div>
                        <div className="absolute top-2 right-2 bg-green-100 text-green-600 p-2 rounded-full">
                            <Wind size={20} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-2">Test de Rockport</h2>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">Capacidad Aeróbica (VO2 Max)</p>

                    {/* Disclaimer */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 mb-6 text-left flex gap-3">
                        <Info className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="font-bold mb-1">Modo Manual</p>
                            <p className="opacity-90 leading-tight">La integración GPS está en desarrollo. Por ahora, mide el tiempo y pulso manualmente.</p>
                        </div>
                    </div>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" /> Protocolo (1 Milla / 1.6km)
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-green-500 marker:font-bold">
                            <li>Camina <strong>1.6 km</strong> lo más rápido posible.</li>
                            <li>No corras, siempre un pie en el suelo.</li>
                            <li>Al terminar, toma tu <strong>pulsación</strong> inmediatamente.</li>
                            <li>Anota tu tiempo total.</li>
                        </ul>
                    </div>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto bg-slate-50/90 backdrop-blur-sm">
                    <button
                        onClick={() => setStage('input')}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Ingresar Datos
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'input') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 animate-in slide-in-from-right bg-slate-50 overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-900">Resultados</h2>
                <p className="text-slate-500 text-sm">Introduce los datos obtenidos al finalizar la milla.</p>

                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6 text-left">

                    {/* Time Input */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 block flex items-center gap-2">
                            <Timer size={16} /> Tiempo Total
                        </label>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <input
                                    type="number"
                                    value={minutes}
                                    onChange={(e) => setMinutes(e.target.value)}
                                    placeholder="00"
                                    className="w-full text-3xl font-black p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-green-500 outline-none text-center"
                                />
                                <span className="text-xs font-bold text-slate-400 uppercase text-center block mt-1">Minutos</span>
                            </div>
                            <span className="text-3xl font-black text-slate-300 mb-8">:</span>
                            <div className="flex-1">
                                <input
                                    type="number"
                                    value={seconds}
                                    onChange={(e) => setSeconds(e.target.value)}
                                    placeholder="00"
                                    className="w-full text-3xl font-black p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-green-500 outline-none text-center"
                                />
                                <span className="text-xs font-bold text-slate-400 uppercase text-center block mt-1">Segundos</span>
                            </div>
                        </div>
                    </div>

                    {/* Heart Rate */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 block flex items-center gap-2">
                            <Heart size={16} /> Pulsaciones Finales
                        </label>
                        <input
                            type="number"
                            value={hr}
                            onChange={(e) => setHr(e.target.value)}
                            placeholder="120"
                            className="w-full text-3xl font-black p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-green-500 outline-none text-center"
                        />
                    </div>

                    {/* User Data if missing */}
                    {(!user.weight || !user.age) && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div className="col-span-2 text-xs text-slate-400 font-medium text-center mb-2">
                                Necesarios para cálculo de VO2 Max
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Peso (kg)</label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="70"
                                    className="w-full p-3 rounded-xl bg-slate-50 font-bold text-center border-2 border-transparent focus:border-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Edad</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="30"
                                    className="w-full p-3 rounded-xl bg-slate-50 font-bold text-center border-2 border-transparent focus:border-green-500 outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 pb-8 w-full mt-auto">
                    <button
                        onClick={handleSave}
                        disabled={!minutes || !hr}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> Guardar Resultado
                    </button>
                    {!minutes && (
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

export default RockportTest;
