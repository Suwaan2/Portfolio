import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function Hero() {
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

    return (
        <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden" id="hero">
            <div className="absolute inset-0 glow-overlay pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <motion.div 
                    className="space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.div variants={childVariants} className="inline-block px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant/20">
                        <span className="text-primary font-label text-sm uppercase tracking-widest font-bold">Available for Hire</span>
                    </motion.div>
                    
                    <motion.h1 variants={childVariants} className="text-5xl md:text-7xl font-headline font-bold leading-tight tracking-tight">
                        Crafting Scalable <span className="text-primary">Website</span> Experiences with Precision.
                    </motion.h1>
                    
                    <motion.p variants={childVariants} className="text-lg md:text-xl text-on-surface-variant max-w-xl font-body leading-relaxed">
                        I am <span className="text-on-surface font-semibold">Suan KC</span>, a Website Developer specializing in the MERN stack, turning complex problems into elegant, user-centric digital solutions.
                    </motion.p>
                    
                    <motion.div variants={childVariants} className="flex flex-wrap gap-4 pt-4">
                        <Link to="/projects" className="bg-gradient-to-br from-primary to-primary-dim text-on-primary px-8 py-4 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 flex items-center gap-2">
                            View My Work <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                        <Link to="/contact" className="px-8 py-4 rounded-xl border border-outline-variant/30 text-primary font-bold hover:bg-primary/5 transition-colors">
                            Get In Touch
                        </Link>
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
        </section>
    );
}