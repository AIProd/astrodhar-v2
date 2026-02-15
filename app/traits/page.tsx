"use client";

import { useState } from "react";
import { BirthInputCard } from "@/components/BirthInputCard";
import { ChartCard } from "@/components/ChartCard";
import { TraitsChat } from "@/components/TraitsChat";
import { CosmicInsights } from "@/components/CosmicInsights";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { BirthInput, VedicChart } from "@/lib/types";

const defaultBirth = (): BirthInput => ({
    name: "",
    date: "",
    time: "",
    tz: "Asia/Kolkata",
    lat: 0,
    lon: 0,
    city: "",
});

export default function TraitsPage() {
    const [birthData, setBirthData] = useState<BirthInput>(defaultBirth());
    const [chart, setChart] = useState<VedicChart | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Phase 2: AI Insights
    const [insights, setInsights] = useState<string | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(false);

    const isValid = (b: BirthInput) =>
        b.name.trim() && b.date && b.time && b.lat !== 0 && b.lon !== 0;

    // Phase 1: Fast chart (no LLM)
    const handleCompute = async () => {
        if (!isValid(birthData)) {
            setError("Please fill in all fields including city selection.");
            return;
        }

        setLoading(true);
        setError(null);
        setInsights(null);

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
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Phase 2: Generate AI insights separately
    const handleGenerateInsights = async () => {
        setInsightsLoading(true);
        try {
            const res = await fetch("/api/insights/chart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ birth: birthData }),
            });

            if (!res.ok) throw new Error("Failed to generate insights");

            const data = await res.json();
            setInsights(data.insights || "");
        } catch (err) {
            setInsights("AI insights temporarily unavailable. Please try again.");
        } finally {
            setInsightsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="font-serif text-3xl md:text-5xl text-[#8b6914] dark:text-gold-light mb-3">
                        Personal Traits
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Compute your Vedic birth chart and explore your cosmic personality.
                    </p>
                </div>

                {/* Input Section */}
                {!chart && (
                    <div className="flex flex-col items-center gap-6 mb-12">
                        <BirthInputCard
                            label="Your Details"
                            data={birthData}
                            onChange={setBirthData}
                            position="center"
                        />

                        <button
                            onClick={handleCompute}
                            disabled={loading}
                            className="group px-8 py-4 rounded-full bg-gradient-to-r from-[#aa8220] to-[#d4af37] text-[#0a0518] text-lg font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_4px_30px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    Computing...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Compute My Chart
                                </>
                            )}
                        </button>

                        {/* Simple loading (Phase 1 is fast) */}
                        {loading && (
                            <div className="glass-panel embossed-gold-border rounded-xl p-5 max-w-md w-full animate-fadeIn text-center">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-primary animate-spin text-2xl">progress_activity</span>
                                    <p className="text-gray-600 dark:text-gray-300 font-medium">Casting your kundli...</p>
                                </div>
                                <p className="text-xs text-gray-500">Usually takes 2-5 seconds</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-center">
                        <span className="material-symbols-outlined align-middle mr-2">error</span>
                        {error}
                    </div>
                )}

                {/* ═══ Results ═══ */}
                {chart && (
                    <div className="space-y-4 md:space-y-6 animate-fadeIn">
                        {/* Summary Header */}
                        <div className="glass-panel embossed-gold-border rounded-xl p-4 md:p-6 text-center">
                            <h2 className="font-serif text-xl md:text-2xl text-[#8b6914] dark:text-[#fce288] mb-2">
                                Welcome, {chart.name || "Seeker"}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-primary">{chart.moon.nakshatra}</span> Nakshatra
                                • <span className="text-primary">{chart.ascendant.sign}</span> Ascendant
                            </p>
                            <button
                                onClick={() => { setChart(null); setInsights(null); }}
                                className="mt-3 text-sm text-primary/60 hover:text-primary underline"
                            >
                                ← Enter different details
                            </button>
                        </div>

                        {/* ── Birth Chart ── */}
                        <CollapsibleSection title="Your Birth Chart" icon="public" defaultOpen={true}>
                            <div className="max-w-2xl mx-auto">
                                <ChartCard chart={chart} label="Your Birth Chart" />
                            </div>
                        </CollapsibleSection>

                        {/* ── AI Insights (Phase 2) ── */}
                        <CollapsibleSection title="AI Cosmic Insights" icon="auto_awesome" defaultOpen={!!insights}>
                            {insights ? (
                                <CosmicInsights insights={insights} />
                            ) : insightsLoading ? (
                                <CosmicInsights loading={true} />
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Get personalized AI-powered insights based on your Vedic chart.
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

                        {/* ── Chat ── */}
                        <CollapsibleSection title="Ask About Your Chart" icon="chat">
                            <TraitsChat chart={chart} insights={insights || chart.insights} />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
