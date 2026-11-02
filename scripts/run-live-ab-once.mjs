import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import pg from "pg";

if (process.env.JOMLUAH_LIVE_AB_CONFIRM !== "I_ACCEPT_SYNTHETIC_WRITES_TO_LIVE_DB") {
  throw new Error("Explicit live synthetic-write confirmation is required.");
}

function localValue(name) {
  const line = readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.trimStart().startsWith(`${name}=`));
  if (!line) throw new Error(`${name} is missing from .env.local`);
  return line.slice(line.indexOf("=") + 1).trim().replace(/^['"]|['"]$/g, "").replace(/\/$/, "");
}

const authUrl = localValue("NEON_AUTH_BASE_URL");
const dataUrl = localValue("NEON_DATA_API_URL");
const databaseUrl = localValue("DATABASE_URL_UNPOOLED");
const origin = "http://localhost:3000";
if (new URL(authUrl).protocol !== "https:" || new URL(dataUrl).protocol !== "https:") {
  throw new Error("Refusing non-HTTPS live endpoints.");
}
const database = new URL(databaseUrl);
const data = new URL(dataUrl);
if (database.protocol !== "postgresql:" || data.hostname.replace(".apirest.", ".") !== database.hostname || data.pathname !== `${database.pathname}/rest/v1`) {
  throw new Error("Direct database URL and Data API URL must target the same Neon database.");
}
const runId = randomUUID().slice(0, 12);
const users = {
  A: { email: `jl-ab-test-${runId}-a@example.invalid`, password: randomBytes(24).toString("base64url") },
  B: { email: `jl-ab-test-${runId}-b@example.invalid`, password: randomBytes(24).toString("base64url") },
};
const client = new pg.Client({ connectionString: databaseUrl, connectionTimeoutMillis: 8000, query_timeout: 8000, application_name: "jomluah_live_ab_test" });
let connected = false;
let testExitCode = 1;

try {
  await client.connect();
  connected = true;
  for (const { email } of Object.values(users)) {
    const existing = await client.query('SELECT id FROM neon_auth."user" WHERE email = $1', [email]);
    if (existing.rowCount !== 0) throw new Error("Generated test identity already exists; refusing to reuse it.");
  }

  for (const { email, password } of Object.values(users)) {
    const response = await fetch(new URL("sign-up/email", `${authUrl}/`), {
      method: "POST",
      headers: { "content-type": "application/json", origin },
      body: JSON.stringify({ email, password, name: "JomLuah A/B Test" }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      const code = typeof problem?.code === "string" && /^[A-Z_]+$/.test(problem.code) ? problem.code : "UNKNOWN";
      throw new Error(`Synthetic sign-up failed (HTTP ${response.status}, code ${code}).`);
    }
    const created = await client.query('SELECT id FROM neon_auth."user" WHERE email = $1', [email]);
    if (created.rowCount !== 1) throw new Error("Synthetic sign-up did not create exactly one Auth identity.");
    await client.query('UPDATE neon_auth."user" SET "emailVerified" = true WHERE id = $1 AND email = $2', [created.rows[0].id, email]);
  }

  const child = spawnSync(process.execPath, [
    "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--test", "tests/integration/live-ab-isolation.test.ts",
  ], {
    cwd: process.cwd(),
    env: {
      PATH: process.env.PATH,
      SystemRoot: process.env.SystemRoot,
      TEMP: process.env.TEMP,
      TMP: process.env.TMP,
      NODE_ENV: "test",
      JOMLUAH_LIVE_AB_CONFIRM: "I_ACCEPT_SYNTHETIC_WRITES_TO_LIVE_DB",
      JOMLUAH_LIVE_AB_AUTH_URL: authUrl,
      JOMLUAH_LIVE_AB_DATA_API_URL: dataUrl,
      JOMLUAH_LIVE_AB_ORIGIN: origin,
      JOMLUAH_LIVE_AB_USER_A_EMAIL: users.A.email,
      JOMLUAH_LIVE_AB_USER_A_PASSWORD: users.A.password,
      JOMLUAH_LIVE_AB_USER_B_EMAIL: users.B.email,
      JOMLUAH_LIVE_AB_USER_B_PASSWORD: users.B.password,
    },
    stdio: "inherit",
    timeout: 120_000,
  });
  testExitCode = child.status ?? 1;
  if (child.error) process.stderr.write(`A/B test process failed: ${child.error.name}\n`);
} catch (error) {
  process.stderr.write(`Live A/B run could not complete: ${error instanceof Error ? error.message : "unknown error"}\n`);
} finally {
  if (connected) {
    let cleanupFailed = false;
    for (const { email } of Object.values(users)) {
      try {
        const result = await client.query('DELETE FROM neon_auth."user" WHERE email = $1 RETURNING id', [email]);
        const remaining = await client.query('SELECT count(*)::int AS count FROM neon_auth."user" WHERE email = $1', [email]);
        if (remaining.rows[0].count !== 0) cleanupFailed = true;
        process.stdout.write(`Synthetic identity cleanup: ${result.rowCount} deleted, ${remaining.rows[0].count} remaining.\n`);
      } catch (error) {
        cleanupFailed = true;
        process.stderr.write(`Synthetic identity cleanup failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
      }
    }
    await client.end();
    if (cleanupFailed) testExitCode = 1;
  }
  process.exitCode = testExitCode;
}
