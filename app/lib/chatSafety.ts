export type SafetyLevel = "none" | "concern" | "urgent";

export type SafetyAssessment = {
  level: SafetyLevel;
  matched: string[];
};

const urgentPatterns = [
  /\b(?:i|im|i am|aku|saya|sy)\s+(?:(?:really|seriously)\s+)?(?:want to|wanna|wish i could|wish i was|wish i were)\s+(?:die|dead|be dead|end (?:my )?life|end it all|kill myself|hurt myself)\b/i,
  /\b(?:i|im|i am|aku|saya|sy)\s+(?:feel like|rasa macam|am thinking about)\s+(?:ending everything|ending it all|ending (?:my )?life)\b/i,
  /\b(?:i|im|i am|aku|saya|sy)\s+(?:(?:am|feel|feeling|rasa|macam)\s+)?(?:suicidal|suisidal)\b/i,
  /\b(?:suicidal thoughts?|thoughts? of suicide)\s+(?:are\s+)?(?:back|returning|getting worse|happening again)\b/i,
  /\b(?:i|im|i am|aku|saya|sy)\s+(?:do not|don't|dont|do not want to|don't want to|dont want to)\s+(?:be alive|live anymore|be here anymore)\b/i,
  /\b(?:i|im|i am|aku|saya|sy)\s+(?:tak|x|xtak|tidak|dah tak|tak mahu|tak nak)\s+(?:nak\s+)?(?:terus\s+)?(?:hidup|live|be alive)\s+(?:lagi|anymore|any longer)\b/i,
  /\b(?:i|aku|saya|sy)\s+(?:(?:rasa|feel|macam)\s+)?(?:nak|mahu|mau|wanna|want to)\s+(?:bunuh\s*diri|mati|end (?:my )?life|kill myself)\b/i,
  /\b(?:i|aku|saya|sy)\s+(?:tak|x|xtak|tidak|tak mahu|tak nak)\s+(?:nak\s+)?(?:hidup|live|be alive)\s*(?:lagi|dah|already|anymore|any longer)?\s*$/i,
  /\b(?:nak|mahu|mau)\s+(?:bunuh\s*diri|mati)\b/i,
  /\b(?:i|aku|saya|sy)\s+(?:dah|sudah|really)?\s*(?:tak sanggup|cannot|can't|cant|tak tahan)\s+(?:teruskan hidup|hidup lagi|go on living|keep living)\b/i,
  /\b(?:everyone|everybody) would be better off without me\b/i,
  /\b(?:everyone|everybody) would be better without me\b/i,
  /\b(?:there is|there's) no reason for me to (?:live|keep living|go on)\b/i,
  /\b(?:i|im|i am)\s+(?:hope|wish)\s+i (?:don't|do not) wake up\b/i,
  /\b(?:i|im|i am|aku|saya)\s+(?:want to|wanna|nak|mahu)\s+sleep and never wake up\b/i,
  /\b(?:kalau|if)\s+(?:aku|saya|i)\s+tak ada\b.{0,50}\b(?:lagi senang|lebih baik|better off)\b/i,
  /\b(?:lebih baik|lagi senang|better off)\s+(?:kalau|if)\s+(?:aku|saya|i)\s+(?:mati|dead)\b/i,
  /\b(?:semua orang|everyone)\s+(?:lebih baik|lagi senang|would be better)\s+tanpa\s+(?:aku|saya|me)\b/i,
];

const concernPatterns = [
  /\b(?:self[- ]?harm|hopeless|worthless|can't go on|cannot go on|can't keep going|cannot keep going|can't do this anymore|cannot do this anymore|i'm done here|im done here|i am done here)\b/i,
  /\b(?:depressed|depression|panic attack|want (?:everything|it all) to stop|want to disappear|wish i could disappear|want to vanish|tired of existing|tired of being alive)\b/i,
  /\b(?:putus asa|tak berguna|murung|serangan panik|tak sanggup|penat hidup|letih hidup|penat wujud|tak nak teruskan|nak hilang|rasa (?:macam )?nak hilang)\b/i,
  /\b(?:i|im|i am|aku|saya)\s+(?:a burden|beban)\s+(?:to everyone|kepada semua orang)\b/i,
];

const safeDenialPatterns = [
  /\b(?:i|im|i am|aku|saya)\s+(?:am\s+)?not\s+(?:suicidal|depressed|hopeless|worthless)\b/gi,
  /\b(?:i|aku|saya)\s+(?:do not|don't|dont|never)\s+(?:want to\s+)?(?:kill|hurt|harm)\s+myself\b/gi,
  /\b(?:i|aku|saya)\s+(?:do not|don't|dont)\s+want to die\b/gi,
  /\b(?:not thinking about|no thoughts? of)\s+(?:suicide|self[- ]?harm)\b/gi,
  /\b(?:tak|tidak)\s+(?:terfikir|fikir)\s+(?:nak\s+)?(?:bunuh\s*diri|mati)\b/gi,
];

const historicalPatterns = [
  /\b(?:used to|years? ago|in the past|previously|when i was younger|dulu|pernah dulu)\b/i,
  /\b(?:safe now|okay now|those thoughts? (?:are )?gone|tak lagi|dah okay|sudah pulih)\b/i,
];

const thirdPartyAttribution = /\b(?:(?:my|a|the)\s+)?(?:friend|classmate|sibling|partner|teacher|character|author|someone|he|she|they|the article|the book|the poem)\s+(?:said|texted|wrote|posted|told me|is|was)\b/i;

function normalizeSafetyText(text: string) {
  let normalized = text.normalize("NFKC").toLowerCase();
  if (thirdPartyAttribution.test(normalized)) {
    normalized = normalized.replace(/[\"“‘][^\"”’]*[\"”’]/g, " ");
  }
  return normalized
    .replace(/\bi['’]?m\b/g, "i am")
    .replace(/\b(?:taknak|xnak)\b/g, "tak nak")
    .replace(/\b(?:takde|xde)\b/g, "tak ada")
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(/\bd1e\b/g, "die")
    .replace(/\bsuisidal\b/g, "suicidal")
    .replace(/[’]/g, "'")
    .replace(/[^\p{L}\p{N}' ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function removeExplicitDenials(text: string) {
  return safeDenialPatterns.reduce((result, pattern) => result.replace(pattern, " "), text);
}

export function assessSafety(text: string): SafetyAssessment {
  const normalized = removeExplicitDenials(normalizeSafetyText(text));
  const urgent = urgentPatterns.filter((pattern) => pattern.test(normalized)).map(String);
  if (urgent.length > 0) {
    const historicalOnly = historicalPatterns.some((pattern) => pattern.test(normalized));
    const currentRisk = /\b(?:now|tonight|today|again|back|plan|planning|might|going to|want to|wanna|nak mati|nak bunuh diri)\b/i.test(normalized);
    if (!(historicalOnly && !currentRisk)) return { level: "urgent", matched: urgent };
    return { level: "concern", matched: urgent };
  }

  if (historicalPatterns.some((pattern) => pattern.test(normalized)) && /\b(?:suicidal|suicide|want to die|bunuh diri|nak mati)\b/i.test(normalized)) {
    return { level: "concern", matched: ["historical crisis mention"] };
  }

  const concern = concernPatterns.filter((pattern) => pattern.test(normalized)).map(String);
  if (concern.length > 0) return { level: "concern", matched: concern };

  if (thirdPartyAttribution.test(normalized) && /\b(?:suicidal|suicide|bunuh diri|nak mati)\b/i.test(normalized)) {
    return { level: "concern", matched: ["third-party crisis mention"] };
  }

  return { level: "none", matched: [] };
}

export function shouldRetrieveForSafety(level: SafetyLevel) {
  return level === "none";
}

export const concernSafetyFallback = `I’m sorry this feels so heavy. I’m having trouble replying right now, but I want to check: **are you safe right now?** If you might hurt yourself or you’re in immediate danger, call **999** or go to someone you trust now. You can also contact **Befrienders KL at 03-7627 2929**.`;

export function getSafetyFallback(level: SafetyLevel) {
  if (level === "urgent") return urgentSafetyReply;
  if (level === "concern") return concernSafetyFallback;
  return null;
}

export const urgentSafetyReply = `I dengar you, and keselamatan you paling penting sekarang. Kalau you rasa mungkin cederakan diri atau dalam bahaya, call **999** sekarang atau pergi dekat orang yang you percaya—jangan duduk sorang.

You juga boleh hubungi:
- **Befrienders KL:** 03-7627 2929 (24/7)
- **Talian Kasih:** 15999 (24/7)
- **UTHM PCU:** +607-453 7465

Boleh jawab satu benda: **you dalam bahaya sekarang, atau ada plan untuk cederakan diri?**`;
