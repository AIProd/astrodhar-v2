import { DimensionScore } from "@/lib/types";

interface DimensionCardProps {
    title: string;
    dimension: DimensionScore;
    icon: string;
    colorClass: string;
}

export function DimensionCard({ title, dimension, icon, colorClass }: DimensionCardProps) {
    const score = dimension.score_100;
    const percentage = score;

    // Extract readable info from basis
    const getBasisInfo = (): string => {
        const basis = dimension.basis;
        if ("moon_signs" in basis) {
            const signs = basis.moon_signs as string[];
            return `${signs[0]} ↔ ${signs[1]}`;
        }
        if ("mercury_signs" in basis) {
            const signs = basis.mercury_signs as string[];
            return `${signs[0]} ↔ ${signs[1]}`;
        }
        if ("pairs" in basis) {
            const pairs = basis.pairs as [string, string][];
            return pairs.map(([a, b]) => `${a}↔${b}`).join(", ");
        }
        if ("saturn_pressure" in basis) {
            return basis.saturn_pressure ? "Pressure detected" : "Stable";
        }
        return "";
    };

    const basisInfo = getBasisInfo();

    return (
        <div className="glass-panel embossed-gold-border rounded-xl p-6 hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-8xl text-primary">
                    {icon}
                </span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div
                    className={`p-3 bg-gradient-to-br ${colorClass} rounded-lg border border-opacity-30 shadow-lg`}
                >
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                </div>
                <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${score >= 78
                            ? "text-green-400 bg-green-900/20 border border-green-500/20"
                            : score >= 62
                                ? "text-yellow-400 bg-yellow-900/20 border border-yellow-500/20"
                                : "text-red-400 bg-red-900/20 border border-red-500/20"
                        }`}
                >
                    {score}/100
                </span>
            </div>

            {/* Title */}
            <h3 className="font-serif text-xl text-[#8b6914] dark:text-[#fce288] mb-2 relative z-10">
                {title}
            </h3>

            {/* Basis info */}
            {basisInfo && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed relative z-10 font-light">
                    <span className="text-primary/60">Signs: </span>
                    {basisInfo}
                </p>
            )}

            {/* Progress bar */}
            <div className="relative z-10">
                <div className="flex justify-between mb-1 text-xs uppercase tracking-wider font-semibold">
                    <span className="text-primary/60">Harmony</span>
                    <span
                        className={
                            score >= 78
                                ? "text-green-300"
                                : score >= 62
                                    ? "text-yellow-300"
                                    : "text-red-300"
                        }
                    >
                        {percentage}%
                    </span>
                </div>
                <div className="h-1.5 bg-[#f0f0f0] dark:bg-[#1a0b2e] rounded-full overflow-hidden border border-white/5">
                    <div
                        className={`h-full transition-all duration-1000 ${score >= 78
                                ? "bg-gradient-to-r from-green-600 via-green-400 to-white shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                                : score >= 62
                                    ? "bg-gradient-to-r from-yellow-600 via-yellow-400 to-white shadow-[0_0_10px_rgba(234,179,8,0.8)]"
                                    : "bg-gradient-to-r from-red-600 via-red-400 to-white shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                            }`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
