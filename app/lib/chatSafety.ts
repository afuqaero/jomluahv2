export type SafetyLevel = "none" | "concern" | "urgent";

export type SafetyAssessment = {
  level: SafetyLevel;
  matched: string[];
};

const urgentPatterns = [
  /\b(?:kill|hurt) myself\b/i,
  /\b(?:suicide|suicidal)\b/i,
  /\b(?:end my life|want to die|don't want to (?:be alive|live anymore)|do not want to (?:be alive|live anymore))\b/i,
  /\b(?:bunuh diri|nak mati|mahu mati|cederakan diri)\b/i,
];

const concernPatterns = [
  /\b(?:self[- ]?harm|hopeless|worthless|can't go on|cannot go on)\b/i,
  /\b(?:depressed|depression|panic attack)\b/i,
  /\b(?:putus asa|tak berguna|murung|serangan panik)\b/i,
];

export function assessSafety(text: string): SafetyAssessment {
  const urgent = urgentPatterns.filter((pattern) => pattern.test(text)).map(String);
  if (urgent.length > 0) return { level: "urgent", matched: urgent };

  const concern = concernPatterns.filter((pattern) => pattern.test(text)).map(String);
  if (concern.length > 0) return { level: "concern", matched: concern };

  return { level: "none", matched: [] };
}

export const urgentSafetyReply = `I dengar you, and keselamatan you paling penting sekarang. Kalau you rasa mungkin cederakan diri atau dalam bahaya, call **999** sekarang atau pergi dekat orang yang you percaya—jangan duduk sorang.

You juga boleh hubungi:
- **Befrienders KL:** 03-7627 2929 (24/7)
- **Talian Kasih:** 15999 (24/7)
- **UTHM PCU:** +607-453 7465

Boleh jawab satu benda: **you dalam bahaya sekarang, atau ada plan untuk cederakan diri?**`;
