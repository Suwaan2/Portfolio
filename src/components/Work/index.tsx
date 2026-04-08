import { motion } from 'framer-motion';

export function Work() {
    const fadeUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <section className="py-32 bg-surface-container-lowest overflow-hidden" id="projects">
            <div className="max-w-7xl mx-auto px-8">
                <motion.div
                    className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={fadeUp}
                >
                    <div>
                        <h2 className="text-4xl font-headline font-bold text-on-background">Featured Projects</h2>
                        <p className="text-on-surface-variant mt-4 font-body">Selected work that defines my engineering standard.</p>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <button className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors">
                            <span className="material-symbols-outlined">west</span>
                        </button>
                        <button className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors">
                            <span className="material-symbols-outlined">east</span>
                        </button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Project 1: Large Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        className="group relative bg-surface-container-high rounded-[2rem] overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(129,236,255,0.1)]"
                    >
                        <div className="h-64 relative overflow-hidden">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                                alt="Modern e-commerce dashboard"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_TxXCh18yobKGp4yleLxoRTSF4VhXpafTUHZ1rhL0sYtQ-Q3b4IRz2PJmtEfbhE9dfjbZEuQRwgxxxWuRAg0vHLItUqLOYQLPVjWsgYXQTn50Sm3L0IcQsIlLUKy-sn3G-FjtxHH25j50iWQPGvUmrRs2k-_e6S0Pw38OUK9Q6dB-7bhga-mdGsyJqFKPFDwItWZp2HtqNaA8cr4af4izTAPPkEg42iOvR_3EHgpGTvi_LFi9zuMTGbuGYY1reEnxJqjBS3OWSGDF"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
                        </div>
                        <div className="p-8 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-headline font-bold text-on-background">Arma Fashion</h3>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">open_in_new</span>
                            </div>
                            <p className="text-on-surface-variant font-body mb-6 text-sm md:text-base">
                                A high-performance Multi-Vendor E-Commerce SPA featuring role-based dashboards and complex Redux state management.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">React</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Django REST</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">PostgreSQL</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Redis</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Project 2 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true, amount: 0.1 }}
                        className="group relative bg-surface-container-high rounded-[2rem] overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(129,236,255,0.1)]"
                    >
                        <div className="h-64 relative overflow-hidden">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                                alt="Authentication System"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN-mIzPPG6A1pANif6qWhmnZcd-pzKLVjfFYvyixkhJDXTDDHgfF_mDvwjghnDAkXH2OgiZc9YBn02Dm-EFcGapjnfK24dh54ke3i9rIXBrNiNN4ytB9EgxdlV9bdiZDHH_7FctqwouS8dzkXhaZEMEEa3rHnU4wkJcWJN4g8vGxhb3rPbx1IxKbcVaJSbkvp9y7ZcsprR76iBGU5Q5b2xNKwPjnLrxJGjyalRIaWJx2Yq-9so9oAIwgfQ7NIiO6lREhU7aRQa1gyd"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
                        </div>
                        <div className="p-8 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-headline font-bold text-on-background">MERN Auth System</h3>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">lock</span>
                            </div>
                            <p className="text-on-surface-variant font-body mb-6 text-sm md:text-base">
                                Secure stateless authentication system implementing JWT Access and Refresh Token rotation for maximum security.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Node.js</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Express</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">JWT</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Project 3 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        className="group relative bg-surface-container-high rounded-[2rem] overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(129,236,255,0.1)]"
                    >
                        <div className="h-64 relative overflow-hidden">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                                alt="LMS System"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPp9w2EibPpnUxzrtU6AI-UGHbX-Q5VPIoDsmhjd32xnpSl6d79YcqM9RQNVgL9VXePSyvv-dACBKqi41TMcaz9JW1YIHSeBnPE2-MxZUW7eRCT7rTAcdEMryCKvg_Y8FC-ecKc74ST-uayFC4eAjQyFwN-ZXfjznB3EY19ukWSbHQ4Z1y7447MQlXVLzocFJASN5V1fVP_YESoBqNfoWg1m0sMp4au2O0oeUmcKTvprVLzjCdTUy0U9FQkHeSvzFTYyMs5aoCBas4"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
                        </div>
                        <div className="p-8 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-headline font-bold text-on-background">ProLMS Ecosystem</h3>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">school</span>
                            </div>
                            <p className="text-on-surface-variant font-body mb-6 text-sm md:text-base">
                                Full-scale Learning Management System featuring Stripe payment integration and a dual Teacher-Student portal.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">MongoDB</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Stripe</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">Node</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Project 4 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true, amount: 0.1 }}
                        className="group relative bg-surface-container-high rounded-[2rem] overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(129,236,255,0.1)]"
                    >
                        <div className="h-64 relative overflow-hidden">
                            <img
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                                alt="Storefront design"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY5hO_M7IDbpAbj_SjHQ7bHccSXQACykadDVIWo4uOesggIUg1gjdSHQ7sDAf2ghF1BX6Al_my3zlBY3FNyEMgFCQWsw3ZfBuZg0OKDQqaS9sfHfhgxVgkjfMQeG2WtUM5NdrkCUNV5z67CUT-6hB0uU5CF40E2YhBkqFRcqeOCXEBDPE1t-2OvQJ1RMlaBgJpUoZAE1_cXJALOempGaLPqPshi0jVM6rBy9k-w7TMMCo5H8W2mQMKIjCBZNmYqvmarl7W7a85W0D1"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
                        </div>
                        <div className="p-8 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-headline font-bold text-on-background">WordPress Store</h3>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">shopping_bag</span>
                            </div>
                            <p className="text-on-surface-variant font-body mb-6 text-sm md:text-base">
                                Custom WooCommerce implementation with optimized checkout flows and seamless Stripe gateway integration.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">WordPress</span>
                                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter bg-primary/10 text-primary rounded">WooCommerce</span>
                            </div>
                        </div>
                    </motion.div>
            

                </div>
            </div>
        </section>
    );
}