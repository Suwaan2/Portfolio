// Prints ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET for .env.local / Vercel.
//   npm run admin:secrets
// The password is typed at a hidden prompt, so it never lands in shell history.
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';
import { hashPassword } from '../server/admin-auth.js';

function askHidden(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  // Echo nothing while the user types (readline has no built-in hidden mode)
  const writable = rl as unknown as { _writeToOutput: (s: string) => void };
  let prompted = false;
  writable._writeToOutput = (s) => {
    if (!prompted) {
      process.stdout.write(s);
      prompted = true;
    }
  };
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    }),
  );
}

async function main() {
  const password = await askHidden('Admin password (min 12 characters): ');
  if (password.length < 12) throw new Error('Use at least 12 characters.');
  if ((await askHidden('Repeat it: ')) !== password) throw new Error('The passwords did not match.');

  console.log('\nAdd these two lines to .env.local and to Vercel → Settings → Environment Variables:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
  console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString('base64url')}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
