import type { ComponentType } from 'react';
import type { SectionKey } from '../../shared/schema';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Skills } from '../components/Skills';
import { Work } from '../components/Work';
import { Experience } from '../components/Experience';
import { Footer } from '../components/Footer';
import { Contact } from '../components/Contact';
import { MARKUP_HINT, type Field } from './fields';

const str =(v: unknown) => (typeof v === 'string' ? v : '');

const ICON_HINT = 'A Material Symbols name from fonts.google.com/icons, e.g. rocket_launch';

export interface SectionConfig {
    title: string;
    description: string;
    fields: Field[];
    // Real site components rendered with the draft content
    preview?: ComponentType[];
}

export const SECTIONS: Record<SectionKey, SectionConfig> = {
    hero: {
        title: 'Hero',
        description: 'The first screen: headline, intro and image.',
        preview: [Hero],
        fields: [
            {
                kind: 'group',
                key: 'headline',
                label: 'Headline',
                fields: [
                    { kind: 'text', key: 'lead', label: 'Before the highlight' },
                    { kind: 'text', key: 'highlight', label: 'Highlighted word', hint: 'Shown in the accent colour with an underline.' },
                    { kind: 'text', key: 'tail', label: 'After the highlight' },
                ],
            },
            { kind: 'text', key: 'intro', label: 'Intro', multiline: true, hint: MARKUP_HINT },
            {
                kind: 'group',
                key: 'focus',
                label: 'Floating card',
                fields: [
                    { kind: 'text', key: 'label', label: 'Small label' },
                    { kind: 'text', key: 'value', label: 'Main text' },
                ],
            },
            { kind: 'file', key: 'image', label: 'Image', upload: 'image' },
            { kind: 'text', key: 'imageAlt', label: 'Image description', hint: 'Read by screen readers. Describe what the image shows.' },
        ],
    },
    profile: {
        title: 'Profile',
        description: 'Your name, title and resume. Used by the navbar, the CV buttons and the chatbot.',
        fields: [
            { kind: 'text', key: 'name', label: 'Name' },
            { kind: 'text', key: 'title', label: 'Job title' },
            { kind: 'text', key: 'location', label: 'Location', optional: true },
            { kind: 'text', key: 'summary', label: 'Summary', multiline: true, hint: 'Used by the AI chatbot.' },
            { kind: 'file', key: 'resumeUrl', label: 'Resume (PDF)', upload: 'resume' },
        ],
    },
    about: {
        title: 'About',
        description: 'Your story and the stat cards next to it.',
        preview: [About],
        fields: [
            { kind: 'strings', key: 'paragraphs', label: 'Paragraphs', itemLabel: 'paragraph', multiline: true, hint: MARKUP_HINT },
            {
                kind: 'list',
                key: 'stats',
                label: 'Stat cards',
                itemLabel: 'stat',
                itemTitle: (s) => [str(s.value), str(s.label)].filter(Boolean).join(' · '),
                newItem: () => ({ value: '', label: '' }),
                fields: [
                    { kind: 'text', key: 'value', label: 'Big text' },
                    { kind: 'text', key: 'label', label: 'Label' },
                    { kind: 'number', key: 'count', label: 'Count up to', optional: true, hint: 'If set, the number animates from 0 to this value.' },
                    { kind: 'text', key: 'suffix', label: 'Suffix', optional: true, hint: 'Shown after the counted number, e.g. +' },
                ],
            },
        ],
    },
    skills: {
        title: 'Skills',
        description: 'Skill groups and their tags.',
        preview: [Skills],
        fields: [
            {
                kind: 'list',
                key: 'groups',
                label: 'Groups',
                itemLabel: 'group',
                itemTitle: (g) => str(g.title),
                newItem: () => ({ icon: 'code', title: '', skills: [] }),
                fields: [
                    { kind: 'text', key: 'title', label: 'Title' },
                    { kind: 'text', key: 'icon', label: 'Icon', hint: ICON_HINT },
                    { kind: 'tags', key: 'skills', label: 'Skills' },
                ],
            },
        ],
    },
    experience: {
        title: 'Experience',
        description: 'Jobs and their highlights.',
        preview: [Experience],
        fields: [
            {
                kind: 'list',
                key: 'experience',
                label: 'Jobs',
                itemLabel: 'job',
                itemTitle: (j) => [str(j.role), str(j.company)].filter(Boolean).join(' at '),
                newItem: () => ({ company: '', role: '', period: '', highlights: [{ icon: 'check_circle', text: '' }] }),
                fields: [
                    { kind: 'text', key: 'role', label: 'Role' },
                    { kind: 'text', key: 'company', label: 'Company' },
                    { kind: 'text', key: 'period', label: 'Period', hint: 'e.g. Jan 2026 – Present' },
                    { kind: 'text', key: 'tech', label: 'Tech used', optional: true, hint: 'Used by the chatbot.' },
                    {
                        kind: 'list',
                        key: 'highlights',
                        label: 'Highlights',
                        itemLabel: 'highlight',
                        itemTitle: (h) => str(h.text).replace(/\*\*|==/g, '').slice(0, 70),
                        newItem: () => ({ icon: 'check_circle', text: '' }),
                        fields: [
                            { kind: 'text', key: 'text', label: 'Text', multiline: true, hint: MARKUP_HINT },
                            { kind: 'text', key: 'icon', label: 'Icon', hint: ICON_HINT },
                        ],
                    },
                ],
            },
        ],
    },
    projects: {
        title: 'Projects',
        description: 'Project cards. The longer fields are only used by the chatbot.',
        preview: [Work],
        fields: [
            {
                kind: 'list',
                key: 'projects',
                label: 'Projects',
                itemLabel: 'project',
                itemTitle: (p) => str(p.name),
                newItem: () => ({
                    id: '',
                    name: '',
                    type: '',
                    icon: 'code',
                    summary: '',
                    description: '',
                    tags: [],
                    technologies: [],
                    features: [],
                    role: '',
                    challenges: [],
                    image: '',
                    imageAlt: '',
                }),
                fields: [
                    { kind: 'text', key: 'name', label: 'Name' },
                    { kind: 'text', key: 'id', label: 'ID', hint: 'Lowercase letters, numbers and dashes, e.g. video-platform. The chatbot links to projects by this.' },
                    { kind: 'text', key: 'type', label: 'Type', hint: 'e.g. Fullstack Video Sharing Platform' },
                    { kind: 'text', key: 'icon', label: 'Icon', hint: ICON_HINT },
                    { kind: 'text', key: 'summary', label: 'Card text', multiline: true, hint: 'Shown on the project card.' },
                    { kind: 'tags', key: 'tags', label: 'Card tags', hint: 'The 2–3 short tags on the card.' },
                    { kind: 'file', key: 'image', label: 'Card image', upload: 'image' },
                    { kind: 'text', key: 'imageAlt', label: 'Image description' },
                    {
                        kind: 'group',
                        key: 'links',
                        label: 'Links',
                        optional: true,
                        fields: [
                            { kind: 'text', key: 'live', label: 'Live site', optional: true, hint: 'Makes the card clickable and adds "Visit Live Site".' },
                            { kind: 'text', key: 'github', label: 'GitHub', optional: true },
                            { kind: 'text', key: 'caseStudy', label: 'Case study', optional: true },
                        ],
                    },
                    { kind: 'text', key: 'description', label: 'Full description', multiline: true, hint: 'Chatbot only.' },
                    { kind: 'text', key: 'role', label: 'Your role', hint: 'Chatbot only.' },
                    { kind: 'tags', key: 'technologies', label: 'All technologies', hint: 'Chatbot only.' },
                    { kind: 'strings', key: 'features', label: 'Features', itemLabel: 'feature', hint: 'Chatbot only.' },
                    { kind: 'strings', key: 'challenges', label: 'Challenges', itemLabel: 'challenge', hint: 'Chatbot only.' },
                ],
            },
        ],
    },
    education: {
        title: 'Education',
        description: 'Not shown on the site yet; the chatbot uses it.',
        fields: [
            {
                kind: 'list',
                key: 'education',
                label: 'Education',
                itemLabel: 'entry',
                itemTitle: (e) => str(e.degree),
                newItem: () => ({ degree: '', institution: '', status: '' }),
                fields: [
                    { kind: 'text', key: 'degree', label: 'Degree' },
                    { kind: 'text', key: 'institution', label: 'Institution' },
                    { kind: 'text', key: 'status', label: 'Status / years' },
                ],
            },
        ],
    },
    achievements: {
        title: 'Achievements',
        description: 'Not shown on the site yet; the chatbot uses it.',
        fields: [{ kind: 'strings', key: 'achievements', label: 'Achievements', itemLabel: 'achievement', multiline: true }],
    },
    contact: {
        title: 'Contact & links',
        description: 'Email for the contact form and footer, and your social links.',
        preview: [Contact, Footer],
        fields: [
            { kind: 'text', key: 'email', label: 'Email', hint: 'Contact form messages are sent here.' },
            { kind: 'text', key: 'phone', label: 'Phone', optional: true, hint: 'Chatbot only.' },
            { kind: 'text', key: 'github', label: 'GitHub URL', optional: true },
            { kind: 'text', key: 'linkedin', label: 'LinkedIn URL', optional: true },
            { kind: 'text', key: 'twitter', label: 'X / Twitter URL', optional: true },
            { kind: 'text', key: 'website', label: 'Website', optional: true },
        ],
    },
    availability: {
        title: 'Availability',
        description: 'The badge at the top of the hero.',
        preview: [Hero],
        fields: [
            { kind: 'toggle', key: 'available', label: 'Show the availability badge', hint: 'Turn off to hide it.' },
            { kind: 'text', key: 'message', label: 'Badge text' },
        ],
    },
};

export const SECTION_ORDER: SectionKey[] = ['hero', 'profile', 'about', 'skills', 'experience', 'projects', 'education', 'achievements', 'contact', 'availability'];
