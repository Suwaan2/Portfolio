import { useRef } from 'react';
import { useScrollReveal } from '../lib/useScrollReveal';

const groups = [
    {
        icon: 'laptop_chromebook',
        title: 'Frontend',
        skills: ['Next.js', 'React 18/19', 'Redux Toolkit', 'RTK Query', 'React Router', 'Vite', 'Tailwind CSS', 'Bootstrap', 'Axios', 'HTML5', 'CSS3', 'Responsive Design'],
    },
    {
        icon: 'database',
        title: 'Backend & DB',
        skills: ['Node.js', 'Express', 'JWT', 'REST APIs', 'MCP', 'Zod', 'MongoDB', 'Mongoose', 'PostgreSQL', 'Prisma', 'Redis'],
    },
    {
        icon: 'architecture',
        title: 'Tools & Testing',
        skills: ['Docker', 'BullMQ', 'Cloudinary', 'Git / GitHub', 'Postman', 'Vercel', 'Figma', 'Canva', 'Trello', 'Vitest', 'Playwright', 'Supertest'],
    },
];

export function Skills() {
    const ref = useRef<HTMLElement>(null);
    useScrollReveal(ref);

    return (
        <section ref={ref} className="py-28 md:py-32 overflow-hidden" id="skills">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="text-center mb-16 md:mb-20 flex flex-col items-center">
                    <div data-reveal className="eyebrow mb-6">
                        <span>02</span>
                        <span data-line className="h-px w-10 bg-primary/60" aria-hidden="true" />
                        <span>Skills</span>
                    </div>
                    <h2 data-split className="text-4xl md:text-5xl font-headline font-bold mb-4">
                        Technical <span className="text-primary">Arsenal</span>
                    </h2>
                    <p data-reveal className="text-on-surface-variant font-body">My specialized toolkit for building modern web ecosystems.</p>
                </div>

                <div data-reveal-group className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {groups.map((g, i) => (
                        <div
                            key={g.title}
                            data-reveal-item
                            className="spotlight group glass-card p-8 rounded-xl border-t-2 border-t-primary/30 transition-[border-color,transform,box-shadow] duration-300 hover:border-t-primary hover:-translate-y-2 hover:shadow-[0_24px_60px_-30px_rgba(129,236,255,0.35)]"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" aria-hidden="true">
                                        {g.icon}
                                    </span>
                                    <h3 className="text-xl font-headline font-bold">{g.title}</h3>
                                </div>
                                <span className="font-mono text-xs text-on-surface-variant" aria-hidden="true">
                                    {String(i + 1).padStart(2, '0')}/{String(groups.length).padStart(2, '0')}
                                </span>
                            </div>
                            <ul className="flex flex-wrap gap-2">
                                {g.skills.map((skill) => (
                                    <li
                                        key={skill}
                                        className="px-3 py-1 bg-surface-container-highest rounded-lg text-xs font-label border border-transparent transition-[color,border-color,transform] duration-150 hover:-translate-y-0.5 hover:text-primary hover:border-primary/30"
                                    >
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
