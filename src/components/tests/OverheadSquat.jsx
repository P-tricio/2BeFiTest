import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { CheckSquare, Square, Maximize2 } from 'lucide-react';
import clsx from 'clsx';

const OverheadSquat = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const setHeaderTitle = useStore((state) => state.setHeaderTitle);

    useEffect(() => {
        setHeaderTitle('Sentadilla Overhead');
        return () => setHeaderTitle('');
    }, []);

    // Checklist State
    const [checks, setChecks] = useState({
        heelsDown: false,
        hipsBelowKnees: false,
        stickAligned: false,
    });

    const toggleCheck = (key) => {
        setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        // Calculate detailed score (0-3)
        const score = Object.values(checks).filter(Boolean).length;
        setTestResult('mobility', 'overheadSquat', { score, checks });
        navigate('/results');
    };

    return (
        <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto bg-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Visual Guide - Large Format (Restored) */}
            <div className="bg-white rounded-[32px] p-6 flex flex-col items-center shadow-sm border border-slate-100">
                <div className="w-full relative aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                    <img
                        src="/exercises/overhead_squat.png"
                        alt="Demonstración de Sentadilla Overhead"
                        className="w-full h-full object-contain p-4 mix-blend-multiply"
                    />
                    <div className="absolute top-2 right-2 bg-pink-100 text-pink-600 p-2 rounded-full">
                        <Maximize2 size={20} />
                    </div>
                </div>
                <p className="text-sm font-medium text-center text-slate-500">
                    Sentadilla profunda con palo sobre la cabeza.<br />
                    Brazos estirados.
                </p>
            </div>

            <div className="bg-pink-50 p-5 rounded-2xl text-sm font-medium text-pink-800 border border-pink-100 mb-2">
                <div className="flex gap-2">
                    <span>ℹ️</span>
                    <p>Marca las casillas <strong>SÓLO</strong> si lograste cumplir el criterio correctamente.</p>
                </div>
            </div>

            <div className="space-y-3">
                <CheckItem
                    label="Talones pegados al suelo"
                    checked={checks.heelsDown}
                    onClick={() => toggleCheck('heelsDown')}
                />
                <CheckItem
                    label="Cadera baja más que rodillas"
                    checked={checks.hipsBelowKnees}
                    onClick={() => toggleCheck('hipsBelowKnees')}
                />
                <CheckItem
                    label="Palo alineado (no se va adelante)"
                    checked={checks.stickAligned}
                    onClick={() => toggleCheck('stickAligned')}
                />
            </div>

            {/* Static Button - Forces scroll to bottom to see/click */}
            <div className="pt-6 pb-8 w-full mt-auto">
                <button
                    onClick={handleSave}
                    className="btn-primary w-full py-4 text-lg shadow-xl shadow-pink-500/20"
                >
                    Guardar Resultado ({Object.values(checks).filter(Boolean).length}/3)
                </button>
            </div>
        </div>
    );
};

const CheckItem = ({ label, checked, onClick }) => (
    <button
        onClick={onClick}
        className={clsx(
            "w-full flex items-center p-5 rounded-2xl border-2 transition-all relative overflow-hidden group text-left",
            checked
                ? "bg-white border-pink-500 shadow-md ring-1 ring-pink-500"
                : "bg-white border-slate-100 hover:border-pink-300 shadow-sm"
        )}
    >
        <div className={clsx(
            "mr-4 w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition-colors",
            checked ? "bg-pink-100 text-pink-600" : "bg-slate-50 text-slate-300 group-hover:bg-pink-50 group-hover:text-pink-400"
        )}>
            {checked ? <CheckSquare size={20} /> : <Square size={20} />}
        </div>
        <span className={clsx("font-bold text-lg leading-tight", checked ? 'text-slate-900' : 'text-slate-500')}>
            {label}
        </span>
    </button>
);

export default OverheadSquat;
