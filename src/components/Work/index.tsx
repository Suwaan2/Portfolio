import { useRef, useState } from 'react';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { useContent } from '../../lib/content';
import { ProjectCard } from './ProjectCard';

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
                    {projects.map((p, i) => (
                        <ProjectCard
                            key={p.id}
                            project={p}
                            index={i}
                            active={activeIndex === i}
                            cardRef={(el) => { cardRefs.current[i] = el; }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
