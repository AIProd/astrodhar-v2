"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface CosmicInsightsProps {
    insights?: string;
    loading?: boolean;
}

function parseInsightSections(text: string) {
    // Split by emoji section headers (emoji followed by text)
    const lines = text.split("\n");
    const sections: { emoji: string; title: string; content: string }[] = [];
    let headline = "";
    let currentSection: { emoji: string; title: string; content: string } | null = null;

    // Common section emojis
    const sectionRegex = /^([\u{1F300}-\u{1FFFF}]|[\u2600-\u27BF]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2702}-\u{27B0}]|[\u{FE00}-\u{FEFF}]|⚠️|✨|💑|⏳|🔮|💎|💼|🌙|🪷|\u23f3)\s+(.+)/u;

    for (const line of lines) {
        const match = line.match(sectionRegex);
        if (match) {
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = { emoji: match[1], title: match[2], content: "" };
        } else if (currentSection) {
            currentSection.content += (currentSection.content ? "\n" : "") + line;
        } else if (line.trim() && !headline) {
            headline = line.trim();
        } else if (line.trim() && headline && !currentSection) {
            headline += "\n" + line.trim();
        }
    }
    if (currentSection) {
        sections.push(currentSection);
    }

    return { headline, sections };
}

export function CosmicInsights({ insights, loading }: CosmicInsightsProps) {
    if (!insights && !loading) return null;

    const parsed = insights ? parseInsightSections(insights) : null;
    const hasSections = parsed && parsed.sections.length > 1;

    return (
        <div className="glass-panel embossed-gold-border rounded-xl p-8 mb-12 animate-fadeIn relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-[#aa8220] to-[#d4af37] rounded-full shadow-lg shadow-gold/20 flex-shrink-0">
                    <span className="material-symbols-outlined text-[#0a0518] text-2xl">
                        auto_awesome
                    </span>
                </div>

                <div className="flex-1 space-y-2">
                    <h3 className="font-serif text-2xl text-[#8b6914] dark:text-[#fce288] flex items-center gap-2">
                        Cosmic Insights
                        {loading && (
                            <span className="material-symbols-outlined animate-spin text-primary text-xl">
                                progress_activity
                            </span>
                        )}
                    </h3>

                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        {loading ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-5 bg-primary/15 rounded w-2/3" />
                                <div className="h-4 bg-primary/10 rounded w-3/4" />
                                <div className="h-4 bg-primary/10 rounded w-full" />
                                <div className="h-4 bg-primary/10 rounded w-5/6" />
                                <div className="mt-4 h-5 bg-primary/15 rounded w-1/2" />
                                <div className="h-4 bg-primary/10 rounded w-4/5" />
                            </div>
                        ) : hasSections ? (
                            <div className="space-y-1">
                                {/* Headline */}
                                {parsed.headline && (
                                    <div className="mb-5">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => <p className="text-lg font-serif text-[#8b6914] dark:text-[#fce288] leading-relaxed" {...props} />,
                                            }}
                                        >
                                            {parsed.headline}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {/* Sections as styled cards */}
                                <div className="grid gap-4">
                                    {parsed.sections.map((section, i) => (
                                        <div
                                            key={i}
                                            className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/8 transition-colors"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xl">{section.emoji}</span>
                                                <h4 className="font-semibold text-primary text-sm uppercase tracking-wide">
                                                    {section.title}
                                                </h4>
                                            </div>
                                            <div className="text-sm text-gray-300 leading-relaxed">
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="text-primary font-bold" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                                                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                    }}
                                                >
                                                    {section.content.trim()}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Fallback: plain text rendering */
                            <ReactMarkdown
                                components={{
                                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                    strong: ({ node, ...props }) => <strong className="text-primary font-bold" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                }}
                            >
                                {insights || ""}
                            </ReactMarkdown>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
