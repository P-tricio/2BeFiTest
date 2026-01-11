import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Activity, CheckCircle, AlertCircle, Play, Zap, Info, Trophy, Dumbbell, ArrowDown, Lightbulb, History } from 'lucide-react';
import clsx from 'clsx';

const Home = () => {
    const navigate = useNavigate();
    const parq = useStore((state) => state.parq);
    const user = useStore((state) => state.user);
    const results = useStore((state) => state.results);

    const firstName = user?.name ? user.name.split(' ')[0] : 'Atleta';

    // --- Improved Scoring Logic (Copied EXACTLY from ResultsDashboard to avoid discrepancies) ---
    const totalScore = useMemo(() => {
        // Normalization Helper
        const normalize = (val, max) => Math.min(100, Math.max(0, (val / max) * 100));

        // 1. Strength
        let strengthRaw = 0, strengthMax = 0;
        if (results.strength?.squat) { strengthRaw += Math.min(results.strength.squat.reps, 50); strengthMax += 50; }
        if (results.strength?.pushup) { strengthRaw += Math.min(results.strength.pushup.reps, 40); strengthMax += 40; }
        if (results.strength?.plank) { strengthRaw += Math.min(results.strength.plank.time, 120); strengthMax += 120; }
        const strengthScore = strengthMax > 0 ? normalize(strengthRaw, strengthMax) : 0;

        // 2. Cardio
        let cardioScore = 0;
        if (results.cardio?.vo2) cardioScore = normalize(results.cardio.vo2, 60);
        else if (results.cardio?.ruffier) cardioScore = normalize(Math.max(0, 20 - results.cardio.ruffier.score), 20);
        else if (results.cardio?.burpee) cardioScore = normalize(results.cardio.burpee.reps, 40);

        // 3. Control
        let coordRaw = 0, coordMax = 0;
        if (results.agility?.tapping) {
            coordRaw += Math.max(0, 100 - (results.agility.tapping.asymmetry * 2)); coordMax += 100;
        }
        if (results.agility?.hops) { coordRaw += results.agility.hops.count; coordMax += 50; }
        if (results.agility?.blindStork) { coordRaw += results.agility.blindStork.time; coordMax += 60; }
        const coordScore = coordMax > 0 ? normalize(coordRaw, coordMax) : 0;

        // 4. Mobility
        let mobRaw = 0, mobMax = 0;
        if (results.mobility?.shoulder) { mobRaw += results.mobility.shoulder.score; mobMax += 6; }
        if (results.mobility?.overheadSquat) { mobRaw += results.mobility.overheadSquat.score; mobMax += 3; }
        const mobScore = mobMax > 0 ? normalize(mobRaw, mobMax) : 0;

        // 5. Composition
        let compScore = 0;
        if (results.composition?.bmi) {
            let pts = 50;
            const bmi = parseFloat(results.composition.bmi);
            if (bmi > 25) pts -= (bmi - 25) * 2;
            if (bmi < 18.5) pts -= (18.5 - bmi) * 2;
            // Bonus for ICA if present
            if (results.composition.ica) {
                const ica = parseFloat(results.composition.ica);
                if (ica <= 0.5) pts += 20;
            }
            compScore = Math.min(100, Math.max(0, pts));
        }

        // Calculate Average of existing categories
        let totalSum = 0;
        let categories = 0;
        if (strengthMax > 0) { totalSum += strengthScore; categories++; }
        if (cardioScore > 0) { totalSum += cardioScore; categories++; }
        if (coordMax > 0) { totalSum += coordScore; categories++; }
        if (mobMax > 0) { totalSum += mobScore; categories++; }
        if (results.composition?.bmi) { totalSum += compScore; categories++; }

        return categories > 0 ? Math.round(totalSum / categories) : 0;
    }, [results]);


    const levelInfo = useMemo(() => {
        if (totalScore >= 80) return { name: 'Atleta Élite', color: 'text-purple-600', bg: 'bg-purple-100', desc: '¡Rendimiento excepcional!' };
        if (totalScore >= 50) return { name: 'En Forma', color: 'text-green-600', bg: 'bg-green-100', desc: 'Buen nivel físico general.' };
        if (totalScore >= 20) return { name: 'Iniciado', color: 'text-blue-600', bg: 'bg-blue-100', desc: 'Empezando el camino.' };
        return { name: 'Principiante', color: 'text-slate-600', bg: 'bg-slate-100', desc: 'Primeros pasos.' };
    }, [totalScore]);

    // ... (keep existing mappings) ...
    const userLevelMap = {
        'adapted': { title: 'Adaptado', color: 'bg-green-100 text-green-700 border-green-200' },
        'general': { title: 'General', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        'advanced': { title: 'Avanzado', color: 'bg-red-100 text-red-700 border-red-200' }
    };
    const currentLevel = userLevelMap[user.level] || userLevelMap['general'];

    const [showInfo, setShowInfo] = React.useState(false);

    return (
        <div className="flex flex-col h-full relative bg-slate-50 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-15%] right-[-35%] w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute top-[20%] left-[-20%] w-[300px] h-[300px] bg-purple-200/20 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex flex-col h-full overflow-y-auto pb-28 min-h-0 relative z-10 w-full max-w-md mx-auto">
                {/* Header Section */}
                <div className="px-6 pt-12 pb-6 shrink-0 z-10">
                    <div className="flex justify-between items-start mb-2 animate-in slide-in-from-top-4 duration-700">
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] relative top-1">Bienvenido,</p>
                    </div>
                    <h1 className="text-[2.75rem] font-black text-slate-900 leading-none tracking-tight animate-in slide-in-from-left-4 duration-700 delay-100">
                        {firstName}
                        <span className="text-blue-600">.</span>
                    </h1>
                </div>

                <div className="px-6 space-y-6 flex-1 flex flex-col pb-6">
                    {/* Status Card Logic */}
                    {!parq.completed ? (
                        <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-[2rem] p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden group cursor-pointer transition-transform active:scale-95 shrink-0" onClick={() => navigate('/onboarding')}>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase mb-5 border border-white/30">
                                    <AlertCircle size={10} strokeWidth={3} /> Requerido
                                </div>
                                <h2 className="text-3xl font-black mb-3 leading-none">Seguridad<br />Primero.</h2>
                                <p className="text-orange-100 text-sm mb-6 leading-relaxed font-medium max-w-[200px]">
                                    Verifiquemos que estás apto para actividad física intensa.
                                </p>
                                <button className="bg-white text-orange-600 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-orange-50 transition-colors flex items-center gap-2 shadow-lg shadow-orange-900/10">
                                    Iniciar PAR-Q <Play size={14} fill="currentColor" />
                                </button>
                            </div>
                            <Activity className="absolute -bottom-6 -right-6 w-48 h-48 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700 ease-out" />
                        </div>
                    ) : (!parq.passed && !parq.disclaimerAccepted) ? (
                        <div className="bg-red-500 rounded-[2rem] p-8 text-white shadow-xl shadow-red-500/20 shrink-0 relative overflow-hidden">
                            <AlertCircle className="w-12 h-12 mb-4 text-red-200" />
                            <h2 className="text-2xl font-black mb-2">Atención Médica</h2>
                            <p className="text-red-100 font-medium">
                                Por seguridad, te recomendamos consultar a un médico antes de continuar con las pruebas físicas.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Subtle Medical Warning (If failed but disclaimer accepted) */}
                            {!parq.passed && parq.disclaimerAccepted && (
                                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3 items-start animate-in slide-in-from-top fade-in shrink-0">
                                    <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                                    <div className="text-sm">
                                        <p className="font-bold text-orange-800">Atención requerida</p>
                                        <p className="text-orange-700 leading-snug mt-1">
                                            Recuerda que estas pruebas se realizan bajo tu responsabilidad. Deténte si sientes malestar.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Status / Level Card */}
                            {parq.passed && (
                                <div className="bg-white rounded-[2.5rem] p-1 shadow-xl shadow-slate-200/40 border border-slate-100 shrink-0 relative animate-in zoom-in-95 duration-500">

                                    {/* Inner Container */}
                                    <div className="bg-slate-50/50 rounded-[2.25rem] p-7 h-full relative overflow-hidden">

                                        {showInfo && (
                                            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 p-8" onClick={() => setShowInfo(false)}>
                                                <Info size={40} className="text-blue-500 mb-4" />
                                                <h4 className="font-black text-slate-900 text-xl mb-2">Estado de Forma</h4>
                                                <p className="text-slate-500 font-medium leading-relaxed">
                                                    Puntuación global (0-100) basada en tus resultados de Fuerza, Cardio, Control y Movilidad.
                                                </p>
                                                <p className="text-[10px] text-blue-500 font-black mt-6 uppercase tracking-widest">Toca para cerrar</p>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={clsx("w-2 h-2 rounded-full animate-pulse", parq.passed ? "bg-emerald-500" : "bg-slate-300")}></div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Actual</span>
                                                </div>
                                                <span className={clsx("text-xs font-black px-2.5 py-1 rounded-lg border bg-white shadow-sm inline-block", currentLevel.color)}>
                                                    {currentLevel.title}
                                                </span>
                                            </div>

                                            <div onClick={() => setShowInfo(true)} className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 hover:text-blue-500 cursor-pointer active:scale-90 transition-all">
                                                <Info size={18} strokeWidth={2.5} />
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Puntuación General</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-5xl font-black text-slate-900 tracking-tighter">{totalScore}</span>
                                                    <span className="text-lg font-bold text-slate-300">/100</span>
                                                </div>
                                                <p className={clsx("font-bold text-sm mt-1", levelInfo.color)}>{levelInfo.name}</p>
                                            </div>

                                            <div className={clsx("w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm rotate-3 transform", levelInfo.bg)}>
                                                <Trophy size={36} className={levelInfo.color} strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recommendation Card */}
                            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden shrink-0 group">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                            <Lightbulb size={20} className="text-blue-100" fill="currentColor" />
                                        </div>
                                        <h3 className="font-black text-lg tracking-wide">Recomendación</h3>
                                    </div>
                                    <p className="text-blue-50 text-[15px] font-medium leading-relaxed opacity-90">
                                        {(() => {
                                            // Priority 1: No data
                                            const hasData = results.cardio || results.strength?.squat || results.strength?.plank || results.agility?.tapping;
                                            if (!hasData) {
                                                return "¡Bienvenido! Empieza por el Test de Sentadillas para evaluar tu fuerza base.";
                                            }

                                            // Priority 2: Asymmetries (Injury Risk)
                                            if (results.agility?.tapping?.asymmetry > 10) {
                                                return "Detectamos asimetría en control motor. Prioriza ejercicios unilaterales.";
                                            }

                                            // Priority 3: Weak Links (Low Scores)
                                            // Only evaluate if data exists. If data is missing, we consider it "unknown" (10), not weak (1).
                                            const scores = [
                                                {
                                                    name: 'Fuerza',
                                                    val: (results.strength?.squat?.reps !== undefined)
                                                        ? (results.strength.squat.reps < 15 ? 1 : 10)
                                                        : 10
                                                },
                                                {
                                                    name: 'Energía',
                                                    val: (results.cardio?.vo2 !== undefined)
                                                        ? (results.cardio.vo2 < 30 ? 1 : 10)
                                                        : (results.cardio ? 10 : 10) // If cardio exists but no vo2 (e.g. ruffier), ignore or handle specific
                                                },
                                                {
                                                    name: 'Core',
                                                    val: (results.strength?.plank?.time !== undefined)
                                                        ? (results.strength.plank.time < 45 ? 1 : 10)
                                                        : 10
                                                }
                                            ];

                                            const weakLink = scores.find(s => s.val === 1);
                                            if (weakLink) {
                                                if (weakLink.name === 'Fuerza') return "Tu fuerza de piernas puede mejorar. Incorpora sentadillas 2 veces por semana.";
                                                if (weakLink.name === 'Energía') return "Tu capacidad aeróbica es un área de oportunidad. Prueba caminatas rápidas.";
                                                if (weakLink.name === 'Core') return "Fortalece tu core para evitar dolores de espalda. Aumenta tu tiempo de plancha.";
                                            }

                                            // Default: Balanced / Maintenance
                                            return "¡Buen equilibrio general! Mantén tu rutina variada e intenta superar tu marca personal.";
                                        })()}
                                    </p>
                                </div>

                                {/* Decorative Circles */}
                                <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-400/30 transition-colors duration-500"></div>
                                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
                            </div>

                            {/* History Navigation Button */}
                            <button
                                onClick={() => navigate('/history')}
                                className="w-full bg-white p-6 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center justify-between group active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        <History size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-900 text-lg">Historial</h3>
                                        <p className="text-slate-500 text-sm font-medium group-hover:text-blue-600 transition-colors">Ver evolución completa</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-blue-200 group-hover:text-blue-600 transition-all">
                                    <ArrowDown className="-rotate-90" size={20} />
                                </div>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Home;
