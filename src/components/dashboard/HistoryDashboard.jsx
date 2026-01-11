import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import useStore from '../../store/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

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
                    {items.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center transition-transform active:scale-[0.99]">
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
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryDashboard;
