import { motion } from 'framer-motion';

export function About() {
    return (
        <section className="py-32 bg-surface-container-low overflow-hidden" id="about">
            <div className="max-w-7xl mx-auto px-8">
                <motion.div 
                    className="grid lg:grid-cols-12 gap-16 items-start"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <div className="lg:col-span-5">
                        <h2 className="text-3xl font-headline font-bold text-primary mb-6">About My Journey</h2>
                        <div className="space-y-6 text-on-surface-variant leading-relaxed font-body text-lg">
                            <p>
                                My journey began as a curious CS student at <span className="text-on-surface">Vedas College</span>, where I discovered the immense power of code to bring abstract ideas to life. This academic foundation paved the way for my role as an Intern at <span className="text-on-surface">Anand Marketing Tech</span>.
                            </p>
                            <p>
                                I found my niche in the intersection of aesthetics and logic. My true passion lies in <span className="text-primary-dim">bridging the gap</span> between intricate Figma designs and high-performance, production-ready React applications.
                            </p>
                        </div>
                    </div>
                    <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                        <motion.div 
                            className="glass-card p-8 rounded-xl flex flex-col justify-center text-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">CS</span>
                            <span className="text-xs md:text-sm font-label text-on-surface-variant uppercase tracking-widest">Education</span>
                        </motion.div>
                        <motion.div 
                            className="glass-card p-8 rounded-xl flex flex-col justify-center text-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">React</span>
                            <span className="text-xs md:text-sm font-label text-on-surface-variant uppercase tracking-widest">Specialization</span>
                        </motion.div>
                        <motion.div 
                            className="glass-card p-8 rounded-xl flex flex-col justify-center text-center col-span-2 md:col-span-1 lg:col-span-2"
                            whileHover={{ scale: 1.02 }}
                        >
                            <span className="text-4xl font-headline font-bold text-primary mb-2">Internship</span>
                            <span className="text-sm font-label text-on-surface-variant uppercase tracking-widest">Anand Marketing Tech</span>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}