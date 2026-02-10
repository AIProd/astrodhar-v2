import { BreakdownItem } from "@/lib/types";

interface ResultCardProps {
    item: BreakdownItem;
    icon: string;
    colorClass: string;
}

export function ResultCard({ item, icon, colorClass }: ResultCardProps) {
    const percentage = Math.round((item.score / item.maxScore) * 100);

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
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-900/20 border border-green-500/20 px-2 py-1 rounded">
                    {item.score}/{item.maxScore}
                </span>
            </div>

            {/* Title */}
            <h3 className="font-serif text-xl text-[#8b6914] dark:text-[#fce288] mb-2 relative z-10">
                {item.label}
            </h3>

            {/* Insight */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed relative z-10 font-light">
                {item.insight}
            </p>

            {/* Progress bar */}
            <div className="relative z-10">
                <div className="flex justify-between mb-1 text-xs uppercase tracking-wider font-semibold">
                    <span className="text-primary/60">Harmony Score</span>
                    <span className={colorClass.includes("blue") ? "text-blue-300" : colorClass.includes("purple") ? "text-purple-300" : "text-green-300"}>
                        {percentage}%
                    </span>
                </div>
                <div className="h-1.5 bg-[#f0f0f0] dark:bg-[#1a0b2e] rounded-full overflow-hidden border border-white/5">
                    <div
                        className={`h-full bg-gradient-to-r ${colorClass.includes("blue")
                                ? "from-blue-600 via-blue-400 to-white shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                                : colorClass.includes("purple")
                                    ? "from-purple-600 via-purple-400 to-white shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                                    : "from-green-600 via-green-400 to-white shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                            } transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
