import { useRef, useState } from 'react';
import { useScrollReveal } from '../../lib/useScrollReveal';

type Project = {
    title: string;
    icon: string;
    description: string;
    tags: string[];
    image: string;
    alt: string;
    href?: string;
};

const projects: Project[] = [
    {
        title: 'Vault',
        icon: 'bookmark',
        description: 'Personal video and bookmark library platform with OpenGraph scraping and AI-generated summaries via OpenAI.',
        tags: ['Next.js', 'Prisma', 'OpenAI'],
        alt: 'Vault bookmark library platform',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN-mIzPPG6A1pANif6qWhmnZcd-pzKLVjfFYvyixkhJDXTDDHgfF_mDvwjghnDAkXH2OgiZc9YBn02Dm-EFcGapjnfK24dh54ke3i9rIXBrNiNN4ytB9EgxdlV9bdiZDHH_7FctqwouS8dzkXhaZEMEEa3rHnU4wkJcWJN4g8vGxhb3rPbx1IxKbcVaJSbkvp9y7ZcsprR76iBGU5Q5b2xNKwPjnLrxJGjyalRIaWJx2Yq-9so9oAIwgfQ7NIiO6lREhU7aRQa1gyd',
    },
    {
        title: 'VideoPlatform App',
        icon: 'play_circle',
        description: 'Fullstack YouTube-style video platform with JWT auth, Cloudinary storage, Redis caching, and Docker Compose deployment.',
        tags: ['React 19', 'Express 5', 'Docker'],
        alt: 'StreamVault video platform homepage screenshot',
        image: `${import.meta.env.BASE_URL}projects/video-platform.png`,
        href: 'https://video-player-platform.vercel.app/home',
    },
    {
        title: 'MomoryBox',
        icon: 'redeem',
        description: 'Personalized gift e-commerce platform with multi-step checkout, eSewa payments, and 70+ REST endpoints with RBAC.',
        tags: ['MERN', 'eSewa', 'BullMQ'],
        alt: 'MomoryBox gift e-commerce platform',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY5hO_M7IDbpAbj_SjHQ7bHccSXQACykadDVIWo4uOesggIUg1gjdSHQ7sDAf2ghF1BX6Al_my3zlBY3FNyEMgFCQWsw3ZfBuZg0OKDQqaS9sfHfhgxVgkjfMQeG2WtUM5NdrkCUNV5z67CUT-6hB0uU5CF40E2YhBkqFRcqeOCXEBDPE1t-2OvQJ1RMlaBgJpUoZAE1_cXJALOempGaLPqPshi0jVM6rBy9k-w7TMMCo5H8W2mQMKIjCBZNmYqvmarl7W7a85W0D1',
    },
    {
        title: 'PMT Frontend',
        icon: 'dashboard',
        description: 'Multi-role project management SaaS frontend with 6 roles, ~130 routes, cookie-based JWT auth, and granular permissions.',
        tags: ['React 19', 'Redux Toolkit', 'Vite'],
        alt: 'Project management SaaS dashboard',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN-mIzPPG6A1pANif6qWhmnZcd-pzKLVjfFYvyixkhJDXTDDHgfF_mDvwjghnDAkXH2OgiZc9YBn02Dm-EFcGapjnfK24dh54ke3i9rIXBrNiNN4ytB9EgxdlV9bdiZDHH_7FctqwouS8dzkXhaZEMEEa3rHnU4wkJcWJN4g8vGxhb3rPbx1IxKbcVaJSbkvp9y7ZcsprR76iBGU5Q5b2xNKwPjnLrxJGjyalRIaWJx2Yq-9so9oAIwgfQ7NIiO6lREhU7aRQa1gyd',
    },
    {
        title: 'TrelloMCP',
        icon: 'view_kanban',
        description: 'Model Context Protocol server exposing Trello as callable tools for AI assistants like Claude Desktop.',
        tags: ['MCP SDK', 'Node.js', 'Zod'],
        alt: 'Trello MCP server',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPp9w2EibPpnUxzrtU6AI-UGHbX-Q5VPIoDsmhjd32xnpSl6d79YcqM9RQNVgL9VXePSyvv-dACBKqi41TMcaz9JW1YIHSeBnPE2-MxZUW7eRCT7rTAcdEMryCKvg_Y8FC-ecKc74ST-uayFC4eAjQyFwN-ZXfjznB3EY19ukWSbHQ4Z1y7447MQlXVLzocFJASN5V1fVP_YESoBqNfoWg1m0sMp4au2O0oeUmcKTvprVLzjCdTUy0U9FQkHeSvzFTYyMs5aoCBas4',
    },
];

const navButtonClass =
    'w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary hover:bg-primary/5 active:scale-90 transition-[color,border-color,background-color,transform] duration-200';

export function Work() {
    const ref = useRef<HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const cardRefs = useRef<Array<HTMLElement | null>>([]);
    useScrollReveal(ref);

    function go(dir: 1 | -1) {
        const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
        if (!cards.length) return;
        const next = (activeIndex + dir + cards.length) % cards.length;
        cards[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
        setActiveIndex(next);
    }

    return (
        <section ref={ref} className="py-28 md:py-32 bg-surface-container-lowest overflow-hidden" id="projects">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-6">
                    <div>
                        <div data-reveal className="eyebrow mb-6">
                            <span>03</span>
                            <span data-line className="h-px w-10 bg-primary/60" aria-hidden="true" />
                            <span>Projects</span>
                        </div>
                        <h2 data-split className="text-4xl md:text-5xl font-headline font-bold text-on-background">
                            Featured <span className="text-primary">Projects</span>
                        </h2>
                        <p data-reveal className="text-on-surface-variant mt-4 font-body">Selected work that defines my engineering standard.</p>
                    </div>
                    <div data-reveal className="hidden md:flex items-center gap-4">
                        <span className="font-mono text-xs text-on-surface-variant tabular-nums" aria-live="polite">
                            {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                        </span>
                        <button onClick={() => go(-1)} className={navButtonClass} aria-label="Previous project">
                            <span className="material-symbols-outlined" aria-hidden="true">west</span>
                        </button>
                        <button onClick={() => go(1)} className={navButtonClass} aria-label="Next project">
                            <span className="material-symbols-outlined" aria-hidden="true">east</span>
                        </button>
                    </div>
                </div>

                <div data-reveal-group className="grid lg:grid-cols-2 gap-8">
                    {projects.map((p, i) => {
                        const media = (
                            <>
                                {/* Oversized so the scrubbed parallax never exposes an edge */}
                                <div data-parallax="14" className="absolute inset-x-0 -inset-y-[12%]">
                                    <img
                                        className="w-full h-full object-cover opacity-70 transition-[transform,opacity] duration-700 ease-out group-hover:scale-105 group-hover:opacity-90"
                                        alt={p.alt}
                                        src={p.image}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent" />
                                <span className="absolute top-5 left-6 font-mono text-xs tracking-[0.2em] text-primary px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md border border-primary/20">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            </>
                        );

                        return (
                            <article
                                key={p.title}
                                ref={(el) => { cardRefs.current[i] = el; }}
                                data-reveal-item
                                className={`spotlight group relative bg-surface-container-high rounded-[2rem] overflow-hidden border transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1.5 hover:shadow-[0_0_40px_rgba(129,236,255,0.12)] ${
                                    activeIndex === i ? 'border-primary/30' : 'border-outline-variant/10'
                                }`}
                            >
                                {p.href ? (
                                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="h-64 relative overflow-hidden block" aria-label={`Open ${p.title} live site`}>
                                        {media}
                                    </a>
                                ) : (
                                    <div className="h-64 relative overflow-hidden">{media}</div>
                                )}
                                <div className="p-8 relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-headline font-bold text-on-background">{p.title}</h3>
                                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full transition-transform duration-300 group-hover:rotate-12" aria-hidden="true">
                                            {p.icon}
                                        </span>
                                    </div>
                                    <p className="text-on-surface-variant font-body mb-6 text-sm md:text-base">{p.description}</p>
                                    <ul className={`flex flex-wrap gap-2 ${p.href ? 'mb-4' : 'mb-2'}`}>
                                        {p.tags.map((t) => (
                                            <li key={t} className="px-2 py-1 text-[11px] uppercase font-bold tracking-tight bg-primary/10 text-primary rounded">
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                    {p.href && (
                                        <a
                                            href={p.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/link inline-flex items-center gap-2 text-primary font-bold text-sm min-h-[44px]"
                                        >
                                            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover/link:bg-[length:100%_1px]">
                                                Visit Live Site
                                            </span>
                                            <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" aria-hidden="true">
                                                open_in_new
                                            </span>
                                        </a>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
