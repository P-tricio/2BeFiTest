import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Scale, Ruler, Save, Info, ArrowRight, Camera, PersonStanding } from 'lucide-react';
import clsx from 'clsx';

const BodyCompositionForm = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const user = useStore((state) => state.user);
    const setUser = useStore((state) => state.setUser);
    const results = useStore((state) => state.results);

    // Initial state from user profile or existing results could be added here
    const [height, setHeight] = useState(user.height || ''); // cm
    const [weight, setWeight] = useState(''); // kg
    const [waist, setWaist] = useState(''); // cm
    const [hip, setHip] = useState(''); // cm
    const [neck, setNeck] = useState(results.composition?.neck || ''); // cm

    // UI State
    const [step, setStep] = useState(1); // 1: Height/Weight, 2: Waist/Hip, 3: Neck, 4: Photos
    const [photos, setPhotos] = useState({ front: null, side: null, back: null });
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = (type, file) => {
        setPhotos(prev => ({ ...prev, [type]: file }));
    };

    const calculateMetrics = () => {
        const hM = parseFloat(height) / 100;
        const hCm = parseFloat(height);
        const wKg = parseFloat(weight);
        const waistCm = parseFloat(waist);
        const hipCm = parseFloat(hip);
        const neckCm = parseFloat(neck);

        const bmi = (wKg / (hM * hM)).toFixed(1);
        const icc = (waistCm / hipCm).toFixed(2); // Waist-to-Hip Ratio
        const whtr = (waistCm / hCm).toFixed(2); // Waist-to-Height Ratio

        // US Navy Body Fat Formula
        const gender = user.gender || 'male';
        let bodyFat = 0;

        if (gender === 'female') {
            bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(hCm)) - 450;
        } else {
            bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(hCm)) - 450;
        }

        // Fat-Free Mass Index (FFMI) Calculation
        // Useful for detecting high muscle mass
        const bodyFatValue = Math.max(0, bodyFat); // Ensure non-negative
        const leanMass = wKg * (1 - (bodyFatValue / 100));
        const ffmi = (leanMass / (hM * hM)).toFixed(1);

        return {
            bmi,
            icc,
            whtr,
            ffmi,
            bodyFat: bodyFat.toFixed(1)
        };
    };

    const handleSave = async () => {
        if (!height || !weight || !waist || !hip || !neck) return;

        setUploading(true);

        // Ensure user profile has height
        if (!user.height || user.height !== height) {
            setUser({ height });
        }

        const stats = calculateMetrics();
        let photoUrls = {};

        // Upload Photos if any
        try {
            if (user.uid && (photos.front || photos.side || photos.back)) {
                const { storage } = await import('../../lib/firebase');
                const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

                for (const [type, file] of Object.entries(photos)) {
                    if (file) {
                        const storageRef = ref(storage, `users/${user.uid}/body/${Date.now()}_${type}`);
                        await uploadBytes(storageRef, file);
                        const url = await getDownloadURL(storageRef);
                        photoUrls[type] = url;
                    }
                }
            }
        } catch (error) {
            console.error("Error uploading photos:", error);
            // Continue saving results even if photos fail (optional?)
        }

        setTestResult('composition', null, {
            weight,
            waist,
            hip,
            neck,
            height,
            bmi: stats.bmi,
            icc: stats.icc,
            whtr: stats.whtr,
            ffmi: stats.ffmi,
            bodyFat: stats.bodyFat,
            photos: photoUrls
        });

        setUploading(false);
        navigate('/results');
    };

    const isStep1Valid = height && weight;

    return (
        <div className="flex flex-col h-full relative bg-slate-50 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />

            {/* Main Content Centered Container */}
            <div className="flex-1 flex flex-col justify-center p-6 space-y-6 relative z-10 max-w-md mx-auto w-full pb-20 overflow-y-auto">

                {/* Hero Header */}
                <div className="text-center space-y-3 shrink-0">
                    <div className="mx-auto w-20 h-20 bg-white text-teal-600 rounded-3xl flex items-center justify-center shadow-lg shadow-teal-100 mb-4 animate-in zoom-in duration-500">
                        <PersonStanding size={40} className="fill-current" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">Composición</h2>
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Métrica</span>
                        <span className="text-xs font-black text-teal-600 uppercase tracking-wider">
                            Salud Estructural
                        </span>
                    </div>
                </div>

                {/* Step 1: Height & Weight */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                            {/* Gender Selector - Critical for accurate Body Fat Calc */}
                            <div className="flex bg-slate-100 p-1 rounded-2xl">
                                <button
                                    onClick={() => setUser({ ...user, gender: 'male' })}
                                    className={clsx(
                                        "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                        user.gender === 'male' || !user.gender ? "bg-white text-teal-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Hombre
                                </button>
                                <button
                                    onClick={() => setUser({ ...user, gender: 'female' })}
                                    className={clsx(
                                        "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                        user.gender === 'female' ? "bg-white text-teal-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Mujer
                                </button>
                            </div>

                            {/* Height */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <Ruler size={16} /> Altura (cm)
                                </label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder="175"
                                    className="w-full text-4xl font-black p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500 outline-none text-slate-900 text-center"
                                />
                            </div>

                            {/* Weight */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <Scale size={16} /> Peso (kg)
                                </label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="70.5"
                                    className="w-full text-4xl font-black p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500 outline-none text-slate-900 text-center"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!isStep1Valid}
                            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 mt-auto"
                        >
                            Siguiente <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {/* Step 2: Waist & Hip */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                            <div className="bg-teal-50 p-4 rounded-xl text-teal-800 text-sm leading-relaxed flex gap-3">
                                <Info className="shrink-0 mt-1" size={18} />
                                <p>
                                    <strong>Cintura:</strong> Justo por encima del ombligo.<br />
                                    <strong>Cadera:</strong> Parte más ancha de los glúteos.
                                </p>
                            </div>

                            {/* Waist */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <Ruler size={16} className="rotate-90" /> Cintura (cm)
                                </label>
                                <input
                                    type="number"
                                    value={waist}
                                    onChange={(e) => setWaist(e.target.value)}
                                    placeholder="80"
                                    className="w-full text-4xl font-black p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500 outline-none text-slate-900 text-center"
                                    autoFocus
                                />
                            </div>

                            {/* Hip */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <Ruler size={16} className="rotate-90" /> Cadera (cm)
                                </label>
                                <input
                                    type="number"
                                    value={hip}
                                    onChange={(e) => setHip(e.target.value)}
                                    placeholder="95"
                                    className="w-full text-4xl font-black p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500 outline-none text-slate-900 text-center"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 text-slate-400 font-bold py-4"
                            >
                                Volver
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!waist || !hip}
                                className="flex-[2] btn-primary py-4 text-lg flex items-center justify-center gap-2"
                            >
                                Siguiente <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Neck (For Body Fat %) */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm leading-relaxed flex gap-3">
                                <Info className="shrink-0 mt-1" size={18} />
                                <p>
                                    <strong>Cuello:</strong> Justo debajo de la nuez de Adán (hombres) o en la parte media (mujeres).
                                    <br /> Esto nos permite diferenciar <strong>músculo</strong> de grasa.
                                </p>
                            </div>

                            {/* Neck */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <Ruler size={16} className="rotate-90" /> Cuello (cm)
                                </label>
                                <input
                                    type="number"
                                    value={neck}
                                    onChange={(e) => setNeck(e.target.value)}
                                    placeholder="38"
                                    className="w-full text-4xl font-black p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500 outline-none text-slate-900 text-center"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 text-slate-400 font-bold py-4"
                            >
                                Volver
                            </button>
                            <button
                                onClick={() => setStep(4)}
                                disabled={!neck}
                                className="flex-[2] btn-primary py-4 text-lg flex items-center justify-center gap-2"
                            >
                                Siguiente <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Photos */}
                {step === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                            <div className="bg-orange-50 p-4 rounded-xl text-orange-800 text-sm leading-relaxed flex gap-3">
                                <Info className="shrink-0 mt-1" size={18} />
                                <p>
                                    <strong>Fotos deshabilitadas:</strong> La subida de fotos está desactivada temporalmente por mantenimiento. Puedes guardar tus datos sin ellas.
                                </p>
                            </div>

                            <PhotoUpload label="Frente" disabled={true} onFileSelect={(f) => handleFileSelect('front', f)} />
                            <PhotoUpload label="Perfil" disabled={true} onFileSelect={(f) => handleFileSelect('side', f)} />
                            <PhotoUpload label="Espalda" disabled={true} onFileSelect={(f) => handleFileSelect('back', f)} />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={uploading}
                            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 mt-auto"
                        >
                            {uploading ? 'Guardando...' : 'Guardar Datos'} <Save size={20} />
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            disabled={uploading}
                            className="w-full text-slate-400 font-bold py-2"
                        >
                            Volver
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const PhotoUpload = ({ label, onFileSelect, disabled }) => {
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onFileSelect(file);
        }
    };

    return (
        <label className={clsx(
            "flex items-center gap-4 p-4 border-2 border-dashed rounded-2xl transition-colors bg-slate-50 border-slate-200",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-teal-500"
        )}>
            <input type="file" className="hidden" accept="image/*" onChange={handleChange} disabled={disabled} />
            <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
                {preview ? (
                    <img src={preview} alt={label} className="w-full h-full object-cover" />
                ) : (
                    <Camera className="text-slate-400" />
                )}
            </div>
            <div>
                <p className="font-bold text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">
                    {disabled ? 'Deshabilitado' : (preview ? 'Foto seleccionada' : 'Tocar para subir')}
                </p>
            </div>
        </label>
    );
};

export default BodyCompositionForm;
