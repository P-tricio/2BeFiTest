import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Orbit, Target, ArrowUpCircle, Anchor } from 'lucide-react';
import HandTappingTest from './HandTappingTest';
import SideHopTest from './SideHopTest';
import BlindStorkTest from './BlindStorkTest';
import useStore from '../../store/useStore';
import clsx from 'clsx';

const CoordinationModule = () => {
    const level = useStore((state) => state.user.level);

    return (
        <Routes>
            <Route index element={<SelectionScreen />} />
            <Route path="tapping" element={<HandTappingTest />} />
            <Route path="stork" element={<BlindStorkTest />} />
            <Route path="hops" element={<SideHopTest />} />
        </Routes>
    );
};

const SelectionScreen = () => {
    const navigate = useNavigate();
    const level = useStore((state) => state.user.level);



    return (
        <div className="flex flex-col h-full relative bg-slate-50 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

            {/* Main Content Centered */}
            <div className="flex-1 flex flex-col justify-center p-6 space-y-8 relative z-10 max-w-md mx-auto w-full">

                {/* Hero Header */}
                <div className="text-center space-y-3">
                    <div className="mx-auto w-20 h-20 bg-white text-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100 mb-4 animate-in zoom-in duration-500">
                        <Orbit size={40} className="fill-current" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">Control y Agilidad</h2>
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
                    {/* 1. Tapping */}
                    <button
                        onClick={() => navigate('tapping')}
                        className="group relative flex items-center p-6 bg-white border border-slate-100 hover:border-blue-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                            <Target size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">Plate Tapping</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-[240px] leading-snug">Velocidad y coordinación manual.</p>
                        </div>
                    </button>

                    {/* 2. Stork */}
                    <button
                        onClick={() => navigate('stork')}
                        className="group relative flex items-center p-6 bg-white border border-slate-100 hover:border-indigo-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                            <Anchor size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">
                                {level === 'advanced' ? "Cigüeña (Cerrados)" : "Cigüeña (Abiertos)"}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-[240px] leading-snug">
                                {level === 'advanced' ? "Equilibrio avanzado sin visión." : "Equilibrio a una pierna."}
                            </p>
                        </div>
                    </button>

                    {/* 3. Hops */}
                    <button
                        onClick={() => navigate('hops')}
                        className="group relative flex items-center p-6 bg-white border border-slate-100 hover:border-purple-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                            <ArrowUpCircle size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">
                                {level === 'adapted' ? "Pasos Laterales" : "Saltos Laterales"}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-[240px] leading-snug">
                                {level === 'adapted' ? "Desplazamiento sin impacto." : "Agilidad y potencia lateral."}
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CoordinationModule;
