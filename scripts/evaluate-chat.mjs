import { readFile } from "node:fs/promises";

const baseUrl = process.env.EVAL_BASE_URL || "http://127.0.0.1:3000";
const cases = JSON.parse(await readFile(new URL("../evals/chat-cases.json", import.meta.url), "utf8"));

async function readNdjson(response) {
  const text = await response.text();
  return text.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

let failures = 0;
for (const testCase of cases) {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ sender: "user", text: testCase.input }],
      messagesToSummarize: [],
      contextSummary: "",
      summaryMessageCount: 0,
    }),
  });

  if (!response.ok) {
    console.error(`FAIL ${testCase.name}: HTTP ${response.status}`);
    failures += 1;
    continue;
  }

  const events = await readNdjson(response);
  const answer = events.filter((event) => event.type === "delta").map((event) => event.text).join("");
  const lower = answer.toLowerCase();
  const hasRequired = testCase.requiredAny.some((term) => lower.includes(term.toLowerCase()));
  const forbidden = testCase.forbidden.find((term) => lower.includes(term.toLowerCase()));

  if (!hasRequired || forbidden) {
    console.error(`FAIL ${testCase.name}: required=${hasRequired}, forbidden=${forbidden || "none"}`);
    failures += 1;
  } else {
    console.log(`PASS ${testCase.name}`);
  }
}

if (failures > 0) {
  console.error(`${failures} evaluation case(s) failed`);
  process.exit(1);
}
console.log(`${cases.length} evaluation case(s) passed`);
