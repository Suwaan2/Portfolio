import { createHash } from 'node:crypto';
import { getDb } from './db.js';

// Failed admin logins, shared by every serverless instance through MongoDB.
// Successful logins don't count, and a success clears the IP's failures.
export const LOGIN_WINDOW_MS = 15 * 60_000;
export const MAX_LOGIN_FAILURES = 5;
const COLLECTION = 'login_failures';

interface FailureDoc {
  ipHash: string;
  at: Date;
}

// Only a hash of the IP is stored
function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

// Fallback when the database is unreachable: still limits within one instance
const memory = new Map<string, number[]>();

function recentInMemory(key: string, now = Date.now()) {
  const recent = (memory.get(key) ?? []).filter((t) => now - t < LOGIN_WINDOW_MS);
  memory.set(key, recent);
  return recent;
}

let indexReady: Promise<unknown> | null = null;

async function collection() {
  const db = await getDb();
  if (!db) return null;
  const col = db.collection<FailureDoc>(COLLECTION);
  // MongoDB deletes each failure once it falls out of the window
  indexReady ??= col.createIndex({ at: 1 }, { expireAfterSeconds: LOGIN_WINDOW_MS / 1000 }).catch((err) => {
    indexReady = null;
    throw err;
  });
  await indexReady;
  return col;
}

async function withFallback<T>(dbOp: (col: NonNullable<Awaited<ReturnType<typeof collection>>>) => Promise<T>, memoryOp: () => T): Promise<T> {
  try {
    const col = await collection();
    if (col) return await dbOp(col);
  } catch (err) {
    console.error('[login-guard] database unavailable, using in-memory limits:', err instanceof Error ? err.message : err);
  }
  return memoryOp();
}

export async function isLoginBlocked(ip: string): Promise<boolean> {
  const ipHash = hashIp(ip);
  return withFallback(
    async (col) => (await col.countDocuments({ ipHash, at: { $gte: new Date(Date.now() - LOGIN_WINDOW_MS) } })) >= MAX_LOGIN_FAILURES,
    () => recentInMemory(ipHash).length >= MAX_LOGIN_FAILURES,
  );
}

export async function recordLoginFailure(ip: string): Promise<void> {
  const ipHash = hashIp(ip);
  await withFallback(
    async (col) => void (await col.insertOne({ ipHash, at: new Date() })),
    () => void memory.set(ipHash, [...recentInMemory(ipHash), Date.now()]),
  );
}

export async function clearLoginFailures(ip: string): Promise<void> {
  const ipHash = hashIp(ip);
  memory.delete(ipHash);
  await withFallback(
    async (col) => void (await col.deleteMany({ ipHash })),
    () => undefined,
  );
}

export function resetLoginFailures(): void {
  memory.clear();
}
