"use client";

import { useState, useEffect } from "react";

export function NavbarScrollWrapper({ children }: { children: React.ReactNode }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            data-scrolled={scrolled}
            className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b ${
                scrolled
                    ? "bg-primary border-primary/80"
                    : "bg-background border-border/40"
            }`}
        >
            {children}
        </header>
    );
}
