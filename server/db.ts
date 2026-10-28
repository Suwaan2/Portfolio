import { setServers } from 'node:dns';
import { MongoClient, type Db } from 'mongodb';
import { getEnv } from '../api/lib/env.js';

// Server-side helpers live outside /api so Vercel doesn't count them as functions.

// Reused across warm serverless invocations (and Vite/HMR reloads in dev)
const globalForMongo = globalThis as typeof globalThis & { __mongoClient?: Promise<MongoClient> };

export async function getDb(): Promise<Db | null> {
  const uri = getEnv('MONGODB_URI');
  if (!uri) return null;

  // Local-only escape hatch: on some Windows networks Node can't resolve mongodb+srv:// records
  // through the system DNS. e.g. MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8
  const dnsServers = getEnv('MONGODB_DNS_SERVERS');
  if (dnsServers && !globalForMongo.__mongoClient) setServers(dnsServers.split(',').map((s) => s.trim()));

  globalForMongo.__mongoClient ??= new MongoClient(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
  })
    .connect()
    .catch((err) => {
      // Let the next call retry instead of caching a failed connection
      globalForMongo.__mongoClient = undefined;
      throw err;
    });

  const client = await globalForMongo.__mongoClient;
  return client.db(getEnv('MONGODB_DB') || 'portfolio');
}

export async function closeDb(): Promise<void> {
  const client = await globalForMongo.__mongoClient?.catch(() => undefined);
  globalForMongo.__mongoClient = undefined;
  await client?.close();
}
