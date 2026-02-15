"use client";

import { useState, useEffect, useRef } from "react";
import { BirthInputCard } from "@/components/BirthInputCard";
import { ChartCard } from "@/components/ChartCard";
import { TraitsChat } from "@/components/TraitsChat";
import { CosmicInsights } from "@/components/CosmicInsights";
import { BirthInput, VedicChart } from "@/lib/types";

// Pre-filled test data for quick testing
const testBirth = (): BirthInput => ({
    name: "Test User",
    date: "1995-05-15",
    time: "14:30",
    city: "Mumbai, Maharashtra",
    lat: 19.0760,
    lon: 72.8777,
    tz: "Asia/Kolkata",
});

const LOADING_PHASES = [
    { message: "Casting your kundli...", icon: "auto_awesome", delay: 0 },
    { message: "Reading planetary positions...", icon: "public", delay: 3000 },
    { message: "Analyzing your dashas...", icon: "timeline", delay: 8000 },
    { message: "Channeling cosmic wisdom...", icon: "psychology", delay: 15000 },
    { message: "Almost there — crafting your insights...", icon: "edit_note", delay: 25000 },
];

export default function TestTraitsPage() {
    const [birthData, setBirthData] = useState<BirthInput>(testBirth());
    const [chart, setChart] = useState<VedicChart | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showChart, setShowChart] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState(0);
    const timersRef = useRef<NodeJS.Timeout[]>([]);

    // Automatically calculate chart on mount
    useEffect(() => {
        handleCompute();
        return () => timersRef.current.forEach(clearTimeout);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCompute = async () => {
        setLoading(true);
        setError(null);
        setLoadingPhase(0);

        // Set up phased loading messages
        timersRef.current.forEach(clearTimeout);
        timersRef.current = LOADING_PHASES.slice(1).map((phase, i) =>
            setTimeout(() => setLoadingPhase(i + 1), phase.delay)
        );

        try {
            const res = await fetch("/api/chart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ birth: birthData }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || data.error || "Chart computation failed");
            }

            const data: VedicChart = await res.json();
            setChart(data);

            // Notify if LLM insights failed
            if (data.insights && data.insights.includes("temporarily unavailable")) {
                console.warn("⚠️  AI insights timed out - chart calculated successfully");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        }
    };

    const currentPhase = LOADING_PHASES[loadingPhase];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-serif text-4xl md:text-5xl text-[#8b6914] dark:text-gold-light mb-4">
                        Test: Personal Traits
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Pre-filled test data for quick testing. Auto-calculates on page load.
                    </p>
                </div>

                {/* Input Section */}
                {!chart && (
                    <div className="flex flex-col items-center gap-6 mb-12">
                        <BirthInputCard
                            label="Test User Details"
                            data={birthData}
                            onChange={setBirthData}
                            position="center"
                        />

                        {/* Compute Button */}
                        <button
                            onClick={handleCompute}
                            disabled={loading}
                            className="group px-8 py-4 rounded-full bg-gradient-to-r from-[#aa8220] to-[#d4af37] text-[#0a0518] text-lg font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_4px_30px_rgba(212,175,55,0.4)] hover:shadow-[0_4px_40px_rgba(212,175,55,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">
                                        progress_activity
                                    </span>
                                    Computing...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Compute My Chart
                                </>
                            )}
                        </button>

                        {/* Phased Loading Indicator */}
                        {loading && (
                            <div className="glass-panel embossed-gold-border rounded-xl p-6 max-w-md w-full animate-fadeIn">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary animate-pulse text-2xl">
                                        {currentPhase.icon}
                                    </span>
                                    <p className="text-gray-300 font-medium">
                                        {currentPhase.message}
                                    </p>
                                </div>
                                {/* Progress bar */}
                                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#aa8220] to-[#d4af37] rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(((loadingPhase + 1) / LOADING_PHASES.length) * 100, 95)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    First time may take 15-30 seconds
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-center">
                        <span className="material-symbols-outlined align-middle mr-2">
                            error
                        </span>
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {chart && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Summary Header */}
                        <div className="glass-panel embossed-gold-border rounded-xl p-6 text-center">
                            <h2 className="font-serif text-2xl text-[#8b6914] dark:text-[#fce288] mb-2">
                                Welcome, {chart.name || "Seeker"}
                            </h2>
                            <p className="text-gray-400">
                                <span className="text-primary">{chart.moon.nakshatra}</span> Nakshatra
                                • <span className="text-primary">{chart.ascendant.sign}</span> Ascendant
                            </p>
                            <button
                                onClick={() => {
                                    setChart(null);
                                    setBirthData(testBirth());
                                }}
                                className="mt-4 text-sm text-primary/60 hover:text-primary underline"
                            >
                                ← Reset to test data
                            </button>
                        </div>

                        {/* Cosmic Insights */}
                        <div className="max-w-4xl mx-auto">
                            <CosmicInsights insights={chart.insights} />
                        </div>

                        {/* Toggle Chart */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowChart(!showChart)}
                                className="px-6 py-2 bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">
                                    {showChart ? "visibility_off" : "visibility"}
                                </span>
                                {showChart ? "Hide" : "Show"} Full Chart
                            </button>
                        </div>

                        {/* Chart Display */}
                        {showChart && (
                            <div className="max-w-2xl mx-auto">
                                <ChartCard chart={chart} label="Your Birth Chart" />
                            </div>
                        )}

                        {/* AI Chat */}
                        <TraitsChat chart={chart} insights={chart.insights} />
                    </div>
                )}
            </div>
        </div>
    );
}
