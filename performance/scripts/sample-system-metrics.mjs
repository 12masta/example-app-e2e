#!/usr/bin/env node
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const DEFAULT_FRONTEND_PORT = 30401;
const DEFAULT_BACKEND_PORT = 5080;
const DEFAULT_INTERVAL_SEC = 5;
const DEFAULT_OUTPUT = 'metrics/system.ndjson';

function printHelp() {
  console.log(`Sample frontend/backend CPU and RSS while a k6 run is in progress.

Usage:
  node performance/scripts/sample-system-metrics.mjs --watch-pid <pid> [options]

Options:
  --watch-pid <pid>       Exit when this process is no longer running (typically the k6 PID)
  --output <path>         NDJSON output file (default: ${DEFAULT_OUTPUT})
  --interval <seconds>    Poll interval in seconds (default: ${DEFAULT_INTERVAL_SEC})
  --frontend-port <port>  Frontend listen port (default: ${DEFAULT_FRONTEND_PORT})
  --backend-port <port>   Backend listen port (default: ${DEFAULT_BACKEND_PORT})
  --help                  Show this help

Each line is JSON: { "ts", "name", "cpuPct", "rssBytes" } with name "frontend" or "backend".
The workflow can start this script in the background, run k6, then send SIGTERM; the loop
also stops automatically when --watch-pid exits.`);
}

function parseArgs(argv) {
  const args = {
    watchPid: undefined,
    output: DEFAULT_OUTPUT,
    intervalSec: DEFAULT_INTERVAL_SEC,
    frontendPort: DEFAULT_FRONTEND_PORT,
    backendPort: DEFAULT_BACKEND_PORT,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token === '--watch-pid') {
      args.watchPid = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--output') {
      args.output = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--interval') {
      args.intervalSec = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--frontend-port') {
      args.frontendPort = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--backend-port') {
      args.backendPort = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

function runCommand(command, commandArgs) {
  return spawnSync(command, commandArgs, { encoding: 'utf8' });
}

function pidListeningOnPort(port) {
  const lsof = runCommand('lsof', ['-ti', `TCP:${port}`, '-sTCP:LISTEN']);
  if (lsof.status === 0) {
    const pid = Number(lsof.stdout.trim().split('\n')[0]);
    if (Number.isFinite(pid) && pid > 0) {
      return pid;
    }
  }

  if (process.platform === 'linux') {
    const ss = runCommand('ss', ['-ltnp']);
    if (ss.status === 0) {
      for (const line of ss.stdout.split('\n')) {
        if (!line.includes(`:${port}`)) {
          continue;
        }
        const match = line.match(/pid=(\d+)/);
        if (match) {
          return Number(match[1]);
        }
      }
    }
  }

  return undefined;
}

function readProcessStats(pid) {
  const ps = runCommand('ps', ['-p', String(pid), '-o', '%cpu=,rss=']);
  if (ps.status !== 0) {
    return undefined;
  }
  const trimmed = ps.stdout.trim();
  if (!trimmed) {
    return undefined;
  }
  const [cpuRaw, rssRaw] = trimmed.split(/\s+/);
  const cpuPct = Number(cpuRaw);
  const rssKb = Number(rssRaw);
  if (!Number.isFinite(cpuPct) || !Number.isFinite(rssKb)) {
    return undefined;
  }
  return { cpuPct, rssBytes: Math.round(rssKb * 1024) };
}

function isAlive(pid) {
  if (!Number.isFinite(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function sleepMs(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function resolveTargetPids(frontendPort, backendPort) {
  const frontendPid = pidListeningOnPort(frontendPort);
  const backendPid = pidListeningOnPort(backendPort);
  const targets = [];
  if (frontendPid) {
    targets.push({ name: 'frontend', pid: frontendPid });
  }
  if (backendPid) {
    targets.push({ name: 'backend', pid: backendPid });
  }
  return targets;
}

function appendSample(outputPath, sample) {
  appendFileSync(outputPath, `${JSON.stringify(sample)}\n`, 'utf8');
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!Number.isFinite(args.watchPid) || args.watchPid <= 0) {
    console.error('--watch-pid is required and must be a positive integer');
    printHelp();
    process.exit(1);
  }

  if (!Number.isFinite(args.intervalSec) || args.intervalSec <= 0) {
    console.error('--interval must be a positive number');
    process.exit(1);
  }

  mkdirSync(dirname(args.output), { recursive: true });

  let stopping = false;
  const stop = () => {
    stopping = true;
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  while (!stopping && isAlive(args.watchPid)) {
    const ts = new Date().toISOString();
    const targets = resolveTargetPids(args.frontendPort, args.backendPort);

    for (const target of targets) {
      const stats = readProcessStats(target.pid);
      if (stats) {
        appendSample(args.output, { ts, name: target.name, ...stats });
      }
    }

    await sleepMs(args.intervalSec * 1000);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
