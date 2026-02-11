"use client";

import { ReactNode } from "react";

interface CollapsibleSectionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: ReactNode;
    className?: string;
}

export function CollapsibleSection({
    title,
    isOpen,
    onToggle,
    children,
    className = "",
}: CollapsibleSectionProps) {
    return (
        <div className={`glass-panel embossed-gold-border rounded-xl overflow-hidden active:scale-[0.99] transition-transform duration-200 ${className}`}>
            <button
                onClick={onToggle}
                className="w-full px-6 py-5 flex items-center justify-between text-left group focus:outline-none"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-primary/30 transition-colors duration-300 ${isOpen ? "bg-primary/20" : "bg-transparent group-hover:bg-primary/10"}`}>
                        <span className="material-symbols-outlined text-primary text-xl">
                            {isOpen ? "expand_less" : "expand_more"}
                        </span>
                    </div>
                    <h2 className="font-serif text-lg md:text-xl text-[#8b6914] dark:text-gold-light font-medium group-hover:text-primary transition-colors">
                        {title}
                    </h2>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                    {/* Chevron is handled by the icon on left, but we can add subtle indicator here if needed */}
                </div>
            </button>

            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="p-6 pt-0 border-t border-primary/10">
                    {children}
                </div>
            </div>
        </div>
    );
}
