import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from '../lib/gsap';

const links = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/skills", label: "Skills" },
    { path: "/projects", label: "Projects" },
    { path: "/experience", label: "Experience" },
    { path: "/contact", label: "Contact" },
];

const menuVariants = {
    closed: { opacity: 0, y: -12, transition: { duration: 0.15, ease: [0.3, 0, 1, 1] as const } },
    open: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.05, 0.7, 0.1, 1] as const, staggerChildren: 0.04, delayChildren: 0.05 } },
};

const itemVariants = {
    closed: { opacity: 0, x: -12 },
    open: { opacity: 1, x: 0 },
};

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const openRef = useRef(isOpen);
    openRef.current = isOpen;
    const { pathname } = useLocation();
    const resumeHref = `${import.meta.env.BASE_URL}Suan_KC_Resume.pdf`;

    // Slide away while reading (scrolling down), return on any upward scroll
    useGSAP(() => {
        const nav = navRef.current;
        if (!nav) return;
        ScrollTrigger.create({
            start: 0,
            end: 'max',
            onUpdate: (self) => setScrolled(self.scroll() > 24),
        });
        gsap.matchMedia().add(MOTION_OK, () => {
            const hideTween = gsap.to(nav, { yPercent: -100, duration: 0.3, ease: 'power2.inOut', paused: true });
            let hidden = false;
            ScrollTrigger.create({
                start: 0,
                end: 'max',
                onUpdate: (self) => {
                    const hide = self.scroll() > 120 && self.direction === 1 && !openRef.current;
                    if (hide === hidden) return;
                    hidden = hide;
                    if (hide) hideTween.play();
                    else hideTween.reverse();
                },
            });
        });
    });

    const isActive = (path: string) => path === "/" ? pathname === "/" : pathname.startsWith(path);

    return (
        <nav
            ref={navRef}
            className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b focus-within:![transform:none] transition-[background-color,border-color] duration-300 ${
                scrolled || isOpen ? 'bg-neutral-950/75 border-outline-variant/20' : 'bg-neutral-900/30 border-transparent'
            }`}
        >
            <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-8 h-20">
                <Link to="/" className="group flex items-center gap-2 text-xl font-bold tracking-tighter text-primary font-headline" onClick={() => setIsOpen(false)}>
                    <span className="font-mono text-sm text-primary/60 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true">&lt;</span>
                    SUAN KC
                    <span className="font-mono text-sm text-primary/60 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">/&gt;</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {links.map((link) => {
                        const active = isActive(link.path);
                        return (
                            <Link
                                key={link.path}
                                aria-current={active ? 'page' : undefined}
                                className={`relative py-2 font-headline tracking-tight transition-colors duration-200 ${
                                    active ? "text-primary font-semibold" : "text-on-surface-variant hover:text-on-surface"
                                }`}
                                to={link.path}
                            >
                                {link.label}
                                {active && (
                                    <motion.span
                                        layoutId="nav-underline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary shadow-[0_0_12px_rgba(129,236,255,0.8)]"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="hidden md:block">
                    <a
                        href={resumeHref}
                        download="Suan_KC_Resume.pdf"
                        className="inline-flex items-center gap-1.5 bg-primary text-on-primary font-bold px-5 py-2.5 rounded-xl hover:shadow-[0_0_24px_rgba(129,236,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-[box-shadow,transform] duration-200"
                    >
                        <span className="material-symbols-outlined text-lg" aria-hidden="true">download</span>
                        Resume
                    </a>
                </div>

                {/* Mobile Hamburger Icon */}
                <button
                    className="md:hidden flex items-center justify-center w-11 h-11 text-primary rounded-xl"
                    onClick={() => setIsOpen((o) => !o)}
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isOpen}
                    aria-controls="mobile-menu"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={isOpen ? 'close' : 'menu'}
                            className="material-symbols-outlined"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            aria-hidden="true"
                        >
                            {isOpen ? 'close' : 'menu'}
                        </motion.span>
                    </AnimatePresence>
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="mobile-menu"
                        key="mobile-menu"
                        className="md:hidden bg-surface-container-high border-b border-outline-variant/10 shadow-lg absolute w-full overflow-hidden"
                        variants={menuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                    >
                        <div className="flex flex-col px-6 py-4 space-y-1">
                            {links.map((link, i) => (
                                <motion.div key={link.path} variants={itemVariants}>
                                    <Link
                                        aria-current={isActive(link.path) ? 'page' : undefined}
                                        className={`flex items-center gap-4 py-3 font-headline tracking-tight transition-colors text-lg ${
                                            isActive(link.path) ? "text-primary font-semibold" : "text-on-surface-variant hover:text-primary"
                                        }`}
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="font-mono text-xs text-primary/50" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.a
                                variants={itemVariants}
                                href={resumeHref}
                                download="Suan_KC_Resume.pdf"
                                onClick={() => setIsOpen(false)}
                                className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:bg-primary-dim transition-colors text-center !mt-4"
                            >
                                Resume
                            </motion.a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
