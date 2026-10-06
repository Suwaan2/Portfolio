import { useRef } from 'react';
import { gsap, useGSAP, MOTION_OK } from '../../lib/gsap';
import { useScrollReveal } from '../../lib/useScrollReveal';

type Stat = { value: string; label: string; count?: number; suffix?: string };

const stats: Stat[] = [
    { value: 'CS', label: 'Education' },
    { value: 'React', label: 'Specialization' },
    { value: '5', count: 5, label: 'Featured Projects' },
    
];

export function About() {
    const ref = useRef<HTMLElement>(null);
    useScrollReveal(ref);

    // Numeric stats count up as they enter
    useGSAP(
        () => {
            gsap.matchMedia().add(MOTION_OK, () => {
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
        { scope: ref },
    );

    return (
        <section ref={ref} className="py-28 md:py-32 bg-surface-container-low overflow-hidden" id="about">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="grid lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-5">
                        <div data-reveal className="eyebrow mb-6">
                            <span>01</span>
                            <span data-line className="h-px w-10 bg-primary/60" aria-hidden="true" />
                            <span>About</span>
                        </div>
                        <h2 data-split className="text-3xl md:text-4xl font-headline font-bold text-on-background mb-6 text-balance">
                            About My <span className="text-primary">Journey</span>
                        </h2>
                        <div className="space-y-6 text-on-surface-variant leading-relaxed font-body text-lg">
                            <p data-reveal>
                                My journey began as a curious CS student at <span className="text-on-surface">Vedas College</span>, where I discovered the immense power of code to bring abstract ideas to life. This academic foundation paved the way for my role as a Junior Frontend Developer at <span className="text-on-surface">Anand Marketing Tech</span>.
                            </p>
                            <p data-reveal>
                                I found my niche in the intersection of aesthetics and logic. My true passion lies in <span className="text-primary-dim">bridging the gap</span> between intricate Figma designs and high-performance, production-ready React applications.
                            </p>
                        </div>
                    </div>
                    <div data-reveal-group="pop" className="lg:col-span-7 grid grid-cols-2 gap-4">
                        {stats.map((s) => (
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
