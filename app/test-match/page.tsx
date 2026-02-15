"use client";

import { useState, useEffect, useRef } from "react";
import { BirthInputCard } from "@/components/BirthInputCard";
import { ScoreRing } from "@/components/ScoreRing";
import { DimensionCard } from "@/components/DimensionCard";
import { ExplainersCard } from "@/components/ExplainersCard";
import { ChartCard } from "@/components/ChartCard";
import { GunaCard } from "@/components/GunaCard";
import { MatchChat } from "@/components/MatchChat";
import { CosmicInsights } from "@/components/CosmicInsights";
import { BirthInput, CompatibilityResponse } from "@/lib/types";

// Pre-filled test data for quick testing
const testPartnerA = (): BirthInput => ({
    name: "Partner A",
    date: "1995-01-15",
    time: "14:30",
    city: "Mumbai, Maharashtra",
    lat: 19.0760,
    lon: 72.8777,
    tz: "Asia/Kolkata",
});

const testPartnerB = (): BirthInput => ({
    name: "Partner B",
    date: "1997-03-22",
    time: "09:15",
    city: "Delhi, NCT",
    lat: 28.6139,
    lon: 77.2090,
    tz: "Asia/Kolkata",
});

const LOADING_PHASES = [
    { message: "Casting both kundlis...", icon: "auto_awesome", delay: 0 },
    { message: "Reading planetary positions...", icon: "public", delay: 3000 },
    { message: "Comparing Guna scores...", icon: "compare", delay: 8000 },
    { message: "Analyzing compatibility dimensions...", icon: "psychology", delay: 15000 },
    { message: "Almost there — crafting your insights...", icon: "edit_note", delay: 25000 },
];

export default function TestMatchPage() {
    const [partnerA, setPartnerA] = useState<BirthInput>(testPartnerA());
    const [partnerB, setPartnerB] = useState<BirthInput>(testPartnerB());
    const [result, setResult] = useState<CompatibilityResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCharts, setShowCharts] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState(0);
    const timersRef = useRef<NodeJS.Timeout[]>([]);

    // Automatically calculate compatibility on mount
    useEffect(() => {
        handleAnalyze();
        return () => timersRef.current.forEach(clearTimeout);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        setLoadingPhase(0);

        // Set up phased loading messages
        timersRef.current.forEach(clearTimeout);
        timersRef.current = LOADING_PHASES.slice(1).map((phase, i) =>
            setTimeout(() => setLoadingPhase(i + 1), phase.delay)
        );

        try {
            const res = await fetch("/api/compatibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partnerA, partnerB }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || data.error || "Analysis failed");
            }

            const data: CompatibilityResponse = await res.json();
            setResult(data);
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-serif text-4xl md:text-5xl text-[#8b6914] dark:text-gold-light mb-4">
                        Test: Compatibility Analysis
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Pre-filled test data for both partners. Auto-calculates on page load.
                    </p>
                </div>

                {/* Input Cards — Mobile: stacked; Desktop: side by side with button in center */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 mb-4 lg:mb-12">
                    <BirthInputCard
                        label="Partner A (Test)"
                        data={partnerA}
                        onChange={setPartnerA}
                        position="left"
                    />

                    {/* Desktop-only circular button between cards */}
                    <div className="hidden lg:flex flex-shrink-0 relative z-10 flex-col items-center">
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="group w-28 h-28 rounded-full bg-gradient-to-br from-primary via-gold-light to-primary border-4 border-primary/50 shadow-gold-glow hover:scale-110 transition-all duration-300 flex items-center justify-center gold-shimmer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined text-4xl text-[#1a0b2e] animate-spin">
                                    progress_activity
                                </span>
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-[#1a0b2e] group-hover:scale-110 transition-transform">
                                    bolt
                                </span>
                            )}
                        </button>
                        <p className="text-center mt-2 text-[10px] uppercase tracking-widest text-primary/60 font-bold">
                            Compute
                        </p>
                    </div>

                    <BirthInputCard
                        label="Partner B (Test)"
                        data={partnerB}
                        onChange={setPartnerB}
                        position="right"
                    />
                </div>

                {/* Mobile-only compute button — full width, below both cards */}
                <div className="lg:hidden flex flex-col items-center gap-4 mb-8 mt-4">
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="group w-full max-w-md px-8 py-4 rounded-full bg-gradient-to-r from-[#aa8220] to-[#d4af37] text-[#0a0518] text-lg font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_4px_30px_rgba(212,175,55,0.4)] hover:shadow-[0_4px_40px_rgba(212,175,55,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
                                Compute Compatibility
                            </>
                        )}
                    </button>
                </div>

                {/* Phased Loading Indicator */}
                {loading && (
                    <div className="max-w-md mx-auto mb-8 glass-panel embossed-gold-border rounded-xl p-6 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="material-symbols-outlined text-primary animate-pulse text-2xl">
                                {currentPhase.icon}
                            </span>
                            <p className="text-gray-600 dark:text-gray-300 font-medium">
                                {currentPhase.message}
                            </p>
                        </div>
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
                {result && (
                    <div className="mt-16 space-y-16 animate-fadeIn">
                        {/* Cosmic Insights */}
                        <div className="max-w-4xl mx-auto">
                            <CosmicInsights insights={result.insights} />
                        </div>

                        {/* Two Score Cards - Side by Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {/* Indicator Score */}
                            <div className="flex flex-col items-center">
                                <h2 className="font-serif text-xl text-center text-[#8b6914] dark:text-gold-light mb-4">
                                    Indicator Score
                                </h2>
                                <ScoreRing
                                    score={result.compatibility.overall_score_100}
                                    maxScore={100}
                                    label={result.compatibility.label}
                                />
                            </div>

                            {/* Guna Score */}
                            <div className="flex flex-col items-center">
                                <h2 className="font-serif text-xl text-center text-[#8b6914] dark:text-gold-light mb-4">
                                    Guna Milan Score
                                </h2>
                                <ScoreRing
                                    score={result.guna.total_points}
                                    maxScore={36}
                                    label={result.guna.verdict}
                                />
                            </div>
                        </div>

                        {/* Toggle Charts */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowCharts(!showCharts)}
                                className="px-6 py-2 bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">
                                    {showCharts ? "visibility_off" : "visibility"}
                                </span>
                                {showCharts ? "Hide" : "Show"} Birth Charts
                            </button>
                        </div>

                        {/* Birth Charts */}
                        {showCharts && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <ChartCard chart={result.charts.partnerA} label="Partner A" />
                                <ChartCard chart={result.charts.partnerB} label="Partner B" />
                            </div>
                        )}

                        {/* Guna Matching Details */}
                        <div>
                            <h2 className="font-serif text-2xl text-center text-[#8b6914] dark:text-gold-light mb-8">
                                Ashtakoota Guna Matching
                            </h2>
                            <div className="max-w-3xl mx-auto">
                                <GunaCard guna={result.guna} />
                            </div>
                        </div>

                        {/* Dimension Cards */}
                        <div>
                            <h2 className="font-serif text-2xl text-center text-[#8b6914] dark:text-gold-light mb-8">
                                Compatibility Dimensions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <DimensionCard
                                    title="Emotional"
                                    dimension={result.compatibility.dimensions.emotional}
                                    icon="self_improvement"
                                    colorClass="from-blue-600/30 to-blue-900/50 text-blue-300 border-blue-500"
                                />
                                <DimensionCard
                                    title="Communication"
                                    dimension={result.compatibility.dimensions.communication}
                                    icon="forum"
                                    colorClass="from-green-600/30 to-green-900/50 text-green-300 border-green-500"
                                />
                                <DimensionCard
                                    title="Attraction"
                                    dimension={result.compatibility.dimensions.attraction}
                                    icon="favorite"
                                    colorClass="from-pink-600/30 to-pink-900/50 text-pink-300 border-pink-500"
                                />
                                <DimensionCard
                                    title="Stability"
                                    dimension={result.compatibility.dimensions.stability}
                                    icon="balance"
                                    colorClass="from-amber-600/30 to-amber-900/50 text-amber-300 border-amber-500"
                                />
                            </div>
                        </div>

                        {/* Explainers */}
                        <div>
                            <h2 className="font-serif text-2xl text-center text-[#8b6914] dark:text-gold-light mb-8">
                                Detailed Insights
                            </h2>
                            <div className="grid grid-cols-1">
                                <ExplainersCard
                                    signals={result.compatibility.signals}
                                    explainers={result.compatibility.explainers}
                                />
                            </div>
                        </div>

                        {/* Chat Section for Remedies */}
                        <div>
                            <h2 className="font-serif text-2xl text-center text-[#8b6914] dark:text-gold-light mb-8">
                                Guidance & Remedies
                            </h2>
                            <div className="max-w-3xl mx-auto">
                                <MatchChat result={result} />
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="max-w-3xl mx-auto text-center p-6 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                <strong>Disclaimer:</strong> This analysis uses both
                                indicator-based metrics and traditional Ashtakoota Guna Milan.
                                Results are for entertainment and educational purposes. Major
                                life decisions should involve qualified professionals and
                                personal judgment.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
