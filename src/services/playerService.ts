const CACHE_PREFIX = "tfig_team_";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

export interface PlayerInfo {
  name: string;
  photo: string | null;
  position?: string;
}

const TEAM_NAMES: Record<string, string> = {
  MEX: "Mexico",
  RSA: "South Africa",
  KOR: "South Korea",
  CZE: "Czech Republic",
  CAN: "Canada",
  BIH: "Bosnia",
  QAT: "Qatar",
  SUI: "Switzerland",
  BRA: "Brazil",
  MAR: "Morocco",
  SCO: "Scotland",
  HAI: "Haiti",
  USA: "United States",
  PAR: "Paraguay",
  AUS: "Australia",
  TUR: "Turkey",
  ALE: "Germany",
  ECU: "Ecuador",
  CIV: "Ivory Coast",
  CUR: "Curacao",
  HOL: "Netherlands",
  JPN: "Japan",
  SWE: "Sweden",
  TUN: "Tunisia",
  BEL: "Belgium",
  IRN: "Iran",
  EGY: "Egypt",
  NZL: "New Zealand",
  ESP: "Spain",
  URU: "Uruguay",
  KSA: "Saudi Arabia",
  CPV: "Cape Verde",
  FRA: "France",
  SEN: "Senegal",
  NOR: "Norway",
  IRQ: "Iraq",
  ARG: "Argentina",
  AUT: "Austria",
  ALG: "Algeria",
  JOR: "Jordan",
  POR: "Portugal",
  COD: "Congo DR",
  UZB: "Uzbekistan",
  COL: "Colombia",
  ENG: "England",
  CRO: "Croatia",
  PAN: "Panama",
  GHA: "Ghana",
};

interface CacheEntry {
  players: PlayerInfo[];
  ts: number;
}

function getCache(code: string): PlayerInfo[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + code);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL) return null;
    return entry.players;
  } catch {
    return null;
  }
}

function setCache(code: string, players: PlayerInfo[]) {
  try {
    localStorage.setItem(CACHE_PREFIX + code, JSON.stringify({ players, ts: Date.now() }));
  } catch {}
}

export async function fetchTeamPlayers(teamCode: string): Promise<PlayerInfo[]> {
  const cached = getCache(teamCode);
  if (cached) return cached;

  const teamName = TEAM_NAMES[teamCode];
  if (!teamName) return [];

  const searchRes = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`
  );
  const searchData = await searchRes.json();
  const teams = searchData.teams as any[] | null;
  if (!teams) return [];

  const soccerTeam = teams.find((t: any) => t.strSport === "Soccer") ?? teams[0];
  if (!soccerTeam) return [];

  const playersRes = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/lookup_all_players.php?id=${soccerTeam.idTeam}`
  );
  const playersData = await playersRes.json();
  const raw = playersData.player as any[] | null;

  if (!raw) {
    setCache(teamCode, []);
    return [];
  }

  const players: PlayerInfo[] = raw.slice(0, 20).map((p: any) => ({
    name: p.strPlayer as string,
    photo: (p.strCutout || p.strThumb || null) as string | null,
    position: p.strPosition as string | undefined,
  }));

  setCache(teamCode, players);
  return players;
}
