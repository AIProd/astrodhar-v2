import type { Metadata } from "next";
import { Inter, Playfair_Display, Rozha_One } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});

const rozha = Rozha_One({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-rozha",
});

export const metadata: Metadata = {
    title: "AstroDhar - Vedic Astrology & Relationship Insights",
    description:
        "Discover your cosmic compatibility with ancient Vedic wisdom. Personalized relationship insights powered by celestial guidance.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body
                className={`${inter.variable} ${playfair.variable} ${rozha.variable} font-display antialiased text-gray-900 dark:text-white bg-background-light dark:bg-[#05030a] min-h-screen flex flex-col relative overflow-x-hidden`}
            >
                {/* Background effects */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-900/10 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-[#d4af37]/5 rounded-full blur-[100px]"></div>
                </div>

                <Providers>
                    <Header />
                    <main className="flex-grow relative z-10">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
