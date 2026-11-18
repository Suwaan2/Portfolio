import type { Content } from '../../../shared/schema';

type Project = Content['projects']['projects'][number];

type Props = {
    project: Project;
    index: number;
    active: boolean;
    cardRef?: (el: HTMLElement | null) => void;
    /**
     * How the cover image drifts: 'y' is the vertical scroll parallax used in the grid,
     * 'x' leaves room either side so a horizontal gallery can slide it sideways.
     */
    parallax?: 'y' | 'x';
    /** Extra classes for the card (e.g. a fixed width inside a horizontal track) */
    className?: string;
    /** Height of the cover image area */
    mediaClassName?: string;
    summaryClassName?: string;
};

export function ProjectCard({
    project: p,
    index,
    active,
    cardRef,
    parallax = 'y',
    className = '',
    mediaClassName = 'h-64',
    summaryClassName = '',
}: Props) {
    const href = p.links?.live;
    const image = (
        <img
            className="w-full h-full object-cover opacity-70 transition-[transform,opacity] duration-700 ease-out group-hover:scale-105 group-hover:opacity-90"
            alt={p.imageAlt}
            src={p.image}
            loading="lazy"
            decoding="async"
        />
    );
    const media = (
        <>
            {/* The cover area is dark-scoped: the art is drawn for a dark backing in every theme. */}
            {/* Oversized so the scrubbed parallax never exposes an edge */}
            {parallax === 'y' ? (
                <div data-parallax="14" className="absolute inset-x-0 -inset-y-[12%]">
                    {image}
                </div>
            ) : (
                <div data-gallery-img className="absolute inset-y-0 -inset-x-[10%]">
                    {image}
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent" />
            <span className="absolute top-5 left-6 font-mono text-xs tracking-[0.2em] text-primary px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md border border-primary/20">
                {String(index + 1).padStart(2, '0')}
            </span>
        </>
    );

    return (
        <article
            ref={cardRef}
            data-reveal-item
            className={`spotlight group relative bg-surface-container-high rounded-[2rem] overflow-hidden border transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1.5 hover:shadow-[0_0_40px_rgb(var(--c-primary)/0.12)] ${
                active ? 'border-primary/30' : 'border-outline-variant/30'
            } ${className}`}
        >
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" data-theme-scope="dark" data-tint-media className={`${mediaClassName} relative overflow-hidden block bg-surface-container-high`} aria-label={`Open ${p.name} live site`}>
                    {media}
                </a>
            ) : (
                <div data-theme-scope="dark" data-tint-media className={`${mediaClassName} relative overflow-hidden bg-surface-container-high`}>{media}</div>
            )}
            <div className="p-8 relative">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-headline font-bold text-on-background">{p.name}</h3>
                    <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full transition-transform duration-300 group-hover:rotate-12" aria-hidden="true">
                        {p.icon}
                    </span>
                </div>
                <p className={`text-on-surface-variant font-body mb-6 text-sm md:text-base ${summaryClassName}`}>{p.summary}</p>
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
}
