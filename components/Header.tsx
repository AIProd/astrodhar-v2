import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
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

                {/* Navigation */}
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

                {/* Theme toggle - positioned top right */}
                <div className="absolute top-6 right-6 flex items-center gap-4">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
