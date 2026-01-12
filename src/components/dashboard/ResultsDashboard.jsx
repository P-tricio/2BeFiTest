import React, { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import html2canvas from 'html2canvas';
import {
    Trophy, Share2, Activity, Info,
    Zap, Dumbbell, Shuffle, Orbit, PersonStanding, Settings, Trash2,
    MessageCircle, Globe, ChevronDown, ExternalLink, History,
    ArrowDown, ArrowUp, Clock, Flame, Heart, Wind, Target, ArrowUpCircle, Anchor, RotateCw, Maximize2, Camera, X
} from 'lucide-react';
import RadarChart from '../common/RadarChart';
import clsx from 'clsx';

const ResultsDashboard = () => {
    const navigate = useNavigate();
    const results = useStore((state) => state.results);
    const user = useStore((state) => state.user);
    const hasAuth = !!user.uid;
    const shareRef = useRef(null);

    // --- Unified Scoring Logic (Synced with Home.jsx) ---
    // --- Unified Scoring Logic (Synced with Home.jsx) ---
    const metrics = useMemo(() => {
        const normalize = (val, max) => Math.min(100, Math.max(0, (val / max) * 100));

        // Define Caps based on Level
        const getCaps = (lvl) => {
            switch (lvl) {
                case 'advanced': return { squat: 75, pushup: 60, plank: 180, burpee: 60, vo2: 65, stork: 60, hops: 60, tapping: 40 };
                case 'adapted': return { squat: 30, pushup: 15, plank: 60, burpee: 20, vo2: 35, stork: 30, hops: 30, tapping: 20 };
                default: return { squat: 50, pushup: 40, plank: 120, burpee: 40, vo2: 50, stork: 60, hops: 50, tapping: 30 }; // General
            }
        };
        const caps = getCaps(user.level || 'general');

        // 1. Strength
        let strengthRaw = 0, strengthMax = 0;
        if (results.strength?.squat) { strengthRaw += Math.min(results.strength.squat.reps, caps.squat); strengthMax += caps.squat; }
        if (results.strength?.pushup) { strengthRaw += Math.min(results.strength.pushup.reps, caps.pushup); strengthMax += caps.pushup; }
        if (results.strength?.plank) { strengthRaw += Math.min(results.strength.plank.time, caps.plank); strengthMax += caps.plank; }
        const strength = strengthMax > 0 ? normalize(strengthRaw, strengthMax) : 0;

        // 2. Cardio
        let cardio = 0;
        if (results.cardio?.vo2) cardio = normalize(results.cardio.vo2, caps.vo2);
        else if (results.cardio?.cooper) cardio = normalize(results.cardio.cooper.vo2, caps.vo2);
        else if (results.cardio?.rockport) cardio = normalize(results.cardio.rockport.vo2, caps.vo2);
        else if (results.cardio?.step) cardio = normalize(results.cardio.step.vo2, caps.vo2);
        else if (results.cardio?.ruffier) cardio = normalize(Math.max(0, 20 - results.cardio.ruffier.score), 20); // Fixed scale
        else if (results.cardio?.burpee) cardio = normalize(results.cardio.burpee.reps, caps.burpee);

        // 3. Control
        let coordRaw = 0, coordMax = 0;
        if (results.agility?.tapping) {
            const tapAvg = (results.agility.tapping.right + results.agility.tapping.left) / 2;
            let tapScore = normalize(tapAvg, caps.tapping);
            // Asymmetry Penalty: -2 pts for every 1% over 10%
            if (results.agility.tapping.asymmetry > 10) {
                tapScore -= (results.agility.tapping.asymmetry - 10) * 2;
            }
            coordRaw += Math.max(0, tapScore); coordMax += 100;
        }
        if (results.agility?.hops) { coordRaw += results.agility.hops.count; coordMax += caps.hops; }
        if (results.agility?.blindStork) { coordRaw += results.agility.blindStork.time; coordMax += caps.stork; }
        const control = coordMax > 0 ? normalize(coordRaw, coordMax) : 0;

        // 4. Mobility
        let mobRaw = 0, mobMax = 0;
        if (results.mobility?.shoulder) { mobRaw += results.mobility.shoulder.score; mobMax += 6; }
        if (results.mobility?.overheadSquat) { mobRaw += results.mobility.overheadSquat.score; mobMax += 3; }
        const mobility = mobMax > 0 ? normalize(mobRaw, mobMax) : 0;

        // 5. Composition
        let composition = 0;
        if (results.composition?.bmi) {
            let pts = 50;
            const bmi = parseFloat(results.composition.bmi);

            // BMI Penalties (Standard)
            if (bmi > 25) pts -= (bmi - 25) * 2;
            if (bmi < 18.5) pts -= (18.5 - bmi) * 2;

            // ATHLETE ADJUSTMENT: If FFMI is high, mitigate BMI penalty
            const ffmi = parseFloat(results.composition.ffmi || 0);
            if (ffmi > 22 && bmi > 25) {
                pts += (bmi - 25) * 2; // Refund penalty
                pts += 10; // Bonus for muscle mass
            }

            // Health Bonus for Waist-to-Height Ratio (ICA)
            // ICA <= 0.5 is excellent health indicator
            if (results.composition.whtr) {
                const ica = parseFloat(results.composition.whtr);
                if (ica <= 0.5) pts += 20;
                else if (ica <= 0.55) pts += 10;
            }

            composition = Math.min(100, Math.max(0, pts));
        }

        // Total Average
        let totalSum = 0, count = 0;
        if (strengthMax > 0) { totalSum += strength; count++; }
        if (cardio > 0) { totalSum += cardio; count++; }
        if (coordMax > 0) { totalSum += control; count++; }
        if (mobMax > 0) { totalSum += mobility; count++; }
        if (results.composition?.bmi) { totalSum += composition; count++; }

        const total = count > 0 ? Math.round(totalSum / count) : 0;

        return { strength, cardio, control, mobility, composition, total };
    }, [results, user.level]);

    const totalScore = metrics.total;

    const level = useMemo(() => {
        if (totalScore >= 80) return { name: 'Atleta Élite', color: 'from-purple-500 to-indigo-600', text: 'text-purple-600', icon: Trophy };
        if (totalScore >= 50) return { name: 'En Forma', color: 'from-green-400 to-emerald-600', text: 'text-green-600', icon: Zap };
        if (totalScore >= 20) return { name: 'Iniciado', color: 'from-blue-400 to-blue-600', text: 'text-blue-600', icon: Zap };
        return { name: 'Principiante', color: 'from-slate-400 to-slate-600', text: 'text-slate-600', icon: Dumbbell };
    }, [totalScore]);

    const radarData = [
        { label: 'Energía', value: Math.round(metrics.cardio), color: 'bg-orange-500', icon: Zap },
        { label: 'Fuerza', value: Math.round(metrics.strength), color: 'bg-purple-500', icon: Dumbbell },
        { label: 'Control', value: Math.round(metrics.control), color: 'bg-blue-500', icon: Orbit },
        { label: 'Movilidad', value: Math.round(metrics.mobility), color: 'bg-pink-500', icon: Shuffle },
        { label: 'Cuerpo', value: Math.round(metrics.composition), color: 'bg-teal-500', icon: PersonStanding },
    ];

    const Icon = level.icon;

    const handleShare = async () => {
        if (!shareRef.current) return;

        try {
            const canvas = await html2canvas(shareRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    // Fix bg-clip-text issue by fallback to solid color during capture
                    const title = clonedDoc.getElementById('share-level-title');
                    if (title) {
                        title.style.background = 'none';
                        title.style.webkitTextFillColor = 'initial';
                        title.className = `text-4xl font-black mb-4 ${level.text}`;
                    }
                }
            });

            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], '2befitest-score.png', { type: 'image/png' });
                const text = `¡Soy Nivel ${level.name} en 2BeFiTest! 🚀\nScore: ${totalScore}/100\n\n¿Te atreves?`;

                const shareData = {
                    title: '2BeFiTest - Mi Nivel',
                    text: text,
                    files: [file]
                };

                if (navigator.canShare && navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                } else {
                    const link = document.createElement('a');
                    link.download = '2befitest-score.png';
                    link.href = canvas.toDataURL();
                    link.click();
                    // alert('Result downloaded!');
                }
            }, 'image/png');
        } catch (err) {
            console.error("Error generating share image:", err);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto pb-40 bg-slate-50">
            {/* Hero Card */}
            <div ref={shareRef} className="relative bg-white pt-16 pb-8 px-6 rounded-b-[48px] shadow-sm mb-4 z-10">
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${level.color}`}></div>

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className={clsx("w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center shadow-2xl shadow-slate-200 mb-4 border-4 border-white ring-1 ring-slate-100", level.color)}>
                        <Icon className="text-white w-10 h-10" />
                    </div>

                    <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Nivel Actual</h2>
                    <h1 id="share-level-title" className={clsx("text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r", level.color)}>
                        {level.name}
                    </h1>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xs bg-slate-100 h-3 rounded-full overflow-hidden relative mb-2">
                        <div
                            className={clsx("h-full bg-gradient-to-r transition-all duration-1000 ease-out", level.color)}
                            style={{ width: `${totalScore}%` }}
                        ></div>
                    </div>
                    <p className="font-mono font-bold text-slate-400 text-sm mb-4">{totalScore} <span className="text-slate-300 font-normal">/ 100 PTS</span></p>

                    {/* Radar Chart Integration */}
                    <div className="flex justify-center -mb-8 scale-90 origin-top">
                        <RadarChart data={radarData} size={280} />
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="px-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-lg">Métricas Clave</h3>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Activity size={16} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <MetricCard
                        title="Fuerza"
                        items={[
                            results.strength?.squat && { label: "Sentadilla", value: results.strength.squat.reps, icon: ArrowDown },
                            results.strength?.pushup && { label: "Flexiones", value: results.strength.pushup.reps, icon: ArrowUp },
                            results.strength?.plank && { label: "Plancha", value: results.strength.plank.time + "s", icon: Clock }
                        ].filter(Boolean)}
                        icon={Dumbbell}
                        color="bg-purple-50 text-purple-600"
                    />
                    <MetricCard
                        title="Energía"
                        items={[
                            results.cardio?.burpee && { label: "Burpees", value: results.cardio.burpee.reps, icon: Flame },
                            results.cardio?.ruffier && { label: "Ruffier", value: results.cardio.ruffier.score, icon: Heart },
                            results.cardio?.step && { label: "VO2 Max", value: results.cardio.step.vo2, icon: Wind },
                            results.cardio?.cooper && { label: "Cooper", value: results.cardio.cooper.vo2, icon: Footprints },
                            results.cardio?.rockport && { label: "Rockport", value: results.cardio.rockport.vo2 || "OK", icon: Wind }
                        ].filter(Boolean)}
                        icon={Zap}
                        color="bg-orange-50 text-orange-600"
                    />
                    <MetricCard
                        title="Control"
                        items={[
                            results.agility?.tapping && { label: "Tapping", value: Math.round((results.agility.tapping.right + results.agility.tapping.left) / 2) + " reps", icon: Target },
                            results.agility?.hops && { label: "Saltos", value: results.agility.hops.count, icon: ArrowUpCircle },
                            results.agility?.blindStork && { label: "Cigüeña", value: results.agility.blindStork.time + "s", icon: Anchor }
                        ].filter(Boolean)}
                        icon={Orbit}
                        color="bg-blue-50 text-blue-600"
                    />
                    <MetricCard
                        title="Movilidad"
                        items={[
                            results.mobility?.shoulder && { label: "Hombro", value: results.mobility.shoulder.score + " pts", icon: RotateCw },
                            results.mobility?.overheadSquat && { label: "Overhead", value: results.mobility.overheadSquat.score + " pts", icon: Maximize2 }
                        ].filter(Boolean)}
                        icon={Shuffle}
                        color="bg-pink-50 text-pink-600"
                    />

                    {/* Custom Body Composition Card */}
                    <BodyCompositionCard results={results} />
                </div>

                {/* Profile Management Actions */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => navigate('/level')}
                        className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        <Settings size={20} /> Editar Nivel
                    </button>
                    {hasAuth ? (
                        <button
                            onClick={() => navigate('/history')}
                            className="flex-1 bg-purple-50 border border-purple-100 text-purple-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <History size={20} /> Historial
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-500/30"
                        >
                            <Trophy size={20} /> Guardar Progreso
                        </button>
                    )}
                </div>

                {/* Contact & Premium Section */}
                <ContactSection />


                {hasAuth && (
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => { useStore.getState().resetApp(); navigate('/onboarding'); }}
                            className="flex-1 bg-red-50 border border-red-100 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <Trash2 size={20} /> Reset App
                        </button>
                    </div>
                )}



                <button
                    onClick={handleShare}
                    className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <Share2 size={20} /> Compartir Informe
                </button>
            </div>
        </div>
    );
};

// Specialized Body Composition Card with Detailed Toggleable Info
const BodyCompositionCard = ({ results }) => {
    const [showDetails, setShowDetails] = React.useState(false);
    const [showPhotos, setShowPhotos] = React.useState(false);
    const hasData = results.composition?.bmi;
    const photos = results.composition?.photos || {};
    const hasPhotos = photos.front || photos.side || photos.back;

    return (
        <div className="col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden transition-all">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-teal-50 text-teal-600">
                        <PersonStanding size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-base">Cuerpo</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                            {hasData ? 'Actualizado' : 'Pendiente'}
                        </p>
                    </div>
                </div>
                {hasData && (
                    <div className="flex gap-2">
                        {hasPhotos && (
                            <button
                                onClick={() => setShowPhotos(true)}
                                className="p-2 rounded-full bg-teal-50 text-teal-600 transition-colors hover:bg-teal-100"
                            >
                                <Camera size={20} />
                            </button>
                        )}
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className={`p-2 rounded-full transition-colors ${showDetails ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:text-slate-500'}`}
                        >
                            <Info size={20} />
                        </button>
                    </div>
                )}
            </div>

            {hasData ? (
                <div className="space-y-6">
                    {/* Primary Metrics: Weight & Fat */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Peso</span>
                            <span className="text-3xl font-black text-slate-900">{results.composition.weight} <span className="text-sm font-bold text-slate-400">kg</span></span>
                        </div>
                        <div className="bg-teal-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-teal-100">
                            <span className="text-xs text-teal-600/80 font-bold uppercase tracking-wider mb-1">Grasa</span>
                            <span className="text-3xl font-black text-teal-700">{results.composition.bodyFat}<span className="text-sm font-bold text-teal-600/60">%</span></span>
                        </div>
                    </div>

                    {/* Secondary Metrics: Indices */}
                    <div className="grid grid-cols-3 gap-2 divide-x divide-slate-100">
                        <div className="px-2 text-center">
                            <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">ICA</span>
                            <span className="block text-lg font-bold text-slate-700">{results.composition.whtr || '-'}</span>
                        </div>
                        <div className="px-2 text-center">
                            <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">ICC</span>
                            <span className="block text-lg font-bold text-slate-700">{results.composition.icc || '-'}</span>
                        </div>
                        <div className="px-2 text-center">
                            <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">FFMI</span>
                            <span className="block text-lg font-bold text-slate-700">{results.composition.ffmi || '-'}</span>
                        </div>
                    </div>

                    {/* Detailed Info Toggle */}
                    {showDetails && (
                        <div className="animate-in slide-in-from-top-2 fade-in duration-300 bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-100 mt-2">
                            <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200 pb-2">Guía de Métricas</h5>
                            <dl className="space-y-3 text-xs leading-relaxed text-slate-600">
                                <div>
                                    <dt className="font-black text-teal-700">Porcentaje de Grasa</dt>
                                    <dd>Estimación basada en medidas (Método US Navy). Rango saludable: 10-20% (H) | 18-28% (M).</dd>
                                </div>
                                <div>
                                    <dt className="font-black text-teal-700">ICA (Cintura/Altura)</dt>
                                    <dd>Indica riesgo cardiometabólico. Mantener <strong>&lt; 0.5</strong> es ideal para la salud a largo plazo.</dd>
                                </div>
                                <div>
                                    <dt className="font-black text-teal-700">ICC (Cintura/Cadera)</dt>
                                    <dd>Distribución de grasa. Riesgo elevado si es <strong>&gt; 0.90</strong> (H) o <strong>&gt; 0.85</strong> (M).</dd>
                                </div>
                                <div>
                                    <dt className="font-black text-teal-700">FFMI (Masa Libre de Grasa)</dt>
                                    <dd>Índice de muscularidad. Un valor <strong>&gt; 20</strong> indica una base muscular atlética y sólida.</dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-8 text-center">
                    <span className="text-2xl font-black block leading-none text-slate-200 mb-2">—</span>
                    <span className="text-xs text-slate-300 font-bold">Sin datos registrados</span>
                </div>
            )}

            {/* Photos Modal */}
            {showPhotos && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md p-4 border-b border-slate-100 flex justify-between items-center z-10">
                            <h3 className="font-bold text-slate-900 text-lg">Mis Fotos</h3>
                            <button onClick={() => setShowPhotos(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-6">
                            {photos.front && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Frente</p>
                                    <img src={photos.front} alt="Frente" className="w-full rounded-2xl border border-slate-100 shadow-sm" />
                                </div>
                            )}
                            {photos.side && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Perfil</p>
                                    <img src={photos.side} alt="Perfil" className="w-full rounded-2xl border border-slate-100 shadow-sm" />
                                </div>
                            )}
                            {photos.back && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Espalda</p>
                                    <img src={photos.back} alt="Espalda" className="w-full rounded-2xl border border-slate-100 shadow-sm" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Enhanced Metric Card with Grid Layout
const MetricCard = ({ title, items = [], icon: Icon, color, className = "", isFullWidth = false, explanation = null }) => {
    const hasData = items && items.length > 0;
    const [showInfo, setShowInfo] = React.useState(false);

    return (
        <div className={clsx("bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full relative overflow-hidden transition-all", className)}>
            {/* Header */}
            <div className={clsx("flex items-center gap-3 mb-4", isFullWidth && "mb-2")}>
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
                    {Icon && <Icon size={20} />}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{title}</h4>
                        {explanation && (
                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className="text-slate-300 hover:text-slate-500 p-1"
                            >
                                <Info size={16} />
                            </button>
                        )}
                    </div>
                    {!isFullWidth && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                            {hasData ? 'Completado' : 'Pendiente'}
                        </p>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className={clsx(
                "w-full transition-all",
                isFullWidth ? "grid grid-cols-4 gap-4 divide-x divide-slate-50" : "space-y-3"
            )}>
                {hasData ? (
                    items.map((item, idx) => (
                        <div key={idx} className={clsx(
                            "flex",
                            isFullWidth ? "flex-col items-center justify-center pl-4 first:pl-0 text-center" : "justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0"
                        )}>
                            <div className="flex items-center gap-2">
                                {item.icon && <item.icon size={14} className="text-slate-400" />}
                                <span className={clsx(
                                    "text-slate-500 font-medium block",
                                    isFullWidth ? "text-[10px] uppercase tracking-wider" : "text-xs"
                                )}>
                                    {item.label}
                                </span>
                            </div>
                            <span className={clsx(
                                "font-black text-slate-900 leading-none",
                                isFullWidth ? "text-xl" : "text-sm"
                            )}>
                                {item.value}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-left mt-2">
                        <span className="text-2xl font-black block leading-none text-slate-300">—</span>
                        <span className="text-xs text-slate-300 font-bold">Sin datos</span>
                    </div>
                )}
            </div>

            {showInfo && explanation && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    {explanation}
                </div>
            )}
        </div>
    );
};

const ContactSection = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6 transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left active:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <MessageCircle size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm">Contacto & Planes</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                            Dudas y Premium
                        </p>
                    </div>
                </div>
                <ChevronDown
                    size={20}
                    className={clsx("text-slate-300 transition-transform duration-300", isOpen && "rotate-180")}
                />
            </button>

            {/* Collapsible Content */}
            <div className={clsx(
                "grid gap-3 px-5 overflow-hidden transition-all duration-300",
                isOpen ? "pb-5 opacity-100 max-h-40" : "pb-0 opacity-0 max-h-0"
            )}>
                {/* Instagram Button (Green) */}
                <a
                    href="https://instagram.com/2befit.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-green-500 text-white p-4 rounded-2xl shadow-lg shadow-green-200 active:scale-95 transition-transform"
                >
                    <div className="flex items-center gap-3">
                        <MessageCircle size={20} className="fill-current opacity-90" />
                        <span className="font-bold text-sm">@2befit.online</span>
                    </div>
                    <ExternalLink size={16} className="opacity-60" />
                </a>

                {/* Web Button (Black) */}
                <a
                    href="https://2befit.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-lg shadow-slate-200 active:scale-95 transition-transform"
                >
                    <div className="flex items-center gap-3">
                        <Globe size={20} className="opacity-90" />
                        <span className="font-bold text-sm">2BEFIT PREMIUM</span>
                    </div>
                    <ExternalLink size={16} className="opacity-60" />
                </a>
            </div>
        </div>
    );
};

export default ResultsDashboard;
