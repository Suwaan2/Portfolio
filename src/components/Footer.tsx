const socials = [
    { label: 'GitHub', href: 'https://github.com/Suwaan2' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/suan-kc/' },
    { label: 'Twitter', href: 'https://x.com/Suan45126923' },
    { label: 'Email', href: 'mailto:kcsuan424@gmail.com' },
];

export function Footer() {
    const scrollTop = () => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    };

    return (
        <footer className="w-full border-t border-outline-variant/30 bg-surface">
            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-28 md:pb-24 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="font-headline font-bold text-primary">
                    SUAN.CODE
                </div>
                <p className="font-body text-sm text-on-surface-variant">
                    © {new Date().getFullYear()} SUAN KC. All rights reserved.
                </p>
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                    {socials.map((s) => (
                        <a
                            key={s.label}
                            className="relative py-2 text-on-surface-variant hover:text-primary transition-colors duration-200 after:absolute after:left-0 after:bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100"
                            href={s.href}
                            target={s.href.startsWith('http') ? '_blank' : undefined}
                            rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                            {s.label}
                        </a>
                    ))}
                    <button
                        onClick={scrollTop}
                        className="group ml-2 w-11 h-11 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors duration-200"
                        aria-label="Back to top"
                    >
                        <span className="material-symbols-outlined transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden="true">arrow_upward</span>
                    </button>
                </div>
            </div>
        </footer>
    );
}
