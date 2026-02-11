"use client";

import { useState, useEffect } from "react";
import { BirthInputCard } from "@/components/BirthInputCard";
import { ScoreRing } from "@/components/ScoreRing";
import { DimensionCard } from "@/components/DimensionCard";
import { ExplainersCard } from "@/components/ExplainersCard";
import { ChartCard } from "@/components/ChartCard";
import { GunaCard } from "@/components/GunaCard";
import { MatchChat } from "@/components/MatchChat";
import { CosmicInsights } from "@/components/CosmicInsights";
import { CollapsibleSection } from "@/components/CollapsibleSection";
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
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCharts, setShowCharts] = useState(false);

    // Accordion state: "scores", "analysis", "guidance", or null
    const [openSection, setOpenSection] = useState<string | null>("scores");

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
        setResult(null); // Clear previous results

        try {
            // First step: Fast analysis (skip insights)
            const res = await fetch("/api/compatibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    partnerA,
                    partnerB,
                    skip_insights: true
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || data.error || "Analysis failed");
            }

            const data: CompatibilityResponse = await res.json();
            setResult(data);
            setOpenSection("scores"); // Auto-open scores

            // Scroll to results
            setTimeout(() => {
                const resultsElement = document.getElementById("results-container");
                if (resultsElement) {
                    resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 100);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleGetInsights = async () => {
        if (!result) return;

        setInsightsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/insights/compatibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partnerA, partnerB }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || data.error || "Insights generation failed");
            }

            const data = await res.json();

            // Merge the new insights into the existing result
            setResult(prev => {
                if (!prev) return data;
                return {
                    ...prev,
                    insights: data.llm_insights, // The endpoint returns "llm_insights" 
                };
            });

            setOpenSection("guidance"); // Auto-open guidance section

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load insights");
        } finally {
            setInsightsLoading(false);
        }
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
                    <div id="results-container" className="mt-8 space-y-6 animate-fadeIn max-w-4xl mx-auto">

                        {/* SECTION 1: Compatibility Scores */}
                        <CollapsibleSection
                            title="Compatibility Scores"
                            icon="query_stats"
                            isOpen={openSection === "scores"}
                            onToggle={() => setOpenSection(openSection === "scores" ? null : "scores")}
                        >
                            <div className="py-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Indicator Score */}
                                    <div className="flex flex-col items-center">
                                        <h2 className="font-serif text-lg text-center text-[#8b6914] dark:text-gold-light mb-4">
                                            Vedic Indicator Score
                                        </h2>
                                        <div className="scale-90 transform -mt-4">
                                            <ScoreRing
                                                score={result.compatibility.overall_score_100}
                                                maxScore={100}
                                                label={result.compatibility.label}
                                            />
                                        </div>
                                    </div>

                                    {/* Guna Score */}
                                    <div className="flex flex-col items-center">
                                        <h2 className="font-serif text-lg text-center text-[#8b6914] dark:text-gold-light mb-4">
                                            Ashtakoota Guna Milan
                                        </h2>
                                        <div className="scale-90 transform -mt-4">
                                            <ScoreRing
                                                score={result.guna.total_points}
                                                maxScore={36}
                                                label={result.guna.verdict}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Toggle Charts */}
                                <div className="flex justify-center mt-2 mb-4">
                                    <button
                                        onClick={() => setShowCharts(!showCharts)}
                                        className="px-4 py-2 text-sm bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-full text-primary transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {showCharts ? "visibility_off" : "visibility"}
                                        </span>
                                        {showCharts ? "Hide" : "Show"} Birth Charts
                                    </button>
                                </div>

                                {/* Birth Charts */}
                                {showCharts && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 animate-fadeIn">
                                        <ChartCard chart={result.charts.partnerA} label="Partner A" />
                                        <ChartCard chart={result.charts.partnerB} label="Partner B" />
                                    </div>
                                )}
                            </div>
                        </CollapsibleSection>

                        {/* SECTION 2: Detailed Analysis */}
                        <CollapsibleSection
                            title="Detailed Analysis"
                            icon="analytics"
                            isOpen={openSection === "analysis"}
                            onToggle={() => setOpenSection(openSection === "analysis" ? null : "analysis")}
                        >
                            <div className="py-6 space-y-10">
                                {/* Dimension Cards */}
                                <div>
                                    <h3 className="font-serif text-xl text-center text-[#8b6914] dark:text-gold-light mb-6">
                                        Compatibility Dimensions
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                {/* Guna Matching Details */}
                                <div>
                                    <h3 className="font-serif text-xl text-center text-[#8b6914] dark:text-gold-light mb-6">
                                        Guna Breakdown
                                    </h3>
                                    <GunaCard guna={result.guna} />
                                </div>

                                {/* Explainers */}
                                <div>
                                    <h3 className="font-serif text-xl text-center text-[#8b6914] dark:text-gold-light mb-6">
                                        Key Observations
                                    </h3>
                                    <ExplainersCard
                                        signals={result.compatibility.signals}
                                        explainers={result.compatibility.explainers}
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* SECTION 3: Cosmic Guidance (AI) */}
                        <CollapsibleSection
                            title="Cosmic Guidance"
                            icon="auto_awesome"
                            isOpen={openSection === "guidance"}
                            onToggle={() => setOpenSection(openSection === "guidance" ? null : "guidance")}
                            className={!result.insights ? "border-primary/60 shadow-[0_0_15px_rgba(212,175,55,0.2)]" : ""}
                        >
                            <div className="py-6">
                                {!result.insights ? (
                                    <div className="text-center py-8">
                                        <span className="material-symbols-outlined text-5xl text-primary mb-4 animate-pulse">
                                            psychology_alt
                                        </span>
                                        <h3 className="font-serif text-2xl text-[#8b6914] dark:text-gold-light mb-3">
                                            Unlock Cosmic Wisdom
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                                            Get a detailed AI-powered analysis of your relationship dynamics,
                                            potential challenges, and personalized remedies.
                                        </p>
                                        <button
                                            onClick={handleGetInsights}
                                            disabled={insightsLoading}
                                            className="px-8 py-3 bg-gradient-to-r from-primary via-[#b8860b] to-primary text-[#1a0b2e] font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {insightsLoading ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin">
                                                        progress_activity
                                                    </span>
                                                    Consulting the Stars...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined">
                                                        auto_awesome
                                                    </span>
                                                    Reveal Insights & Remedies
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-10 animate-fadeIn">
                                        <CosmicInsights insights={result.insights} />

                                        <div>
                                            <h3 className="font-serif text-xl text-center text-[#8b6914] dark:text-gold-light mb-6">
                                                Ask the Stars
                                            </h3>
                                            <MatchChat result={result} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CollapsibleSection>

                        {/* Disclaimer */}
                        <div className="max-w-3xl mx-auto text-center p-6 bg-primary/5 border border-primary/20 rounded-lg mt-8">
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
