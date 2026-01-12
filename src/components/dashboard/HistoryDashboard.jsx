import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import useStore from '../../store/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Calendar, TrendingUp, Camera, X, ArrowRightLeft, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import clsx from 'clsx';

const HistoryDashboard = () => {
    const user = useStore((state) => state.user);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user.uid) return;
            try {
                const q = query(
                    collection(db, 'results'),
                    where('uid', '==', user.uid),
                    orderBy('timestamp', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setHistory(data);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user.uid]);

    if (loading) return <div className="p-8 text-center text-slate-400">Cargando historial...</div>;
    if (history.length === 0) return (
        <div className="p-8 text-center bg-slate-50 rounded-3xl m-6">
            <h3 className="text-xl font-bold text-slate-700 mb-2">No tienes resultados guardados</h3>
            <p className="text-slate-500">Realiza tu primer test para ver tu progreso aquí.</p>
        </div>
    );

    // Prepare Data for Charts
    const getChartData = (testType, valueKey = 'reps') => {
        return history
            .filter(h => h.test === testType)
            .map(h => ({
                date: new Date(h.timestamp.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                value: h.data[valueKey] || 0
            }))
            .reverse();
    };

    const compositionData = history
        .filter(h => h.category === 'composition' && h.data && h.data.weight) // Ensure weight exists
        .map(h => ({
            date: new Date(h.timestamp.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            weight: parseFloat(h.data.weight || 0),
            fat: parseFloat(h.data.bodyFat || 0),
            bmi: parseFloat(h.data.bmi || 0)
        }))
        .filter(d => d.weight > 0) // Remove incomplete records
        .reverse();

    const photoHistory = history
        .filter(h => h.category === 'composition' && h.data?.photos && (h.data.photos.front || h.data.photos.side || h.data.photos.back))
        .map(h => ({
            id: h.id,
            date: new Date(h.timestamp.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            fullDate: new Date(h.timestamp.seconds * 1000).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            weight: h.data.weight,
            fat: h.data.bodyFat,
            photos: h.data.photos
        }))
        .reverse();

    const chartConfig = [
        { id: 'squat', title: 'Sentadillas', color: '#8b5cf6', bg: 'bg-purple-100', text: 'text-purple-600', key: 'reps' },
        { id: 'pushup', title: 'Flexiones', color: '#ec4899', bg: 'bg-pink-100', text: 'text-pink-600', key: 'reps' },
        { id: 'burpee', title: 'Burpees', color: '#f59e0b', bg: 'bg-orange-100', text: 'text-orange-600', key: 'reps' },
        { id: 'plank', title: 'Plancha', color: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-600', key: 'time' },
        { id: 'hops', title: 'Saltos Laterales', color: '#3b82f6', bg: 'bg-blue-100', text: 'text-blue-600', key: 'count' },
        { id: 'blindStork', title: 'Cigüeña', color: '#6366f1', bg: 'bg-indigo-100', text: 'text-indigo-600', key: 'time' },
        { id: 'step', title: 'Test del Escalón (VO2)', color: '#f97316', bg: 'bg-orange-100', text: 'text-orange-600', key: 'vo2' },
        { id: 'rockport', title: 'Rockport (VO2)', color: '#f97316', bg: 'bg-orange-100', text: 'text-orange-600', key: 'vo2' },
        { id: 'cooper', title: 'Cooper (VO2)', color: '#f97316', bg: 'bg-orange-100', text: 'text-orange-600', key: 'vo2' },
        // Add more tests here as needed
    ];

    // --- Group History by Date ---
    const getGroupLabel = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Hoy';
        if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
        return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const groupedHistory = history.reduce((groups, item) => {
        const date = new Date(item.timestamp.seconds * 1000);
        const label = getGroupLabel(date);

        if (!groups[label]) {
            groups[label] = [];
        }
        groups[label].push(item);
        return groups;
    }, {});

    return (
        <div className="h-full overflow-y-auto bg-slate-50">
            <div className="p-6 pb-32 space-y-8 min-h-full">
                <header>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Tu Progreso</h1>
                    <p className="text-slate-500 font-medium">Historial de evolución</p>
                </header>

                {/* Body Composition Progress - ALWAYS FIRST & DEFAULT OPEN */}
                {compositionData.length > 0 && (
                    <ChartGroup
                        title="Evolución Corporal"
                        icon={TrendingUp}
                        iconBg="bg-teal-100"
                        iconColor="text-teal-600"
                        defaultOpen={true}
                    >
                        <div className="h-64 w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={compositionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="fat" name="% Grasa" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartGroup>
                )}

                {/* Photo Evolution Gallery */}
                {photoHistory.length > 0 && (
                    <ChartGroup
                        title="Galería de Progreso"
                        icon={Camera}
                        iconBg="bg-teal-100"
                        iconColor="text-teal-600"
                        defaultOpen={true}
                    >
                        <PhotoEvolutionGallery items={photoHistory} />
                    </ChartGroup>
                )}

                {/* Dynamic Charts for Other Tests */}
                {chartConfig.map(config => {
                    const data = getChartData(config.id, config.key);
                    if (data.length === 0) return null;

                    return (
                        <ChartGroup
                            key={config.id}
                            title={`Evolución ${config.title}`}
                            icon={TrendingUp}
                            iconBg={config.bg}
                            iconColor={config.text}
                            defaultOpen={false}
                        >
                            <div className="h-64 w-full min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            name={config.key === 'time' ? 'Tiempo (s)' : 'Repeticiones'}
                                            stroke={config.color}
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: config.color, strokeWidth: 0 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartGroup>
                    );
                })}

                <div className="space-y-6">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-4">
                        <Calendar size={20} className="text-slate-400" />
                        Historial Reciente
                    </h3>

                    {Object.entries(groupedHistory).map(([label, items]) => (
                        <HistoryGroup key={label} label={label} items={items} />
                    ))}
                </div>
            </div>
        </div>
    );
};


const PhotoEvolutionGallery = ({ items }) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [compareView, setCompareView] = useState('front'); // front, side, back
    const comparisonRef = useRef(null);

    const toggleSelection = (item) => {
        if (selectedForCompare.find(i => i.id === item.id)) {
            setSelectedForCompare(prev => prev.filter(i => i.id !== item.id));
        } else {
            if (selectedForCompare.length < 2) {
                setSelectedForCompare(prev => [...prev, item].sort((a, b) => new Date(a.date) - new Date(b.date))); // Keep chronological
            }
        }
    };

    const handleCardClick = (item) => {
        if (compareMode) {
            toggleSelection(item);
        } else {
            setSelectedItem(item);
        }
    };

    const handleDownloadComparison = async () => {
        if (!comparisonRef.current) return;
        try {
            const canvas = await html2canvas(comparisonRef.current, {
                backgroundColor: '#0f172a', // slate-900 matches background
                scale: 2, // High res
                useCORS: true, // Handle cross-origin images
                allowTaint: true,
                logging: false
            });
            const link = document.createElement('a');
            link.download = `comparativa-progreso-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error("Error generating comparison image:", error);
        }
    };

    const sortedCompareItems = [...selectedForCompare].sort((a, b) => new Date(a.id) - new Date(b.id)); // Ensure Old vs New

    return (
        <div className="relative">
            {/* Gallery Controls */}
            <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                    {compareMode ? (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full animate-in fade-in">
                            Selecciona 2 fechas ({selectedForCompare.length}/2)
                        </span>
                    ) : (
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Línea de Tiempo</span>
                    )}
                </div>

                <div className="flex gap-2">
                    {compareMode ? (
                        <>
                            <button
                                onClick={() => { setCompareMode(false); setSelectedForCompare([]); }}
                                className="px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => setShowCompareModal(true)}
                                disabled={selectedForCompare.length !== 2}
                                className={clsx(
                                    "px-4 py-1.5 text-xs font-bold text-white rounded-lg flex items-center gap-2 transition-all",
                                    selectedForCompare.length === 2
                                        ? "bg-indigo-600 shadow-md shadow-indigo-200 hover:scale-105 active:scale-95"
                                        : "bg-slate-300 cursor-not-allowed"
                                )}
                            >
                                <ArrowRightLeft size={14} />
                                Comparar
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setCompareMode(true)}
                            className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                            <ArrowRightLeft size={14} />
                            Comparar
                        </button>
                    )}
                </div>
            </div>

            {/* Timeline Scroll Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1 snap-x snap-mandatory scrollbar-hide">
                {items.map((item) => {
                    const isSelected = selectedForCompare.find(i => i.id === item.id);
                    const isDisabled = compareMode && !isSelected && selectedForCompare.length >= 2;

                    return (
                        <div
                            key={item.id}
                            onClick={() => !isDisabled && handleCardClick(item)}
                            className={clsx(
                                "flex-shrink-0 w-28 md:w-36 snap-center group cursor-pointer transition-all duration-300",
                                isDisabled ? "opacity-40 grayscale" : "opacity-100"
                            )}
                        >
                            <div className={clsx(
                                "relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm mb-2 transition-all",
                                isSelected ? "ring-4 ring-indigo-500 scale-105 shadow-xl shadow-indigo-200" : "border border-slate-100 bg-slate-100 group-hover:shadow-md group-hover:scale-105 group-active:scale-95"
                            )}>
                                {item.photos.front ? (
                                    <img src={item.photos.front} alt={`Foto ${item.date}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Camera size={24} /></div>
                                )}

                                {/* Overlay / Checkbox for Selection */}
                                {compareMode && (
                                    <div className={clsx(
                                        "absolute inset-0 flex items-center justify-center transition-all bg-black/20",
                                        isSelected ? "bg-indigo-500/20" : ""
                                    )}>
                                        <div className={clsx(
                                            "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm",
                                            isSelected ? "bg-indigo-600 text-white scale-110" : "bg-white/80 text-transparent border-2 border-slate-200"
                                        )}>
                                            {isSelected && <ArrowRightLeft size={16} />}
                                        </div>
                                    </div>
                                )}

                                {!compareMode && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Ver Todo</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <p className={clsx("font-bold text-xs transition-colors", isSelected ? "text-indigo-600" : "text-slate-800")}>{item.date}</p>
                                <p className="text-[10px] text-slate-400 font-bold">
                                    {item.weight ? `${item.weight}kg` : ''}
                                    {item.weight && item.fat ? ' • ' : ''}
                                    {item.fat ? `${item.fat}%` : ''}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Single Viewer Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedItem(null)}>
                    <div className="w-full max-w-5xl h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 px-2 text-white shrink-0">
                            <div>
                                <h3 className="font-bold text-2xl capitalize tracking-tight">{selectedItem.fullDate}</h3>
                                <p className="text-white/60 text-base font-medium mt-1">
                                    Peso: <strong className="text-white">{selectedItem.weight}kg</strong> • Grasa: <strong className="text-white">{selectedItem.fat}%</strong>
                                </p>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 pb-8 h-full">
                                {['front', 'side', 'back'].map((view) => (
                                    selectedItem.photos[view] && (
                                        <div key={view} className="flex flex-col h-full">
                                            <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
                                                <img src={selectedItem.photos[view]} alt={view} className="absolute inset-0 w-full h-full object-contain" />
                                                <div className="absolute top-4 left-0 w-full text-center pointer-events-none">
                                                    <span className="inline-block px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs font-bold text-white uppercase tracking-widest border border-white/10">
                                                        {view === 'front' ? 'Frente' : view === 'side' ? 'Perfil' : 'Espalda'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison Modal */}
            {showCompareModal && sortedCompareItems.length === 2 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/95 backdrop-blur-md animate-in zoom-in-95 duration-200" onClick={() => setShowCompareModal(false)}>
                    <div className="w-full max-w-6xl h-full max-h-[95vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>

                        {/* Header Responsive */}
                        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-black/20 shrink-0">
                            <div className="flex items-center justify-between w-full md:w-auto gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500 rounded-lg text-white">
                                        <ArrowRightLeft size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">Comparativa</h3>
                                        <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Antes vs Después</p>
                                    </div>
                                </div>
                                {/* Mobile Close Button */}
                                <button onClick={() => setShowCompareModal(false)} className="md:hidden p-2 bg-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Controls Wrapper */}
                            <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
                                {/* View Switcher */}
                                <div className="bg-white/5 rounded-xl p-1 flex gap-1">
                                    {['front', 'side', 'back'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setCompareView(v)}
                                            className={clsx(
                                                "px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all",
                                                compareView === v ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {{ front: 'Frente', side: 'Perfil', back: 'Espalda' }[v]}
                                        </button>
                                    ))}
                                </div>

                                {/* Download Button */}
                                <button
                                    onClick={handleDownloadComparison}
                                    className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] md:text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                                    title="Guardar Comparativa"
                                >
                                    <Download size={16} />
                                    <span className="hidden md:inline">Guardar</span>
                                </button>

                                {/* Desktop Close Button */}
                                <button onClick={() => setShowCompareModal(false)} className="hidden md:block p-2 bg-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Comparison Area to Capture */}
                        <div ref={comparisonRef} className="flex-1 flex min-h-0 relative bg-slate-900 border-t border-white/5">
                            {sortedCompareItems.map((item, idx) => (
                                <div key={item.id} className={clsx("flex-1 relative flex flex-col", idx === 0 ? "border-r border-white/10" : "")}>
                                    {/* Data Label */}
                                    <div className="absolute top-4 left-0 w-full z-10 flex flex-col items-center pointer-events-none">
                                        <span className={clsx(
                                            "px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 text-sm font-black uppercase tracking-tight shadow-xl mb-2",
                                            idx === 0 ? "bg-slate-800/80 text-slate-400" : "bg-indigo-600/90 text-white"
                                        )}>
                                            {idx === 0 ? 'Antes' : 'Después'}
                                        </span>
                                        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5 text-center">
                                            <p className="text-white font-bold text-sm">{item.date}</p>
                                            <p className="text-white/60 text-xs">{item.weight}kg • {item.fat}%</p>
                                        </div>
                                    </div>

                                    {/* Image */}
                                    <div className="flex-1 relative w-full h-full bg-black/40 flex items-center justify-center overflow-hidden">
                                        {item.photos[compareView] ? (
                                            <img
                                                src={item.photos[compareView]}
                                                alt="Compare"
                                                className="max-w-full max-h-full object-contain w-auto h-auto relative"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-2">
                                                <Camera size={48} />
                                                <p className="font-bold text-sm uppercase">Sin Foto</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Collapsible Chart Component
const ChartGroup = ({ title, children, icon: Icon, iconBg, iconColor, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="card-base">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center ${iconColor}`}>
                        <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800">{title}</h3>
                </div>
                <span className={`transform transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                    {children}
                </div>
            )}
        </div>
    );
};

// Collapsible Group Component
const HistoryGroup = ({ label, items }) => {
    const [isOpen, setIsOpen] = useState(label === 'Hoy'); // Default open only 'Hoy'
    const [selectedPhotos, setSelectedPhotos] = useState(null);

    return (
        <div className="space-y-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 sticky top-0 bg-slate-50 z-10 glass-effect"
            >
                <span>{label}</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="animate-in slide-in-from-top-2 space-y-3">
                    {items.map((item) => {
                        const hasPhotos = item.test === 'composition' && (item.data.photos?.front || item.data.photos?.side || item.data.photos?.back);

                        return (
                            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center transition-transform active:scale-[0.99]">
                                <div className="flex items-center gap-3">
                                    {/* Photo Trigger */}
                                    {hasPhotos && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedPhotos(item.data.photos); }}
                                            className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 hover:bg-teal-100 transition-colors"
                                        >
                                            <Camera size={18} />
                                        </button>
                                    )}
                                    <div>
                                        <p className="font-bold text-slate-800 capitalize">
                                            {item.test === 'composition' ? 'Composición Corporal' :
                                                item.test === 'ruffier' ? 'Test de Ruffier' :
                                                    item.test === 'squat' ? 'Sentadillas' :
                                                        item.test === 'pushup' ? 'Flexiones' :
                                                            item.test === 'plank' ? 'Plancha' :
                                                                item.test === 'tapping' ? 'Plate Tapping' :
                                                                    item.test === 'hops' ? 'Saltos Laterales' :
                                                                        item.test === 'blindStork' ? 'Test de Cigüeña' :
                                                                            item.test === 'burpee' ? 'Burpees' :
                                                                                item.test === 'step' ? 'Test del Escalón' :
                                                                                    item.test}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(item.timestamp.seconds * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    {(() => {
                                        const formatResult = (item) => {
                                            // Composition
                                            if (item.test === 'composition') {
                                                return {
                                                    primary: `${item.data.weight} kg`,
                                                    secondary: `Grasa ${item.data.bodyFat}% | IMC ${item.data.bmi}`,
                                                    accent: 'teal'
                                                };
                                            }
                                            // Ruffier
                                            if (item.test === 'ruffier') {
                                                return {
                                                    primary: `Ind. ${item.data.score}`,
                                                    secondary: item.data.label || (item.data.score < 5 ? 'Excelente' : item.data.score < 10 ? 'Bueno' : 'Mejorable'),
                                                    accent: 'yellow'
                                                };
                                            }
                                            // Strength (Squat, Pushup, Burpee)
                                            if (['squat', 'pushup', 'burpee'].includes(item.test)) {
                                                const val = item.data.reps || item.data.value;
                                                let quality = 'Completado';
                                                if (val > 40) quality = 'Excelente';
                                                else if (val > 25) quality = 'Bueno';
                                                else quality = 'Inicial';
                                                return {
                                                    primary: `${val} reps`,
                                                    secondary: quality,
                                                    accent: item.test === 'burpee' ? 'yellow' : 'purple'
                                                };
                                            }
                                            // Plank / Stork / Step
                                            if (['plank', 'blindStork', 'step', 'rockport', 'cooper'].includes(item.test)) {
                                                if (item.test === 'rockport' || item.test === 'cooper') {
                                                    const unit = item.test === 'cooper' ? 'm' : 'min';
                                                    const val = item.test === 'cooper' ? item.data.distance : item.data.time;
                                                    return {
                                                        primary: `VO2 ${item.data.vo2}`,
                                                        secondary: `${val} ${unit}`,
                                                        accent: 'orange'
                                                    };
                                                }
                                                if (item.test === 'step') {
                                                    return {
                                                        primary: `VO2 ${item.data.vo2}`,
                                                        secondary: `${item.data.hr} ppm`,
                                                        accent: 'orange'
                                                    };
                                                }
                                                const time = item.data.time || item.data.value;
                                                return {
                                                    primary: `${time}s`,
                                                    secondary: time > 60 ? 'Excelente' : time > 30 ? 'Bueno' : 'Inicial',
                                                    accent: item.test === 'plank' ? 'purple' : 'blue'
                                                };
                                            }
                                            // Tapping / Hops
                                            if (['tapping', 'hops'].includes(item.test)) {
                                                if (item.test === 'hops') {
                                                    return {
                                                        primary: `${item.data.count} saltos`,
                                                        secondary: item.data.rating || 'Completado', // Ensure rating from test component is used or fallback
                                                        accent: 'blue'
                                                    };
                                                }
                                                return {
                                                    primary: `${item.data.asymmetry}% Asim.`,
                                                    secondary: item.data.score || (item.data.asymmetry < 5 ? 'Excelente' : 'Revisar'),
                                                    accent: 'blue'
                                                };
                                            }
                                            // Shoulder
                                            if (item.test === 'shoulder') {
                                                return {
                                                    primary: `${item.data.score} pts`,
                                                    secondary: item.data.asymmetry ? 'Asimetría' : 'Simétrico',
                                                    accent: 'emerald'
                                                };
                                            }

                                            // Fallback
                                            return {
                                                primary: item.data.value || item.data.reps || item.data.score || '-',
                                                secondary: item.data.unit || 'Resultado',
                                                accent: 'slate'
                                            };
                                        };

                                        const info = formatResult(item);
                                        const colorMap = {
                                            teal: 'text-teal-600',
                                            yellow: 'text-yellow-600',
                                            purple: 'text-purple-600',
                                            blue: 'text-blue-600',
                                            emerald: 'text-emerald-600',
                                            slate: 'text-slate-600'
                                        };

                                        return (
                                            <>
                                                <span className={`font-black text-lg ${colorMap[info.accent]}`}>
                                                    {info.primary}
                                                </span>
                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                    {info.secondary}
                                                </span>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Photos Modal */}
            {selectedPhotos && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md p-4 border-b border-slate-100 flex justify-between items-center z-10">
                            <h3 className="font-bold text-slate-900 text-lg">Fotos del Historial</h3>
                            <button onClick={() => setSelectedPhotos(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-6">
                            {selectedPhotos.front && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Frente</p>
                                    <img src={selectedPhotos.front} alt="Frente" className="w-full rounded-2xl border border-slate-100 shadow-sm" />
                                </div>
                            )}
                            {selectedPhotos.side && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Perfil</p>
                                    <img src={selectedPhotos.side} alt="Perfil" className="w-full rounded-2xl border border-slate-100 shadow-sm" />
                                </div>
                            )}
                            {selectedPhotos.back && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Espalda</p>
                                    <img src={selectedPhotos.back} alt="Espalda" className="w-full rounded-2xl border border-slate-100 shadow-sm" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryDashboard;
