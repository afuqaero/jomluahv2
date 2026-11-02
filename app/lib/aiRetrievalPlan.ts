import { allowsMemoryForget, allowsMemorySave } from "./aiPolicy.ts";

export type RetrievalPlan = {
  memories: boolean;
  journals: boolean;
};

export function planRetrieval(text: string): RetrievalPlan {
  const memoryCue = /\b(?:remember|memories|memory|forget|preference|preferences|prefer|ingat|memori|lupa|simpan)\b/i.test(text);
  const journalCue = /\b(?:journal|journals|diary|diaries|jurnal|diari|mood (?:history|trend|pattern)|sejarah mood|trend mood|how have i been feeling|how was my mood|(?:past|previous|last) (?:entry|entries)|(?:wrote|written|write) in (?:my |the )?(?:journal|diary))\b/i.test(text);
  const priorContextCue = /\b(?:again|earlier|before|previously|last (?:time|week|month|year|night)|yesterday|used to|we (?:talked|discussed)|i (?:told|mentioned) you|as i said|what (?:did|have) i (?:tell|mention)|dulu|sebelum ini|hari tu|semalam|minggu lepas|bulan lepas|pernah|lagi|macam (?:dulu|sebelum))\b/i.test(text);

  return {
    memories: memoryCue || priorContextCue,
    journals: journalCue || priorContextCue,
  };
}

export function shouldUseRecallAgent(text: string): boolean {
  const plan = planRetrieval(text);
  if (!plan.memories && !plan.journals) return false;
  if (allowsMemorySave(text) || allowsMemoryForget(text)) return false;
  if (/\b(?:mood (?:history|trend)|sejarah mood|trend mood|list (?:my )?memories|what do you remember)\b/i.test(text)) return false;
  return true;
}

