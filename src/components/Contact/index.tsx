import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { useMagnetic } from '../../lib/useMagnetic';

export function Contact() {
    const ref = useRef<HTMLElement>(null);
    const primary = useMagnetic<HTMLSpanElement>(0.3);
    const secondary = useMagnetic<HTMLSpanElement>(0.3);
    useScrollReveal(ref);

    return (
        <section ref={ref} className="py-28 md:py-32 overflow-hidden" id="contact">
            <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
                <div
                    data-reveal
                    className="spotlight relative glass-card p-10 md:p-16 rounded-[2rem] md:rounded-[2.5rem] border-2 border-primary/10 hover:border-primary/30 transition-colors duration-500 overflow-hidden"
                >
                    <div className="hud-grid absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
                    <div data-parallax="30" className="absolute -top-32 left-1/2 -ml-40 h-80 w-80 rounded-full bg-primary/10 blur-[100px] -z-10" aria-hidden="true" />

                    <div className="eyebrow mb-6 justify-center">
                        <span>05</span>
                        <span data-line className="h-px w-10 bg-primary/60" aria-hidden="true" />
                        <span>Contact</span>
                    </div>
                    <h2 data-split className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold mb-6 text-on-background leading-tight text-balance">
                        Let's build something <span className="text-primary">extraordinary.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-on-surface-variant font-body mb-12 max-w-2xl mx-auto">
                        Looking for a dedicated developer to elevate your next project? My inbox is always open.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                        <span ref={primary} className="block sm:inline-block">
                            <Link
                                to="/contact"
                                className="flex items-center justify-center h-14 md:h-16 px-8 md:px-10 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_30px_rgba(129,236,255,0.35)] active:scale-[0.97] transition-[box-shadow,transform] duration-200"
                            >
                                Get In Touch
                            </Link>
                        </span>
                        <span ref={secondary} className="block sm:inline-block">
                            <a
                                className="flex items-center justify-center gap-2 h-14 md:h-16 px-8 md:px-10 bg-surface-container-highest text-on-surface font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-variant hover:border-primary/40 active:scale-[0.97] transition-[background-color,border-color,transform] duration-200"
                                href={`${import.meta.env.BASE_URL}Suan_KC_Resume.pdf`}
                                download="Suan_KC_Resume.pdf"
                            >
                                <span className="material-symbols-outlined text-xl" aria-hidden="true">download</span>
                                Download CV
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
