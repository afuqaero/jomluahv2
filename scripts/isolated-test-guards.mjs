const required = [
  "JOMLUAH_TEST_ENV_CONFIRM",
  "JOMLUAH_TEST_PROJECT_ID",
  "JOMLUAH_TEST_AUTH_URL",
  "JOMLUAH_TEST_DATA_API_URL",
  "JOMLUAH_TEST_ALLOWED_AUTH_HOST",
  "JOMLUAH_TEST_ALLOWED_DATA_HOST",
  "JOMLUAH_TEST_USER_A_EMAIL",
  "JOMLUAH_TEST_USER_A_PASSWORD",
  "JOMLUAH_TEST_USER_B_EMAIL",
  "JOMLUAH_TEST_USER_B_PASSWORD",
];

export function readIsolatedConfig({ providers = false } = {}) {
  const missing = [...required, ...(providers ? [
    "JOMLUAH_ENABLE_LIVE_PROVIDER_TESTS",
    "JOMLUAH_TEST_QWEN_API_KEY",
    "JOMLUAH_TEST_CHAT_API_KEY",
    "JOMLUAH_TEST_CHAT_MODEL",
  ] : [])].filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Isolated test prerequisites missing: ${missing.join(", ")}`);
  if (process.env.JOMLUAH_TEST_ENV_CONFIRM !== "ISOLATED_TEST_ONLY") {
    throw new Error("Refusing to run: set JOMLUAH_TEST_ENV_CONFIRM=ISOLATED_TEST_ONLY only for the isolated test project.");
  }
  if (process.env.JOMLUAH_TEST_PROJECT_ID !== "shy-wildflower-28479163") {
    throw new Error("Refusing to run outside the dedicated JomLuah isolated test project.");
  }
  if (providers && process.env.JOMLUAH_ENABLE_LIVE_PROVIDER_TESTS !== "YES_I_EXPECT_SYNTHETIC_PAID_CALLS") {
    throw new Error("Refusing provider calls without explicit synthetic paid-call opt-in.");
  }

  const authUrl = new URL(process.env.JOMLUAH_TEST_AUTH_URL);
  const dataUrl = new URL(process.env.JOMLUAH_TEST_DATA_API_URL);
  const authHost = process.env.JOMLUAH_TEST_ALLOWED_AUTH_HOST.toLowerCase();
  const dataHost = process.env.JOMLUAH_TEST_ALLOWED_DATA_HOST.toLowerCase();
  if (authUrl.protocol !== "https:" || authUrl.hostname !== authHost) throw new Error("Auth URL must use the exact allowlisted isolated Neon Auth host over HTTPS.");
  if (dataUrl.protocol !== "https:" || dataUrl.hostname !== dataHost) throw new Error("Data API URL must use the exact allowlisted isolated Neon host over HTTPS.");
  if (authUrl.hostname !== "ep-long-river-azdshj6q.neonauth.c-3.ap-southeast-1.aws.neon.tech" ||
      dataUrl.hostname !== "ep-long-river-azdshj6q.apirest.c-3.ap-southeast-1.aws.neon.tech" ||
      dataUrl.pathname !== "/neondb/rest/v1") {
    throw new Error("Auth and Data API must target only the dedicated isolated Neon project.");
  }
  for (const user of ["A", "B"]) {
    const email = process.env[`JOMLUAH_TEST_USER_${user}_EMAIL`];
    const password = process.env[`JOMLUAH_TEST_USER_${user}_PASSWORD`];
    if (!email.toLowerCase().endsWith(".invalid") || password.length < 16) {
      throw new Error(`User ${user} must use a fictional .invalid email and a unique test-only password of at least 16 characters.`);
    }
  }
  if (process.env.JOMLUAH_TEST_DATABASE_URL) {
    const db = new URL(process.env.JOMLUAH_TEST_DATABASE_URL);
    if (db.protocol !== "postgresql:" || db.hostname !== "ep-long-river-azdshj6q.c-3.ap-southeast-1.aws.neon.tech" || db.pathname !== "/neondb") {
      throw new Error("Direct database URL, if set, must target only the dedicated isolated Neon project.");
    }
  }
  return { authUrl: authUrl.toString().replace(/\/$/, ""), dataUrl: dataUrl.toString().replace(/\/$/, ""), providers };
}

export function requireProviderHosts() {
  const embeddingUrl = new URL(process.env.JOMLUAH_TEST_EMBEDDING_URL || "https://openrouter.ai/api/v1/embeddings");
  const chatUrl = new URL(process.env.JOMLUAH_TEST_CHAT_URL || "https://rootsys.cloud/v1/chat/completions");
  if (embeddingUrl.protocol !== "https:" || embeddingUrl.hostname !== "openrouter.ai" || embeddingUrl.pathname !== "/api/v1/embeddings") {
    throw new Error("Only the fixed OpenRouter embeddings endpoint is allowed in live tests.");
  }
  const directDeepseek = chatUrl.hostname === "api.deepseek.com" && chatUrl.pathname === "/chat/completions";
  const openRouterDeepseek = chatUrl.hostname === "openrouter.ai" && chatUrl.pathname === "/api/v1/chat/completions" &&
    process.env.JOMLUAH_TEST_CHAT_MODEL?.startsWith("deepseek/");
  const fiqstoreGlm = chatUrl.hostname === "rootsys.cloud" && chatUrl.pathname === "/v1/chat/completions" &&
    process.env.JOMLUAH_TEST_CHAT_MODEL === "glm-5.3-flash";
  if (chatUrl.protocol !== "https:" || (!directDeepseek && !openRouterDeepseek && !fiqstoreGlm)) {
    throw new Error("Only the fixed RootsSys GLM endpoint or explicitly configured legacy chat provider endpoint is allowed in live tests.");
  }
  return { embeddingUrl: embeddingUrl.toString(), chatUrl: chatUrl.toString() };
}
