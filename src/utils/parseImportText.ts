import { getAllStickerIds } from "@/data/teams";

export interface ParsedImport {
  missing: Set<string>;
  duplicates: Map<string, number>;
  /** IDs in the text that don't exist in this app's album */
  unknown: string[];
}

/** Normalize sticker IDs from the external app format to internal format.
 *  FWC2  → FWC02   (add leading zero for single digit)
 *  CC1   → COCA1   (prefix rename)
 */
function normalizeId(raw: string): string {
  const id = raw.trim().toUpperCase();
  if (/^CC(\d+)$/.test(id)) return `COCA${id.slice(2)}`;
  const fwc = id.match(/^FWC(\d+)$/);
  if (fwc) return `FWC${fwc[1].padStart(2, "0")}`;
  return id;
}

/** Parse a sticker ID token that may include a count like "AUT16 (×2)" or "ENG5 (×2)".
 *  Returns { id, count } where count is the number of duplicates (extras beyond 1st copy).
 */
function parseToken(token: string): { id: string; count: number } {
  const countMatch = token.match(/\(×(\d+)\)/);
  const count = countMatch ? parseInt(countMatch[1]) : 1;
  const id = normalizeId(token.replace(/\(×\d+\)/, "").trim());
  return { id, count };
}

export function parseImportText(text: string): ParsedImport {
  const ALL_IDS = new Set(getAllStickerIds());
  const missing = new Set<string>();
  const duplicates = new Map<string, number>();
  const unknown: string[] = [];

  let mode: "none" | "missing" | "duplicates" = "none";

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.includes("❌") && line.toLowerCase().includes("falt")) {
      mode = "missing";
      continue;
    }
    if (line.includes("🔁") && line.toLowerCase().includes("repeti")) {
      mode = "duplicates";
      continue;
    }

    // Skip section headers (lines ending with ":" that have no sticker codes)
    if (/^[^A-Z]*[A-Z]{2,5}\d/.test(line) === false && line.endsWith(":")) continue;

    // Extract sticker tokens: sequences of LETTERS+DIGITS optionally followed by (×N)
    const tokenRegex = /[A-Z]{1,5}\d{1,3}(?:\s*\(×\d+\))?/g;
    const tokens = line.match(tokenRegex);
    if (!tokens) continue;

    for (const token of tokens) {
      const { id, count } = parseToken(token);
      if (!ALL_IDS.has(id)) {
        unknown.push(id);
        continue;
      }
      if (mode === "missing") {
        missing.add(id);
      } else if (mode === "duplicates") {
        duplicates.set(id, count);
      }
    }
  }

  return { missing, duplicates, unknown };
}

/** Build the full collection state from a parsed import.
 *  - missing → collected: false, duplicates: 0
 *  - duplicates → collected: true, duplicates: N
 *  - everything else → collected: true, duplicates: 0
 */
export function buildCollectionFromImport(parsed: ParsedImport) {
  const ALL_IDS = getAllStickerIds();
  return ALL_IDS.map((id) => {
    if (parsed.missing.has(id)) {
      return { sticker_id: id, collected: false, duplicates: 0 };
    }
    if (parsed.duplicates.has(id)) {
      return { sticker_id: id, collected: true, duplicates: parsed.duplicates.get(id)! };
    }
    return { sticker_id: id, collected: true, duplicates: 0 };
  });
}
