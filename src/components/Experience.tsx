import { useRef } from 'react';
import { useScrollReveal } from '../lib/useScrollReveal';

const highlights = [
    {
        icon: 'shopping_cart',
        body: (
            <>
                Developed <span className="text-on-surface font-bold">Ecommerce-Fashion</span>, a live multi-vendor e-commerce platform with JWT-based MERN auth and role-based dashboards.
            </>
        ),
    },
    {
        icon: 'rocket_launch',
        body: <>Resolved critical deployment blockers to bring the platform to production.</>,
    },
    {
        icon: 'stacked_bar_chart',
        body: (
            <>
                Worked across <span className="text-on-surface font-bold">React, Redux Toolkit, Node.js, Express, PostgreSQL, and Redis</span> in a production environment.
            </>
        ),
    },
];

export function Experience() {
    const ref = useRef<HTMLElement>(null);
    useScrollReveal(ref);

    return (
        <section ref={ref} className="py-28 md:py-32 overflow-hidden" id="experience">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="mb-16 flex flex-col items-center text-center">
                    <div data-reveal className="eyebrow mb-6">
                        <span>04</span>
                        <span data-line className="h-px w-10 bg-primary/60" aria-hidden="true" />
                        <span>Experience</span>
                    </div>
                    <h2 data-split className="text-3xl md:text-5xl font-headline font-bold text-on-background">
                        Leadership & <span className="text-primary">Experience</span>
                    </h2>
                </div>

                <div className="relative md:pl-16">
                    {/* Timeline rail: draws itself as the card scrolls through */}
                    <div className="absolute left-5 top-0 bottom-0 hidden md:block" aria-hidden="true">
                        <div className="absolute inset-y-0 left-0 w-px bg-outline-variant/30" />
                        <div data-line="y" className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-primary via-primary/60 to-transparent" />
                        <span className="absolute -left-[5px] top-12 h-[11px] w-[11px] rounded-full bg-primary shadow-[0_0_0_4px_rgba(129,236,255,0.15),0_0_20px_rgba(129,236,255,0.6)]" />
                    </div>

                    <article data-reveal className="spotlight glass-card p-8 md:p-12 rounded-[2rem] relative overflow-hidden transition-[border-color] duration-300 hover:border-primary/20">
                        <div className="absolute -top-10 -right-10 p-8 opacity-5" aria-hidden="true">
                            <span className="material-symbols-outlined text-[150px]">corporate_fare</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 relative z-10">
                            <div>
                                <h3 className="text-2xl font-headline font-bold text-primary">Junior Frontend Developer</h3>
                                <p className="text-on-surface font-semibold text-lg">Anand Marketing Tech</p>
                            </div>
                            <div className="font-mono text-on-surface-variant text-xs tracking-widest uppercase bg-surface-container-highest px-4 py-2 rounded-lg inline-flex items-center gap-2 self-start md:self-auto">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                                Jan 2026 – Present
                            </div>
                        </div>
                        <ul data-reveal-group className="grid md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
                            {highlights.map((h) => (
                                <li key={h.icon} data-reveal-item className="group flex gap-4 items-start">
                                    <span
                                        className="material-symbols-outlined text-primary mt-0.5 rounded-lg bg-primary/10 p-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                                        aria-hidden="true"
                                    >
                                        {h.icon}
                                    </span>
                                    <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">{h.body}</p>
                                </li>
                            ))}
                        </ul>
                    </article>
                </div>
            </div>
        </section>
    );
}
