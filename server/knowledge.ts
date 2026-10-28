import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sectionSchemas, SECTION_KEYS, type Content, type Project as ContentProject } from '../shared/schema.js';
import { stripMarkup } from '../shared/markup.js';

const SERVER_DIR = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = [join(SERVER_DIR, '..', 'data', 'portfolio'), join(process.cwd(), 'data', 'portfolio')].find(
  (p) => existsSync(p),
) ?? join(SERVER_DIR, '..', 'data', 'portfolio');

function loadSection<K extends keyof Content>(key: K): Content[K] {
  const raw = JSON.parse(readFileSync(join(DATA_DIR, `${key}.json`), 'utf-8'));
  const parsed = sectionSchemas[key].safeParse(raw);
  if (!parsed.success) throw new Error(`Invalid ${key}.json: ${parsed.error.message}`);
  return parsed.data as Content[K];
}

export function loadContent(): Content {
  return Object.fromEntries(SECTION_KEYS.map((k) => [k, loadSection(k)])) as Content;
}

export interface PortfolioProfile {
  name: string;
  title: string;
  location?: string;
  summary: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  status: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  tech?: string;
  responsibilities: string[];
}

// Display-only fields (icons, images, card text) are left out of the chatbot's view
export type Project = Omit<ContentProject, 'icon' | 'image' | 'imageAlt' | 'summary' | 'tags'>;

export interface PortfolioKnowledge {
  profile: PortfolioProfile;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: Record<string, string[]>;
  projects: Project[];
  achievements: string[];
  availability: { available: boolean; message: string };
  contact: Record<string, string>;
}

export function toKnowledge(content: Content): PortfolioKnowledge {
  const { name, title, location, summary } = content.profile;
  return {
    profile: { name, title, location, summary },
    education: content.education.education,
    experience: content.experience.experience.map(({ highlights, ...job }) => ({
      ...job,
      responsibilities: highlights.map((h) => stripMarkup(h.text)),
    })),
    skills: Object.fromEntries(content.skills.groups.map((g) => [g.title, g.skills])),
    projects: content.projects.projects.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      description: p.description,
      technologies: p.technologies,
      features: p.features,
      role: p.role,
      challenges: p.challenges,
      links: p.links,
    })),
    achievements: content.achievements.achievements,
    availability: content.availability,
    contact: Object.fromEntries(Object.entries(content.contact).filter((e): e is [string, string] => Boolean(e[1]))),
  };
}

export function loadKnowledge(): PortfolioKnowledge {
  return toKnowledge(loadContent());
}
