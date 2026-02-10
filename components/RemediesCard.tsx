interface RemediesCardProps {
    remedies: string[];
}

export function RemediesCard({ remedies }: RemediesCardProps) {
    return (
        <div className="glass-panel embossed-gold-border rounded-xl p-6 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 bg-gradient-to-b from-[#f8f8f6]/80 dark:from-[#1a0b2e]/80 to-white/90 dark:to-[#0a0518]/90">
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 text-primary/5 rotate-12 transform scale-150 pointer-events-none group-hover:text-primary/10 transition-colors duration-500">
                <span className="material-symbols-outlined text-9xl">temple_hindu</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-primary/30 to-black rounded-lg border border-primary/40 text-primary shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                    <span className="material-symbols-outlined text-2xl">
                        self_improvement
                    </span>
                </div>
            </div>

            {/* Title */}
            <h3 className="font-serif text-xl text-[#8b6914] dark:text-[#fce288] mb-2 relative z-10">
                Vedic Remedies
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed relative z-10 font-light italic">
                To strengthen the bond and mitigate minor conflicts:
            </p>

            {/* Remedies list */}
            <ul className="space-y-3 relative z-10 mb-6">
                {remedies.map((remedy, index) => (
                    <li
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                    >
                        <span className="material-symbols-outlined text-primary text-base mt-0.5">
                            check_circle
                        </span>
                        <span>{remedy}</span>
                    </li>
                ))}
            </ul>

            {/* CTA Button */}
            <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#aa8220] to-[#d4af37] text-[#0a0518] text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)] relative z-10">
                View Full Report
            </button>
        </div>
    );
}
