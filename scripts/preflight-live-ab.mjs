import { readLiveAbConfig } from "./live-ab-guards.mjs";

try {
  readLiveAbConfig();
  process.stdout.write("Live A/B preflight passed. Only synthetic test identities and exact .env.local endpoints are configured. No network request was made.\n");
} catch (error) {
  process.stderr.write(`Live A/B preflight blocked: ${error instanceof Error ? error.message : "invalid configuration"}\n`);
  process.exitCode = 1;
}
