import { useRef } from 'react';
import { gsap, useGSAP, MOTION_OK } from './gsap';

/**
 * Pulls the element toward the cursor while hovered and springs back on leave.
 * Fine pointers only — touch devices and reduced-motion users get a static element.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
    const ref = useRef<T>(null);

    useGSAP(() => {
        const el = ref.current;
        if (!el) return;
        const mm = gsap.matchMedia();
        mm.add(`${MOTION_OK} and (pointer: fine)`, () => {
            const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
            const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

            const move = (e: PointerEvent) => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - (r.left + r.width / 2)) * strength);
                yTo((e.clientY - (r.top + r.height / 2)) * strength);
            };
            const leave = () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
            };

            el.addEventListener('pointermove', move);
            el.addEventListener('pointerleave', leave);
            return () => {
                el.removeEventListener('pointermove', move);
                el.removeEventListener('pointerleave', leave);
            };
        });
    });

    return ref;
}
