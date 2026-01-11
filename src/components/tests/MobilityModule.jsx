import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Shuffle, RotateCw, Maximize2 } from 'lucide-react';
import ShoulderMobility from './ShoulderMobility';
import OverheadSquat from './OverheadSquat';

const MobilityModule = () => {
    return (
        <Routes>
            <Route index element={<MobilityMenu />} />
            <Route path="shoulder" element={<ShoulderMobility />} />
            <Route path="overhead" element={<OverheadSquat />} />
        </Routes>
    );
};

const MobilityMenu = () => {
    const navigate = useNavigate();

    return (

        <div className="flex flex-col h-full relative bg-slate-50 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

            {/* Main Content Centered */}
            <div className="flex-1 flex flex-col justify-center p-6 space-y-8 relative z-10 max-w-md mx-auto w-full">

                {/* Hero Header */}
                <div className="text-center space-y-3">
                    <div className="mx-auto w-20 h-20 bg-white text-pink-600 rounded-3xl flex items-center justify-center shadow-lg shadow-pink-100 mb-4 animate-in zoom-in duration-500">
                        <Shuffle size={40} className="fill-current" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">Tests de Movilidad</h2>
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Objetivo</span>
                        <span className="text-xs font-black text-pink-600 uppercase tracking-wider">
                            Rango Completo
                        </span>
                    </div>
                </div>

                {/* Cards List */}
                {/* Cards List */}
                <div className="grid gap-6 w-full">
                    <button
                        onClick={() => navigate('shoulder')}
                        className="group relative flex items-center p-6 bg-white border border-slate-100 hover:border-pink-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="bg-pink-50 text-pink-600 p-4 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                            <RotateCw size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">Movilidad de Hombros</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-[240px] leading-snug">Apley Scratch Test.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('overhead')}
                        className="group relative flex items-center p-6 bg-white border border-slate-100 hover:border-pink-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="bg-pink-50 text-pink-600 p-4 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                            <Maximize2 size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">Sentadilla Overhead</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-[240px] leading-snug">Estabilidad y simetría.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobilityModule;
