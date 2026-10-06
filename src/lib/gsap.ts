import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// Brand motion identity: one signature ease, three durations, one entrance pattern
// (rise + fade from below). Exits use the accelerate ease and run shorter.
export const EASE = {
    enter: 'expo.out',
    soft: 'power3.out',
    exit: 'power2.in',
    pop: 'back.out(1.4)',
} as const;

export const DUR = {
    quick: 0.25,
    base: 0.6,
    slow: 0.9,
} as const;

gsap.defaults({ ease: EASE.soft, duration: DUR.base });

// Every scroll/entrance animation is registered inside this query so users who
// ask for reduced motion get the final, readable state with no movement.
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

export { gsap, ScrollTrigger, SplitText, useGSAP };
