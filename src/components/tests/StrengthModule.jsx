import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowDown, ArrowUp, Clock } from 'lucide-react';
import clsx from 'clsx';
import SquatTest from './SquatTest';
import PlankTest from './PlankTest';
import PushUpTest from './PushUpTest';

import useStore from '../../store/useStore';
import ChairStandTest from './ChairStandTest';

const StrengthModule = () => {
    const level = useStore((state) => state.user.level);

    return (
        <Routes>
            <Route index element={<StrengthMenu />} />
            <Route
                path="squat"
                element={
                    level === 'adapted' ? <ChairStandTest /> : <SquatTest />
                }
            />
            <Route path="pushup" element={<PushUpTest />} />
            <Route path="plank" element={<PlankTest />} />
        </Routes>
    );
};

const StrengthMenu = () => {
    const navigate = useNavigate();
    const level = useStore((state) => state.user.level);

    // ... helper functions ...
    const getSquatTitle = () => {
        if (level === 'adapted') return "Sentadilla en Silla";
        if (level === 'advanced') return "Sentadilla (o Avanzado)";
        return "Sentadillas (60s)";
    };

    const getSquatDesc = () => {
        if (level === 'adapted') return "Levantarse y sentarse en silla (30s).";
        return "Máximas repeticiones posibles en 60 segundos.";
    };

    const getPushupTitle = () => {
        if (level === 'adapted') return "Flexiones en Pared";
        return "Flexiones (Push-Ups)";
    };

    const getPushupDesc = () => {
        if (level === 'adapted') return "Fuerza de tren superior con apoyo en pared.";
        return "Fuerza de tren superior y core (60s).";
    };

    return (
        <div className="flex flex-col h-full relative bg-slate-50 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

            {/* Main Content Centered */}
            <div className="flex-1 flex flex-col justify-center p-6 space-y-8 relative z-10 max-w-md mx-auto w-full">

                {/* Hero Header */}
                <div className="text-center space-y-3">
                    <div className="mx-auto w-20 h-20 bg-white text-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-100 mb-4 animate-in zoom-in duration-500">
                        <Dumbbell size={40} className="fill-current" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">Tests de Fuerza</h2>
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nivel</span>
                        <span className={clsx(
                            "text-xs font-black uppercase tracking-wider",
                            level === 'adapted' ? "text-green-600" :
                                level === 'advanced' ? "text-red-600" : "text-blue-600"
                        )}>
                            {level || 'General'}
                        </span>
                    </div>
                </div>

                {/* Cards List */}
                {/* Cards List */}
                <div className="grid gap-6 w-full">
                    <button
                        onClick={() => navigate('pushup')}
                        className="group relative flex items-center p-6 bg-white border border-slate-100 hover:border-purple-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                            <ArrowUp size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">{getPushupTitle()}</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-[240px] leading-snug">{getPushupDesc()}</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('squat')}
                        className="group relative flex items-center p-6 bg-white border border-slate-100 hover:border-rose-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                            <ArrowDown size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">{getSquatTitle()}</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-[240px] leading-snug">{getSquatDesc()}</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('plank')}
                        className="group relative flex items-center p-6 bg-white border border-slate-100 hover:border-indigo-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">Plancha (Plank)</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-[240px] leading-snug">Mantén la posición isométrica.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StrengthModule;
