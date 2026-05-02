export interface TeamSection {
  code: string;
  name: string;
  group?: string;
  flag?: string;
  stickerCount?: number;
  players?: string[];
}

export const SECTIONS: TeamSection[] = [
  // Introdução (20 figurinhas: FWC01-FWC19 + FWC00)
  { code: "FWC", name: "Copa do Mundo 2026", flag: "🏆" },
  // Patrocinador (14 figurinhas — jogadores selecionados pela Coca-Cola)
  { code: "COCA", name: "Coca-Cola", flag: "🥤", stickerCount: 14, players: [
    "Lamine Yamal",      // COCA1
    "Gabriel Magalhães", // COCA2
    "Joshua Kimmich",    // COCA3
    "Harry Kane",        // COCA4
    "Santiago Giménez",  // COCA5
    "Joško Gvardiol",    // COCA6
    "Federico Valverde", // COCA7
    "Jefferson Lerma",   // COCA8
    "Enner Valencia",    // COCA9
    "Emiliano Martínez", // COCA10
    "Virgil van Dijk",   // COCA11
    "Alphonso Davies",   // COCA12
    "Raúl Jiménez",      // COCA13
    "Lautaro Martínez",  // COCA14
  ]},

  // Grupo A
  { code: "MEX", name: "México", group: "A", flag: "🇲🇽" },
  { code: "RSA", name: "África do Sul", group: "A", flag: "🇿🇦" },
  { code: "KOR", name: "Coreia do Sul", group: "A", flag: "🇰🇷" },
  { code: "CZE", name: "República Tcheca", group: "A", flag: "🇨🇿" },

  // Grupo B
  { code: "CAN", name: "Canadá", group: "B", flag: "🇨🇦" },
  { code: "BIH", name: "Bósnia", group: "B", flag: "🇧🇦" },
  { code: "QAT", name: "Catar", group: "B", flag: "🇶🇦" },
  { code: "SUI", name: "Suíça", group: "B", flag: "🇨🇭" },

  // Grupo C
  { code: "BRA", name: "Brasil", group: "C", flag: "🇧🇷" },
  { code: "MAR", name: "Marrocos", group: "C", flag: "🇲🇦" },
  { code: "SCO", name: "Escócia", group: "C", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { code: "HAI", name: "Haiti", group: "C", flag: "🇭🇹" },

  // Grupo D
  { code: "USA", name: "Estados Unidos", group: "D", flag: "🇺🇸" },
  { code: "PAR", name: "Paraguai", group: "D", flag: "🇵🇾" },
  { code: "AUS", name: "Austrália", group: "D", flag: "🇦🇺" },
  { code: "TUR", name: "Turquia", group: "D", flag: "🇹🇷" },

  // Grupo E
  { code: "ALE", name: "Alemanha", group: "E", flag: "🇩🇪" },
  { code: "ECU", name: "Equador", group: "E", flag: "🇪🇨" },
  { code: "CIV", name: "Costa do Marfim", group: "E", flag: "🇨🇮" },
  { code: "CUR", name: "Curaçao", group: "E", flag: "🇨🇼" },

  // Grupo F
  { code: "HOL", name: "Holanda", group: "F", flag: "🇳🇱" },
  { code: "JPN", name: "Japão", group: "F", flag: "🇯🇵" },
  { code: "SWE", name: "Suécia", group: "F", flag: "🇸🇪" },
  { code: "TUN", name: "Tunísia", group: "F", flag: "🇹🇳" },

  // Grupo G
  { code: "BEL", name: "Bélgica", group: "G", flag: "🇧🇪" },
  { code: "IRN", name: "Irã", group: "G", flag: "🇮🇷" },
  { code: "EGY", name: "Egito", group: "G", flag: "🇪🇬" },
  { code: "NZL", name: "Nova Zelândia", group: "G", flag: "🇳🇿" },

  // Grupo H
  { code: "ESP", name: "Espanha", group: "H", flag: "🇪🇸" },
  { code: "URU", name: "Uruguai", group: "H", flag: "🇺🇾" },
  { code: "KSA", name: "Arábia Saudita", group: "H", flag: "🇸🇦" },
  { code: "CPV", name: "Cabo Verde", group: "H", flag: "🇨🇻" },

  // Grupo I
  { code: "FRA", name: "França", group: "I", flag: "🇫🇷" },
  { code: "SEN", name: "Senegal", group: "I", flag: "🇸🇳" },
  { code: "NOR", name: "Noruega", group: "I", flag: "🇳🇴" },
  { code: "IRQ", name: "Iraque", group: "I", flag: "🇮🇶" },

  // Grupo J
  { code: "ARG", name: "Argentina", group: "J", flag: "🇦🇷" },
  { code: "AUT", name: "Áustria", group: "J", flag: "🇦🇹" },
  { code: "ALG", name: "Argélia", group: "J", flag: "🇩🇿" },
  { code: "JOR", name: "Jordânia", group: "J", flag: "🇯🇴" },

  // Grupo K
  { code: "POR", name: "Portugal", group: "K", flag: "🇵🇹" },
  { code: "COD", name: "RD Congo", group: "K", flag: "🇨🇩" },
  { code: "UZB", name: "Uzbequistão", group: "K", flag: "🇺🇿" },
  { code: "COL", name: "Colômbia", group: "K", flag: "🇨🇴" },

  // Grupo L
  { code: "ENG", name: "Inglaterra", group: "L", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "CRO", name: "Croácia", group: "L", flag: "🇭🇷" },
  { code: "PAN", name: "Panamá", group: "L", flag: "🇵🇦" },
  { code: "GHA", name: "Gana", group: "L", flag: "🇬🇭" },

];

export const STICKERS_PER_SECTION = 20;
export const TOTAL_STICKERS = SECTIONS.reduce(
  (acc, s) => acc + (s.stickerCount ?? STICKERS_PER_SECTION), 0
); // 1004

// FWC20 é exibida como "00" (figurinha especial da capa)
export function getStickerNumber(code: string, i: number): string {
  if (code === "FWC" && i === 20) return "00";
  return String(i);
}

// Generate all sticker IDs in order
export const getAllStickerIds = (): string[] => {
  const ids: string[] = [];
  for (const section of SECTIONS) {
    const count = section.stickerCount ?? STICKERS_PER_SECTION;
    for (let i = 1; i <= count; i++) {
      ids.push(`${section.code}${getStickerNumber(section.code, i)}`);
    }
  }
  return ids;
};

// Get section for a sticker ID
export const getSectionForSticker = (id: string): TeamSection | undefined => {
  const code = id.replace(/\d+$/, "");
  return SECTIONS.find((s) => s.code === code);
};

// Get player name for a sticker ID (e.g. "BRA5" → "Vinícius Jr.")
export const getPlayerName = (id: string): string | undefined => {
  const section = getSectionForSticker(id);
  if (!section?.players) return undefined;
  const numStr = id.replace(/^[A-Z]+/, "");
  const num = parseInt(numStr, 10);
  if (isNaN(num) || num < 1) return undefined;
  return section.players[num - 1];
};
