// Copies data/portfolio/*.json into MongoDB.
//   npm run seed           only adds sections the database doesn't have yet
//   npm run seed -- --force  overwrites every section with the file copy
import { SECTION_KEYS } from '../shared/schema.js';
import { loadContent } from '../server/knowledge.js';
import { getDb, closeDb } from '../server/db.js';
import { CONTENT_COLLECTION, type ContentDoc } from '../server/content-store.js';

const force = process.argv.includes('--force');

async function main() {
  const db = await getDb();
  if (!db) throw new Error('MONGODB_URI is not set (add it to .env.local)');

  // Throws if any file fails the schema, before anything is written
  const content = loadContent();
  const collection = db.collection<ContentDoc>(CONTENT_COLLECTION);

  for (const key of SECTION_KEYS) {
    const now = new Date();
    if (force) {
      const existing = await collection.findOne({ _id: key }, { projection: { version: 1 } });
      await collection.replaceOne(
        { _id: key },
        { data: content[key], version: (existing?.version ?? 0) + 1, updatedAt: now },
        { upsert: true },
      );
      console.log(`  ${key}: written`);
    } else {
      const res = await collection.updateOne(
        { _id: key },
        { $setOnInsert: { data: content[key], version: 1, updatedAt: now } },
        { upsert: true },
      );
      console.log(`  ${key}: ${res.upsertedCount ? 'added' : 'already in database, skipped'}`);
    }
  }
  console.log(`Done (database "${db.databaseName}").`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(closeDb);
