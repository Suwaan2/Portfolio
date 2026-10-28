import { useRef, useState } from 'react';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { useContent } from '../../lib/content';

const navButtonClass =
    'w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary hover:bg-primary/5 active:scale-90 transition-[color,border-color,background-color,transform] duration-200';

export function Work() {
    const { projects } = useContent().projects;
    const ref = useRef<HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const cardRefs = useRef<Array<HTMLElement | null>>([]);
    useScrollReveal(ref);

    function go(dir: 1 | -1) {
        const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
        if (!cards.length) return;
        const next = (activeIndex + dir + cards.length) % cards.length;
        cards[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
        setActiveIndex(next);
    }

    return (
        <section ref={ref} className="py-28 md:py-32 bg-surface-container-low section-glow overflow-hidden" id="projects">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-6">
                    <div>
                        <div data-reveal className="eyebrow mb-6">
                            <span>03</span>
                            <span data-line className="h-px w-10 bg-primary/60" aria-hidden="true" />
                            <span>Projects</span>
                        </div>
                        <h2 data-split className="text-4xl md:text-5xl font-headline font-bold text-on-background">
                            Featured <span className="text-primary">Projects</span>
                        </h2>
                        <p data-reveal className="text-on-surface-variant mt-4 font-body">Selected work that defines my engineering standard.</p>
                    </div>
                    <div data-reveal className="hidden md:flex items-center gap-4">
                        <span className="font-mono text-xs text-on-surface-variant tabular-nums" aria-live="polite">
                            {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                        </span>
                        <button onClick={() => go(-1)} className={navButtonClass} aria-label="Previous project">
                            <span className="material-symbols-outlined" aria-hidden="true">west</span>
                        </button>
                        <button onClick={() => go(1)} className={navButtonClass} aria-label="Next project">
                            <span className="material-symbols-outlined" aria-hidden="true">east</span>
                        </button>
                    </div>
                </div>

                <div data-reveal-group className="grid lg:grid-cols-2 gap-8">
                    {projects.map((p, i) => {
                        const href = p.links?.live;
                        const media = (
                            <>
                                {/* Oversized so the scrubbed parallax never exposes an edge */}
                                <div data-parallax="14" className="absolute inset-x-0 -inset-y-[12%]">
                                    <img
                                        className="w-full h-full object-cover opacity-70 transition-[transform,opacity] duration-700 ease-out group-hover:scale-105 group-hover:opacity-90"
                                        alt={p.imageAlt}
                                        src={p.image}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent" />
                                <span className="absolute top-5 left-6 font-mono text-xs tracking-[0.2em] text-primary px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md border border-primary/20">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            </>
                        );

                        return (
                            <article
                                key={p.id}
                                ref={(el) => { cardRefs.current[i] = el; }}
                                data-reveal-item
                                className={`spotlight group relative bg-surface-container-high rounded-[2rem] overflow-hidden border transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1.5 hover:shadow-[0_0_40px_rgba(129,236,255,0.12)] ${
                                    activeIndex === i ? 'border-primary/30' : 'border-outline-variant/30'
                                }`}
                            >
                                {href ? (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="h-64 relative overflow-hidden block" aria-label={`Open ${p.name} live site`}>
                                        {media}
                                    </a>
                                ) : (
                                    <div className="h-64 relative overflow-hidden">{media}</div>
                                )}
                                <div className="p-8 relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-headline font-bold text-on-background">{p.name}</h3>
                                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full transition-transform duration-300 group-hover:rotate-12" aria-hidden="true">
                                            {p.icon}
                                        </span>
                                    </div>
                                    <p className="text-on-surface-variant font-body mb-6 text-sm md:text-base">{p.summary}</p>
                                    <ul className={`flex flex-wrap gap-2 ${href ? 'mb-4' : 'mb-2'}`}>
                                        {p.tags.map((t) => (
                                            <li key={t} className="px-2 py-1 text-[11px] uppercase font-bold tracking-tight bg-primary/10 text-primary rounded">
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                    {href && (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/link inline-flex items-center gap-2 text-primary font-bold text-sm min-h-[44px]"
                                        >
                                            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover/link:bg-[length:100%_1px]">
                                                Visit Live Site
                                            </span>
                                            <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" aria-hidden="true">
                                                open_in_new
                                            </span>
                                        </a>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
