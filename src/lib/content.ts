import { createContext, useContext } from 'react';
import type { Content } from '../../shared/schema';
import profile from '../../data/portfolio/profile.json';
import hero from '../../data/portfolio/hero.json';
import about from '../../data/portfolio/about.json';
import skills from '../../data/portfolio/skills.json';
import experience from '../../data/portfolio/experience.json';
import projects from '../../data/portfolio/projects.json';
import education from '../../data/portfolio/education.json';
import achievements from '../../data/portfolio/achievements.json';
import contact from '../../data/portfolio/contact.json';
import availability from '../../data/portfolio/availability.json';

// Copy of the content baked into the build; also the fallback once content is fetched at runtime
export const bundledContent: Content = {
    profile,
    hero,
    about,
    skills,
    experience,
    projects,
    education,
    achievements,
    contact,
    availability,
};

const FETCH_TIMEOUT_MS = 2500;

async function fetchContent(): Promise<Content> {
    if (typeof window === 'undefined') return bundledContent;
    try {
        const res = await fetch('/api/content', { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
        if (!res.ok) return bundledContent;
        const body = (await res.json()) as { success?: boolean; data?: Partial<Content> };
        // The server has already validated each section; anything missing keeps the bundled copy
        return body.success && body.data ? { ...bundledContent, ...body.data } : bundledContent;
    } catch {
        return bundledContent;
    }
}

// Started at load so it runs alongside the preloader; always resolves
export const contentRequest: Promise<Content> = fetchContent();

export const ContentContext = createContext<Content>(bundledContent);

export function useContent(): Content {
    return useContext(ContentContext);
}

/** Link props for the resume: browsers ignore `download` on other origins (e.g. Cloudinary), so those open in a new tab */
export function resumeLinkProps(url: string) {
    return /^https?:\/\//.test(url) ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : { href: url, download: 'Suan_KC_Resume.pdf' };
}
