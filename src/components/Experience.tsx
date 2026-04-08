import { motion } from 'framer-motion';

export function Experience() {
    return (
        <section className="py-32 overflow-hidden" id="experience">
            <div className="max-w-7xl mx-auto px-8">
                <motion.h2 
                    className="text-3xl md:text-4xl font-headline font-bold mb-16 text-center text-on-background"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, amount: 0.8 }}
                >
                    Leadership & Experience
                </motion.h2>
                
                <div className="grid gap-8">
                    {/* AMT Experience */}
                    <motion.div 
                        className="glass-card p-8 md:p-12 rounded-[2rem] relative overflow-hidden"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, type: 'spring' }}
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <div className="absolute -top-10 -right-10 p-8 opacity-5">
                            <span className="material-symbols-outlined text-[150px]">corporate_fare</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
                            <div>
                                <h3 className="text-2xl font-headline font-bold text-primary">Website Development Intern</h3>
                                <p className="text-on-surface font-semibold text-lg">Anand Marketing Tech</p>
                            </div>
                            <div className="text-on-surface-variant font-label font-bold text-sm tracking-widest uppercase bg-surface-container-highest px-4 py-2 rounded-lg inline-block self-start md:self-auto">
                                2023 - PRESENT
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative z-10">
                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-primary mt-1">architecture</span>
                                    <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                                        Architected <span className="text-on-surface font-bold">Arma Fashion V1</span>, translating complex business requirements into a functional frontend architecture.
                                    </p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-primary mt-1">groups</span>
                                    <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                                        Mentored and onboarded <span className="text-on-surface font-bold">4+ interns</span>, fostering a culture of clean code and collaborative growth.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-primary mt-1">account_tree</span>
                                    <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                                        Managed GitHub branch strategies and orchestrated daily standups to maintain high development velocity.
                                    </p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-primary mt-1">draw</span>
                                    <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                                        Team Lead for <span className="text-on-surface font-bold">UI/UX</span>, ensuring design fidelity across all technical implementations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
