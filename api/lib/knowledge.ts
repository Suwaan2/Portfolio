import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_DIR = dirname(fileURLToPath(import.meta.url));
const CWD_DIR = join(process.cwd(), 'api', 'lib');

const DATA_DIR = [join(API_DIR, '..', '..', 'data', 'portfolio'), join(CWD_DIR, '..', '..', 'data', 'portfolio')].find(
  (p) => existsSync(p),
) ?? join(API_DIR, '..', '..', 'data', 'portfolio');

function loadJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8')) as T;
}

function loadWrapped<T>(filename: string, key: string): T[] {
  const data = loadJson<Record<string, T[]>>(filename);
  return data[key] ?? [];
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
  responsibilities: string[];
}

export interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  technologies: string[];
  features: string[];
  role: string;
  challenges: string[];
  links?: {
    live?: string;
    github?: string;
    caseStudy?: string;
  };
}

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

export function loadKnowledge(): PortfolioKnowledge {
  return {
    profile: loadJson<PortfolioProfile>('profile.json'),
    education: loadWrapped<EducationEntry>('education.json', 'education'),
    experience: loadWrapped<ExperienceEntry>('experience.json', 'experience'),
    skills: loadJson<Record<string, string[]>>('skills.json'),
    projects: loadWrapped<Project>('projects.json', 'projects'),
    achievements: loadWrapped<string>('achievements.json', 'achievements'),
    availability: loadJson<{ available: boolean; message: string }>('availability.json'),
    contact: loadJson<Record<string, string>>('contact.json'),
  };
}