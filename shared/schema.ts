import { z } from 'zod';

// Single source of truth for portfolio content. The site, the AI chatbot and
// (later) the admin panel all validate against these rules.

const text = z.string().trim().min(1, 'Required');
// Absolute URLs or site-relative paths such as /projects/x.png
const link = z.string().trim().regex(/^(https?:\/\/|\/)\S*$/, 'Use a full URL or a path starting with /');
const icon = z.string().regex(/^[a-z0-9_]+$/, 'Use a Material Symbols icon name, e.g. rocket_launch');
// Rich text fields accept **strong** and ==accent== markup (see shared/markup.ts)
const richText = text;

export const profileSchema = z.object({
  name: text,
  title: text,
  location: text.optional(),
  summary: text,
  resumeUrl: link,
});

export const heroSchema = z.object({
  headline: z.object({ lead: text, highlight: text, tail: text }),
  intro: richText,
  focus: z.object({ label: text, value: text }),
  image: link,
  imageAlt: text,
});

export const aboutSchema = z.object({
  paragraphs: z.array(richText).min(1),
  stats: z.array(
    z.object({
      value: text,
      label: text,
      // When set, the value counts up from 0 to this number on scroll
      count: z.number().int().nonnegative().optional(),
      suffix: z.string().optional(),
    }),
  ),
});

export const skillsSchema = z.object({
  groups: z.array(
    z.object({
      icon,
      title: text,
      skills: z.array(text).min(1),
    }),
  ),
});

export const experienceSchema = z.object({
  experience: z.array(
    z.object({
      company: text,
      role: text,
      period: text,
      tech: text.optional(),
      highlights: z.array(z.object({ icon, text: richText })).min(1),
    }),
  ),
});

export const projectSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes'),
  name: text,
  type: text,
  icon,
  // Short text shown on the project card
  summary: text,
  // Longer text the chatbot uses
  description: text,
  tags: z.array(text),
  technologies: z.array(text),
  features: z.array(text),
  role: text,
  challenges: z.array(text).default([]),
  image: link,
  imageAlt: text,
  links: z
    .object({
      live: link.optional(),
      github: link.optional(),
      caseStudy: link.optional(),
    })
    .optional(),
});

export const projectsSchema = z.object({
  projects: z.array(projectSchema).refine((ps) => new Set(ps.map((p) => p.id)).size === ps.length, 'Project ids must be unique'),
});

export const educationSchema = z.object({
  education: z.array(z.object({ degree: text, institution: text, status: text })),
});

export const achievementsSchema = z.object({
  achievements: z.array(text),
});

export const contactSchema = z.object({
  email: z.email(),
  phone: text.optional(),
  github: link.optional(),
  linkedin: link.optional(),
  twitter: link.optional(),
  website: link.optional(),
});

export const availabilitySchema = z.object({
  available: z.boolean(),
  message: text,
});

export const sectionSchemas = {
  profile: profileSchema,
  hero: heroSchema,
  about: aboutSchema,
  skills: skillsSchema,
  experience: experienceSchema,
  projects: projectsSchema,
  education: educationSchema,
  achievements: achievementsSchema,
  contact: contactSchema,
  availability: availabilitySchema,
} as const;

export const contentSchema = z.object(sectionSchemas);

export type SectionKey = keyof typeof sectionSchemas;
export const SECTION_KEYS = Object.keys(sectionSchemas) as SectionKey[];

export type Content = z.infer<typeof contentSchema>;
export type Project = z.infer<typeof projectSchema>;
