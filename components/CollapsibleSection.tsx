"use client";

import { useState } from "react";

interface CollapsibleSectionProps {
    title: string;
    icon?: string;
    defaultOpen?: boolean;
    badge?: string;
    children: React.ReactNode;
}

export function CollapsibleSection({
    title,
    icon,
    defaultOpen = false,
    badge,
    children,
}: CollapsibleSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="glass-panel embossed-gold-border rounded-xl overflow-hidden transition-all duration-300">
            {/* Clickable header */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 md:px-6 md:py-4 hover:bg-white/5 transition-colors cursor-pointer group"
            >
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    {icon && (
                        <span className="material-symbols-outlined text-primary text-lg md:text-xl flex-shrink-0">
                            {icon}
                        </span>
                    )}
                    <h3 className="font-serif text-base md:text-lg text-[#8b6914] dark:text-[#fce288] truncate">
                        {title}
                    </h3>
                    {badge && (
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex-shrink-0">
                            {badge}
                        </span>
                    )}
                </div>
                <span
                    className={`material-symbols-outlined text-primary/60 transition-transform duration-300 flex-shrink-0 ${open ? "rotate-180" : ""
                        }`}
                >
                    expand_more
                </span>
            </button>

            {/* Collapsible content */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="px-4 pb-4 md:px-6 md:pb-6 pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
