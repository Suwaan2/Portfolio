import { motion } from 'framer-motion';

export function Contact() {
    return (
        <section className="py-32 overflow-hidden" id="contact">
            <motion.div 
                className="max-w-4xl mx-auto px-4 md:px-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                viewport={{ once: true, amount: 0.5 }}
            >
                <div className="glass-card p-10 md:p-16 rounded-[2rem] md:rounded-[2.5rem] border-2 border-primary/10 hover:border-primary/30 transition-colors duration-500">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold mb-6 text-on-background leading-tight">
                        Let's build something <span className="text-primary block md:inline mt-2 md:mt-0">extraordinary.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-on-surface-variant font-body mb-12 max-w-2xl mx-auto">
                        Looking for a dedicated developer to elevate your next project? My inbox is always open.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <a 
                            className="px-8 md:px-10 py-4 md:py-5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_30px_rgba(129,236,255,0.3)] hover:-translate-y-1 transition-all duration-300" 
                            href="mailto:hello@suankc.com"
                        >
                            Get In Touch
                        </a>
                        <a 
                            className="px-8 md:px-10 py-4 md:py-5 bg-surface-container-highest text-on-surface font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-variant hover:-translate-y-1 transition-all duration-300" 
                            href="/Suan_KC_Resume.pdf"
                            download="Suan_KC_Resume.pdf"
                        >
                            Download CV
                        </a>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}