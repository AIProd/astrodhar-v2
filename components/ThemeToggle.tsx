"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className="p-2 text-primary/70 hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
                aria-label="Toggle theme"
            >
                <span className="material-symbols-outlined">dark_mode</span>
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-primary/70 hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            <span className="material-symbols-outlined">
                {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
        </button>
    );
}
