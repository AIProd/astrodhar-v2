interface ScoreRingProps {
    score: number;
    maxScore: number;
    label: string;
}

export function ScoreRing({ score, maxScore, label }: ScoreRingProps) {
    // Calculate stroke dashoffset for the progress ring
    const circumference = 2 * Math.PI * 42; // radius = 42
    const percentage = score / maxScore;
    const strokeDashoffset = circumference * (1 - percentage);

    // Determine color based on score (for 100-point scale)
    const getScoreColor = () => {
        if (maxScore === 100) {
            if (score >= 78) return { gradient: "url(#greenGradient)", glow: "rgba(74,222,128,0.3)" };
            if (score >= 62) return { gradient: "url(#goldGradient)", glow: "rgba(212,175,55,0.3)" };
            return { gradient: "url(#redGradient)", glow: "rgba(239,68,68,0.3)" };
        }
        // Default gold for other scales
        return { gradient: "url(#goldGradient)", glow: "rgba(212,175,55,0.3)" };
    };

    const colors = getScoreColor();

    return (
        <div className="relative w-48 h-48 md:w-72 md:h-72 flex items-center justify-center">
            {/* Glow background */}
            <div
                className="absolute inset-0 rounded-full blur-3xl animate-pulse"
                style={{ backgroundColor: colors.glow }}
            ></div>

            {/* Rotating decorative rings */}
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_20s_linear_infinite] opacity-50 border-dashed"></div>
            <div className="absolute inset-2 rounded-full border border-primary/10 animate-[spin_30s_linear_infinite_reverse]"></div>

            {/* Main score ring */}
            <svg
                className="w-full h-full transform -rotate-90"
                style={{ filter: `drop-shadow(0 0 15px ${colors.glow})` }}
                viewBox="0 0 100 100"
            >
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: "#aa8220", stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: "#fce288", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#d4af37", stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: "#16a34a", stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: "#4ade80", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#22c55e", stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: "#dc2626", stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: "#f87171", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#ef4444", stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#1a0b2e"
                    strokeWidth="4"
                    className="dark:stroke-[#1a0b2e] stroke-gray-200"
                />
                {/* Progress circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={colors.gradient}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center">
                <div className="flex items-baseline relative">
                    <span className="font-serif text-4xl md:text-6xl font-bold text-gold-3d drop-shadow-2xl">
                        {score}
                    </span>
                    <span className="text-lg md:text-2xl text-primary/40 font-light ml-1 font-serif">
                        /{maxScore}
                    </span>
                </div>
                <span className="mt-2 text-primary/80 font-bold tracking-[0.2em] uppercase text-[10px]">
                    {maxScore === 100 ? "Indicator Score" : "Gunas Matched"}
                </span>
                <div className="mt-4 px-6 py-1.5 rounded-full bg-gradient-to-r from-transparent via-primary/20 to-transparent border-y border-primary/30 backdrop-blur-sm">
                    <span className="text-[#8b6914] dark:text-[#fce288] text-sm font-serif italic tracking-wide">
                        {label}
                    </span>
                </div>
            </div>
        </div>
    );
}
