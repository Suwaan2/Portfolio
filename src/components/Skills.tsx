import { motion } from 'framer-motion';

export function Skills() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" as const }
        }
    };

    return (
        <section className="py-32 overflow-hidden" id="skills">
            <div className="max-w-7xl mx-auto px-8">
                <motion.div 
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <h2 className="text-4xl font-headline font-bold mb-4">Technical Arsenal</h2>
                    <p className="text-on-surface-variant font-body">My specialized toolkit for building modern web ecosystems.</p>
                </motion.div>
                
                <motion.div 
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {/* Frontend */}
                    <motion.div variants={cardVariants} className="glass-card p-8 rounded-xl border-t-2 border-primary/30 hover:border-primary transition-colors">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary" data-icon="laptop_chromebook">laptop_chromebook</span>
                            <h3 className="text-xl font-headline font-bold">Frontend</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['React.js', 'Redux Toolkit', 'React Router', 'Axios', 'HTML5', 'CSS3', 'Responsive Design', 'Tailwind CSS'].map(skill => (
                                <span key={skill} className="px-3 py-1 bg-surface-container-highest rounded-lg text-xs font-label">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                    
                    {/* Backend */}
                    <motion.div variants={cardVariants} className="glass-card p-8 rounded-xl border-t-2 border-primary/30 hover:border-primary transition-colors">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary" data-icon="database">database</span>
                            <h3 className="text-xl font-headline font-bold">Backend & DB</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Node.js', 'Express.js', 'JWT', 'MongoDB', 'PostgreSQL', 'Redis', 'Django REST'].map(skill => (
                                <span key={skill} className="px-3 py-1 bg-surface-container-highest rounded-lg text-xs font-label">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                    
                    {/* Tools */}
                    <motion.div variants={cardVariants} className="glass-card p-8 rounded-xl border-t-2 border-primary/30 hover:border-primary transition-colors">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary" data-icon="architecture">architecture</span>
                            <h3 className="text-xl font-headline font-bold">Architecture & Tools</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Git / GitHub', 'Postman', 'Figma', 'Canva', 'Vercel', 'WordPress'].map(skill => (
                                <span key={skill} className="px-3 py-1 bg-surface-container-highest rounded-lg text-xs font-label">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
