export const MEMORY_CATEGORIES = [
  "general",
  "preference",
  "personal",
  "goal",
  "support",
  "schedule",
] as const;

export type MemoryCategory = typeof MEMORY_CATEGORIES[number];

const categorySet = new Set<string>(MEMORY_CATEGORIES);

export function hasToolIntent(text: string) {
  return /\b(?:remember|save (?:this|that)|store (?:this|that|a memory|memory)|forget|delete (?:that|my )?memory|what do you remember|journal|diary|mood history|mood trend)\b|\b(?:ingat|simpan|lupa|padam memori|jurnal|diari|sejarah mood|trend mood)\b/i.test(text);
}

export function allowsMemorySave(text: string) {
  return /\b(?:remember|save (?:this|that)|store (?:this|that|a memory|memory))\b|\b(?:ingat|simpan)\b/i.test(text);
}

export function allowsMemoryForget(text: string) {
  return /\b(?:forget|delete (?:that|my )?memory)\b|\b(?:lupa|padam memori)\b/i.test(text);
}

export function containsSecretData(content: string) {
  return /\b(?:password|passcode|pin|credit card|bank account|api key|secret key)\b/i.test(content);
}

export function normaliseMemoryCategory(value: unknown): MemoryCategory {
  return typeof value === "string" && categorySet.has(value)
    ? value as MemoryCategory
    : "general";
}

export function normaliseImportance(value: unknown) {
  return Math.round(Math.max(1, Math.min(5, Number(value) || 3)));
}

export function normaliseMemoryContent(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 1000) : "";
}
