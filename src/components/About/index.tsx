import { useRef } from 'react';
import { gsap, SplitText, useGSAP, MOTION_OK } from '../../lib/gsap';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { useContent } from '../../lib/content';
import { RichText } from '../RichText';

type AboutProps = {
    /**
     * How the bio text arrives: 'fade' (default) fades each paragraph in beside the stats;
     * 'scrub' sets it large and lights it up word by word as the reader scrolls through.
     */
    textReveal?: 'fade' | 'scrub';
};

export function About({ textReveal = 'fade' }: AboutProps = {}) {
    const { about } = useContent();
    const ref = useRef<HTMLElement>(null);
    const scrub = textReveal === 'scrub';
    useScrollReveal(ref);

    useGSAP(
        () => {
            gsap.matchMedia().add(MOTION_OK, () => {
                // Bio lights up word by word, tied to scroll position
                const bio = ref.current?.querySelector('[data-scrub-text]');
                if (bio) {
                    const split = SplitText.create(bio.querySelectorAll('p'), { type: 'words' });
                    gsap.fromTo(
                        split.words,
                        { opacity: 0.14 },
                        {
                            opacity: 1,
                            ease: 'none',
                            duration: 0.3,
                            stagger: 0.1,
                            scrollTrigger: { trigger: bio, start: 'top 78%', end: 'bottom 45%', scrub: 0.5 },
                        },
                    );
                }

                // Numeric stats count up as they enter
                gsap.utils.toArray<HTMLElement>('[data-count-to]', ref.current).forEach((el) => {
                    const target = Number(el.dataset.countTo);
                    const suffix = el.dataset.suffix ?? '';
                    const obj = { n: 0 };
                    gsap.to(obj, {
                        n: target,
                        duration: 1.2,
                        ease: 'power2.out',
                        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
                        onUpdate: () => {
                            el.textContent = `${Math.round(obj.n)}${suffix}`;
                        },
                    });
                });
            });
        },
        { scope: ref, dependencies: [scrub, about.paragraphs] },
    );

    return (
        <section ref={ref} className="py-28 md:py-32 bg-surface-container-low section-glow overflow-hidden" id="about">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className={scrub ? 'flex flex-col gap-16' : 'grid lg:grid-cols-12 gap-16 items-start'}>
                    <div className={scrub ? 'max-w-5xl' : 'lg:col-span-5'}>
                        <div data-reveal className="eyebrow mb-6">
                            <span>01</span>
                            <span data-line className="h-px w-10 bg-primary/60" aria-hidden="true" />
                            <span>About</span>
                        </div>
                        <h2 data-split className="text-3xl md:text-4xl font-headline font-bold text-on-background mb-6 text-balance">
                            About My <span className="text-primary">Journey</span>
                        </h2>
                        {scrub ? (
                            <div data-scrub-text className="space-y-8 font-headline text-2xl font-medium leading-snug text-on-surface md:text-4xl md:leading-snug">
                                {about.paragraphs.map((p, i) => (
                                    <p key={i}>
                                        <RichText text={p} strongClassName="text-primary" accentClassName="text-primary-dim" />
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6 text-on-surface-variant leading-relaxed font-body text-lg">
                                {about.paragraphs.map((p, i) => (
                                    <p key={i} data-reveal>
                                        <RichText text={p} strongClassName="text-on-surface" accentClassName="text-primary-dim" />
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                    <div data-reveal-group="pop" className={scrub ? 'grid grid-cols-2 gap-4 lg:grid-cols-3' : 'lg:col-span-7 grid grid-cols-2 gap-4'}>
                        {about.stats.map((s) => (
                            <div
                                key={s.label}
                                data-reveal-item
                                className="spotlight glass-card p-8 rounded-xl flex flex-col justify-center text-center transition-[border-color,transform] duration-300 hover:border-primary/30 hover:-translate-y-1"
                            >
                                <span
                                    className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2 tabular-nums"
                                    data-count-to={s.count}
                                    data-suffix={s.suffix}
                                >
                                    {s.value}
                                </span>
                                <span className="text-xs md:text-sm font-label text-on-surface-variant uppercase tracking-widest">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
