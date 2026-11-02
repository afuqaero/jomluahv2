import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { readLiveAbConfig } from "../../scripts/live-ab-guards.mjs";

type Principal = { label: "A" | "B"; id: string; email: string; jwt: string };
type ApiResult = { status: number; data: unknown };

const marker = `jl-ab-test-${randomUUID()}`;
const fixtureIds = { A: randomUUID(), B: randomUUID(), rejectedInsert: randomUUID() };
const cleanupIds = new Set(Object.values(fixtureIds));
let config: ReturnType<typeof readLiveAbConfig>;
let principals: Record<"A" | "B", Principal> | undefined;

async function authenticate(label: "A" | "B"): Promise<Principal> {
  const { email, password } = config.users[label];
  const signIn = await fetch(new URL("sign-in/email", `${config.authUrl}/`), {
    method: "POST",
    headers: { "content-type": "application/json", origin: process.env.JOMLUAH_LIVE_AB_ORIGIN || "http://localhost:3000" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(12_000),
  });
  assert.equal(signIn.ok, true, `dedicated test identity ${label} could not sign in (HTTP ${signIn.status})`);
  const cookie = (signIn.headers.getSetCookie?.() ?? []).map((value) => value.split(";", 1)[0]).join("; ");
  assert.ok(cookie, `test identity ${label} received no session cookie`);
  const sessionResponse = await fetch(new URL("get-session", `${config.authUrl}/`), {
    headers: { cookie, origin: process.env.JOMLUAH_LIVE_AB_ORIGIN || "http://localhost:3000" },
    signal: AbortSignal.timeout(12_000),
  });
  assert.equal(sessionResponse.ok, true, `test identity ${label} session failed (HTTP ${sessionResponse.status})`);
  const jwt = sessionResponse.headers.get("set-auth-jwt");
  const session = await sessionResponse.json() as { user?: { id?: string; email?: string } };
  assert.ok(session.user?.id && jwt?.split(".").length === 3, `test identity ${label} received no Data API identity`);
  assert.equal(session.user.email?.toLowerCase(), email, `test identity ${label} email mismatch`);
  return { label, id: session.user.id, email, jwt };
}

async function api(principal: Principal | undefined, table: string, query: string, init: RequestInit = {}): Promise<ApiResult> {
  const response = await fetch(`${config.dataUrl}/${table}?${query}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      ...(principal ? { authorization: `Bearer ${principal.jwt}` } : {}),
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(12_000),
  });
  const body = await response.text();
  let data: unknown = null;
  if (body) {
    try { data = JSON.parse(body); } catch { data = null; }
  }
  return { status: response.status, data };
}

function rows(result: ApiResult): Array<Record<string, unknown>> {
  assert.ok(Array.isArray(result.data), `expected JSON array, got HTTP ${result.status}`);
  return result.data as Array<Record<string, unknown>>;
}

async function createFixture(principal: Principal, id: string) {
  const result = await api(principal, "journal_entries", "select=id,user_id", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({
      id,
      user_id: principal.id,
      title: `${marker}-${principal.label}`,
      mood: "fictional-test",
      excerpt: `${marker} fictional journal for user ${principal.label}`,
      tags: [marker],
      embedding: principal.label === "A" ? [1, 0, 0] : [0, 1, 0],
    }),
  });
  assert.equal(result.status, 201, `could not create synthetic fixture for ${principal.label} (HTTP ${result.status})`);
  assert.equal(rows(result)[0]?.id, id);
  assert.equal(rows(result)[0]?.user_id, principal.id);
}

before(async () => {
  config = readLiveAbConfig();
  const userA = await authenticate("A");
  const userB = await authenticate("B");
  assert.notEqual(userA.id, userB.id, "test identities must have different database IDs");
  principals = { A: userA, B: userB };
});

after(async () => {
  if (!principals) return;
  const failures: string[] = [];
  for (const id of cleanupIds) {
    for (const principal of Object.values(principals)) {
      try {
        const deletion = await api(principal, "journal_entries", `id=eq.${id}`, { method: "DELETE" });
        if (![200, 204].includes(deletion.status)) failures.push(`delete ${id} as ${principal.label}: HTTP ${deletion.status}`);
      } catch (error) {
        failures.push(`delete ${id}: ${error instanceof Error ? error.name : "error"}`);
      }
    }
    for (const principal of Object.values(principals)) {
      try {
        const check = await api(principal, "journal_entries", `id=eq.${id}&select=id`);
        if (check.status !== 200 || !Array.isArray(check.data) || check.data.length !== 0) failures.push(`fixture ${id} still visible to ${principal.label}`);
      } catch (error) {
        failures.push(`verify ${id}: ${error instanceof Error ? error.name : "error"}`);
      }
    }
  }
  assert.deepEqual(failures, [], "synthetic fixture cleanup did not complete; inspect exact fixture IDs manually");
});

test("A and B can create and read only their own fictional journal", async () => {
  assert.ok(principals);
  await createFixture(principals.A, fixtureIds.A);
  await createFixture(principals.B, fixtureIds.B);
  for (const principal of Object.values(principals)) {
    const id = fixtureIds[principal.label];
    const own = await api(principal, "journal_entries", `id=eq.${id}&select=id,user_id`);
    assert.equal(own.status, 200);
    assert.equal(rows(own).length, 1);
    assert.equal(rows(own)[0].user_id, principal.id);
  }
});

test("cross-user reads and owner-filtered embedding retrieval return no other user's fixture", async () => {
  assert.ok(principals);
  for (const [caller, other, otherId] of [
    [principals.A, principals.B, fixtureIds.B],
    [principals.B, principals.A, fixtureIds.A],
  ] as const) {
    const direct = await api(caller, "journal_entries", `id=eq.${otherId}&select=id`);
    assert.equal(direct.status, 200);
    assert.deepEqual(rows(direct), []);
    const scoped = await api(caller, "journal_entries", `user_id=eq.${other.id}&id=eq.${otherId}&select=id,user_id,embedding`);
    assert.equal(scoped.status, 200);
    assert.deepEqual(rows(scoped), []);
  }
});

test("cross-user insert, update, delete, and ownership transfer fail", async () => {
  assert.ok(principals);
  const crossInsert = await api(principals.A, "journal_entries", "select=id", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({ id: fixtureIds.rejectedInsert, user_id: principals.B.id, title: marker, mood: "fictional-test" }),
  });
  assert.ok([400, 403].includes(crossInsert.status), `cross-user insert returned HTTP ${crossInsert.status}`);

  const transfer = await api(principals.A, "journal_entries", `id=eq.${fixtureIds.A}&select=id`, {
    method: "PATCH", headers: { prefer: "return=representation" }, body: JSON.stringify({ user_id: principals.B.id }),
  });
  assert.ok([400, 403].includes(transfer.status), `ownership transfer returned HTTP ${transfer.status}`);

  const update = await api(principals.A, "journal_entries", `id=eq.${fixtureIds.B}&select=id`, {
    method: "PATCH", headers: { prefer: "return=representation" }, body: JSON.stringify({ excerpt: `${marker} tampered` }),
  });
  assert.equal(update.status, 200);
  assert.deepEqual(rows(update), []);

  const deletion = await api(principals.A, "journal_entries", `id=eq.${fixtureIds.B}&select=id`, {
    method: "DELETE", headers: { prefer: "return=representation" },
  });
  assert.equal(deletion.status, 200);
  assert.deepEqual(rows(deletion), []);
  const verify = await api(principals.B, "journal_entries", `id=eq.${fixtureIds.B}&select=id,excerpt`);
  assert.equal(rows(verify).length, 1);
  assert.equal(rows(verify)[0].excerpt, `${marker} fictional journal for user B`);
});

test("own update and delete work while missing identity cannot read a synthetic fixture", async () => {
  assert.ok(principals);
  const anonymous = await api(undefined, "journal_entries", `id=eq.${fixtureIds.A}&select=id`);
  const missingBearer = anonymous.status === 400
    && typeof anonymous.data === "object"
    && anonymous.data !== null
    && "message" in anonymous.data
    && anonymous.data.message === "missing authentication credentials: required authorization bearer token in JWT format";
  assert.ok(
    missingBearer || [401, 403].includes(anonymous.status) || (anonymous.status === 200 && rows(anonymous).length === 0),
    `anonymous request did not fail closed (HTTP ${anonymous.status})`,
  );

  const update = await api(principals.A, "journal_entries", `id=eq.${fixtureIds.A}&select=id,excerpt`, {
    method: "PATCH", headers: { prefer: "return=representation" }, body: JSON.stringify({ excerpt: `${marker} updated by owner` }),
  });
  assert.equal(update.status, 200);
  assert.equal(rows(update)[0]?.excerpt, `${marker} updated by owner`);

  const deletion = await api(principals.A, "journal_entries", `id=eq.${fixtureIds.A}&select=id`, {
    method: "DELETE", headers: { prefer: "return=representation" },
  });
  assert.equal(deletion.status, 200);
  assert.equal(rows(deletion)[0]?.id, fixtureIds.A);
  const verify = await api(principals.A, "journal_entries", `id=eq.${fixtureIds.A}&select=id`);
  assert.deepEqual(rows(verify), []);
});
