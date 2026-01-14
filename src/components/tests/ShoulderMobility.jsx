import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Check, AlertCircle, XCircle, RotateCw } from 'lucide-react';
import clsx from 'clsx';

const ShoulderMobility = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const setHeaderTitle = useStore((state) => state.setHeaderTitle);
    const [scores, setScores] = useState({ right: null, left: null });

    useEffect(() => {
        setHeaderTitle('Movilidad de Hombros');
        return () => setHeaderTitle('');
    }, []);

    const handleSelect = (side, value) => {
        setScores(prev => ({ ...prev, [side]: value }));
    };

    const handleSave = () => {
        if (!scores.right || !scores.left) return;

        const totalScore = scores.right + scores.left;
        const asymmetry = Math.abs(scores.right - scores.left);
        const isSignificantAsymmetry = asymmetry >= 2;

        setTestResult('mobility', 'shoulder', {
            right: scores.right,
            left: scores.left,
            score: totalScore,
            asymmetry: isSignificantAsymmetry
        });
        navigate('/results');
    };

    const ScoreSelector = ({ side, value, onChange }) => (
        <div className="space-y-3">
            <h3 className="font-bold text-slate-900 border-l-4 border-pink-500 pl-3">
                {side === 'right' ? 'Brazo DERECHO Arriba' : 'Brazo IZQUIERDO Arriba'}
            </h3>
            <div className="grid grid-cols-1 gap-2">
                {[
                    { val: 3, label: 'Se tocan (Puños)', sub: 'Excelente (3)', icon: Check, color: 'green' },
                    { val: 2, label: 'Se tocan dedos', sub: 'Aceptable (2)', icon: AlertCircle, color: 'yellow' },
                    { val: 1, label: 'No se tocan', sub: 'Mejorable (1)', icon: XCircle, color: 'red' }
                ].map((option) => (
                    <button
                        key={option.val}
                        onClick={() => onChange(side, option.val)}
                        className={clsx(
                            "w-full p-4 rounded-xl border-2 flex items-center transition-all relative overflow-hidden",
                            value === option.val
                                ? `border-${option.color}-500 bg-${option.color}-50`
                                : "border-slate-100 bg-white hover:border-slate-300"
                        )}
                    >
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-colors",
                            value === option.val ? `bg-${option.color}-200 text-${option.color}-700` : "bg-slate-100 text-slate-400"
                        )}>
                            <option.icon size={20} />
                        </div>
                        <div className="text-left">
                            <span className={clsx("font-bold block text-sm", value === option.val ? "text-slate-900" : "text-slate-600")}>
                                {option.label}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                                {option.sub}
                            </span>
                        </div>
                        {value === option.val && (
                            <div className={`absolute right-4 w-3 h-3 rounded-full bg-${option.color}-500`}></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full p-6 space-y-8 overflow-y-auto bg-slate-50 animate-in fade-in">
            <header className="text-center">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center mb-8">
                    {/* Visual Aid Image */}
                    <div className="w-full relative aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                        <img
                            src="/exercises/shoulder_mobility.png"
                            alt="Demonstración de Movilidad de Hombros"
                            className="w-full h-full object-contain p-4 mix-blend-multiply"
                        />
                        <div className="absolute top-2 right-2 bg-pink-100 text-pink-600 p-2 rounded-full">
                            <RotateCw size={20} />
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                        Evalúa ambos lados. Un lado puede ser más flexible que el otro.
                    </p>
                </div>
            </header>

            <ScoreSelector side="right" value={scores.right} onChange={handleSelect} />
            <ScoreSelector side="left" value={scores.left} onChange={handleSelect} />

            <div className="pt-6 pb-8 w-full mt-auto">
                <button
                    onClick={handleSave}
                    disabled={!scores.right || !scores.left}
                    className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Guardar Resultado
                </button>
            </div>
        </div>
    );
};

export default ShoulderMobility;
