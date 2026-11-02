import { allowsMemoryForget, allowsMemorySave } from "./aiPolicy.ts";

export type RetrievalPlan = {
  memories: boolean;
  journals: boolean;
};

export function planRetrieval(text: string): RetrievalPlan {
  const memoryCue = /\b(?:remember|memories|memory|forget|preference|preferences|prefer|ingat|memori|lupa|simpan)\b/i.test(text);
  const journalCue = /\b(?:journal|journals|diary|diaries|jurnal|diari|mood (?:history|trend|pattern)|sejarah mood|trend mood|how have i been feeling|how was my mood|(?:past|previous|last) (?:entry|entries)|(?:wrote|written|write) in (?:my |the )?(?:journal|diary))\b/i.test(text);
  const priorContextCue = /\b(?:again|earlier|before|previously|last (?:time|week|month|year|night)|yesterday|used to|we (?:talked|discussed)|i (?:told|mentioned) you|as i said|what (?:did|have) i (?:tell|mention)|dulu|sebelum ini|hari tu|semalam|minggu lepas|bulan lepas|pernah|lagi|macam (?:dulu|sebelum))\b/i.test(text);
  const autobiographicalJournalCue =
    /\b(?:what|which|how)\b[^?\n]{0,100}\b(?:helped|made|worked for)\s+me\b/i.test(text)
    || /\bingat tak\b[^?\n]{0,80}\bapa\b[^?\n]{0,60}\b(?:buat|bantu|menolong)\s+saya\b/i.test(text);

  return {
    memories: !autobiographicalJournalCue && (memoryCue || priorContextCue),
    journals: journalCue || priorContextCue || autobiographicalJournalCue,
  };
}

export function shouldUseRecallAgent(text: string): boolean {
  const plan = planRetrieval(text);
  if (!plan.memories && !plan.journals) return false;
  if (allowsMemorySave(text) || allowsMemoryForget(text)) return false;
  if (/\b(?:mood (?:history|trend)|sejarah mood|trend mood|list (?:my )?memories|what do you remember)\b/i.test(text)) return false;
  return true;
}

