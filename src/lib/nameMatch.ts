import { supabase } from "@/integrations/supabase/client";

export const slugify = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

export const levenshtein = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
};

export interface ProfileMatch {
  userId: string;
  displayName: string;
}

// Try to resolve a typed name to an existing user. Returns exact match,
// or the closest fuzzy match (≤ 2 edits) if no exact match.
export const resolveProfileByName = async (
  typedName: string
): Promise<{ exact: ProfileMatch | null; suggestion: ProfileMatch | null }> => {
  const inputSlug = slugify(typedName);
  if (!inputSlug) return { exact: null, suggestion: null };

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name");
  if (!profiles?.length) return { exact: null, suggestion: null };

  let exact: ProfileMatch | null = null;
  let suggestion: ProfileMatch | null = null;
  let bestDist = Infinity;

  for (const p of profiles) {
    if (!p.display_name) continue;
    const slug = slugify(p.display_name);
    if (slug === inputSlug) {
      exact = { userId: p.user_id, displayName: p.display_name };
    } else {
      const dist = levenshtein(inputSlug, slug);
      if (dist > 0 && dist <= 2 && dist < bestDist) {
        bestDist = dist;
        suggestion = { userId: p.user_id, displayName: p.display_name };
      }
    }
  }

  return { exact, suggestion };
};
