"use client";

import { useState, useRef, useEffect } from "react";

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
    icon?: string;
    className?: string;
}

export function CollapsibleSection({
    title,
    children,
    isOpen: controlledIsOpen,
    onToggle,
    icon,
    className = "",
}: CollapsibleSectionProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Use controlled state if provided, otherwise internal state
    const isOpen = controlledIsOpen ?? internalIsOpen;

    const handleToggle = () => {
        const newState = !isOpen;
        if (onToggle) {
            onToggle(newState);
        } else {
            setInternalIsOpen(newState);
        }
    };

    return (
        <div className={`glass-panel embossed-gold-border rounded-xl w-full transition-all duration-300 ${className} ${isOpen ? 'ring-1 ring-primary/30' : ''}`}>
            {/* Header */}
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none group"
            >
                <div className="flex items-center gap-3">
                    {icon && (
                        <span className={`material-symbols-outlined text-2xl text-primary/80 group-hover:text-primary transition-colors ${isOpen ? 'text-primary' : ''}`}>
                            {icon}
                        </span>
                    )}
                    <h2 className="font-serif text-lg md:text-xl text-[#8b6914] dark:text-gold-light group-hover:text-primary transition-colors">
                        {title}
                    </h2>
                </div>
                <div className={`w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary/20 rotate-180' : 'bg-transparent group-hover:bg-primary/10'}`}>
                    <span className="material-symbols-outlined text-primary/80">
                        expand_more
                    </span>
                </div>
            </button>

            {/* Content */}
            <div
                ref={contentRef}
                className={`overflow-hidden transition-all duration-500 ease-in-out`}
                style={{
                    maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : "0px",
                    opacity: isOpen ? 1 : 0,
                }}
            >
                <div className="p-5 pt-0 border-t border-primary/10 mt-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
