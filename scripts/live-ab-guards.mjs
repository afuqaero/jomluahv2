import { readFileSync } from "node:fs";

function localEndpoint(name, envFilePath) {
  const line = readFileSync(envFilePath, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.trimStart().startsWith(`${name}=`));
  if (!line) throw new Error(`${name} is missing from .env.local`);
  return line.slice(line.indexOf("=") + 1).trim().replace(/^['"]|['"]$/g, "").replace(/\/$/, "");
}

/** @param {{ env?: Record<string, string | undefined>, envFilePath?: string }} [options] */
export function readLiveAbConfig({ env = process.env, envFilePath = ".env.local" } = {}) {
  if (env.JOMLUAH_LIVE_AB_CONFIRM !== "I_ACCEPT_SYNTHETIC_WRITES_TO_LIVE_DB") {
    throw new Error("Live A/B test requires explicit synthetic-write confirmation.");
  }

  const authUrl = localEndpoint("NEON_AUTH_BASE_URL", envFilePath);
  const dataUrl = localEndpoint("NEON_DATA_API_URL", envFilePath);
  const auth = new URL(authUrl);
  const data = new URL(dataUrl);
  if (auth.protocol !== "https:" || data.protocol !== "https:" || !data.pathname.endsWith("/rest/v1")) {
    throw new Error("Live A/B test requires HTTPS Neon Auth and Data API endpoints.");
  }
  if (env.JOMLUAH_LIVE_AB_AUTH_URL !== authUrl || env.JOMLUAH_LIVE_AB_DATA_API_URL !== dataUrl) {
    throw new Error("Live A/B endpoints must exactly match .env.local; no alternate target is allowed.");
  }

  function user(label) {
    const email = env[`JOMLUAH_LIVE_AB_USER_${label}_EMAIL`]?.trim().toLowerCase();
    const password = env[`JOMLUAH_LIVE_AB_USER_${label}_PASSWORD`];
    if (!email || !/^jl-ab-test-[a-z0-9-]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(`User ${label} must be a dedicated jl-ab-test-* identity.`);
    }
    if (!password || password.length < 16) {
      throw new Error(`User ${label} needs a unique test-only password of at least 16 characters.`);
    }
    return { email, password };
  }
  const users = { A: user("A"), B: user("B") };
  if (users.A.email === users.B.email || users.A.password === users.B.password) {
    throw new Error("A and B must use distinct identities and passwords.");
  }

  return { authUrl, dataUrl, users };
}
