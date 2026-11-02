import assert from "node:assert/strict";
import test from "node:test";
import {
  retrieveJournalRecords,
  type JournalDatabase,
  type JournalRecord,
} from "../app/lib/journalRetrieval.ts";

const sensitiveFixture = "synthetic-private-journal-canary-84f";

function databaseStub(result: { data: JournalRecord[] | null; error: unknown | null } | Error) {
  const filters: Array<[string, string]> = [];
  let queryCount = 0;
  const query = {
    eq(field: string, value: string) {
      filters.push([field, value]);
      return this;
    },
    order() {
      return this;
    },
    limit() {
      queryCount += 1;
      return {
        then(resolve: (value: { data: JournalRecord[] | null; error: unknown | null }) => unknown, reject: (error: unknown) => unknown) {
          if (result instanceof Error) return Promise.reject(result).then(resolve, reject);
          return Promise.resolve(result).then(resolve, reject);
        },
      };
    },
  };
  const database = {
    from(table: string) {
      assert.equal(table, "journal_entries");
      return { select: () => query };
    },
  } as unknown as JournalDatabase;
  return { database, filters, queryCount: () => queryCount };
}

test("Neon connection unavailable returns a safe retrieval failure", async () => {
  const stub = databaseStub(new TypeError("connection refused"));
  const result = await retrieveJournalRecords(stub.database, "synthetic-user-a", "journal memory", null, 3);
  assert.deepEqual(result, { ok: false, reason: "unavailable" });
  assert.deepEqual(stub.filters, [["user_id", "synthetic-user-a"]]);
  assert.equal(JSON.stringify(result).includes("connection refused"), false);
});

test("Neon retrieval timeout is distinguished from an empty journal", async () => {
  const stub = databaseStub(new DOMException("database query exceeded deadline", "TimeoutError"));
  const result = await retrieveJournalRecords(stub.database, "synthetic-user-a", "journal memory", null, 3);
  assert.deepEqual(result, { ok: false, reason: "timeout" });
  assert.deepEqual(stub.filters, [["user_id", "synthetic-user-a"]]);
});

test("successful empty Neon result is distinct from retrieval failure", async () => {
  const stub = databaseStub({ data: [], error: null });
  const result = await retrieveJournalRecords(stub.database, "synthetic-user-a", "journal memory", null, 3);
  assert.deepEqual(result, { ok: true, records: [] });
  assert.deepEqual(stub.filters, [["user_id", "synthetic-user-a"]]);
});

test("unexpected Neon error is sanitized and never returned as journal content", async () => {
  const stub = databaseStub({ data: null, error: { message: `database failure ${sensitiveFixture} credential=stub-secret` } });
  const result = await retrieveJournalRecords(stub.database, "synthetic-user-a", "journal memory", null, 3);
  assert.deepEqual(result, { ok: false, reason: "unavailable" });
  assert.equal(JSON.stringify(result).includes(sensitiveFixture), false);
  assert.equal(JSON.stringify(result).includes("stub-secret"), false);
  assert.deepEqual(stub.filters, [["user_id", "synthetic-user-a"]]);
});
