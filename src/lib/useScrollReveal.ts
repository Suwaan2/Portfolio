import type { RefObject } from 'react';
import { gsap, SplitText, useGSAP, EASE, DUR, MOTION_OK } from './gsap';

/**
 * Declarative scroll choreography for a section. Mark elements up with:
 *  - data-split           headline revealed word-by-word from a mask
 *  - data-reveal          single element rises + fades in
 *  - data-reveal-group    direct children marked data-reveal-item stagger in
 *                         (data-reveal-group="pop" uses a slight overshoot)
 *  - data-line            hairline draws in (scaleX for horizontal, scaleY with data-line="y")
 *  - data-parallax="12"   element drifts by N yPercent while the section scrolls (scrubbed)
 *
 * Content is fully visible without JS and with reduced motion; tweens only use
 * transform/opacity and clear their inline styles so CSS hover states keep working.
 */
export function useScrollReveal(scope: RefObject<HTMLElement | null>) {
    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add(MOTION_OK, () => {
                const q = gsap.utils.selector(scope);
                const onEnter = (trigger: Element, start = 'top 85%') => ({ trigger, start, once: true });

                q('[data-split]').forEach((el) => {
                    const split = SplitText.create(el, { type: 'words', mask: 'words', wordsClass: 'split-word' });
                    gsap.from(split.words, {
                        yPercent: 120,
                        duration: DUR.slow,
                        ease: EASE.enter,
                        stagger: 0.04,
                        scrollTrigger: onEnter(el, 'top 88%'),
                    });
                });

                q('[data-reveal]').forEach((el) => {
                    gsap.from(el, {
                        y: 32,
                        autoAlpha: 0,
                        ease: EASE.soft,
                        clearProps: 'transform,opacity,visibility',
                        scrollTrigger: onEnter(el),
                    });
                });

                q('[data-reveal-group]').forEach((group) => {
                    const items = group.querySelectorAll(':scope > [data-reveal-item]');
                    if (!items.length) return;
                    const pop = group.getAttribute('data-reveal-group') === 'pop';
                    gsap.from(items, {
                        y: pop ? 24 : 32,
                        scale: pop ? 0.94 : 1,
                        autoAlpha: 0,
                        ease: pop ? EASE.pop : EASE.soft,
                        // keep the whole cascade under ~450ms regardless of item count
                        stagger: { each: Math.min(0.09, 0.45 / items.length), grid: 'auto' },
                        clearProps: 'transform,opacity,visibility',
                        scrollTrigger: onEnter(group, 'top 82%'),
                    });
                });

                q('[data-line]').forEach((el) => {
                    const vertical = el.getAttribute('data-line') === 'y';
                    gsap.from(el, {
                        [vertical ? 'scaleY' : 'scaleX']: 0,
                        transformOrigin: vertical ? '50% 0%' : '0% 50%',
                        duration: DUR.slow,
                        ease: EASE.enter,
                        scrollTrigger: vertical
                            ? { trigger: el, start: 'top 75%', end: 'bottom 60%', scrub: 0.6 }
                            : onEnter(el, 'top 90%'),
                    });
                });

                q('[data-parallax]').forEach((el) => {
                    const amount = Number(el.getAttribute('data-parallax')) || 10;
                    gsap.fromTo(
                        el,
                        { yPercent: -amount / 2 },
                        {
                            yPercent: amount / 2,
                            ease: 'none',
                            scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
                        },
                    );
                });
            });
        },
        { scope },
    );
}
