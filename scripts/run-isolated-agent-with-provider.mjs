import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { parseEnv } from "node:util";

const isolated = parseEnv(readFileSync(".env.isolated.local", "utf8"));
const provider = parseEnv(readFileSync(".env.local", "utf8"));
const testFile = process.argv[2] || "tests/integration/agentic-live.test.ts";
if (!/^tests\/(?:integration\/)?[a-z0-9_-]+\.test\.ts$/i.test(testFile)) {
  throw new Error("Test runner accepts only a single tests/*.test.ts or tests/integration/*.test.ts file.");
}
const testKeys = Object.fromEntries(Object.entries(isolated).filter(([name]) => name.startsWith("JOMLUAH_TEST_")));
const environment = {
  PATH: process.env.PATH,
  SystemRoot: process.env.SystemRoot,
  TEMP: process.env.TEMP,
  TMP: process.env.TMP,
  ...testKeys,
  JOMLUAH_ENABLE_LIVE_PROVIDER_TESTS: "YES_I_EXPECT_SYNTHETIC_PAID_CALLS",
  JOMLUAH_TEST_QWEN_API_KEY: provider.EMBEDDING_API_KEY,
  JOMLUAH_TEST_QWEN_MODEL: provider.EMBEDDING_MODEL,
  JOMLUAH_TEST_EMBEDDING_URL: provider.EMBEDDING_API_URL,
  JOMLUAH_TEST_CHAT_API_KEY: provider.FIQSTORE_API_KEY,
  JOMLUAH_TEST_CHAT_MODEL: provider.FIQSTORE_MODEL,
  JOMLUAH_TEST_CHAT_URL: `${(provider.FIQSTORE_BASE_URL || "").replace(/\/+$/, "")}/chat/completions`,
};

if (!environment.JOMLUAH_TEST_QWEN_API_KEY || !environment.JOMLUAH_TEST_CHAT_API_KEY) {
  throw new Error("Provider keys are missing; no live calls were made.");
}

const preflight = spawnSync(process.execPath, ["scripts/preflight-isolated-tests.mjs", "--providers"], {
  env: environment,
  stdio: "inherit",
});
if (preflight.status !== 0) process.exit(preflight.status || 1);

const result = spawnSync(process.execPath, [
  "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
  "--test",
  testFile,
], { env: environment, stdio: "inherit", timeout: 360_000 });
if (result.error) throw new Error(`Isolated provider test process failed: ${result.error.message}`);
process.exit(result.status || 0);
