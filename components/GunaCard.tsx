interface GunaKoota {
    points: number;
    max: number;
    description: string;
}

interface GunaResult {
    total_points: number;
    max_points: number;
    percentage: number;
    kootas: {
        varna: GunaKoota;
        vashya: GunaKoota;
        tara: GunaKoota;
        yoni: GunaKoota;
        graha_maitri: GunaKoota;
        gana: GunaKoota;
        bhakoot: GunaKoota;
        nadi: GunaKoota;
    };
    verdict: string;
}

interface GunaCardProps {
    guna: GunaResult;
}

const KOOTA_NAMES: Record<string, string> = {
    varna: "Varna",
    vashya: "Vashya",
    tara: "Tara",
    yoni: "Yoni",
    graha_maitri: "Graha Maitri",
    gana: "Gana",
    bhakoot: "Bhakoot",
    nadi: "Nadi",
};

const KOOTA_ICONS: Record<string, string> = {
    varna: "diversity_3",
    vashya: "handshake",
    tara: "star",
    yoni: "pets",
    graha_maitri: "group",
    gana: "psychology",
    bhakoot: "calendar_month",
    nadi: "bloodtype",
};

function getScoreColor(points: number, max: number): string {
    const ratio = points / max;
    if (ratio >= 0.8) return "text-green-400";
    if (ratio >= 0.5) return "text-yellow-400";
    return "text-red-400";
}

function getProgressColor(points: number, max: number): string {
    const ratio = points / max;
    if (ratio >= 0.8) return "bg-green-500";
    if (ratio >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
}

export function GunaCard({ guna }: GunaCardProps) {
    return (
        <div className="glass-panel embossed-gold-border rounded-xl p-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-serif text-xl text-[#8b6914] dark:text-[#fce288]">
                        Ashtakoota Guna Milan
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Traditional 36-Point Matching
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                        {guna.total_points}
                        <span className="text-lg text-primary/60">/{guna.max_points}</span>
                    </div>
                    <div
                        className={`text-sm font-medium ${guna.total_points >= 21 ? "text-green-400" : guna.total_points >= 14 ? "text-yellow-400" : "text-red-400"
                            }`}
                    >
                        {guna.verdict}
                    </div>
                </div>
            </div>

            {/* Overall progress bar */}
            <div className="mb-6">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${guna.total_points >= 21 ? "bg-green-500" : guna.total_points >= 14 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                        style={{ width: `${guna.percentage}%` }}
                    />
                </div>
                <p className="text-center text-xs text-gray-500 mt-1">
                    {guna.percentage}% compatibility
                </p>
            </div>

            {/* Kootas grid */}
            <div className="grid grid-cols-2 gap-3">
                {Object.entries(guna.kootas).map(([key, koota]) => (
                    <div
                        key={key}
                        className="bg-white/5 dark:bg-black/20 rounded-lg p-3 border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary/60 text-sm">
                                    {KOOTA_ICONS[key]}
                                </span>
                                <span className="text-xs font-medium text-gray-300">
                                    {KOOTA_NAMES[key]}
                                </span>
                            </div>
                            <span className={`text-sm font-bold ${getScoreColor(koota.points, koota.max)}`}>
                                {koota.points}/{koota.max}
                            </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                            <div
                                className={`h-full transition-all duration-300 ${getProgressColor(koota.points, koota.max)}`}
                                style={{ width: `${(koota.points / koota.max) * 100}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 truncate" title={koota.description}>
                            {koota.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-center gap-6 text-[10px] text-gray-500">
                <span>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    ≥18 Good
                </span>
                <span>
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                    14-17 Average
                </span>
                <span>
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                    &lt;14 Low
                </span>
            </div>
        </div>
    );
}
