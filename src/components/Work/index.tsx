import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function Work() {
    const [activeIndex, setActiveIndex] = useState(0);
    const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

    const headerVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const gridVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 24 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    function go(dir: 1 | -1) {
        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        if (!cards.length) return;
        const next = (activeIndex + dir + cards.length) % cards.length;
        cards[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
        setActiveIndex(next);
    }

    return (
        <section className="py-32 bg-surface-container-lowest overflow-hidden" id="projects">
            <div className="max-w-7xl mx-auto px-8">
                <motion.div
                    className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={headerVariants}
                >
                    <div>
                        <h2 className="text-4xl font-headline font-bold text-on-background">Featured Projects</h2>
                        <p className="text-on-surface-variant mt-4 font-body">Selected work that defines my engineering standard.</p>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <button
                            onClick={() => go(-1)}
                            className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
                            aria-label="Previous project"
                        >
                            <span className="material-symbols-outlined">west</span>
                        </button>
                        <button
                            onClick={() => go(1)}
                            className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
                            aria-label="Next project"
                        >
                            <span className="material-symbols-outlined">east</span>
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    className="grid lg:grid-cols-2 gap-8"
                    variants={gridVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {/* Vault */}
                    <motion.div
                        ref={(el) => { cardRefs.current[0] = el; }}
                        variants={cardVariants}
                        whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                        className="group relative bg-surface-container-high rounded-[2rem] overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(129,236,255,0.1)]"
                    >
                        <div className="h-64 relative overflow-hidden">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                                alt="Vault bookmark library platform"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN-mIzPPG6A1pANif6qWhmnZcd-pzKLVjfFYvyixkhJDXTDDHgfF_mDvwjghnDAkXH2OgiZc9YBn02Dm-EFcGapjnfK24dh54ke3i9rIXBrNiNN4ytB9EgxdlV9bdiZDHH_7FctqwouS8dzkXhaZEMEEa3rHnU4wkJcWJN4g8vGxhb3rPbx1IxKbcVaJSbkvp9y7ZcsprR76iBGU5Q5b2xNKwPjnLrxJGjyalRIaWJx2Yq-9so9oAIwgfQ7NIiO6lREhU7aRQa1gyd"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
                        </div>
                        <div className="p-8 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-headline font-bold text-on-background">Vault</h3>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">bookmark</span>
                            </div>
                            <p className="text-on-surface-variant font-body mb-6 text-sm md:text-base">
                                Personal video and bookmark library platform with OpenGraph scraping and AI-generated summaries via OpenAI.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Next.js</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Prisma</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">OpenAI</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* VideoPlatform App */}
                    <motion.div
                        ref={(el) => { cardRefs.current[1] = el; }}
                        variants={cardVariants}
                        whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                        className="group relative bg-surface-container-high rounded-[2rem] overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(129,236,255,0.1)]"
                    >
                        <a
                            href="https://video-player-platform.vercel.app/home"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-64 relative overflow-hidden block"
                            aria-label="Open VideoPlatform App live site"
                        >
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                                alt="StreamVault video platform homepage screenshot"
                                src={`${import.meta.env.BASE_URL}projects/video-platform.png`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
                        </a>
                        <div className="p-8 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-headline font-bold text-on-background">VideoPlatform App</h3>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">play_circle</span>
                            </div>
                            <p className="text-on-surface-variant font-body mb-6 text-sm md:text-base">
                                Fullstack YouTube-style video platform with JWT auth, Cloudinary storage, Redis caching, and Docker Compose deployment.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">React 19</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Express 5</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Docker</span>
                            </div>
                            <a
                                href="https://video-player-platform.vercel.app/home"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                            >
                                Visit Live Site
                                <span className="material-symbols-outlined text-base">open_in_new</span>
                            </a>
                        </div>
                    </motion.div>

                    {/* MomoryBox */}
                    <motion.div
                        ref={(el) => { cardRefs.current[2] = el; }}
                        variants={cardVariants}
                        whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                        className="group relative bg-surface-container-high rounded-[2rem] overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(129,236,255,0.1)]"
                    >
                        <div className="h-64 relative overflow-hidden">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                                alt="MomoryBox gift e-commerce platform"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY5hO_M7IDbpAbj_SjHQ7bHccSXQACykadDVIWo4uOesggIUg1gjdSHQ7sDAf2ghF1BX6Al_my3zlBY3FNyEMgFCQWsw3ZfBuZg0OKDQqaS9sfHfhgxVgkjfMQeG2WtUM5NdrkCUNV5z67CUT-6hB0uU5CF40E2YhBkqFRcqeOCXEBDPE1t-2OvQJ1RMlaBgJpUoZAE1_cXJALOempGaLPqPshi0jVM6rBy9k-w7TMMCo5H8W2mQMKIjCBZNmYqvmarl7W7a85W0D1"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
                        </div>
                        <div className="p-8 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-headline font-bold text-on-background">MomoryBox</h3>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">redeem</span>
                            </div>
                            <p className="text-on-surface-variant font-body mb-6 text-sm md:text-base">
                                Personalized gift e-commerce platform with multi-step checkout, eSewa payments, and 70+ REST endpoints with RBAC.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">MERN</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">eSewa</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">BullMQ</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* PMT Frontend */}
                    <motion.div
                        ref={(el) => { cardRefs.current[3] = el; }}
                        variants={cardVariants}
                        whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                        className="group relative bg-surface-container-high rounded-[2rem] overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(129,236,255,0.1)]"
                    >
                        <div className="h-64 relative overflow-hidden">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                                alt="Project management SaaS dashboard"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN-mIzPPG6A1pANif6qWhmnZcd-pzKLVjfFYvyixkhJDXTDDHgfF_mDvwjghnDAkXH2OgiZc9YBn02Dm-EFcGapjnfK24dh54ke3i9rIXBrNiNN4ytB9EgxdlV9bdiZDHH_7FctqwouS8dzkXhaZEMEEa3rHnU4wkJcWJN4g8vGxhb3rPbx1IxKbcVaJSbkvp9y7ZcsprR76iBGU5Q5b2xNKwPjnLrxJGjyalRIaWJx2Yq-9so9oAIwgfQ7NIiO6lREhU7aRQa1gyd"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
                        </div>
                        <div className="p-8 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-headline font-bold text-on-background">PMT Frontend</h3>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">dashboard</span>
                            </div>
                            <p className="text-on-surface-variant font-body mb-6 text-sm md:text-base">
                                Multi-role project management SaaS frontend with 6 roles, ~130 routes, cookie-based JWT auth, and granular permissions.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">React 19</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Redux Toolkit</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Vite</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* TrelloMCP */}
                    <motion.div
                        ref={(el) => { cardRefs.current[4] = el; }}
                        variants={cardVariants}
                        whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                        className="group relative bg-surface-container-high rounded-[2rem] overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(129,236,255,0.1)]"
                    >
                        <div className="h-64 relative overflow-hidden">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                                alt="Trello MCP server"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPp9w2EibPpnUxzrtU6AI-UGHbX-Q5VPIoDsmhjd32xnpSl6d79YcqM9RQNVgL9VXePSyvv-dACBKqi41TMcaz9JW1YIHSeBnPE2-MxZUW7eRCT7rTAcdEMryCKvg_Y8FC-ecKc74ST-uayFC4eAjQyFwN-ZXfjznB3EY19ukWSbHQ4Z1y7447MQlXVLzocFJASN5V1fVP_YESoBqNfoWg1m0sMp4au2O0oeUmcKTvprVLzjCdTUy0U9FQkHeSvzFTYyMs5aoCBas4"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
                        </div>
                        <div className="p-8 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-headline font-bold text-on-background">TrelloMCP</h3>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">view_kanban</span>
                            </div>
                            <p className="text-on-surface-variant font-body mb-6 text-sm md:text-base">
                                Model Context Protocol server exposing Trello as callable tools for AI assistants like Claude Desktop.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">MCP SDK</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Node.js</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Zod</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}