import { VedicChart } from "@/lib/types";

interface ChartCardProps {
    chart: VedicChart;
    label: string;
}

export function ChartCard({ chart, label }: ChartCardProps) {
    return (
        <div className="glass-panel embossed-gold-border rounded-xl p-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl text-[#8b6914] dark:text-[#fce288]">
                    {chart.name || label}&apos;s Chart
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 bg-primary/10 border border-primary/20 px-2 py-1 rounded">
                    {chart.ayanamsa.type}
                </span>
            </div>

            {/* Ascendant & Moon */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 dark:bg-black/20 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-primary/60 uppercase tracking-wider mb-1">
                        Ascendant (Lagna)
                    </p>
                    <p className="font-serif text-lg text-gray-800 dark:text-white">
                        {chart.ascendant.sign}
                    </p>
                    <p className="text-xs text-gray-500">
                        {chart.ascendant.degree_in_sign.toFixed(1)}°
                    </p>
                </div>
                <div className="bg-white/5 dark:bg-black/20 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-primary/60 uppercase tracking-wider mb-1">
                        Moon Nakshatra
                    </p>
                    <p className="font-serif text-lg text-gray-800 dark:text-white">
                        {chart.moon.nakshatra}
                    </p>
                    <p className="text-xs text-gray-500">Pada {chart.moon.pada}</p>
                </div>
            </div>

            {/* Planets Grid */}
            <div className="space-y-1">
                <p className="text-[10px] text-primary/60 uppercase tracking-wider mb-2">
                    Planet Positions
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                    {chart.planets.map((planet) => (
                        <div
                            key={planet.name}
                            className="flex items-center justify-between bg-white/5 dark:bg-black/20 rounded px-2 py-1.5 border border-white/5"
                        >
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                {planet.name.substring(0, 3)}
                                {planet.retrograde && (
                                    <span className="text-red-400 ml-0.5">®</span>
                                )}
                            </span>
                            <span className="text-gray-800 dark:text-white">
                                {planet.sign.substring(0, 3)} {planet.degree_in_sign.toFixed(0)}°
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer info */}
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] text-gray-500">
                <span>Ayanamsa: {chart.ayanamsa.value_deg.toFixed(2)}°</span>
                <span>{chart.house_system} houses</span>
            </div>
        </div>
    );
}
