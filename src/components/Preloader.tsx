import { useRef, useState } from 'react';
import { gsap, SplitText, useGSAP, EASE, MOTION_OK } from '../lib/gsap';
import { markIntroDone } from '../lib/intro';

const MIN_DISPLAY_MS = 1200;

function pageLoaded() {
    return new Promise<void>((resolve) => {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', () => resolve(), { once: true });
    });
}

export function Preloader() {
    const root = useRef<HTMLDivElement>(null);
    const [gone, setGone] = useState(false);

    useGSAP(
        () => {
            let cancelled = false;
            const counter = { value: 0 };
            const countEl = root.current?.querySelector<HTMLElement>('[data-count]');
            const nameEl = root.current?.querySelector<HTMLElement>('[data-name]');
            const finish = () => {
                markIntroDone();
                setGone(true);
            };

            const mm = gsap.matchMedia();

            mm.add(MOTION_OK, () => {
                if (!nameEl) return;
                const split = SplitText.create(nameEl, { type: 'chars', mask: 'chars', charsClass: 'split-char' });

                // Intro: name rises char-by-char while the counter climbs to ~90%
                const intro = gsap
                    .timeline()
                    .from(split.chars, { yPercent: 120, duration: 0.8, ease: EASE.enter, stagger: 0.05 })
                    .from('[data-caption]', { autoAlpha: 0, y: 8, duration: 0.4 }, 0.1)
                    .to(counter, {
                        value: 90,
                        duration: MIN_DISPLAY_MS / 1000,
                        ease: 'power1.inOut',
                        onUpdate: () => {
                            if (countEl) countEl.textContent = String(Math.round(counter.value)).padStart(3, '0');
                        },
                    }, 0)
                    .to('[data-bar]', { scaleX: 0.9, duration: MIN_DISPLAY_MS / 1000, ease: 'power1.inOut' }, 0);

                // Outro only once the page has actually loaded: finish the count, then lift the curtain
                Promise.all([pageLoaded(), intro.then()]).then(() => {
                    if (cancelled) return;
                    gsap
                        .timeline({ onComplete: finish })
                        .to(counter, {
                            value: 100,
                            duration: 0.3,
                            onUpdate: () => {
                                if (countEl) countEl.textContent = String(Math.round(counter.value)).padStart(3, '0');
                            },
                        })
                        .to('[data-bar]', { scaleX: 1, duration: 0.3 }, '<')
                        .to(split.chars, { yPercent: -110, duration: 0.45, ease: EASE.exit, stagger: 0.025 }, '+=0.1')
                        .to('[data-caption], [data-meta]', { autoAlpha: 0, duration: 0.25, ease: EASE.exit }, '<')
                        .to(root.current, { yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, '-=0.15');
                });
            });

            mm.add('(prefers-reduced-motion: reduce)', () => {
                pageLoaded().then(() => !cancelled && finish());
            });

            return () => {
                cancelled = true;
            };
        },
        { scope: root },
    );

    if (gone) return null;

    return (
        <div
            ref={root}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-surface-container-lowest"
            aria-hidden="true"
        >
            <div className="hud-grid absolute inset-0 opacity-60" />
            <div className="glow-overlay absolute inset-0" />
            <p data-caption className="font-mono text-xs tracking-[0.4em] uppercase text-primary/70 mb-4">
                Initialising portfolio
            </p>
            <p data-name className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-on-background">
                SUAN KC
            </p>
            <div data-meta className="mt-10 flex w-56 flex-col gap-3">
                <div className="h-px w-full overflow-hidden bg-outline-variant/40">
                    <div data-bar className="h-full origin-left scale-x-0 bg-gradient-to-r from-primary to-primary-dim" />
                </div>
                <div className="flex justify-between font-mono text-xs text-on-surface-variant">
                    <span>Loading</span>
                    <span><span data-count>000</span>%</span>
                </div>
            </div>
        </div>
    );
}
