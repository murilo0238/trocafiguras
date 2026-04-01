export interface TeamSection {
  code: string;
  name: string;
  group?: string;
  flag?: string;
}

export const SECTIONS: TeamSection[] = [
  // Introdução (20 figurinhas: FWC01-FWC20)
  { code: "FWC", name: "Copa do Mundo 2026", flag: "🏆" },

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
  { code: "COL", name: "Colômbia", group: "K", flag: "🇨🇴" },
  { code: "UZB", name: "Uzbequistão", group: "K", flag: "🇺🇿" },
  { code: "JAM", name: "Jamaica", group: "K", flag: "🇯🇲" },

  // Grupo L
  { code: "ENG", name: "Inglaterra", group: "L", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "CRO", name: "Croácia", group: "L", flag: "🇭🇷" },
  { code: "PAN", name: "Panamá", group: "L", flag: "🇵🇦" },
  { code: "GHA", name: "Gana", group: "L", flag: "🇬🇭" },

  // Encerramento (20 figurinhas: FIN01-FIN20)
  { code: "FIN", name: "Encerramento", flag: "⭐" },
];

export const STICKERS_PER_SECTION = 20;
export const TOTAL_STICKERS = SECTIONS.length * STICKERS_PER_SECTION; // 1000

// Generate all sticker IDs in order
export const getAllStickerIds = (): string[] => {
  const ids: string[] = [];
  for (const section of SECTIONS) {
    for (let i = 1; i <= STICKERS_PER_SECTION; i++) {
      ids.push(`${section.code}${i}`);
    }
  }
  return ids;
};

// Get section for a sticker ID
export const getSectionForSticker = (id: string): TeamSection | undefined => {
  const code = id.replace(/\d+$/, "");
  return SECTIONS.find((s) => s.code === code);
};
