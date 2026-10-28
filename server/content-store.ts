import { sectionSchemas, SECTION_KEYS, type Content, type SectionKey } from '../shared/schema.js';
import { loadContent as loadFileContent } from '../api/lib/knowledge.js';
import { getDb } from './db.js';

// One document per section: { _id: 'projects', data: {...}, version: 3, updatedAt }
export interface ContentDoc {
  _id: SectionKey;
  data: unknown;
  version: number;
  updatedAt: Date;
}

export const CONTENT_COLLECTION = 'content';

export type ContentSource = 'database' | 'files';

const CACHE_MS = 60_000;
let cache: { at: number; content: Content; source: ContentSource } | null = null;

export function invalidateContentCache() {
  cache = null;
}

/**
 * Portfolio content from MongoDB, cached in memory for 60s.
 * Never throws: a missing, invalid or unreachable section falls back to data/portfolio/*.json.
 */
export async function getContent(): Promise<{ content: Content; source: ContentSource }> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache;

  const files = loadFileContent();
  let content = files;
  let source: ContentSource = 'files';

  try {
    const db = await getDb();
    if (db) {
      const docs = await db.collection<ContentDoc>(CONTENT_COLLECTION).find({ _id: { $in: SECTION_KEYS } }).toArray();
      const merged: Record<string, unknown> = { ...files };
      for (const doc of docs) {
        const parsed = sectionSchemas[doc._id].safeParse(doc.data);
        if (parsed.success) merged[doc._id] = parsed.data;
        else console.warn(`[content] invalid "${doc._id}" in database, using file copy:`, parsed.error.message);
      }
      if (docs.length) {
        content = merged as Content;
        source = 'database';
      }
    }
  } catch (err) {
    console.error('[content] database unavailable, using file copy:', err instanceof Error ? err.message : err);
  }

  cache = { at: Date.now(), content, source };
  return cache;
}
