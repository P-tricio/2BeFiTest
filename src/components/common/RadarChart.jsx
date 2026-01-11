import React, { useMemo } from 'react';
import clsx from 'clsx';

const RadarChart = ({ data, size = 300 }) => {
    // Data structure: { label, value, color }
    // Value should be normalized 0-100

    const radius = size / 2;
    const center = size / 2;
    const scale = radius - 40; // Padding

    // Calculate points
    const points = useMemo(() => {
        const total = data.length;
        const angleStep = (Math.PI * 2) / total;

        return data.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2; // Start at top
            // Axis Point (Max)
            const xMax = center + Math.cos(angle) * scale;
            const yMax = center + Math.sin(angle) * scale;

            // Value Point
            const valueScale = (item.value / 100) * scale;
            const x = center + Math.cos(angle) * valueScale;
            const y = center + Math.sin(angle) * valueScale;

            return { ...item, x, y, xMax, yMax, angle };
        });
    }, [data, center, scale]);

    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="relative flex justify-center items-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Grid (Concentric Pentagons/Polygons) */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((step, i) => (
                    <polygon
                        key={i}
                        points={points.map(p => {
                            const val = step * scale;
                            const x = center + Math.cos(p.angle) * val;
                            const y = center + Math.sin(p.angle) * val;
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#e2e8f0" // slate-200
                        strokeWidth="1"
                        className={i === 4 ? "stroke-slate-300" : ""}
                    />
                ))}

                {/* Axes */}
                {points.map((p, i) => (
                    <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={p.xMax}
                        y2={p.yMax}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                    />
                ))}

                {/* Data Area */}
                <polygon
                    points={polygonPoints}
                    fill="rgba(59, 130, 246, 0.2)" // blue-500 @ 20%
                    stroke="#3b82f6"
                    strokeWidth="2"
                    className="drop-shadow-lg"
                />

                {/* Data Points */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="white"
                        stroke="#3b82f6"
                        strokeWidth="2"
                    />
                ))}

                {/* Labels/Icons */}
                {points.map((p, i) => {
                    // Position label slightly outside axis tip
                    const labelX = center + Math.cos(p.angle) * (scale + 30);
                    const labelY = center + Math.sin(p.angle) * (scale + 30);
                    const Icon = p.icon;

                    return (
                        <foreignObject
                            key={i}
                            x={labelX - 20}
                            y={labelY - 20}
                            width="40"
                            height="40"
                            className="overflow-visible"
                        >
                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-white", p.color)}>
                                {Icon && <Icon size={18} />}
                            </div>
                        </foreignObject>
                    );
                })}
            </svg>
        </div>
    );
};

export default RadarChart;
