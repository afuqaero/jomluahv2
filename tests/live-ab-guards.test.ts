import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { readLiveAbConfig } from "../scripts/live-ab-guards.mjs";

const directory = mkdtempSync(join(tmpdir(), "jomluah-live-ab-"));
const envFilePath = join(directory, ".env.local");
writeFileSync(envFilePath, "NEON_AUTH_BASE_URL=https://auth.example.test/api/auth\nNEON_DATA_API_URL=https://data.example.test/neondb/rest/v1\n");

const valid = {
  JOMLUAH_LIVE_AB_CONFIRM: "I_ACCEPT_SYNTHETIC_WRITES_TO_LIVE_DB",
  JOMLUAH_LIVE_AB_AUTH_URL: "https://auth.example.test/api/auth",
  JOMLUAH_LIVE_AB_DATA_API_URL: "https://data.example.test/neondb/rest/v1",
  JOMLUAH_LIVE_AB_USER_A_EMAIL: "jl-ab-test-a@example.invalid",
  JOMLUAH_LIVE_AB_USER_A_PASSWORD: "fictional-password-a-123",
  JOMLUAH_LIVE_AB_USER_B_EMAIL: "jl-ab-test-b@example.invalid",
  JOMLUAH_LIVE_AB_USER_B_PASSWORD: "fictional-password-b-456",
};

test("live A/B guard accepts exact endpoints and dedicated identities", () => {
  const config = readLiveAbConfig({ env: valid, envFilePath });
  assert.equal(config.users.A.email, valid.JOMLUAH_LIVE_AB_USER_A_EMAIL);
});

test("live A/B guard refuses missing confirmation", () => {
  assert.throws(() => readLiveAbConfig({ env: { ...valid, JOMLUAH_LIVE_AB_CONFIRM: "" }, envFilePath }), /confirmation/);
});

test("live A/B guard refuses alternate endpoint", () => {
  assert.throws(() => readLiveAbConfig({ env: { ...valid, JOMLUAH_LIVE_AB_DATA_API_URL: "https://other.example.test/neondb/rest/v1" }, envFilePath }), /exactly match/);
});

test("live A/B guard refuses ordinary accounts and shared passwords", () => {
  assert.throws(() => readLiveAbConfig({ env: { ...valid, JOMLUAH_LIVE_AB_USER_A_EMAIL: "student@example.com" }, envFilePath }), /dedicated/);
  assert.throws(() => readLiveAbConfig({ env: { ...valid, JOMLUAH_LIVE_AB_USER_B_PASSWORD: valid.JOMLUAH_LIVE_AB_USER_A_PASSWORD }, envFilePath }), /distinct/);
});

test.after(() => rmSync(directory, { recursive: true, force: true }));
