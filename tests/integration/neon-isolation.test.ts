import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { readIsolatedConfig } from "../../scripts/isolated-test-guards.mjs";

type Principal = { label: "A" | "B"; id: string; email: string; jwt: string };
type Journal = { id: string; user_id: string; title: string; mood: string; excerpt: string; tags: string[]; embedding: unknown };

let config: ReturnType<typeof readIsolatedConfig>;
let principals: Record<"A" | "B", Principal>;
let fixtures: Array<{ owner: Principal; row: Journal }> = [];
let dbReady = false;
const runMarker = `jl-isolated-${randomUUID()}`;

async function authenticate(label: "A" | "B"): Promise<Principal> {
  const email = process.env[`JOMLUAH_TEST_USER_${label}_EMAIL`]!;
  const password = process.env[`JOMLUAH_TEST_USER_${label}_PASSWORD`]!;
  const signInUrl = new URL("sign-in/email", `${config.authUrl}/`);
  const signIn = await fetch(signInUrl, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(12_000),
  });
  assert.equal(signIn.ok, true, `isolated test identity ${label} must be able to authenticate (HTTP ${signIn.status})`);
  const cookie = (signIn.headers.getSetCookie?.() ?? []).map((value) => value.split(";", 1)[0]).join("; ");
  assert.ok(cookie, `auth did not issue a session cookie for synthetic identity ${label}`);
  const sessionResponse = await fetch(new URL("get-session", `${config.authUrl}/`), {
    headers: { cookie, origin: "http://localhost:3000" },
    signal: AbortSignal.timeout(12_000),
  });
  assert.equal(sessionResponse.ok, true, `could not read isolated identity ${label} session`);
  const jwt = sessionResponse.headers.get("set-auth-jwt");
  const session = await sessionResponse.json() as { user?: { id?: string; email?: string }; session?: { user?: { id?: string } } };
  const id = session.user?.id ?? session.session?.user?.id;
  assert.ok(id && jwt?.split(".").length === 3, `auth did not issue a Data API JWT for synthetic identity ${label}`);
  assert.equal(session.user?.email?.toLowerCase() ?? email.toLowerCase(), email.toLowerCase());
  return { label, id, email, jwt };
}

async function api(principal: Principal, table: string, query = "", init: RequestInit = {}) {
  const response = await fetch(`${config.dataUrl}/${table}${query ? `?${query}` : ""}`, {
    ...init,
    headers: {
      authorization: `Bearer ${principal.jwt}`,
      "content-type": "application/json",
      accept: "application/json",
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(12_000),
  });
  const body = await response.text();
  return { response, body, data: body ? JSON.parse(body) : null };
}

async function createJournal(owner: Principal, excerpt: string) {
  const data = {
    user_id: owner.id,
    title: `${runMarker}-${owner.label}`,
    mood: "fictional-test",
    excerpt,
    tags: [runMarker],
    embedding: null,
  };
  const result = await api(owner, "journal_entries", "select=id,user_id,title,mood,excerpt,tags,embedding", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify(data),
  });
  assert.equal(result.response.status, 201, `could not insert synthetic journal fixture (HTTP ${result.response.status})`);
  const row = (result.data as Journal[])[0];
  assert.ok(row?.id);
  fixtures.push({ owner, row });
  return row;
}

before(async () => {
  config = readIsolatedConfig();
  principals = { A: await authenticate("A"), B: await authenticate("B") };
  assert.notEqual(principals.A.id, principals.B.id, "synthetic accounts must be distinct identities");
  dbReady = true;
});

after(async () => {
  if (!dbReady) return;
  for (const { owner, row } of fixtures) {
    await api(owner, "journal_entries", `id=eq.${encodeURIComponent(row.id)}`, { method: "DELETE" }).catch(() => undefined);
  }
});

test("migration 006 rejects self-promotion to admin", async () => {
  const user = principals.A;
  const denied = await api(user, "profiles", "select=id", {
    method: "POST", headers: { prefer: "return=representation" },
    body: JSON.stringify({ id: user.id, email: user.email, role: "admin" }),
  });
  assert.ok([400, 403].includes(denied.response.status), `expected migration 006 to deny admin self-insert; got HTTP ${denied.response.status}`);
  assert.match(denied.body, /permission|policy|row-level|42501|violates/i, "denial should be an authorization/policy failure, not unrelated schema failure");
});

test("journal RLS permits own rows and blocks cross-user read, insert, update, and delete", async () => {
  const rowA = await createJournal(principals.A, `${runMarker} synthetic fact A-only: likes quiet walks`);
  const rowB = await createJournal(principals.B, `${runMarker} synthetic fact B-only: likes green tea`);

  const readA = await api(principals.A, "journal_entries", `id=eq.${rowA.id}&select=id,user_id,excerpt`);
  const readB = await api(principals.B, "journal_entries", `id=eq.${rowB.id}&select=id,user_id,excerpt`);
  assert.equal(readA.data.length, 1);
  assert.equal(readB.data.length, 1);
  assert.equal(readA.data[0].user_id, principals.A.id);
  assert.equal(readB.data[0].user_id, principals.B.id);

  const crossRead = await api(principals.A, "journal_entries", `id=eq.${rowB.id}&select=id`);
  assert.deepEqual(crossRead.data, []);
  const crossInsert = await api(principals.A, "journal_entries", "select=id", {
    method: "POST", headers: { prefer: "return=representation" },
    body: JSON.stringify({ user_id: principals.B.id, title: runMarker, mood: "fictional", excerpt: runMarker }),
  });
  if (crossInsert.response.status === 201 && Array.isArray(crossInsert.data)) {
    for (const row of crossInsert.data as Array<{ id: string }>) {
      if (row.id) fixtures.push({ owner: principals.B, row: { id: row.id } as Journal });
    }
  }
  assert.ok([400, 403].includes(crossInsert.response.status));
  const transferOwnRow = await api(principals.A, "journal_entries", `id=eq.${rowA.id}`, {
    method: "PATCH", headers: { prefer: "return=representation" }, body: JSON.stringify({ user_id: principals.B.id }),
  });
  assert.ok([400, 403].includes(transferOwnRow.response.status), `expected RLS WITH CHECK to block ownership transfer; got HTTP ${transferOwnRow.response.status}`);
  const verifyA = await api(principals.A, "journal_entries", `id=eq.${rowA.id}&select=id,user_id`);
  assert.equal(verifyA.data[0]?.user_id, principals.A.id);
  const crossUpdate = await api(principals.A, "journal_entries", `id=eq.${rowB.id}`, {
    method: "PATCH", headers: { prefer: "return=representation" }, body: JSON.stringify({ excerpt: "tampered" }),
  });
  assert.deepEqual(crossUpdate.data, []);
  const crossDelete = await api(principals.A, "journal_entries", `id=eq.${rowB.id}`, { method: "DELETE", headers: { prefer: "return=representation" } });
  assert.deepEqual(crossDelete.data, []);
  const verifyB = await api(principals.B, "journal_entries", `id=eq.${rowB.id}&select=id,excerpt`);
  assert.equal(verifyB.data[0]?.excerpt, `${runMarker} synthetic fact B-only: likes green tea`);
});

test("journal requests without JWT fail closed", async () => {
  const response = await fetch(`${config.dataUrl}/journal_entries?select=id&limit=1`, {
    headers: { accept: "application/json" }, signal: AbortSignal.timeout(12_000),
  });
  const body = await response.text();
  assert.ok([401, 403].includes(response.status) ||
    (response.status === 400 && /missing authentication credentials.*bearer token/i.test(body)),
  `expected unauthenticated request rejection; got HTTP ${response.status}`);
});
