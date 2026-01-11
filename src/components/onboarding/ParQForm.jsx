import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, HeartPulse, AlertTriangle } from 'lucide-react';
import useStore from '../../store/useStore';
import clsx from 'clsx';

const questions = [
    { id: 'chest_pain_activity', text: '¿Sientes dolor en el pecho cuando realizas actividad física?' },
    { id: 'chest_pain_rest', text: '¿Has tenido dolor en el pecho en reposo en el último mes?' },
    { id: 'dizziness', text: '¿Pierdes el equilibrio por mareos o has perdido el conocimiento?' },
    { id: 'bone_joint', text: '¿Tienes algún problema óseo o articular que podría empeorar con la actividad?' },
    { id: 'medication', text: '¿Tomas medicación para la presión arterial o el corazón?' },
];

const ParQForm = () => {
    const navigate = useNavigate();
    const setParqObj = useStore((state) => state.setParqObj);
    const setUser = useStore((state) => state.setUser);

    // Form State
    const [answers, setAnswers] = useState({});
    const [hr, setHr] = useState('');
    const [step, setStep] = useState('intro'); // intro, questions, hr, result

    const handleAnswer = (id, value) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleQuestionsSubmit = () => {
        // Validate all answered
        if (Object.keys(answers).length < questions.length) {
            alert("Por favor responde todas las preguntas");
            return;
        }
        setStep('hr');
    };

    const finishAssessment = () => {
        const hasYes = Object.values(answers).includes(true);
        const highHr = parseInt(hr) > 100;
        const passed = !hasYes && !highHr;

        setParqObj({ completed: true, passed });
        setUser({ restingHeartRate: hr }); // simple update

        setStep('result');
    };

    if (step === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 animate-in fade-in duration-300">
                <ShieldAlert className="w-16 h-16 text-blue-600 mx-auto" />
                <h2 className="text-2xl font-bold text-slate-900">Seguridad Primero</h2>
                <p className="text-slate-600 leading-relaxed">
                    Antes de comenzar los tests físicos, necesitamos asegurarnos de que es seguro para ti realizar ejercicio.
                </p>

                <div className="bg-blue-50 p-4 rounded-xl text-left border border-blue-100">
                    <h3 className="font-semibold text-blue-800 mb-2 text-sm uppercase">Cuestionario PAR-Q</h3>
                    <p className="text-sm text-blue-700">
                        Responderás 5 preguntas rápidas sobre tu salud y reportarás tu frecuencia cardíaca en reposo.
                    </p>
                </div>

                <button
                    onClick={() => setStep('questions')}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg mt-auto hover:bg-blue-700 transition"
                >
                    Comenzar Cuestionario
                </button>
            </div>
        );
    }

    if (step === 'questions') {
        return (
            <div className="flex flex-col h-full p-6 animate-in slide-in-from-right duration-300 overflow-y-auto pb-24">
                <h2 className="text-xl font-bold mb-6">Cuestionario de Salud</h2>

                <div className="space-y-6">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <p className="font-medium text-slate-800 mb-4">{idx + 1}. {q.text}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAnswer(q.id, true)}
                                    className={clsx(
                                        "flex-1 py-3 rounded-lg font-bold border-2 transition-colors",
                                        answers[q.id] === true
                                            ? "bg-red-100 border-red-500 text-red-700"
                                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                                    )}
                                >
                                    SÍ
                                </button>
                                <button
                                    onClick={() => handleAnswer(q.id, false)}
                                    className={clsx(
                                        "flex-1 py-3 rounded-lg font-bold border-2 transition-colors",
                                        answers[q.id] === false
                                            ? "bg-green-100 border-green-500 text-green-700"
                                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                                    )}
                                >
                                    NO
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleQuestionsSubmit}
                    disabled={Object.keys(answers).length < questions.length}
                    className="fixed bottom-6 left-6 right-6 bg-blue-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg z-20"
                >
                    Siguiente
                </button>
            </div>
        );
    }

    if (step === 'hr') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-8 animate-in slide-in-from-right duration-300">
                <HeartPulse className="w-16 h-16 text-rose-500 mx-auto" />

                <div>
                    <h2 className="text-2xl font-bold mb-2">Frecuencia Cardíaca</h2>
                    <p className="text-slate-600">
                        ¿Cuál es tu pulso en reposo actual?
                    </p>
                </div>

                <div className="w-full max-w-xs mx-auto">
                    <input
                        type="number"
                        value={hr}
                        onChange={(e) => setHr(e.target.value)}
                        placeholder="00"
                        className="w-full text-center text-5xl font-black p-6 rounded-2xl border-2 border-slate-200 focus:border-rose-500 outline-none text-slate-800 placeholder:text-slate-200"
                    />
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Latidos / Min</p>
                </div>

                <button
                    onClick={finishAssessment}
                    disabled={!hr}
                    className="w-full bg-blue-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg mt-auto"
                >
                    Finalizar Evaluación
                </button>
            </div>
        );
    }

    if (step === 'result') {
        const parq = useStore.getState().parq;

        if (parq.passed) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6 animate-in zoom-in duration-300 pb-28">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-green-700">¡Aprobado!</h2>
                    <p className="text-slate-600">
                        Tu perfil de seguridad es adecuado para realizar ejercicio físico moderado.
                    </p>
                    <button
                        onClick={() => navigate('/level')}
                        className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg mt-8"
                    >
                        Configurar Perfil
                    </button>
                </div>
            );
        } else {
            return (
                <div className="flex flex-col h-full p-6 text-center space-y-6 animate-in zoom-in duration-300 bg-red-50 overflow-y-auto pb-32">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shrink-0">
                        <AlertTriangle className="w-12 h-12 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-red-700">Atención Médica Requerida</h2>
                    <p className="text-slate-700 font-medium">
                        Basado en tus respuestas, <strong>NO es seguro</strong> iniciar sin supervisión.
                    </p>

                    <div className="bg-white p-4 rounded-xl border border-red-200 text-left text-sm text-red-800 space-y-2">
                        <p className="font-bold">⚠️ Descargo de Responsabilidad:</p>
                        <p>Al continuar, declaras que entiendes los riesgos asociados a la actividad física intensa y eximes de responsabilidad a esta aplicación.</p>

                        <label className="flex items-start gap-3 mt-4 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                            <input
                                type="checkbox"
                                className="mt-1 w-5 h-5 accent-red-600"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        useStore.getState().acceptDisclaimer();
                                    }
                                }}
                            />
                            <span className="text-xs font-bold text-red-900">
                                He leído, entiendo y acepto realizar las pruebas bajo mi propia responsabilidad.
                            </span>
                        </label>
                    </div>

                    <button
                        onClick={() => {
                            if (useStore.getState().parq.disclaimerAccepted) {
                                navigate('/level');
                            }
                        }}
                        disabled={!useStore.getState().parq.disclaimerAccepted}
                        className="w-full bg-red-600 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg mt-auto transition-all"
                    >
                        Continuar de todos modos
                    </button>
                </div>
            );
        }
    }

    return null;
};

export default ParQForm;
