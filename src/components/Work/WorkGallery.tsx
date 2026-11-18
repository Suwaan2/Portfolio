import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from '../../lib/gsap';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { useContent } from '../../lib/content';
import { ProjectCard } from './ProjectCard';

const navButtonClass =
    'w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary hover:bg-primary/5 active:scale-90 transition-[color,border-color,background-color,transform] duration-200';

// The pinned gallery needs room: a wide, reasonably tall screen and motion allowed.
// Everywhere else the same markup is a normal swipeable row of cards.
const PINNED = `${MOTION_OK} and (min-width: 1024px) and (min-height: 600px)`;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Projects as a horizontal gallery: the section stays in place while vertical
 * scrolling slides the cards across.
 *
 * Must not sit inside a transformed ancestor — pinning relies on position: fixed.
 */
export function WorkGallery() {
    const { projects } = useContent().projects;
    const ref = useRef<HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const cardRefs = useRef<Array<HTMLElement | null>>([]);
    const pinRef = useRef<ScrollTrigger | null>(null);
    const count = projects.length;
    useScrollReveal(ref);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add(PINNED, () => {
                const section = ref.current;
                const q = gsap.utils.selector(ref);
                const viewport = q('[data-gallery-viewport]')[0] as HTMLElement | undefined;
                const track = q('[data-gallery-track]')[0] as HTMLElement | undefined;
                const progress = q('[data-gallery-progress]')[0];
                if (!section || !viewport || !track) return;

                // Switches the layout classes to the full-screen, non-scrollable version
                section.dataset.pinned = 'true';
                viewport.scrollLeft = 0;

                const distance = () => Math.max(0, track.offsetWidth - viewport.clientWidth);

                const slide = gsap.to(track, {
                    x: () => -distance(),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: () => `+=${distance()}`,
                        pin: true,
                        pinSpacing: true,
                        scrub: 0.8,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            if (progress) gsap.set(progress, { scaleX: self.progress });
                            setActiveIndex(Math.round(self.progress * (count - 1)));
                        },
                    },
                });
                pinRef.current = slide.scrollTrigger ?? null;

                // Cover images drift against the slide for a little depth
                q('[data-gallery-img]').forEach((img) => {
                    gsap.fromTo(
                        img,
                        { xPercent: -7 },
                        {
                            xPercent: 7,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: img.parentElement,
                                containerAnimation: slide,
                                start: 'left right',
                                end: 'right left',
                                scrub: true,
                            },
                        },
                    );
                });

                return () => {
                    delete section.dataset.pinned;
                    pinRef.current = null;
                };
            });
        },
        { scope: ref, dependencies: [count] },
    );

    function go(dir: 1 | -1) {
        if (!count) return;
        const next = (activeIndex + dir + count) % count;
        const pin = pinRef.current;
        if (pin) {
            // Pinned: the page scroll position decides which card is in view
            const ratio = count > 1 ? next / (count - 1) : 0;
            window.scrollTo({ top: pin.start + ratio * (pin.end - pin.start), behavior: 'smooth' });
            return;
        }
        cardRefs.current[next]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        setActiveIndex(next);
    }

    return (
        <section
            ref={ref}
            id="projects"
            className="group/gallery relative overflow-hidden bg-surface-container-low section-glow py-28 md:py-32 data-[pinned=true]:flex data-[pinned=true]:h-screen data-[pinned=true]:flex-col data-[pinned=true]:justify-center data-[pinned=true]:pb-6 data-[pinned=true]:pt-20"
        >
            <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
                <div className="mb-12 flex flex-col justify-between gap-6 group-data-[pinned=true]/gallery:mb-6 md:flex-row md:items-end">
                    <div>
                        <div data-reveal className="eyebrow mb-6 group-data-[pinned=true]/gallery:mb-3">
                            <span>03</span>
                            <span data-line className="h-px w-10 bg-primary/60" aria-hidden="true" />
                            <span>Projects</span>
                        </div>
                        <h2 data-split className="font-headline text-4xl font-bold text-on-background md:text-5xl group-data-[pinned=true]/gallery:text-4xl">
                            Featured <span className="text-primary">Projects</span>
                        </h2>
                        <p data-reveal className="mt-4 font-body text-on-surface-variant group-data-[pinned=true]/gallery:hidden">
                            Selected work that defines my engineering standard.
                        </p>
                    </div>
                    <div data-reveal className="hidden items-center gap-4 md:flex">
                        <span className="font-mono text-xs tabular-nums text-on-surface-variant" aria-live="polite">
                            {pad(activeIndex + 1)} / {pad(count)}
                        </span>
                        <button onClick={() => go(-1)} className={navButtonClass} aria-label="Previous project">
                            <span className="material-symbols-outlined" aria-hidden="true">west</span>
                        </button>
                        <button onClick={() => go(1)} className={navButtonClass} aria-label="Next project">
                            <span className="material-symbols-outlined" aria-hidden="true">east</span>
                        </button>
                    </div>
                </div>
                {/* Fills as the gallery is scrolled through (pinned layout only) */}
                <div className="mb-8 hidden h-px bg-outline-variant/30 group-data-[pinned=true]/gallery:block" aria-hidden="true">
                    <div data-gallery-progress className="h-full origin-left scale-x-0 bg-primary" />
                </div>
            </div>

            <div
                data-gallery-viewport
                className="snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] group-data-[pinned=true]/gallery:snap-none group-data-[pinned=true]/gallery:overflow-visible [&::-webkit-scrollbar]:hidden"
            >
                <div
                    data-gallery-track
                    data-reveal-group
                    className="flex w-max items-stretch gap-6 will-change-transform md:gap-8"
                    // Lines the first and last card up with the page's content column
                    style={{ paddingInline: 'max(1.5rem, calc((100vw - 80rem) / 2 + 2rem))' }}
                >
                    {projects.map((p, i) => (
                        <ProjectCard
                            key={p.id}
                            project={p}
                            index={i}
                            active={activeIndex === i}
                            cardRef={(el) => { cardRefs.current[i] = el; }}
                            parallax="x"
                            className="w-[min(82vw,30rem)] shrink-0 snap-center"
                            mediaClassName="h-[clamp(7rem,20vh,16rem)]"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
