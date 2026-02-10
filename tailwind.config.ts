import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#d4af37",
                "gold-light": "#fce288",
                "gold-dark": "#aa8220",
                "background-light": "#f8f8f6",
                "background-dark": "#0a0518",
                "mystic-dark": "#05030a",
                "mystic-purple": "#1a0b2e",
                "mystic-black": "#0d0d12",
            },
            fontFamily: {
                display: ["var(--font-inter)", "sans-serif"],
                serif: ["var(--font-playfair)", "serif"],
                devanagari: ["var(--font-rozha)", "serif"],
            },
            backgroundImage: {
                "nebula-gradient":
                    "radial-gradient(circle at 50% 0%, #2d1b4e 0%, #0a0518 70%)",
                "gold-gradient":
                    "linear-gradient(135deg, #aa8220 0%, #fce288 50%, #aa8220 100%)",
                "card-gradient":
                    "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(20, 10, 30, 0.4) 100%)",
            },
            boxShadow: {
                "gold-glow":
                    "0 0 20px rgba(212, 175, 55, 0.25), inset 0 0 10px rgba(212, 175, 55, 0.1)",
                "3d-text": "0px 2px 0px #aa8220, 0px 4px 5px rgba(0,0,0,0.5)",
            },
            animation: {
                shimmer: "shimmer 6s infinite",
                "subtle-float": "subtle-float 3s ease-in-out infinite",
            },
            keyframes: {
                shimmer: {
                    "0%": { transform: "translateX(-100%) rotate(30deg)" },
                    "20%": { transform: "translateX(100%) rotate(30deg)" },
                    "100%": { transform: "translateX(100%) rotate(30deg)" },
                },
                "subtle-float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-5px)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
