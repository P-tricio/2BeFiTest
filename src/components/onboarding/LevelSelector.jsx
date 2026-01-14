import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Activity, Battery, Zap, ChevronRight, Check } from 'lucide-react';
import clsx from 'clsx';

const LevelSelector = () => {
    const navigate = useNavigate();
    const setLevel = useStore((state) => state.setLevel);
    const [selected, setSelected] = useState(null);

    const levels = [
        {
            id: 'adapted',
            title: 'Adaptado',
            desc: 'Movilidad reducida, recuperación o senior.',
            icon: Battery,
            color: 'green'
        },
        {
            id: 'general',
            title: 'General',
            desc: 'Población activa o sedentaria. Estándar.',
            icon: Activity,
            color: 'emerald'
        },
        {
            id: 'advanced',
            title: 'Avanzado',
            desc: 'Entrenamiento regular y alto rendimiento.',
            icon: Zap,
            color: 'red' // or purple/orange
        }
    ];

    const handleContinue = () => {
        if (selected) {
            setLevel(selected);
            navigate('/');
        }
    };

    return (
        <div className="flex flex-col h-full p-6 space-y-6 animate-in fade-in bg-slate-50 overflow-y-auto">
            <div className="space-y-2 mt-4 text-center">
                <h1 className="text-3xl font-black text-slate-900">Selecciona tu Nivel</h1>
                <p className="text-slate-600 font-medium leading-relaxed">
                    Indica el nivel que mejor se adapte a tu condición física actual.
                </p>
            </div>

            <div className="space-y-4 flex-1">
                {levels.map((lvl) => {
                    const isSelected = selected === lvl.id;
                    const Icon = lvl.icon;
                    return (
                        <button
                            key={lvl.id}
                            onClick={() => setSelected(lvl.id)}
                            className={clsx(
                                "w-full p-5 rounded-[24px] border-2 text-left relative transition-all duration-300 group overflow-hidden",
                                isSelected
                                    ? `border-${lvl.color}-500 bg-white shadow-lg scale-[1.02] ring-1 ring-${lvl.color}-500`
                                    : "border-slate-100 bg-white hover:border-slate-300 shadow-sm"
                            )}
                        >
                            <div className="flex items-start gap-4 z-10 relative">
                                <div className={clsx(
                                    "p-3 rounded-2xl transition-colors",
                                    isSelected ? `bg-${lvl.color}-100 text-${lvl.color}-600` : "bg-slate-50 text-slate-400 group-hover:text-slate-600"
                                )}>
                                    <Icon size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={clsx("font-bold text-lg", isSelected ? "text-slate-900" : "text-slate-700")}>
                                        {lvl.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium leading-tight mt-1">
                                        {lvl.desc}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className={`p-1 bg-${lvl.color}-500 rounded-full text-white animate-in zoom-in`}>
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="sticky bottom-28 pt-4 pb-2 z-10 w-full bg-slate-50/90 backdrop-blur-sm rounded-t-2xl">
                <button
                    onClick={handleContinue}
                    disabled={!selected}
                    className="btn-primary w-full py-4 text-lg shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                    Confirmar Nivel <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default LevelSelector;
