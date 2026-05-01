const STOPWORDS = new Set([
  "a","an","and","are","as","at","be","by","for","from","has","have","i","in",
  "is","it","its","of","on","or","that","the","this","to","was","were","will",
  "with","you","your","our","we","they","their","but","not","if","then","than",
  "into","over","under","more","most","some","any","each","other","such","via",
  "use","using","also","including","include","includes","like",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\-\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

export function computeMatchScore(coverLetter: string, requirements: string): number {
  const reqTokens = new Set(tokenize(requirements));
  if (reqTokens.size === 0) return 0;
  const letterTokens = new Set(tokenize(coverLetter));
  let hits = 0;
  for (const t of reqTokens) if (letterTokens.has(t)) hits += 1;
  const raw = hits / reqTokens.size;
  return Math.round(Math.min(0.95, Math.max(0.35, raw * 1.4 + 0.3)) * 100);
}
