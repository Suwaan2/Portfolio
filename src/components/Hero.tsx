import { useRef } from 'react';
import { motion, useScroll, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionLink = motion.create(Link);

export function Hero() {
    const heroRef = useRef<HTMLElement>(null);

    // Mouse parallax on the hero image
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 150, damping: 20 });

    // Scroll-driven fade as the hero scrolls away
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -80]);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const childVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: 'spring' as const, stiffness: 50, damping: 15 }
        }
    };

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.8, ease: "easeOut" as const }
        }
    };

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
    }

    return (
        <motion.section 
            ref={heroRef}
            className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden"
            id="hero"
            style={{ opacity: heroOpacity, y: heroY }}
        >
            <div className="absolute inset-0 glow-overlay pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <motion.div 
                    className="space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.div variants={childVariants} className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-primary font-label text-sm uppercase tracking-widest font-bold">Available for Hire</span>
                    </motion.div>
                    
                    <motion.h1 variants={childVariants} className="text-5xl md:text-7xl font-headline font-bold leading-tight tracking-tight">
                        Crafting Scalable <span className="text-primary">Website</span> Experiences with Precision.
                    </motion.h1>
                    
                    <motion.p variants={childVariants} className="text-lg md:text-xl text-on-surface-variant max-w-xl font-body leading-relaxed">
                        I am <span className="text-on-surface font-semibold">Suan KC</span>, a Junior Frontend Developer specializing in React, Next.js, and the MERN stack, turning complex problems into elegant, user-centric digital solutions.
                    </motion.p>
                    
                    <motion.div variants={childVariants} className="flex flex-wrap gap-4 pt-4">
                        <MotionLink
                            to="/projects"
                            className="bg-gradient-to-br from-primary to-primary-dim text-on-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2 will-change-transform"
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                            View My Work <span className="material-symbols-outlined">arrow_forward</span>
                        </MotionLink>
                        <MotionLink
                            to="/contact"
                            className="px-8 py-4 rounded-xl border border-outline-variant/30 text-primary font-bold will-change-transform"
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                            Get In Touch
                        </MotionLink>
                    </motion.div>
                    
                    <motion.div variants={childVariants} className="flex items-center gap-6 pt-6">
                        <a className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2" href="https://github.com/Suwaan2" target="_blank">
                            <span className="material-symbols-outlined" data-icon="terminal">terminal</span> GitHub
                        </a>
                        <a className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2" href="https://www.linkedin.com/in/suan-kc/" target="_blank">
                            <span className="material-symbols-outlined" data-icon="work">work</span> LinkedIn
                        </a>
                    </motion.div>
                </motion.div>

                <motion.div 
                    className="hidden lg:block relative"
                    variants={imageVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                    onMouseMove={handleMouseMove}
                >
                    <div className="aspect-square rounded-[2rem] overflow-hidden bg-surface-container-low border border-outline-variant/10">
                        <img 
                            className="w-full h-full object-cover opacity-60" 
                            alt="abstract close-up of computer code on a high-definition monitor with blue and cyan neon light reflecting on the screen" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBp-YyEMlgyOU10GBa5rcI35DI1z5OEmBEHXxPTUVTNr4cL2_rbuoL09y5uT4k-Wljt_uAGz8osz6I1VLIFsrnXWpHXzPR4Eko6i3r0K7G7n255QTrT-r1j5NaxqZEXn7GRi1LOVFtMLghjHW7efazHepTgAsvGEHDsRttFcTRzeBVPbDCIC8erHnjxnBwPRflwo2UEgq34qXJ6APrCI13tnIjeGg9RNOamX30F3oV4u5vBKk_xHTMNE15s14WNvuLa6i_fRRxFCxGk"
                        />
                    </div>
                    <motion.div 
                        className="absolute -bottom-8 -left-8 glass-card p-6 rounded-xl space-y-4 max-w-[240px]"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        viewport={{ once: true }}
                        style={{ transform: 'translateZ(40px)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">code</span>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant font-label">Core Focus</p>
                                <p className="font-headline font-bold text-sm">Frontend Engineering</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    );
}