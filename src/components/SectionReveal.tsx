import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, MOTION_OK } from '../lib/gsap';

/**
 * Depth wrapper for a page section: the section rises and
 * scales up as it enters, and settles back as the next one takes over.
 *
 * The wrapped section is untouched, so its own reveal animations keep working.
 * Don't wrap anything that pins itself — the transforms here break position: fixed.
 */
export function SectionReveal({ children }: { children: ReactNode }) {
    const rootRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add(MOTION_OK, () => {
                const q = gsap.utils.selector(rootRef);
                const body = q('[data-section-enter]')[0];
                if (!body) return;

                // Section comes toward the viewer as it enters…
                gsap.fromTo(
                    body,
                    { y: 90, scale: 0.93, opacity: 0.25 },
                    {
                        y: 0,
                        scale: 1,
                        opacity: 1,
                        ease: 'none',
                        scrollTrigger: { trigger: body, start: 'top 100%', end: 'top 45%', scrub: 0.6 },
                    },
                );
                // …and settles back as the next one takes over
                gsap.to(rootRef.current, {
                    scale: 0.96,
                    opacity: 0.35,
                    ease: 'none',
                    scrollTrigger: { trigger: body, start: 'bottom 55%', end: 'bottom top', scrub: 0.6 },
                });
            });
        },
        { scope: rootRef },
    );

    return (
        <div ref={rootRef} className="origin-top will-change-transform">
            <div data-section-enter className="origin-top will-change-transform">
                {children}
            </div>
        </div>
    );
}
