"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <header className="w-full relative z-50 pt-6 pb-2">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
                {/* Logo */}
                <Link href="/" className="relative group cursor-pointer mb-2">
                    <h1 className="font-samarkan text-5xl md:text-6xl lg:text-7xl tracking-tight text-gold-3d leading-tight">
                        astrodhar
                    </h1>
                    <div className="h-[2px] w-3/4 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mt-1 shadow-[0_0_10px_#d4af37]"></div>
                </Link>

                {/* Tagline */}
                <div className="flex items-center gap-3 text-primary/90 text-sm tracking-[0.3em] font-medium uppercase mt-2">
                    <span>Celestial Guidance</span>
                    <span className="text-[0.6rem] opacity-60">♦</span>
                    <span>Divine Insights</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-400 dark:text-gray-400 mt-6 border-y border-white/5 dark:border-white/5 py-3 w-full justify-center bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-full max-w-3xl">
                    <Link
                        href="/"
                        className="hover:text-primary transition-colors hover:scale-105 transform duration-200"
                    >
                        Home
                    </Link>
                    <Link
                        href="/match"
                        className="hover:text-primary transition-colors hover:scale-105 transform duration-200"
                    >
                        Matchmaking
                    </Link>
                    <Link
                        href="/traits"
                        className="hover:text-primary transition-colors hover:scale-105 transform duration-200"
                    >
                        Personal Traits
                    </Link>
                </nav>

                {/* Top-right controls: hamburger + theme toggle */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                    <ThemeToggle />
                    {/* Mobile hamburger button */}
                    <button
                        className="md:hidden p-2 text-primary/70 hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
                        onClick={() => setMobileNavOpen(!mobileNavOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        <span className="material-symbols-outlined">
                            {mobileNavOpen ? "close" : "menu"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {mobileNavOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 z-50 animate-fadeIn">
                    <nav className="mx-4 mt-2 bg-white/95 dark:bg-[#0f0820]/95 backdrop-blur-lg border border-primary/20 rounded-xl shadow-xl overflow-hidden">
                        <Link
                            href="/"
                            onClick={() => setMobileNavOpen(false)}
                            className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 transition-colors border-b border-primary/10"
                        >
                            <span className="material-symbols-outlined text-primary/60 text-lg">home</span>
                            Home
                        </Link>
                        <Link
                            href="/match"
                            onClick={() => setMobileNavOpen(false)}
                            className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 transition-colors border-b border-primary/10"
                        >
                            <span className="material-symbols-outlined text-primary/60 text-lg">favorite</span>
                            Matchmaking
                        </Link>
                        <Link
                            href="/traits"
                            onClick={() => setMobileNavOpen(false)}
                            className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-primary/60 text-lg">auto_awesome</span>
                            Personal Traits
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
