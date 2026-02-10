interface ExplainersCardProps {
    signals: string[];
    explainers: string[];
}

// Map signals to icons
const SIGNAL_ICONS: Record<string, string> = {
    moon_harmony: "dark_mode",
    moon_distance: "dark_mode",
    mercury_support: "forum",
    mercury_distance: "forum",
    venus_mars_pull: "favorite",
    venus_mars_mixed: "favorite",
    saturn_pressure: "balance",
    saturn_support: "balance",
    manglik_flag_simple: "warning",
    "7th_lord_pressure": "home",
    "7th_lord_ok": "home",
};

// Map signals to colors
const SIGNAL_COLORS: Record<string, string> = {
    moon_harmony: "text-blue-400",
    moon_distance: "text-blue-300",
    mercury_support: "text-green-400",
    mercury_distance: "text-yellow-400",
    venus_mars_pull: "text-pink-400",
    venus_mars_mixed: "text-orange-400",
    saturn_pressure: "text-red-400",
    saturn_support: "text-green-400",
    manglik_flag_simple: "text-orange-500",
    "7th_lord_pressure": "text-red-400",
    "7th_lord_ok": "text-green-400",
};

export function ExplainersCard({ signals, explainers }: ExplainersCardProps) {
    return (
        <div className="glass-panel embossed-gold-border rounded-xl p-6 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 col-span-1 md:col-span-2 lg:col-span-3">
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 text-primary/5 rotate-12 transform scale-150 pointer-events-none group-hover:text-primary/10 transition-colors duration-500">
                <span className="material-symbols-outlined text-9xl">auto_awesome</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="p-3 bg-gradient-to-br from-primary/30 to-black rounded-lg border border-primary/40 text-primary shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                    <span className="material-symbols-outlined text-2xl">psychology</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                    {signals.length} Insights
                </span>
            </div>

            {/* Title */}
            <h3 className="font-serif text-2xl text-[#8b6914] dark:text-[#fce288] mb-2 relative z-10">
                Cosmic Insights
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed relative z-10 font-light italic">
                Detailed analysis based on planetary positions and house placements:
            </p>

            {/* Explainers list */}
            <div className="space-y-4 relative z-10">
                {explainers.map((explainer, index) => {
                    const signal = signals[index] || "default";
                    const icon = SIGNAL_ICONS[signal] || "star";
                    const color = SIGNAL_COLORS[signal] || "text-primary";

                    return (
                        <div
                            key={index}
                            className="flex items-start gap-4 p-4 bg-white/5 dark:bg-black/20 rounded-lg border border-white/10"
                        >
                            <span
                                className={`material-symbols-outlined text-xl mt-0.5 ${color}`}
                            >
                                {icon}
                            </span>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                {explainer}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 pt-4 border-t border-primary/20 relative z-10">
                <p className="text-[10px] text-gray-500 dark:text-gray-500 italic">
                    <strong>Note:</strong> These are indicator-based insights, not
                    traditional Ashtakoota/Guna Milan. They provide a modern lens on
                    planetary compatibility patterns.
                </p>
            </div>
        </div>
    );
}
