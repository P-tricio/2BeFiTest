import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Shuffle, EyeOff, Save, CheckCircle, Anchor } from 'lucide-react';
import clsx from 'clsx';

const BlindStorkTest = () => {
    const navigate = useNavigate();
    const setTestResult = useStore((state) => state.setTestResult);
    const user = useStore((state) => state.user);

    // Level Check
    // "Adaptado" & "Intermedio" -> Open Eyes.
    // "Avanzado" -> Closed Eyes.
    // "General" -> Let's assume Open for safety if not specified, or Closed if it's the standard "Blind Stork". 
    // Given the prompt "en adaptados e intermedios... ojos abiertos", implying exclusion of Advanced.
    const isAdvanced = user.level === 'advanced';
    const eyesOpen = !isAdvanced;

    // stages: intro, ready, counter_start, testing, input
    const [stage, setStage] = useState('intro');
    const [startTime, setStartTime] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [manualTime, setManualTime] = useState('');

    useEffect(() => {
        let interval;
        if (stage === 'testing') {
            interval = setInterval(() => {
                setElapsed((Date.now() - startTime) / 1000);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [stage, startTime]);

    const startTest = () => {
        setStartTime(Date.now());
        setStage('testing');
    };

    const stopTest = () => {
        setStage('input');
        setManualTime(elapsed.toFixed(1));
    };

    const handleSave = () => {
        setTestResult('agility', 'blindStork', { time: parseFloat(manualTime) });
        navigate('/results');
    };

    if (stage === 'intro') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-6 overflow-y-auto animate-in fade-in bg-slate-50">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">

                    {/* Visual Aid Image */}
                    <div className="w-full relative aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                        <img
                            src="/exercises/blind_stork.png"
                            alt="Demonstración de la Cigüeña"
                            className="w-full h-full object-contain p-6 mix-blend-multiply"
                        />
                        <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-600 p-2 rounded-full">
                            <Anchor size={20} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-2">Test de la Cigüeña</h2>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">
                        Equilibrio {eyesOpen ? '(Ojos Abiertos)' : '(Ojos Cerrados)'}
                    </p>

                    <div className="w-full bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-2">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-indigo-500" /> Protocolo
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-indigo-500 marker:font-bold">
                            <li>Apóyate en UN solo pie (descalzo).</li>
                            <li>Coloca el otro pie contra la rodilla interna.</li>
                            <li>Manos en las caderas.</li>
                            {eyesOpen ? (
                                <li><strong>Mantén la vista en un punto fijo.</strong></li>
                            ) : (
                                <li><strong>Cierra los ojos</strong> y aguanta.</li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="sticky bottom-0 pt-4 pb-2 z-10 w-full mt-auto bg-slate-50/90 backdrop-blur-sm">
                    <button
                        onClick={() => setStage('ready')}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'ready') {
        return (
            <div className="flex flex-col h-full p-6 text-center space-y-8 animate-in slide-in-from-right bg-slate-50 pt-20">
                <h2 className="text-2xl font-bold">Instrucciones</h2>
                <div className="bg-white p-6 rounded-2xl shadow-sm text-left space-y-4">
                    <p className="text-slate-600">
                        1. Adopta la postura. <br />
                        2. Pulsa "Comenzar" con el dedo sin perder la postura.<br />
                        {!eyesOpen && <>3. <strong>Cierra los ojos inmediatamente.</strong><br /></>}
                        {eyesOpen ? '3' : '4'}. En cuando pierdas el equilibrio, pulsa la pantalla.
                    </p>
                </div>
                <button
                    onClick={startTest}
                    className="w-full h-32 rounded-3xl bg-indigo-600 text-white text-2xl font-bold shadow-xl flex items-center justify-center animate-pulse mt-auto"
                >
                    COMENZAR
                </button>
            </div>
        );
    }

    if (stage === 'testing') {
        return (
            <div
                onClick={stopTest}
                className="flex flex-col h-full bg-slate-900 text-white items-center justify-center p-6 cursor-pointer touch-manipulation"
            >
                {eyesOpen ? <Shuffle className="w-20 h-20 text-indigo-400 mb-8 animate-pulse" /> : <EyeOff className="w-20 h-20 text-indigo-400 mb-8 animate-pulse" />}
                <div className="text-7xl font-black font-mono">
                    {elapsed.toFixed(1)}s
                </div>
                <p className="mt-8 text-indigo-200 font-bold uppercase tracking-widest text-center">
                    {eyesOpen ? 'Mantén el equilibrio' : 'Cierra los ojos'}<br />
                    Toca la pantalla al fallar
                </p>
            </div>
        );
    }

    if (stage === 'input') {
        return (
            <div className="flex flex-col h-full p-6 items-center justify-center space-y-6 animate-in zoom-in duration-300">
                <h2 className="text-2xl font-bold">Resultado</h2>
                <p className="text-slate-600">Tiempo de equilibrio registrado:</p>

                <input
                    type="number"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full max-w-[200px] text-center text-6xl font-black p-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-indigo-500"
                />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Segundos</span>

                <button
                    onClick={handleSave}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 mt-8"
                >
                    <Save size={20} /> Guardar Resultado
                </button>
            </div>
        );
    }

    return null;
};

export default BlindStorkTest;
