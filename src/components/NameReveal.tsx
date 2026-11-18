import { useId, useRef, type CSSProperties } from 'react';
import { gsap, useGSAP, MOTION_OK } from '../lib/gsap';
import { useContent } from '../lib/content';
import { REVEAL_IMAGE } from '../lib/revealImage';

type ZoomGeometry = { x: number; y: number; scale: number };

// Scroll progress through the reveal at which the page-coloured overlay has closed in
// over the top of the screen, so the navbar goes back to its normal theme styling.
const NAV_OVER_PHOTO_UNTIL = 0.1;

/**
 * Works out where to zoom from so the whole viewport starts *inside* one letter.
 * Returns a point in the middle of a letter stroke (as close to the centre as possible)
 * and the scale at which that stroke is big enough to cover every corner of the screen.
 */
function measureZoom(text: SVGTextElement, width: number, height: number): ZoomGeometry {
    const fallback = { x: width / 2, y: height / 2, scale: 80 };
    const style = getComputedStyle(text);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return fallback;

    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = style.letterSpacing;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.textContent ?? '', canvas.width / 2, canvas.height / 2);

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const filled = (x: number, y: number) => {
        const px = Math.round(x);
        const py = Math.round(y);
        return px >= 0 && py >= 0 && px < canvas.width && py < canvas.height && data[(py * canvas.width + px) * 4 + 3] > 128;
    };

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxR = Math.min(canvas.width, canvas.height) / 2;

    // Spiral outward from the centre until we hit ink, then step to the middle of that stroke
    let origin: { x: number; y: number } | null = null;
    for (let r = 0; r < maxR && !origin; r += 2) {
        const steps = Math.max(8, Math.round(r));
        for (let i = 0; i < steps; i++) {
            const a = (i / steps) * Math.PI * 2;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (!filled(x, y)) continue;
            const dx = r === 0 ? 1 : Math.cos(a);
            const dy = r === 0 ? 0 : Math.sin(a);
            let depth = 0;
            while (filled(x + dx * depth, y + dy * depth) && depth < maxR) depth++;
            origin = { x: x + (dx * depth) / 2, y: y + (dy * depth) / 2 };
            break;
        }
    }
    if (!origin) return fallback;

    // Radius of the largest circle around the origin that is all ink
    let clearance = maxR;
    for (let i = 0; i < 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        let d = 1;
        while (d < clearance && filled(origin.x + Math.cos(a) * d, origin.y + Math.sin(a) * d)) d++;
        clearance = Math.min(clearance, d);
    }

    const farthestCorner = Math.max(
        Math.hypot(origin.x, origin.y),
        Math.hypot(width - origin.x, origin.y),
        Math.hypot(origin.x, height - origin.y),
        Math.hypot(width - origin.x, height - origin.y),
    );
    // 0.8 leaves a margin for small differences between canvas and SVG text rendering
    const scale = gsap.utils.clamp(20, 400, (1.2 * farthestCorner) / Math.max(1, clearance * 0.8));
    return { ...origin, scale };
}

/**
 * Scroll-driven logo mask reveal:
 * full-screen image → the dark overlay closes in until the image only shows
 * inside the name → the letters fill with a gradient → tagline fades in.
 *
 * The markup's resting state is the END of that sequence, so visitors with
 * reduced motion simply see the finished frame.
 */
export function NameReveal() {
    const { profile } = useContent();
    const sectionRef = useRef<HTMLElement>(null);
    const uid = useId().replace(/:/g, '');
    const maskId = `name-mask-${uid}`;
    const gradientId = `name-gradient-${uid}`;
    const word = (profile.name.split(' ')[0] || profile.name).toUpperCase();

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add(MOTION_OK, () => {
                const section = sectionRef.current;
                const text = section?.querySelector<SVGTextElement>('[data-reveal-text]');
                const mask = section?.querySelector<HTMLElement>('[data-reveal-mask]');
                if (!section || !text || !mask) return;

                let geo = measureZoom(text, section.clientWidth, section.clientHeight);
                const zoom = { progress: 0 };
                // Interpolating the scale exponentially keeps the zoom speed even to the eye
                const applyZoom = () =>
                    gsap.set(mask, {
                        transformOrigin: `${geo.x}px ${geo.y}px`,
                        scale: Math.exp(Math.log(geo.scale) * (1 - zoom.progress)),
                    });
                const remeasure = () => {
                    geo = measureZoom(text, section.clientWidth, section.clientHeight);
                    applyZoom();
                };
                applyZoom();

                // While the photo still fills the top of the screen the navbar is styled for a
                // dark backdrop (see data-nav-over-media in theme.css), whatever the theme.
                const setNavOverPhoto = (over: boolean) => {
                    if (over) document.documentElement.dataset.navOverMedia = 'true';
                    else delete document.documentElement.dataset.navOverMedia;
                };
                setNavOverPhoto(window.scrollY < 8);

                const tl = gsap.timeline({
                    defaults: { ease: 'none' },
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: '+=220%',
                        pin: true,
                        // The page is a flex column, where ScrollTrigger defaults this to false
                        pinSpacing: true,
                        scrub: 1,
                        anticipatePin: 1,
                        onRefresh: remeasure,
                        onUpdate: (self) => setNavOverPhoto(self.progress < NAV_OVER_PHOTO_UNTIL),
                    },
                });

                // The dark scrim only exists to keep the intro copy readable, so it leaves with it
                tl.fromTo('[data-reveal-scrim]', { opacity: 1 }, { opacity: 0, duration: 0.14 }, 0)
                    .fromTo('[data-reveal-intro]', { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, duration: 0.1 }, 0)
                    // 1. The overlay closes in until the image only shows inside the letters
                    .to(zoom, { progress: 1, duration: 0.62, ease: 'sine.out', onUpdate: applyZoom }, 0)
                    .fromTo('[data-reveal-img]', { scale: 1.3 }, { scale: 1, duration: 0.62, ease: 'sine.out' }, 0)
                    // 2. The letters fill with the brand gradient
                    .fromTo('[data-reveal-fill]', { opacity: 0 }, { opacity: 1, duration: 0.16 }, 0.62)
                    // 3. Tagline lands underneath
                    .fromTo(
                        '[data-reveal-outro] > *',
                        { autoAlpha: 0, y: 28 },
                        { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.14 },
                        0.76,
                    );

                // Glyph shapes change once web fonts load, so the zoom point has to be measured again
                document.fonts?.ready.then(remeasure);

                return () => setNavOverPhoto(false);
            });
        },
        { scope: sectionRef, dependencies: [word] },
    );

    const nameSize = { '--name-size': 'min(30vw, 62vh)' } as CSSProperties;
    const nameStyle: CSSProperties = { fontSize: 'var(--name-size)', letterSpacing: '-0.04em' };
    const nameProps = { x: '50%', y: '50%', textAnchor: 'middle', dominantBaseline: 'central' } as const;

    return (
        <section
            ref={sectionRef}
            id="intro"
            aria-label={`${profile.name}, ${profile.title}`}
            // Sits under the fixed navbar (cancels main's pt-20) so it fills the whole screen
            className="relative -mt-20 h-screen w-full overflow-hidden bg-background"
            style={nameSize}
        >
            {/* The scene */}
            <img
                data-reveal-img
                src={REVEAL_IMAGE}
                alt=""
                className="absolute inset-0 h-full w-full object-cover will-change-transform"
            />
            <div data-reveal-scrim data-theme-scope="dark" className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-background/45 opacity-0" aria-hidden="true" />

            {/* Dark overlay with the name cut out of it */}
            <div data-reveal-mask className="absolute inset-0" aria-hidden="true">
                <svg className="h-full w-full overflow-visible">
                    <defs>
                        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                            <rect width="100%" height="100%" fill="white" />
                            <text data-reveal-text {...nameProps} fill="black" className="font-headline font-bold" style={nameStyle}>
                                {word}
                            </text>
                        </mask>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="currentColor" className="text-primary" />
                            <stop offset="0.55" stopColor="currentColor" className="text-primary-dim" />
                            <stop offset="1" stopColor="currentColor" className="text-tertiary" />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" className="fill-background" mask={`url(#${maskId})`} />
                    {/* Gradient fill that replaces the image inside the letters at the end */}
                    <text data-reveal-fill {...nameProps} fill={`url(#${gradientId})`} className="font-headline font-bold" style={nameStyle}>
                        {word}
                    </text>
                </svg>
            </div>

            {/* Shown over the full image before scrolling (hidden in the resting/reduced-motion state).
                Dark-scoped with its scrim so it stays white-on-dark over the photo in every theme. */}
            <div data-reveal-intro data-theme-scope="dark" className="invisible pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center gap-4 px-6 text-center">
                <p className="font-headline text-3xl font-bold tracking-tight md:text-5xl">{profile.name}</p>
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">{profile.title}</p>
                <span className="flex flex-col items-center gap-3 pt-2 text-on-surface-variant" aria-hidden="true">
                    <span className="font-mono text-[11px] uppercase tracking-[0.3em]">Scroll</span>
                    <span className="relative h-10 w-px overflow-hidden bg-outline-variant/40">
                        <span className="absolute inset-x-0 top-0 h-1/2 bg-primary animate-[scroll-cue_1.8s_ease-in-out_infinite]" />
                    </span>
                </span>
            </div>

            {/* Tagline under the name once the mask has closed */}
            <div
                data-reveal-outro
                className="pointer-events-none absolute inset-x-0 flex flex-col items-center gap-3 px-6 text-center"
                style={{ top: 'calc(50% + var(--name-size) * 0.44)' }}
            >
                <p className="bg-gradient-to-r from-primary via-primary-dim to-tertiary bg-clip-text font-headline text-2xl font-bold tracking-tight text-transparent md:text-4xl">
                    {profile.title}
                </p>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-on-surface-variant">{profile.location}</p>
            </div>
        </section>
    );
}
