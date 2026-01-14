import React, { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import html2canvas from 'html2canvas';
import {
    Activity, ArrowDown, ArrowUp, ArrowUpCircle, Award, Calendar, ChevronRight, Clock,
    Dumbbell, Flame, History, Layout, Maximize2, MoreHorizontal, Orbit, PersonStanding, RotateCw,
    Share2, Shuffle, Target, Trophy, Users, Wind, Zap, Anchor, Scale, UserCheck,
    Camera, Info, X, Trash2, Heart, ExternalLink, Settings, MessageCircle, Globe, ChevronDown
} from 'lucide-react';
import RadarChart from '../common/RadarChart';
import clsx from 'clsx';
import { calculateMetrics } from '../../utils/scoring';

const ResultsDashboard = () => {
    const navigate = useNavigate();
    const results = useStore((state) => state.results);
    const user = useStore((state) => state.user);
    const hasAuth = !!user.uid;
    const shareRef = useRef(null);

    // --- Unified Scoring Logic (Synced with Home.jsx) ---
    const metrics = useMemo(() => calculateMetrics(results, user.level), [results, user.level]);

    // Data mapped for Radar Chart (Array format)
    const chartData = useMemo(() => [
        { label: 'Fuerza', value: metrics.strength, color: 'bg-purple-500', icon: Dumbbell },
        { label: 'Energía', value: metrics.energy, color: 'bg-orange-500', icon: Zap },
        { label: 'Cuerpo', value: metrics.body, color: 'bg-teal-500', icon: PersonStanding },
        { label: 'Control', value: metrics.control, color: 'bg-blue-500', icon: Orbit },
        { label: 'Movilidad', value: metrics.mobility, color: 'bg-pink-500', icon: Shuffle }
    ], [metrics]);

    const handleShare = async () => {
        if (!shareRef.current) return;
        try {
            const canvas = await html2canvas(shareRef.current);
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `FitnessTest_Report_${new Date().toISOString().split('T')[0]}.png`;
            link.click();
        } catch (err) {
            console.error("Share failed", err);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-24 font-sans">
            {/* Header / Top Bar */}
            <div className="sticky top-0 p-4 pt-6 flex items-center justify-center z-10">
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-wide text-center w-full">
                    Mi Perfil
                </h1>
            </div>

            <div ref={shareRef} className="p-4 space-y-6 max-w-md mx-auto">

                {/* User Identity Card */}
                {/* User Identity Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200 border border-slate-100 relative overflow-hidden flex flex-col items-center text-center">

                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                        NIVEL ACTUAL
                    </span>

                    <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">
                        {user.level ? user.level.charAt(0).toUpperCase() + user.level.slice(1) : 'Principiante'}
                    </h2>

                    <p className="text-slate-400 font-medium text-sm mb-6">
                        {user.name ? `Hola, ${user.name}` : 'Miembro verificado'}
                    </p>

                    {/* Progress Bar & Score */}
                    <div className="w-full max-w-[200px] space-y-2">
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
                            <div
                                className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out absolute top-0 left-0 shadow-sm"
                                style={{ width: `${Math.round((metrics.strength + metrics.energy + metrics.body + metrics.control + metrics.mobility) / 5)}%` }}
                            />
                        </div>
                        <p className="text-xs font-bold text-slate-400 tracking-widest">
                            {Math.round((metrics.strength + metrics.energy + metrics.body + metrics.control + metrics.mobility) / 5)} / 100 PTS
                        </p>
                    </div>
                </div>

                {/* Radar Chart Section */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center">
                    <RadarChart data={chartData} size={280} />
                </div>

                {/* Detailed Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Strength */}
                    <MetricCard
                        title="Fuerza"
                        icon={Dumbbell}
                        color="bg-purple-50 text-purple-600"
                        items={[
                            { icon: ArrowUp, label: 'Flexiones', value: results.strength?.pushup?.reps || '-' },
                            { icon: ArrowDown, label: 'Sentadillas', value: results.strength?.squat?.reps || '-' },
                            { icon: Clock, label: 'Plancha', value: results.strength?.plank?.time ? `${results.strength.plank.time}s` : '-' }
                        ]}
                    />

                    {/* Energy */}
                    <MetricCard
                        title="Energía"
                        icon={Zap}
                        color="bg-orange-50 text-orange-600"
                        items={[
                            { icon: Flame, label: 'Burpees', value: results.cardio?.burpee?.reps || '-' },
                            {
                                icon: Wind,
                                label: results.cardio?.cooper?.vo2Max ? 'Cooper' : (results.cardio?.rockport?.vo2Max ? 'Rockport' : (user.level === 'advanced' ? 'Cooper' : 'Rockport')),
                                value: results.cardio?.rockport?.vo2Max || results.cardio?.cooper?.vo2Max || '-'
                            },
                            { icon: Activity, label: 'Step', value: results.cardio?.ruffier?.score ? results.cardio.ruffier.score : '-' }
                        ]}
                    />

                    {/* Control (Agility) */}
                    <MetricCard
                        title="Control"
                        icon={Orbit}
                        color="bg-blue-50 text-blue-600"
                        items={[
                            { icon: Target, label: 'Tapping', value: results.agility?.tapping?.count || '-' },
                            { icon: Anchor, label: 'Cigüeña', value: results.agility?.blindStork?.time ? `${results.agility.blindStork.time}s` : '-' },
                            { icon: ArrowUpCircle, label: 'Saltos Lat.', value: results.agility?.hops?.count || '-' }
                        ]}
                    />

                    {/* Mobility */}
                    <MetricCard
                        title="Movilidad"
                        icon={Shuffle}
                        color="bg-pink-50 text-pink-600"
                        items={[
                            { icon: Maximize2, label: 'Hombros', value: results.mobility?.shoulder?.gap ? `${results.mobility.shoulder.gap}cm` : '-' },
                            { icon: UserCheck, label: 'Sentadilla OH', value: results.mobility?.overheadSquat?.score ? `${results.mobility.overheadSquat.score}/3` : '-' },
                            { icon: RotateCw, label: 'Asimetría', value: results.mobility?.shoulder?.difference ? `${results.mobility.shoulder.difference}cm` : '-' }
                        ]}
                    />

                    {/* Body Composition (Full Width) */}
                    <BodyCompositionCard results={results} />
                </div>

                {/* Actions & Footer */}
                <div className="flex gap-4">
                    {hasAuth ? (
                        <button
                            onClick={() => navigate('/history')}
                            className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <History size={20} /> Historial
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-emerald-500/30"
                        >
                            <Trophy size={20} /> Guardar Progreso
                        </button>
                    )}
                </div>

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
                    {/* Subtitle Removed */}
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

export default ResultsDashboard;
