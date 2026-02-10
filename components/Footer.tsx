export function Footer() {
    return (
        <footer className="w-full border-t border-primary/20 py-8 mt-12 bg-black/40 dark:bg-black/40 backdrop-blur-md relative z-10">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                <div className="flex flex-col items-center md:items-start gap-1">
                    <p>© 2026 AstroDhar. Celestial insights powered by Vedic wisdom.</p>
                    <p className="text-[10px] opacity-60">All cosmic rights reserved.</p>
                </div>
                {/* 
                <div className="flex gap-6 mt-4 md:mt-0 font-medium">
                    <a href="#" className="hover:text-primary transition-colors">
                        Privacy Policy
                    </a>
                    <a href="#" className="hover:text-primary transition-colors">
                        Terms of Service
                    </a>
                    <a href="#" className="hover:text-primary transition-colors">
                        Support
                    </a>
                </div> 
                */}
            </div>
        </footer>
    );
}
