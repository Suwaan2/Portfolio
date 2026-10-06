import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, SplitText, useGSAP, EASE, DUR, MOTION_OK } from '../lib/gsap';
import { onIntroDone } from '../lib/intro';
import { useMagnetic } from '../lib/useMagnetic';

export function Hero() {
    const heroRef = useRef<HTMLElement>(null);
    const primaryCta = useMagnetic<HTMLSpanElement>(0.25);
    const secondaryCta = useMagnetic<HTMLSpanElement>(0.25);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add(MOTION_OK, () => {
                const headline = heroRef.current?.querySelector('[data-hero-title]');
                if (!headline) return;
                const split = SplitText.create(headline, { type: 'words', mask: 'words', wordsClass: 'split-word' });

                // Choreography: hero headline leads, supporting copy follows, visual lands last.
                const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.enter } });
                tl.from('[data-hero-badge]', { y: 16, autoAlpha: 0, scale: 0.9, duration: DUR.base, ease: EASE.pop })
                    .from(split.words, { yPercent: 120, duration: DUR.slow, stagger: 0.045 }, '-=0.35')
                    .from('[data-hero-underline]', { scaleX: 0, duration: DUR.base }, '-=0.45')
                    .from('[data-hero-fade]', { y: 24, autoAlpha: 0, duration: DUR.base, stagger: 0.08, ease: EASE.soft }, '-=0.6')
                    .from('[data-hero-visual]', { clipPath: 'inset(100% 0% 0% 0% round 2rem)', duration: 1.1, ease: 'expo.inOut' }, 0.15)
                    .from('[data-hero-img]', { scale: 1.25, duration: 1.4 }, '<')
                    .from('[data-hero-chip]', { y: 30, autoAlpha: 0, duration: DUR.base, ease: EASE.pop }, '-=0.6')
                    .from('[data-hero-scroll]', { autoAlpha: 0, y: -8, duration: DUR.base }, '-=0.3');

                // Plain callback on purpose: on revisits this fires synchronously inside the
                // matchMedia context, and wrapping it in the outer contextSafe nests the two
                // contexts into a cycle (infinite recursion in Context.getTweens).
                // play() creates no tweens, and unsubscribe stops late calls after unmount.
                const unsubscribe = onIntroDone(() => tl.play());

                // Scroll exit: copy drifts up and fades, visual moves slower (depth)
                const exit = { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true };
                gsap.to('[data-hero-copy]', { yPercent: -18, autoAlpha: 0.1, ease: 'none', scrollTrigger: exit });
                gsap.to('[data-hero-tilt]', { yPercent: -8, ease: 'none', scrollTrigger: exit });
                gsap.to('[data-hero-ambient]', { yPercent: 25, ease: 'none', scrollTrigger: exit });

                // Ambient layer: orbs breathe slowly so the background never feels frozen
                gsap.to('[data-orb]', {
                    x: 'random(-40, 40)',
                    y: 'random(-30, 30)',
                    duration: 8,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                    repeatRefresh: true,
                    stagger: 2,
                });

                return unsubscribe;
            });

            // Pointer tilt on the visual — fine pointers only
            mm.add(`${MOTION_OK} and (pointer: fine)`, () => {
                const card = heroRef.current?.querySelector<HTMLElement>('[data-hero-tilt]');
                if (!card) return;
                gsap.set(card, { transformPerspective: 900 });
                const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
                const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
                const move = (e: PointerEvent) => {
                    const r = card.getBoundingClientRect();
                    ry(((e.clientX - r.left) / r.width - 0.5) * 12);
                    rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
                };
                const leave = () => {
                    rx(0);
                    ry(0);
                };
                card.addEventListener('pointermove', move);
                card.addEventListener('pointerleave', leave);
                return () => {
                    card.removeEventListener('pointermove', move);
                    card.removeEventListener('pointerleave', leave);
                };
            });
        },
        { scope: heroRef },
    );

    return (
        <section
            ref={heroRef}
            className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden"
            id="hero"
        >
            {/* Ambient layer */}
            <div data-hero-ambient className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="hud-grid absolute inset-0" />
                <div className="glow-overlay absolute inset-0" />
                <div data-orb className="absolute -top-24 left-[10%] h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
                <div data-orb className="absolute bottom-0 right-[8%] h-96 w-96 rounded-full bg-tertiary/10 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div data-hero-copy className="space-y-8">
                    <div data-hero-badge className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-high/80 rounded-full border border-outline-variant/30">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-primary font-mono text-xs uppercase tracking-[0.2em]">Available for Hire</span>
                    </div>

                    <h1 data-hero-title className="text-5xl md:text-7xl font-headline font-bold leading-[1.05] tracking-tight text-balance">
                        Crafting Scalable{' '}
                        <span className="relative inline-block text-primary">
                            Website
                            <span
                                data-hero-underline
                                className="absolute left-0 -bottom-1 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-primary to-transparent"
                                aria-hidden="true"
                            />
                        </span>{' '}
                        Experiences with Precision.
                    </h1>

                    <p data-hero-fade className="text-lg md:text-xl text-on-surface-variant max-w-xl font-body leading-relaxed">
                        I am <span className="text-on-surface font-semibold">Suan KC</span>, a Junior Frontend Developer specializing in React, Next.js, and the MERN stack, turning complex problems into elegant, user-centric digital solutions.
                    </p>

                    <div data-hero-fade className="flex flex-wrap gap-4 pt-2">
                        <span ref={primaryCta} className="inline-block">
                            <Link
                                to="/projects"
                                className="group bg-gradient-to-br from-primary to-primary-dim text-on-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_0_rgba(129,236,255,0)] hover:shadow-[0_10px_40px_-10px_rgba(129,236,255,0.6)] active:scale-[0.97] transition-[box-shadow,transform] duration-200"
                            >
                                View My Work
                                <span className="material-symbols-outlined transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                            </Link>
                        </span>
                        <span ref={secondaryCta} className="inline-block">
                            <Link
                                to="/contact"
                                className="block px-8 py-4 rounded-xl border border-outline-variant/40 text-primary font-bold hover:border-primary hover:bg-primary/5 active:scale-[0.97] transition-[border-color,background-color,transform] duration-200"
                            >
                                Get In Touch
                            </Link>
                        </span>
                    </div>

                    <div data-hero-fade className="flex items-center gap-6 pt-4">
                        <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 flex items-center gap-2 min-h-[44px]" href="https://github.com/Suwaan2" target="_blank" rel="noopener noreferrer">
                            <span className="material-symbols-outlined" aria-hidden="true">terminal</span> GitHub
                        </a>
                        <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 flex items-center gap-2 min-h-[44px]" href="https://www.linkedin.com/in/suan-kc/" target="_blank" rel="noopener noreferrer">
                            <span className="material-symbols-outlined" aria-hidden="true">work</span> LinkedIn
                        </a>
                    </div>
                </div>

                <div data-hero-tilt className="hidden lg:block relative will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
                    <div data-hero-visual className="aspect-square rounded-[2rem] overflow-hidden bg-surface-container-low border border-outline-variant/20 relative">
                        <img
                            data-hero-img
                            className="w-full h-full object-cover opacity-60"
                            alt="abstract close-up of computer code on a high-definition monitor with blue and cyan neon light reflecting on the screen"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBp-YyEMlgyOU10GBa5rcI35DI1z5OEmBEHXxPTUVTNr4cL2_rbuoL09y5uT4k-Wljt_uAGz8osz6I1VLIFsrnXWpHXzPR4Eko6i3r0K7G7n255QTrT-r1j5NaxqZEXn7GRi1LOVFtMLghjHW7efazHepTgAsvGEHDsRttFcTRzeBVPbDCIC8erHnjxnBwPRflwo2UEgq34qXJ6APrCI13tnIjeGg9RNOamX30F3oV4u5vBKk_xHTMNE15s14WNvuLa6i_fRRxFCxGk"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-primary/10" />
                        {/* HUD corner brackets */}
                        <span className="absolute top-5 left-5 h-6 w-6 border-l border-t border-primary/60" aria-hidden="true" />
                        <span className="absolute top-5 right-5 h-6 w-6 border-r border-t border-primary/60" aria-hidden="true" />
                        <span className="absolute bottom-5 right-5 h-6 w-6 border-r border-b border-primary/60" aria-hidden="true" />
                        <span className="absolute top-6 left-14 font-mono text-[11px] tracking-[0.2em] text-primary/70" aria-hidden="true">SYS.FRONTEND // ONLINE</span>
                    </div>
                    <div
                        data-hero-chip
                        className="absolute -bottom-8 -left-8 glass-card p-6 rounded-xl max-w-[240px] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
                        style={{ transform: 'translateZ(40px)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined" aria-hidden="true">code</span>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant font-label">Core Focus</p>
                                <p className="font-headline font-bold text-sm">Frontend Engineering</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div data-hero-scroll className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex lg:hidden flex-col items-center gap-3 text-on-surface-variant" aria-hidden="true">
                <span className="font-mono text-[11px] tracking-[0.3em] uppercase">Scroll</span>
                <span className="relative h-10 w-px overflow-hidden bg-outline-variant/40">
                    <span className="absolute inset-x-0 top-0 h-1/2 bg-primary animate-[scroll-cue_1.8s_ease-in-out_infinite]" />
                </span>
            </div>
        </section>
    );
}
