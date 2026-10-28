import { describe, it, expect } from 'vitest';
import { loadContent, loadKnowledge } from '../../server/knowledge';
import { contentSchema } from '../../shared/schema';
import { parseMarkup, stripMarkup } from '../../shared/markup';
import { bundledContent, resumeLinkProps } from '../../src/lib/content';

describe('portfolio content', () => {
  it('every data file passes the shared schema', () => {
    expect(() => loadContent()).not.toThrow();
  });

  it('the bundled client copy matches the validated files', () => {
    expect(contentSchema.parse(bundledContent)).toEqual(loadContent());
  });

  it('chatbot knowledge hides display-only fields and markup', () => {
    const k = loadKnowledge();
    expect(k.projects[0]).not.toHaveProperty('image');
    expect(JSON.stringify(k.experience)).not.toContain('**');
    expect(k.contact.email).toBe('suankc22@gmail.com');
  });
});

describe('markup', () => {
  it('splits strong and accent spans', () => {
    expect(parseMarkup('a **b** c ==d==')).toEqual([
      { text: 'a ' },
      { text: 'b', mark: 'strong' },
      { text: ' c ' },
      { text: 'd', mark: 'accent' },
    ]);
  });

  it('leaves unmatched markers as plain text', () => {
    expect(parseMarkup('2 ** 3')).toEqual([{ text: '2 ** 3' }]);
    expect(stripMarkup('**x** and ==y==')).toBe('x and y');
  });
});

describe('resume link', () => {
  it('downloads local files and opens other origins in a new tab', () => {
    expect(resumeLinkProps('/Suan_KC_Resume.pdf')).toEqual({ href: '/Suan_KC_Resume.pdf', download: 'Suan_KC_Resume.pdf' });
    expect(resumeLinkProps('https://res.cloudinary.com/x/raw/upload/resume-1.pdf')).toMatchObject({ target: '_blank', rel: 'noopener noreferrer' });
  });
});
