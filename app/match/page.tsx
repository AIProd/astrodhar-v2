"use client";

import { useState } from "react";
import { BirthInputCard } from "@/components/BirthInputCard";
import { ScoreRing } from "@/components/ScoreRing";
import { DimensionCard } from "@/components/DimensionCard";
import { ExplainersCard } from "@/components/ExplainersCard";
import { ChartCard } from "@/components/ChartCard";
import { GunaCard } from "@/components/GunaCard";
import { MatchChat } from "@/components/MatchChat";
import { CosmicInsights } from "@/components/CosmicInsights";
import { BirthInput, CompatibilityResponse } from "@/lib/types";

const defaultBirth = (): BirthInput => ({
    name: "",
    date: "",
    time: "",
    tz: "Asia/Kolkata",
    lat: 0,
    lon: 0,
    city: "",
});

export default function MatchPage() {
    const [partnerA, setPartnerA] = useState<BirthInput>(defaultBirth());
    const [partnerB, setPartnerB] = useState<BirthInput>(defaultBirth());
    const [result, setResult] = useState<CompatibilityResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCharts, setShowCharts] = useState(false);

    // New state for accordion and deferred insights
    const [activeSection, setActiveSection] = useState<string | null>("guna");
    const [insightsStage, setInsightsStage] = useState<"initial" | "loading" | "loaded">("initial");
    const [insightsError, setInsightsError] = useState<string | null>(null);

    const isValid = (b: BirthInput) =>
        b.name.trim() && b.date && b.time && b.lat !== 0 && b.lon !== 0;

    const handleAnalyze = async () => {
        if (!isValid(partnerA) || !isValid(partnerB)) {
            setError(
                "Please fill in all fields for both partners, including city selection."
            );
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setInsightsStage("initial"); // Reset AI stage

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
            // Scroll to results
            setTimeout(() => {
                document.getElementById("results-start")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleUnlockInsights = async () => {
        if (!result) return;
        setInsightsStage("loading");
        setInsightsError(null);

        try {
            const res = await fetch("/api/compatibility/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partnerA, partnerB }),
            });

            if (!res.ok) {
                throw new Error("Failed to fetch cosmic insights");
            }

            const data = await res.json();
            setResult(prev => prev ? { ...prev, insights: data.insights } : null);
            setInsightsStage("loaded");

            // Scroll to insights
            setTimeout(() => {
                document.getElementById("insights-start")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (err) {
            setInsightsStage("initial");
            setInsightsError("Failed to connect to the cosmic source. Please try again.");
        }
    };

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-serif text-4xl md:text-5xl text-[#8b6914] dark:text-gold-light mb-4">
                        Compatibility Analysis
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Enter birth details for both partners to receive a detailed analysis
                        based on Vedic planetary positions and traditional Guna matching.
                    </p>
                </div>

                {/* Input Cards */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 mb-12">
                    <BirthInputCard
                        label="Partner A"
                        data={partnerA}
                        onChange={setPartnerA}
                        position="left"
                    />

                    {/* Analyze Button */}
                    <div className="flex-shrink-0 relative z-10">
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="group w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-primary via-gold-light to-primary border-4 border-primary/50 shadow-gold-glow hover:scale-110 transition-all duration-300 flex items-center justify-center gold-shimmer disabled:opacity-50 disabled:cursor-not-allowed"
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
                            Analyze
                        </p>
                    </div>

                    <BirthInputCard
                        label="Partner B"
                        data={partnerB}
                        onChange={setPartnerB}
                        position="right"
                    />
                </div>

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
                    <div id="results-start" className="mt-16 space-y-8 animate-fadeIn">

                        {/* Two Score Cards - Side by Side (Always Visible) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
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

                        {/* Accordion Sections */}
                        <div className="max-w-4xl mx-auto space-y-4">

                            {/* Guna Matching Details */}
                            <CollapsibleSection
                                title="Ashtakoota Guna Details"
                                isOpen={activeSection === "guna"}
                                onToggle={() => toggleSection("guna")}
                            >
                                <GunaCard guna={result.guna} />
                            </CollapsibleSection>

                            {/* Compatibility Dimensions */}
                            <CollapsibleSection
                                title="Compatibility Dimensions"
                                isOpen={activeSection === "dimensions"}
                                onToggle={() => toggleSection("dimensions")}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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
                            </CollapsibleSection>

                            {/* Planetary Signals */}
                            <CollapsibleSection
                                title="Planetary Signals"
                                isOpen={activeSection === "signals"}
                                onToggle={() => toggleSection("signals")}
                            >
                                <div className="pt-2">
                                    <ExplainersCard
                                        signals={result.compatibility.signals}
                                        explainers={result.compatibility.explainers}
                                    />
                                </div>
                            </CollapsibleSection>

                            {/* Birth Charts */}
                            <CollapsibleSection
                                title="Birth Charts"
                                isOpen={activeSection === "charts"}
                                onToggle={() => toggleSection("charts")}
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                                    <ChartCard chart={result.charts.partnerA} label="Partner A" />
                                    <ChartCard chart={result.charts.partnerB} label="Partner B" />
                                </div>
                            </CollapsibleSection>
                        </div>

                        {/* AI Section / Call to Action */}
                        <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-primary/20">
                            {insightsStage === "initial" && (
                                <div className="text-center py-12 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl border border-primary/10">
                                    <span className="material-symbols-outlined text-5xl text-gold-3d mb-4 animate-pulse">
                                        auto_awesome
                                    </span>
                                    <h3 className="font-serif text-3xl text-[#8b6914] dark:text-gold-light mb-4">
                                        Unlock Cosmic Wisdom
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                                        Go beyond the numbers. Consult the AI Vedic Astrologer for a detailed
                                        relationship analysis, psychological compatibility, and personalized remedies.
                                    </p>
                                    <button
                                        onClick={handleUnlockInsights}
                                        className="px-8 py-4 bg-gradient-to-r from-[#1a0b2e] to-[#4a2b7e] hover:to-[#5a3b8e] border border-primary/50 rounded-full text-gold-light font-bold tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] transition-all duration-300 flex items-center gap-3 mx-auto"
                                    >
                                        <span className="material-symbols-outlined">psychology</span>
                                        Reveal Detailed Insights
                                    </button>
                                    {insightsError && (
                                        <p className="text-red-400 mt-4 text-sm">{insightsError}</p>
                                    )}
                                </div>
                            )}

                            {insightsStage === "loading" && (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 mx-auto mb-6 relative">
                                        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
                                        <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-3xl text-primary animate-pulse">
                                            auto_awesome
                                        </span>
                                    </div>
                                    <h3 className="font-serif text-2xl text-gold-light mb-2">
                                        Consulting the Stars...
                                    </h3>
                                    <p className="text-primary/60 text-sm animate-pulse">
                                        Analyzing planetary aspects and nakshatra compatibility
                                    </p>
                                </div>
                            )}

                            {insightsStage === "loaded" && result.insights && (
                                <div id="insights-start" className="animate-fadeIn space-y-12">
                                    {/* Cosmic Insights */}
                                    <CosmicInsights insights={result.insights} />

                                    {/* Chat Section */}
                                    <div>
                                        <h2 className="font-serif text-2xl text-center text-[#8b6914] dark:text-gold-light mb-8">
                                            Guidance & Remedies
                                        </h2>
                                        <div className="max-w-3xl mx-auto">
                                            <MatchChat result={result} />
                                        </div>
                                    </div>
                                </div>
                            )}
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

import { CollapsibleSection } from "@/components/CollapsibleSection";
