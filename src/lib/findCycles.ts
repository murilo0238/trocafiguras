import { isShiny } from "@/data/shinies";

export interface MemberInventory {
  userId: string;
  displayName: string;
  gives: Set<string>;
  wants: Set<string>;
}

export interface TradeLeg {
  fromUserId: string;
  toUserId: string;
  stickerId: string;
}

export interface TradeCycle {
  legs: TradeLeg[];
  shiny: boolean;
  size: number;
  score: number;
}

interface FindOpts {
  maxResults?: number;
  maxCandidates?: number;
}

const partitionStickers = (codes: string[]) => {
  const shiny = new Set<string>();
  const normal = new Set<string>();
  for (const c of codes) (isShiny(c) ? shiny : normal).add(c);
  return { shiny, normal };
};

const cycleKey = (legs: TradeLeg[]): string =>
  legs
    .map((l) => `${l.fromUserId}>${l.stickerId}>${l.toUserId}`)
    .sort()
    .join("|");

const scoreCycle = (legs: TradeLeg[]): number => legs.length * 10 - legs.length;

const findCyclesForPartition = (
  members: MemberInventory[],
  filter: (sticker: string) => boolean,
  shinyFlag: boolean,
  maxCandidates: number
): TradeCycle[] => {
  const filtered = members.map((m) => ({
    userId: m.userId,
    gives: new Set(Array.from(m.gives).filter(filter)),
    wants: new Set(Array.from(m.wants).filter(filter)),
  }));

  // edges[from][to] = stickers that from has, to wants
  const edges: Record<string, Record<string, string[]>> = {};
  for (const a of filtered) {
    edges[a.userId] = {};
    for (const b of filtered) {
      if (a.userId === b.userId) continue;
      const matching: string[] = [];
      for (const s of a.gives) if (b.wants.has(s)) matching.push(s);
      edges[a.userId][b.userId] = matching;
    }
  }

  const seen = new Set<string>();
  const out: TradeCycle[] = [];
  let evaluated = 0;
  const guard = () => evaluated++ < maxCandidates;

  const N = filtered.length;
  const ids = filtered.map((m) => m.userId);

  // 2-cycles: A→B, B→A (one sticker each direction)
  for (let i = 0; i < N && guard(); i++) {
    for (let j = i + 1; j < N && guard(); j++) {
      const a = ids[i], b = ids[j];
      const ab = edges[a][b], ba = edges[b][a];
      if (!ab?.length || !ba?.length) continue;
      // Use first available sticker each way (distinct stickers, naturally are)
      for (const sa of ab) {
        for (const sb of ba) {
          if (sa === sb) continue; // can't give and receive same sticker
          const legs: TradeLeg[] = [
            { fromUserId: a, toUserId: b, stickerId: sa },
            { fromUserId: b, toUserId: a, stickerId: sb },
          ];
          const key = cycleKey(legs);
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({ legs, shiny: shinyFlag, size: 2, score: scoreCycle(legs) });
          break;
        }
        if (out.length && out[out.length - 1].legs[0].stickerId === sa) break;
      }
    }
  }

  // 3-cycles: A→B→C→A
  for (let i = 0; i < N && guard(); i++) {
    for (let j = 0; j < N && guard(); j++) {
      if (j === i) continue;
      for (let k = 0; k < N && guard(); k++) {
        if (k === i || k === j) continue;
        const a = ids[i], b = ids[j], c = ids[k];
        const ab = edges[a][b], bc = edges[b][c], ca = edges[c][a];
        if (!ab?.length || !bc?.length || !ca?.length) continue;
        const sab = ab[0], sbc = bc[0], sca = ca[0];
        if (new Set([sab, sbc, sca]).size !== 3) continue;
        const legs: TradeLeg[] = [
          { fromUserId: a, toUserId: b, stickerId: sab },
          { fromUserId: b, toUserId: c, stickerId: sbc },
          { fromUserId: c, toUserId: a, stickerId: sca },
        ];
        const key = cycleKey(legs);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ legs, shiny: shinyFlag, size: 3, score: scoreCycle(legs) });
      }
    }
  }

  // 4-cycles: A→B→C→D→A
  if (N >= 4) {
    for (let i = 0; i < N && guard(); i++) {
      for (let j = 0; j < N && guard(); j++) {
        if (j === i) continue;
        for (let k = 0; k < N && guard(); k++) {
          if (k === i || k === j) continue;
          for (let l = 0; l < N && guard(); l++) {
            if (l === i || l === j || l === k) continue;
            const a = ids[i], b = ids[j], c = ids[k], d = ids[l];
            const ab = edges[a][b], bc = edges[b][c], cd = edges[c][d], da = edges[d][a];
            if (!ab?.length || !bc?.length || !cd?.length || !da?.length) continue;
            const sab = ab[0], sbc = bc[0], scd = cd[0], sda = da[0];
            if (new Set([sab, sbc, scd, sda]).size !== 4) continue;
            const legs: TradeLeg[] = [
              { fromUserId: a, toUserId: b, stickerId: sab },
              { fromUserId: b, toUserId: c, stickerId: sbc },
              { fromUserId: c, toUserId: d, stickerId: scd },
              { fromUserId: d, toUserId: a, stickerId: sda },
            ];
            const key = cycleKey(legs);
            if (seen.has(key)) continue;
            seen.add(key);
            out.push({ legs, shiny: shinyFlag, size: 4, score: scoreCycle(legs) });
          }
        }
      }
    }
  }

  return out;
};

export const findCycles = (
  members: MemberInventory[],
  opts: FindOpts = {}
): TradeCycle[] => {
  const maxResults = opts.maxResults ?? 8;
  const maxCandidates = opts.maxCandidates ?? 5000;

  // All sticker codes across all members
  const all = new Set<string>();
  for (const m of members) {
    for (const s of m.gives) all.add(s);
    for (const s of m.wants) all.add(s);
  }
  const { shiny, normal } = partitionStickers(Array.from(all));

  const shinyCycles = findCyclesForPartition(
    members,
    (s) => shiny.has(s),
    true,
    maxCandidates
  );
  const normalCycles = findCyclesForPartition(
    members,
    (s) => normal.has(s),
    false,
    maxCandidates
  );

  const all_cycles = [...shinyCycles, ...normalCycles];
  // Sort: prefer larger cycles (more stickers traded), then prefer shorter
  all_cycles.sort((a, b) => {
    if (a.legs.length !== b.legs.length) return b.legs.length - a.legs.length;
    return b.score - a.score;
  });

  // Greedy dedup: drop cycles that overlap stickers with an already-picked cycle
  const taken = new Set<string>();
  const picked: TradeCycle[] = [];
  for (const c of all_cycles) {
    const stickers = c.legs.map((l) => `${l.fromUserId}:${l.stickerId}`);
    if (stickers.some((s) => taken.has(s))) continue;
    stickers.forEach((s) => taken.add(s));
    picked.push(c);
    if (picked.length >= maxResults) break;
  }

  return picked;
};
