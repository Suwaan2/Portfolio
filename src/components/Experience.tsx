import { motion } from 'framer-motion';

export function Experience() {
    const columnVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } }
    };

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
                        whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                        transition={{ duration: 0.7, type: 'spring' }}
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <div className="absolute -top-10 -right-10 p-8 opacity-5">
                            <span className="material-symbols-outlined text-[150px]">corporate_fare</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
                            <div>
                                <h3 className="text-2xl font-headline font-bold text-primary">Junior Frontend Developer</h3>
                                <p className="text-on-surface font-semibold text-lg">Anand Marketing Tech</p>
                            </div>
                            <div className="text-on-surface-variant font-label font-bold text-sm tracking-widest uppercase bg-surface-container-highest px-4 py-2 rounded-lg inline-block self-start md:self-auto">
                                JAN 2026 - PRESENT
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative z-10">
                            <motion.div
                                className="space-y-6"
                                variants={columnVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <motion.div variants={itemVariants} className="flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-primary mt-1">shopping_cart</span>
                                    <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                                        Developed <span className="text-on-surface font-bold">Ecommerce-Fashion</span>, a live multi-vendor e-commerce platform with JWT-based MERN auth and role-based dashboards.
                                    </p>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-primary mt-1">groups</span>
                                    <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                                        Mentored and onboarded <span className="text-on-surface font-bold">4+ incoming interns</span>, fostering a culture of clean code and collaborative growth.
                                    </p>
                                </motion.div>
                            </motion.div>
                            <motion.div
                                className="space-y-6"
                                variants={columnVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <motion.div variants={itemVariants} className="flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-primary mt-1">rocket_launch</span>
                                    <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                                        Resolved critical deployment blockers to bring the platform to production.
                                    </p>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-primary mt-1">stacked_bar_chart</span>
                                    <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                                        Worked across <span className="text-on-surface font-bold">React, Redux Toolkit, Node.js, Express, PostgreSQL, and Redis</span> in a production environment.
                                    </p>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}