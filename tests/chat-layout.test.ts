import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const chatPage = readFileSync(new URL("../app/chat/page.tsx", import.meta.url), "utf8");

test("chat autoscroll stays inside the message pane", () => {
  assert.match(chatPage, /const messagesScrollRef = useRef<HTMLDivElement>\(null\)/);
  assert.match(chatPage, /messagePane\?\.scrollTo\(/);
  assert.match(chatPage, /ref=\{messagesScrollRef\}/);
  assert.doesNotMatch(chatPage, /scrollIntoView\(/);
});

test("chat shell cannot make the document taller than the viewport", () => {
  assert.match(chatPage, /h-dvh[^"`]*overflow-clip/);
  assert.match(chatPage, /flex-1 h-full[^"`]*overflow-clip/);
});

test("chat history has no opaque decorative strip below the header", () => {
  assert.doesNotMatch(chatPage, /Premium Gradient Top Fade/);
  assert.doesNotMatch(chatPage, /dark:from-stone-950/);
});
