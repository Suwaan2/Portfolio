import { sectionSchemas, SECTION_KEYS, type Content, type SectionKey } from '../shared/schema.js';
import { loadContent as loadFileContent } from './knowledge.js';
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

export interface SectionState<K extends SectionKey = SectionKey> {
  data: Content[K];
  // 0 means the section isn't in the database yet (data is the file copy)
  version: number;
  updatedAt: string | null;
}

export type AdminSections = { [K in SectionKey]: SectionState<K> };

async function requireCollection() {
  const db = await getDb();
  if (!db) throw new Error('MONGODB_URI is not set');
  return db.collection<ContentDoc>(CONTENT_COLLECTION);
}

/** Uncached read for the admin panel, with each section's version for conflict checks. */
export async function getAdminSections(): Promise<AdminSections> {
  const files = loadFileContent();
  const docs = await (await requireCollection()).find({ _id: { $in: SECTION_KEYS } }).toArray();
  const byKey = new Map(docs.map((d) => [d._id, d]));

  return Object.fromEntries(
    SECTION_KEYS.map((key) => {
      const doc = byKey.get(key);
      if (!doc) return [key, { data: files[key], version: 0, updatedAt: null }];
      const parsed = sectionSchemas[key].safeParse(doc.data);
      // An invalid stored section shows the file copy but keeps its version, so saving replaces it
      return [key, { data: parsed.success ? parsed.data : files[key], version: doc.version, updatedAt: doc.updatedAt.toISOString() }];
    }),
  ) as AdminSections;
}

export type SaveResult = { status: 'saved'; version: number } | { status: 'conflict'; version: number };

/**
 * Saves a section only if its version is still `expectedVersion`, so a stale editor
 * can't overwrite a newer save. `data` must already be validated.
 */
export async function saveSection<K extends SectionKey>(key: K, data: Content[K], expectedVersion: number): Promise<SaveResult> {
  const collection = await requireCollection();
  const updatedAt = new Date();

  if (expectedVersion === 0) {
    try {
      await collection.insertOne({ _id: key, data, version: 1, updatedAt });
      invalidateContentCache();
      return { status: 'saved', version: 1 };
    } catch (err) {
      // Someone created it first
      if ((err as { code?: number }).code !== 11000) throw err;
    }
  } else {
    const updated = await collection.findOneAndUpdate(
      { _id: key, version: expectedVersion },
      { $set: { data, updatedAt }, $inc: { version: 1 } },
      { returnDocument: 'after' },
    );
    if (updated) {
      invalidateContentCache();
      return { status: 'saved', version: updated.version };
    }
  }

  const current = await collection.findOne({ _id: key }, { projection: { version: 1 } });
  return { status: 'conflict', version: current?.version ?? 0 };
}
