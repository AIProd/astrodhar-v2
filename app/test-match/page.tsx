"use client";

import { useState, useEffect } from "react";
import { BirthInputCard } from "@/components/BirthInputCard";
import { ScoreRing } from "@/components/ScoreRing";
import { DimensionCard } from "@/components/DimensionCard";
import { ChartCard } from "@/components/ChartCard";
import { GunaCard } from "@/components/GunaCard";
import { MatchChat } from "@/components/MatchChat";
import { CosmicInsights } from "@/components/CosmicInsights";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { BirthInput, CompatibilityResponse } from "@/lib/types";

// Pre-filled test data
const testPartnerA = (): BirthInput => ({
    name: "Partner A",
    date: "1995-01-15",
    time: "14:30",
    city: "Mumbai, Maharashtra",
    lat: 19.076,
    lon: 72.8777,
    tz: "Asia/Kolkata",
});

const testPartnerB = (): BirthInput => ({
    name: "Partner B",
    date: "1997-03-22",
    time: "09:15",
    city: "Delhi, NCT",
    lat: 28.6139,
    lon: 77.209,
    tz: "Asia/Kolkata",
});

export default function TestMatchPage() {
    const [partnerA, setPartnerA] = useState<BirthInput>(testPartnerA());
    const [partnerB, setPartnerB] = useState<BirthInput>(testPartnerB());
    const [result, setResult] = useState<CompatibilityResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Phase 2: AI Insights
    const [insights, setInsights] = useState<string | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(false);

    // Auto-compute on mount
    useEffect(() => {
        handleCompute();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCompute = async () => {
        setLoading(true);
        setError(null);
        setInsights(null);

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
        }
    };

    const handleGenerateInsights = async () => {
        setInsightsLoading(true);
        try {
            const res = await fetch("/api/insights/compatibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partnerA, partnerB }),
            });
            if (!res.ok) throw new Error("Failed to generate insights");
            const data = await res.json();
            setInsights(data.llm_insights || data.insights || "");
        } catch {
            setInsights("AI insights temporarily unavailable. Please try again.");
        } finally {
            setInsightsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="font-serif text-3xl md:text-5xl text-[#8b6914] dark:text-gold-light mb-3">
                        Test: Compatibility Analysis
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Pre-filled test data. Auto-calculates on page load.
                    </p>
                </div>

                {/* Input Cards */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 mb-4 lg:mb-12">
                    <BirthInputCard label="Partner A (Test)" data={partnerA} onChange={setPartnerA} position="left" />

                    <div className="hidden lg:flex flex-shrink-0 relative z-10 flex-col items-center">
                        <button
                            onClick={handleCompute}
                            disabled={loading}
                            className="group w-28 h-28 rounded-full bg-gradient-to-br from-primary via-gold-light to-primary border-4 border-primary/50 shadow-gold-glow hover:scale-110 transition-all duration-300 flex items-center justify-center gold-shimmer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined text-4xl text-[#1a0b2e] animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-[#1a0b2e] group-hover:scale-110 transition-transform">bolt</span>
                            )}
                        </button>
                        <p className="text-center mt-2 text-[10px] uppercase tracking-widest text-primary/60 font-bold">Compute</p>
                    </div>

                    <BirthInputCard label="Partner B (Test)" data={partnerB} onChange={setPartnerB} position="right" />
                </div>

                {/* Mobile compute button */}
                <div className="lg:hidden flex flex-col items-center gap-4 mb-8 mt-4">
                    <button
                        onClick={handleCompute}
                        disabled={loading}
                        className="group w-full max-w-md px-8 py-4 rounded-full bg-gradient-to-r from-[#aa8220] to-[#d4af37] text-[#0a0518] text-lg font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_4px_30px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Computing...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">bolt</span>
                                Compute Compatibility
                            </>
                        )}
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="max-w-md mx-auto mb-8 glass-panel embossed-gold-border rounded-xl p-5 animate-fadeIn text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-primary animate-spin text-2xl">progress_activity</span>
                            <p className="text-gray-600 dark:text-gray-300 font-medium">Casting kundlis &amp; computing scores...</p>
                        </div>
                        <p className="text-xs text-gray-500">Usually takes 2-5 seconds</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-center">
                        <span className="material-symbols-outlined align-middle mr-2">error</span>
                        {error}
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="mt-8 md:mt-12 space-y-4 md:space-y-6 max-w-5xl mx-auto animate-fadeIn">
                        <CollapsibleSection title="Compatibility Scores" icon="speed" defaultOpen={true}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                <div className="flex flex-col items-center">
                                    <h4 className="font-serif text-base md:text-lg text-center text-[#8b6914] dark:text-gold-light mb-3">Indicator Score</h4>
                                    <ScoreRing score={result.compatibility.overall_score_100} maxScore={100} label={result.compatibility.label} />
                                </div>
                                <div className="flex flex-col items-center">
                                    <h4 className="font-serif text-base md:text-lg text-center text-[#8b6914] dark:text-gold-light mb-3">Guna Milan Score</h4>
                                    <ScoreRing score={result.guna.total_points} maxScore={36} label={result.guna.verdict} />
                                </div>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Ashtakoota Guna Milan" icon="auto_awesome" badge={`${result.guna.total_points}/36`}>
                            <GunaCard guna={result.guna} />
                        </CollapsibleSection>

                        <CollapsibleSection title="Compatibility Dimensions" icon="dashboard">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <DimensionCard title="Emotional" dimension={result.compatibility.dimensions.emotional} icon="self_improvement" colorClass="from-blue-600/30 to-blue-900/50 text-blue-300 border-blue-500" />
                                <DimensionCard title="Communication" dimension={result.compatibility.dimensions.communication} icon="forum" colorClass="from-green-600/30 to-green-900/50 text-green-300 border-green-500" />
                                <DimensionCard title="Attraction" dimension={result.compatibility.dimensions.attraction} icon="favorite" colorClass="from-pink-600/30 to-pink-900/50 text-pink-300 border-pink-500" />
                                <DimensionCard title="Stability" dimension={result.compatibility.dimensions.stability} icon="balance" colorClass="from-amber-600/30 to-amber-900/50 text-amber-300 border-amber-500" />
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Birth Charts" icon="public">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                <ChartCard chart={result.charts.partnerA} label="Partner A" />
                                <ChartCard chart={result.charts.partnerB} label="Partner B" />
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="AI Cosmic Insights" icon="auto_awesome" defaultOpen={!!insights}>
                            {insights ? (
                                <CosmicInsights insights={insights} />
                            ) : insightsLoading ? (
                                <CosmicInsights loading={true} />
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Get personalized AI-powered insights based on the planetary analysis above.
                                    </p>
                                    <button
                                        onClick={handleGenerateInsights}
                                        className="px-6 py-3 rounded-full bg-gradient-to-r from-[#aa8220] to-[#d4af37] text-[#0a0518] font-bold uppercase tracking-wider text-sm hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)] flex items-center gap-2 mx-auto"
                                    >
                                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                        Generate AI Insights
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">Takes 15-30 seconds</p>
                                </div>
                            )}
                        </CollapsibleSection>

                        <CollapsibleSection title="Guidance & Remedies" icon="chat">
                            <MatchChat result={result} insights={insights || undefined} />
                        </CollapsibleSection>

                        <div className="text-center p-4 md:p-6 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 italic">
                                <strong>Disclaimer:</strong> Results are for entertainment and educational purposes.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
