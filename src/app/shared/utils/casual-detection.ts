/**
 * Casual Detection — Identifies casual/greeting messages vs. actionable queries.
 */

const CASUAL_RE =
  /^(hi|hey|hello|howdy|yo|sup|good\s?(morning|afternoon|evening|night|day)|thanks|thank\s?you|thx|ty|ok|okay|cool|nice|great|good|sure|yes|no|yep|nope|alright|fine|awesome|perfect|got\s?it|understood|cheers|bye|goodbye|see\s?ya|later|welcome|please|np|no\s?problem)[\s!.,?]*$/i;

const CASUAL_KEYWORDS = [
  "threat","ioc","attack","cve","apt","agent","incident","case","alert","breach",
  "compliance","audit","soc","nist","iso","status","health","system","dashboard",
  "help","vulnerability","vuln","patch","scan","identity","access","privilege",
  "credential","analyst","attention","approve","pending","reasoning","happened",
  "timeline","metrics","summary","iam","misconfig","appsec","asset","risk",
  "exposure","governance","policy","module","chart","graph","trend","distribution",
  "path","visual","discover","detect","investigate","contribute",
];

export function isCasual(text: string): boolean {
  if (CASUAL_RE.test(text.trim())) return true;
  const words = text.trim().split(/\s+/);
  if (words.length <= 2) {
    const lo = text.toLowerCase();
    return !CASUAL_KEYWORDS.some(k => lo.includes(k));
  }
  return false;
}

export const CASUAL_RESPS = [
  "Standing by. What do you need me to look into?",
  "Monitoring. All agents reporting nominal. What's next?",
  "Ready. All systems green — ask me anything.",
  "Copy that. Awaiting your next query.",
];
