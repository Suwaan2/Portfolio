// Watches the Vercel deployment for a commit until it finishes, then reports how long it took.
//
// Vercel's GitHub integration posts a "Vercel" commit status: "pending" when the build starts,
// then "success" / "failure" / "error" when it ends, linking to the deployment inspector. So this
// only needs the workflow's GITHUB_TOKEN (optional for public repos when run locally).
// Every state change is written to LOG_FILE; the workflow uploads that file when the deployment
// fails and deletes it when it succeeds.
//
// Exit code: 0 = deployed, 1 = failed / timed out.

import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const {
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
  COMMIT_SHA,
  LOG_FILE = 'deploy-logs/deployment.log',
  GITHUB_OUTPUT,
  GITHUB_STEP_SUMMARY,
} = process.env;
const TIMEOUT_MS = Number(process.env.TIMEOUT_MINUTES ?? 15) * 60_000;
const POLL_MS = Number(process.env.POLL_SECONDS ?? 10) * 1000;

if (!GITHUB_REPOSITORY || !COMMIT_SHA) {
  console.error('GITHUB_REPOSITORY and COMMIT_SHA are required');
  process.exit(1);
}

mkdirSync(dirname(LOG_FILE), { recursive: true });

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  appendFileSync(LOG_FILE, `${stamped}\n`);
}

function setOutput(key, value) {
  if (GITHUB_OUTPUT) appendFileSync(GITHUB_OUTPUT, `${key}=${value ?? ''}\n`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function github(path) {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` }),
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}: ${await res.text()}`);
  return res.json();
}

function formatDuration(ms) {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
}

const TERMINAL = ['success', 'failure', 'error'];

// Returns the exit code. Setting process.exitCode instead of calling process.exit() avoids a
// Node crash on Windows while fetch's sockets are still closing.
async function main() {
  const started = Date.now();
  let lastState;
  let first;
  let final;

  log(`Watching Vercel deployment for ${GITHUB_REPOSITORY}@${COMMIT_SHA.slice(0, 7)}`);

  while (!final) {
    // Newest first. The context is "Vercel" (or "Vercel – <project>" when several projects share a repo).
    const statuses = (await github(`/commits/${COMMIT_SHA}/statuses?per_page=100`)).filter((s) =>
      s.context.startsWith('Vercel'),
    );
    const latest = statuses[0];
    first = statuses[statuses.length - 1];

    if (latest && latest.state !== lastState) {
      lastState = latest.state;
      log(`State: ${latest.state}${latest.description ? ` - ${latest.description}` : ''}`);
    }
    if (latest && TERMINAL.includes(latest.state)) {
      final = latest;
      break;
    }
    if (Date.now() - started > TIMEOUT_MS) {
      log(
        latest
          ? `Timed out after ${formatDuration(Date.now() - started)} (last state: ${latest.state})`
          : 'Timed out waiting for Vercel to start a deployment. Is the Vercel GitHub integration connected?',
      );
      setOutput('result', 'timeout');
      return 1;
    }
    await sleep(POLL_MS);
  }

  const ok = final.state === 'success';
  const duration = formatDuration(new Date(final.created_at) - new Date(first.created_at));
  const inspectUrl = final.target_url || '';
  // Inspector URLs look like https://vercel.com/<team>/<project>/<id>; the API id is "dpl_<id>".
  const deploymentId = inspectUrl.startsWith('https://vercel.com/') ? `dpl_${inspectUrl.split('/').pop()}` : '';

  log(`${ok ? 'Deployment succeeded' : `Deployment ${final.state}`} in ${duration}`);
  log(`Inspect: ${inspectUrl || 'n/a'}`);

  setOutput('result', ok ? 'success' : 'failure');
  setOutput('duration', duration);
  setOutput('deployment_id', deploymentId);
  setOutput('inspect_url', inspectUrl);

  if (GITHUB_STEP_SUMMARY) {
    const rows = [
      `### Vercel deployment: ${ok ? '✅ succeeded' : '❌ failed'}`,
      '',
      '| | |',
      '|---|---|',
      `| Commit | \`${COMMIT_SHA.slice(0, 7)}\` |`,
      `| Build time | ${duration} |`,
      `| Status | ${final.state}${final.description ? ` - ${final.description}` : ''} |`,
      inspectUrl ? `| Inspect | ${inspectUrl} |` : null,
    ];
    appendFileSync(GITHUB_STEP_SUMMARY, `${rows.filter((r) => r !== null).join('\n')}\n`);
  }

  return ok ? 0 : 1;
}

process.exitCode = await main();
