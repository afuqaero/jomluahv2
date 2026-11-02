import assert from "node:assert/strict";
import test from "node:test";
import { readIsolatedConfig, requireProviderHosts } from "../scripts/isolated-test-guards.mjs";

const testVariables = [
  "JOMLUAH_TEST_ENV_CONFIRM", "JOMLUAH_TEST_PROJECT_ID", "JOMLUAH_TEST_AUTH_URL", "JOMLUAH_TEST_DATA_API_URL",
  "JOMLUAH_TEST_ALLOWED_AUTH_HOST", "JOMLUAH_TEST_ALLOWED_DATA_HOST",
  "JOMLUAH_TEST_USER_A_EMAIL", "JOMLUAH_TEST_USER_A_PASSWORD",
  "JOMLUAH_TEST_USER_B_EMAIL", "JOMLUAH_TEST_USER_B_PASSWORD",
  "JOMLUAH_ENABLE_LIVE_PROVIDER_TESTS", "JOMLUAH_TEST_QWEN_API_KEY",
  "JOMLUAH_TEST_DEEPSEEK_API_KEY", "JOMLUAH_TEST_DEEPSEEK_MODEL",
  "JOMLUAH_TEST_EMBEDDING_URL", "JOMLUAH_TEST_DEEPSEEK_URL",
];

function withIsolatedEnvironment(run: () => void) {
  const previous = new Map(testVariables.map((name) => [name, process.env[name]]));
  for (const name of testVariables) delete process.env[name];
  Object.assign(process.env, {
    JOMLUAH_TEST_ENV_CONFIRM: "ISOLATED_TEST_ONLY",
    JOMLUAH_TEST_PROJECT_ID: "shy-wildflower-28479163",
    JOMLUAH_TEST_AUTH_URL: "https://ep-long-river-azdshj6q.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth",
    JOMLUAH_TEST_DATA_API_URL: "https://ep-long-river-azdshj6q.apirest.c-3.ap-southeast-1.aws.neon.tech/neondb/rest/v1",
    JOMLUAH_TEST_ALLOWED_AUTH_HOST: "ep-long-river-azdshj6q.neonauth.c-3.ap-southeast-1.aws.neon.tech",
    JOMLUAH_TEST_ALLOWED_DATA_HOST: "ep-long-river-azdshj6q.apirest.c-3.ap-southeast-1.aws.neon.tech",
    JOMLUAH_TEST_USER_A_EMAIL: "user-a@jomluah.invalid",
    JOMLUAH_TEST_USER_A_PASSWORD: "unique-random-test-password-a",
    JOMLUAH_TEST_USER_B_EMAIL: "user-b@jomluah.invalid",
    JOMLUAH_TEST_USER_B_PASSWORD: "unique-random-test-password-b",
  });
  try {
    run();
  } finally {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

test("isolated test config accepts only explicit synthetic identity and database target", () => {
  withIsolatedEnvironment(() => {
    const config = readIsolatedConfig();
    assert.equal(new URL(config.dataUrl).pathname, "/neondb/rest/v1");
    assert.equal(config.providers, false);
  });
});

test("isolated test config fails closed for production database path and host mismatch", () => {
  withIsolatedEnvironment(() => {
    process.env.JOMLUAH_TEST_DATA_API_URL = "https://ep-weathered-art-a1rz6zzf.apirest.c-3.ap-southeast-1.aws.neon.tech/neondb/rest/v1";
    assert.throws(() => readIsolatedConfig(), /exact allowlisted/);
    process.env.JOMLUAH_TEST_DATA_API_URL = "https://ep-long-river-azdshj6q.apirest.c-3.ap-southeast-1.aws.neon.tech/other/rest/v1";
    assert.throws(() => readIsolatedConfig(), /dedicated isolated/);
    process.env.JOMLUAH_TEST_PROJECT_ID = "small-butterfly-85023985";
    assert.throws(() => readIsolatedConfig(), /outside the dedicated/);
  });
});

test("provider calls require explicit opt-in, test credentials, and fixed provider hosts", () => {
  withIsolatedEnvironment(() => {
    assert.throws(() => readIsolatedConfig({ providers: true }), /prerequisites missing/);
    process.env.JOMLUAH_ENABLE_LIVE_PROVIDER_TESTS = "YES_I_EXPECT_SYNTHETIC_PAID_CALLS";
    process.env.JOMLUAH_TEST_QWEN_API_KEY = "synthetic-test-key";
    process.env.JOMLUAH_TEST_DEEPSEEK_API_KEY = "synthetic-test-key";
    process.env.JOMLUAH_TEST_DEEPSEEK_MODEL = "test-model";
    assert.equal(readIsolatedConfig({ providers: true }).providers, true);
    assert.equal(requireProviderHosts().embeddingUrl, "https://openrouter.ai/api/v1/embeddings");
    process.env.JOMLUAH_TEST_DEEPSEEK_MODEL = "deepseek/deepseek-chat";
    process.env.JOMLUAH_TEST_DEEPSEEK_URL = "https://openrouter.ai/api/v1/chat/completions";
    assert.equal(requireProviderHosts().deepseekUrl, "https://openrouter.ai/api/v1/chat/completions");
    process.env.JOMLUAH_TEST_DEEPSEEK_MODEL = "unrelated/model";
    assert.throws(() => requireProviderHosts(), /OpenRouter DeepSeek/);
    process.env.JOMLUAH_TEST_DEEPSEEK_URL = "https://attacker.example/chat/completions";
    assert.throws(() => requireProviderHosts(), /OpenRouter DeepSeek/);
  });
});
