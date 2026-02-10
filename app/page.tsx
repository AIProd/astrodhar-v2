import Link from "next/link";

export default function HomePage() {
    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
            {/* Hero Section */}
            <section className="text-center max-w-4xl mx-auto mb-16">
                <h2 className="font-serif text-4xl md:text-6xl text-gold-3d mb-6 leading-tight">
                    Discover Your
                    <br />
                    <span className="italic">Cosmic Self</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
                    Unlock the secrets of your destiny through the ancient wisdom of
                    Vedic astrology. Explore compatibility with a partner or understand
                    your own cosmic blueprint.
                </p>
            </section>

            {/* Two Main Features */}
            <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-5xl">
                {/* Compatibility Analysis */}
                <Link
                    href="/match"
                    className="group glass-panel embossed-gold-border rounded-xl p-10 text-center hover:-translate-y-3 hover:shadow-[0_12px_40px_rgba(212,175,55,0.3)] transition-all duration-500 cursor-pointer"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500/20 via-red-500/20 to-primary/20 flex items-center justify-center border border-primary/40 group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-4xl text-primary">
                            favorite
                        </span>
                    </div>
                    <h3 className="font-serif text-2xl text-[#8b6914] dark:text-[#fce288] mb-4">
                        Compatibility Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-light mb-6">
                        Match two birth charts with Ashtakoota Guna Milan and discover
                        relationship harmony through planetary alignments.
                    </p>
                    <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                        Find Your Match
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </span>
                </Link>

                {/* Personal Traits */}
                <Link
                    href="/traits"
                    className="group glass-panel embossed-gold-border rounded-xl p-10 text-center hover:-translate-y-3 hover:shadow-[0_12px_40px_rgba(212,175,55,0.3)] transition-all duration-500 cursor-pointer"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-primary/20 flex items-center justify-center border border-primary/40 group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-4xl text-primary">
                            person
                        </span>
                    </div>
                    <h3 className="font-serif text-2xl text-[#8b6914] dark:text-[#fce288] mb-4">
                        Personal Traits
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-light mb-6">
                        Compute your birth chart and chat with AI to explore your
                        personality, career paths, and cosmic destiny.
                    </p>
                    <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                        Explore Yourself
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </span>
                </Link>
            </section>

            {/* How It Works */}
            <section className="w-full max-w-3xl mx-auto text-center mb-16">
                <h2 className="font-serif text-3xl text-gold-3d mb-8">How It Works</h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-lg mb-3">
                            1
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enter birth details
                        </p>
                    </div>
                    <span className="hidden md:block text-primary/40">→</span>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-lg mb-3">
                            2
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Compute Vedic chart
                        </p>
                    </div>
                    <span className="hidden md:block text-primary/40">→</span>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-lg mb-3">
                            3
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get insights & chat
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="glass-panel embossed-gold-border rounded-xl p-12 text-center max-w-2xl mx-auto">
                <h2 className="font-serif text-2xl text-[#8b6914] dark:text-[#fce288] mb-4">
                    Ready to Discover Your Cosmic Path?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 font-light">
                    Start your journey into the celestial realm of Vedic wisdom today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/match"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#aa8220] to-[#d4af37] text-[#0a0518] font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                    >
                        <span className="material-symbols-outlined text-xl">favorite</span>
                        <span>Match Charts</span>
                    </Link>
                    <Link
                        href="/traits"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-primary text-primary font-bold uppercase tracking-wider hover:bg-primary/10 transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">person</span>
                        <span>My Traits</span>
                    </Link>
                </div>
            </section>
        </div>
    );
}
