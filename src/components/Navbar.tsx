import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { pathname } = useLocation();
    const resumeHref = `${import.meta.env.BASE_URL}Suan_KC_Resume.pdf`;

    const toggleMenu = () => setIsOpen(!isOpen);

    const links = [
        { path: "/", label: "Home" },
        { path: "/about", label: "About" },
        { path: "/skills", label: "Skills" },
        { path: "/projects", label: "Projects" },
        { path: "/experience", label: "Experience" },
        { path: "/contact", label: "Contact" },
    ];

    const isActive = (path: string) => path === "/" ? pathname === "/" : pathname.startsWith(path);

    return (
        <nav className="fixed top-0 w-full z-50 bg-neutral-900/40 backdrop-blur-xl border-b border-outline-variant/10">
            <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-8 h-20">
                <Link to="/" className="text-xl font-bold tracking-tighter text-primary font-headline" onClick={() => setIsOpen(false)}>
                    SUAN KC
                </Link>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {links.map((link) => {
                        const active = isActive(link.path);
                        return (
                            <Link
                                key={link.path}
                                className={`relative font-headline tracking-tight transition-colors duration-200 ${
                                    active ? "text-primary font-semibold" : "text-on-surface-variant hover:text-primary"
                                }`}
                                to={link.path}
                            >
                                {link.label}
                                {active && (
                                    <motion.span
                                        layoutId="nav-underline"
                                        className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-primary"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
                
                <div className="hidden md:block">
                    <a href={resumeHref} download="Suan_KC_Resume.pdf" className="bg-primary text-on-primary font-bold px-6 py-2 rounded-xl scale-95 hover:scale-100 active:scale-90 transition-transform inline-block text-center cursor-pointer">Resume</a>
                </div>

                {/* Mobile Hamburger Icon */}
                <button 
                    className="md:hidden flex items-center p-2 text-primary focus:outline-none"
                    onClick={toggleMenu}
                >
                    <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="mobile-menu"
                        className="md:hidden bg-surface-container-high border-b border-outline-variant/10 shadow-lg absolute w-full overflow-hidden"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <div className="flex flex-col px-6 py-4 space-y-4">
                            {links.map((link) => (
                                <Link
                                    key={link.path}
                                    className={`font-headline tracking-tight transition-colors block text-lg ${
                                        isActive(link.path) ? "text-primary font-semibold" : "text-on-surface-variant hover:text-primary"
                                    }`}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <a href={resumeHref} download="Suan_KC_Resume.pdf" onClick={() => setIsOpen(false)} className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:bg-primary-dim transition-colors text-center mt-4">
                                Resume
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}