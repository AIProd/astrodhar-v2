"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { VedicChart } from "@/lib/types";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface TraitsChatProps {
    chart: VedicChart;
}

const MAX_CONVERSATION_PAIRS = 10;

const STARTER_QUESTIONS = [
    "How is 2026 looking for me?",
    "Which career will bring me most success?",
    "What gemstone should I wear?",
    "When is my best period coming?",
    "What remedies will help me right now?",
];

export function TraitsChat({ chart }: TraitsChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Calculate conversation pairs (user + assistant = 1 pair)
    const conversationPairs = Math.floor(messages.filter(m => m.role === "assistant").length);
    const remainingQuestions = MAX_CONVERSATION_PAIRS - conversationPairs;
    const limitReached = conversationPairs >= MAX_CONVERSATION_PAIRS;

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (question: string) => {
        if (!question.trim() || limitReached) return;

        const userMessage: Message = { role: "user", content: question };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chart,
                    question,
                    history: messages  // Send conversation history for context
                }),
            });

            const data = await res.json();
            const assistantMessage: Message = {
                role: "assistant",
                content: data.response || data.error || "I couldn't process that question.",
            };
            setMessages((prev) => [...prev, assistantMessage]);

            // Check if limit will be reached after this response
            if (conversationPairs + 1 >= MAX_CONVERSATION_PAIRS) {
                setShowFeedback(true);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, there was an error. Please try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="glass-panel embossed-gold-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl text-primary">
                        forum
                    </span>
                    <div>
                        <h3 className="font-serif text-xl text-[#8b6914] dark:text-[#fce288]">
                            Ask About Your Chart
                        </h3>
                        <p className="text-xs text-gray-500">
                            AI-powered insights based on your Vedic birth chart
                        </p>
                    </div>
                </div>
                {messages.length > 0 && !limitReached && (
                    <div className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        {remainingQuestions}/{MAX_CONVERSATION_PAIRS} left
                    </div>
                )}
            </div>

            {/* Starter Questions */}
            {messages.length === 0 && (
                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-3">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                        {STARTER_QUESTIONS.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(q)}
                                disabled={loading}
                                className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
                <div className="max-h-96 overflow-y-auto mb-6 space-y-4 pr-2">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] p-4 rounded-xl ${msg.role === "user"
                                    ? "bg-primary/20 text-primary-foreground border border-primary/30"
                                    : "bg-white/5 border border-white/10"
                                    }`}
                            >
                                {msg.role === "assistant" && (
                                    <span className="material-symbols-outlined text-primary text-sm mr-2 align-middle">
                                        auto_awesome
                                    </span>
                                )}
                                <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="text-primary font-bold" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-2">
                                <span className="material-symbols-outlined animate-spin text-primary">
                                    progress_activity
                                </span>
                                <span className="text-xs text-gray-400">Consulting the stars...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* Feedback Form */}
            {showFeedback && limitReached && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined">chat_info</span>
                        You've reached your question limit
                    </h4>
                    <p className="text-sm text-gray-400 mb-3">
                        How was your experience? Your feedback helps us improve!
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFeedback(false)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                            Maybe later
                        </button>
                        <a
                            href="mailto:feedback@astrodhar.com?subject=Chat Feedback"
                            className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg text-sm text-primary hover:bg-primary/30 transition-colors"
                        >
                            Send Feedback
                        </a>
                    </div>
                </div>
            )}

            {/* Quick Questions (after conversation started) */}
            {messages.length > 0 && !limitReached && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {STARTER_QUESTIONS
                        .filter(q => !messages.some(m => m.content.toLowerCase().includes(q.toLowerCase().substring(0, 20))))
                        .slice(0, 3)
                        .map((q, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(q)}
                                disabled={loading || limitReached}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={limitReached ? "Question limit reached" : "Ask about your chart..."}
                    disabled={loading || limitReached}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none transition-colors disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim() || limitReached}
                    className="px-6 py-3 bg-gradient-to-r from-[#aa8220] to-[#d4af37] text-[#0a0518] font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined">send</span>
                </button>
            </form>
        </div>
    );
}
