// Tiny inline markup for content text: **strong** and ==accent==.
// Parsed into plain segments so it can be rendered without HTML injection.

export type Segment = { text: string; mark?: 'strong' | 'accent' };

const TOKEN = /\*\*(.+?)\*\*|==(.+?)==/g;

export function parseMarkup(source: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const m of source.matchAll(TOKEN)) {
    if (m.index > last) segments.push({ text: source.slice(last, m.index) });
    segments.push(m[1] !== undefined ? { text: m[1], mark: 'strong' } : { text: m[2], mark: 'accent' });
    last = m.index + m[0].length;
  }
  if (last < source.length) segments.push({ text: source.slice(last) });
  return segments;
}

export function stripMarkup(source: string): string {
  return source.replace(TOKEN, (_, strong?: string, accent?: string) => strong ?? accent ?? '');
}
