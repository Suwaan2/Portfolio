import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadContent } from '../../api/lib/knowledge';

const getDb = vi.fn();
vi.mock('../../server/db', () => ({ getDb: () => getDb() }));

import { getContent, invalidateContentCache } from '../../server/content-store';

function fakeDb(docs: unknown[]) {
  return { collection: () => ({ find: () => ({ toArray: async () => docs }) }) };
}

const files = loadContent();

beforeEach(() => {
  getDb.mockReset();
  invalidateContentCache();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('content store', () => {
  it('uses the file copy when no database is configured', async () => {
    getDb.mockResolvedValue(null);
    const { content, source } = await getContent();
    expect(source).toBe('files');
    expect(content).toEqual(files);
  });

  it('uses valid database sections and keeps the file copy for invalid ones', async () => {
    const availability = { available: false, message: 'Not looking right now' };
    getDb.mockResolvedValue(
      fakeDb([
        { _id: 'availability', data: availability, version: 2 },
        { _id: 'contact', data: { email: 'not-an-email' }, version: 1 },
      ]),
    );
    const { content, source } = await getContent();
    expect(source).toBe('database');
    expect(content.availability).toEqual(availability);
    expect(content.contact).toEqual(files.contact);
  });

  it('falls back to files when the database throws', async () => {
    getDb.mockRejectedValue(new Error('connection refused'));
    const { source } = await getContent();
    expect(source).toBe('files');
  });

  it('caches the result between calls', async () => {
    getDb.mockResolvedValue(null);
    await getContent();
    await getContent();
    expect(getDb).toHaveBeenCalledTimes(1);
  });
});
