import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Play } from 'lucide-react';

/**
 * VisualMetronome Component
 * Alternates between two visual states at a given BPM.
 * 
 * @param {number} bpm - Beats per minute (default: 60)
 * @param {boolean} isPlaying - Toggle animation
 * @param {string} labelUp - Text for the "Up" / Phase 1 state
 * @param {string} labelDown - Text for the "Down" / Phase 2 state
 * @param {string} color - Theme color (blue, green, purple, orange)
 */
const VisualMetronome = ({
    bpm = 60,
    isPlaying = false,
    labelUp = "SUBE",
    labelDown = "BAJA",
    color = "blue"
}) => {
    const [phase, setPhase] = useState(0); // 0 = UP, 1 = DOWN

    useEffect(() => {
        let interval;
        if (isPlaying) {
            const beatDuration = 60000 / bpm;
            interval = setInterval(() => {
                setPhase((prev) => (prev === 0 ? 1 : 0));
            }, beatDuration);
        } else {
            setPhase(0);
        }
        return () => clearInterval(interval);
    }, [isPlaying, bpm]);

    const colors = {
        blue: { bg: 'bg-blue-500', shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.6)]' },
        green: { bg: 'bg-green-500', shadow: 'shadow-[0_0_30px_rgba(34,197,94,0.6)]' },
        purple: { bg: 'bg-purple-500', shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.6)]' },
        orange: { bg: 'bg-orange-500', shadow: 'shadow-[0_0_30px_rgba(249,115,22,0.6)]' },
    };

    const activeStyle = colors[color] || colors.blue;

    return (
        <div className="flex flex-col items-center justify-between h-full max-h-[500px] w-full max-w-xs mx-auto my-4 select-none relative">
            {/* Phase 1 Indicator (Usually UP) */}
            <div className={clsx(
                "w-full p-8 rounded-[32px] flex items-center justify-center transition-all duration-300 transform z-10",
                phase === 0 && isPlaying
                    ? `${activeStyle.bg} scale-105 ${activeStyle.shadow} text-white`
                    : "bg-slate-800 text-slate-500 opacity-40 scale-95"
            )}>
                <span className="text-4xl font-black tracking-widest uppercase">{labelUp}</span>
            </div>

            {/* Vertical Dots Animation */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2 w-full py-4 overflow-hidden relative opacity-50">
                {/* Background Dots */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-slate-700"></div>
                ))}

                {/* Falling/Rising Active Dot Animation */}
                {isPlaying && (
                    <div
                        className={clsx(
                            "absolute w-4 h-4 rounded-full bg-white shadow-[0_0_15px_white]",
                            "transition-all ease-linear"
                        )}
                        style={{
                            top: phase === 1 ? '100%' : '0%', // If phase is 1 (Down), we moved down. If 0 (Up), we moved up. 
                            transitionDuration: `${60000 / bpm}ms` // This might be too smooth/slow. User wanted "fast fill".
                            // Actually, metronome beats usually mean "hit this point at this time".
                            // If Phase 0 is "Start UP", Phase 1 is "End UP / Start DOWN".
                            // Let's try a simple ping oscillation or just keep the dots static for framing and animate the active state.
                        }}
                    ></div>
                )}
            </div>

            {/* Phase 2 Indicator (Usually DOWN) */}
            <div className={clsx(
                "w-full p-8 rounded-[32px] flex items-center justify-center transition-all duration-300 transform z-10",
                phase === 1 && isPlaying
                    ? `${activeStyle.bg} scale-105 ${activeStyle.shadow} text-white`
                    : "bg-slate-800 text-slate-500 opacity-40 scale-95"
            )}>
                <span className="text-4xl font-black tracking-widest uppercase">{labelDown}</span>
            </div>

            {!isPlaying && (
                <div className="text-slate-500 text-xs font-mono absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 py-1 rounded">
                    PAUSA
                </div>
            )}
        </div>
    );
};

export default VisualMetronome;
