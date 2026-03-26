export interface TeamSection {
  code: string;
  name: string;
  group?: string;
  flag?: string;
}

export const SECTIONS: TeamSection[] = [
  // Introdução (20 figurinhas: FWC01-FWC20)
  { code: "FWC", name: "Copa do Mundo", flag: "🏆" },

  // Grupo A
  { code: "QAT", name: "Catar", group: "A", flag: "🇶🇦" },
  { code: "ECU", name: "Equador", group: "A", flag: "🇪🇨" },
  { code: "SEN", name: "Senegal", group: "A", flag: "🇸🇳" },
  { code: "HOL", name: "Holanda", group: "A", flag: "🇳🇱" },

  // Grupo B
  { code: "ENG", name: "Inglaterra", group: "B", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "IRN", name: "Irã", group: "B", flag: "🇮🇷" },
  { code: "USA", name: "Estados Unidos", group: "B", flag: "🇺🇸" },
  { code: "WAL", name: "País de Gales", group: "B", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },

  // Grupo C
  { code: "ARG", name: "Argentina", group: "C", flag: "🇦🇷" },
  { code: "KSA", name: "Arábia Saudita", group: "C", flag: "🇸🇦" },
  { code: "MEX", name: "México", group: "C", flag: "🇲🇽" },
  { code: "POL", name: "Polônia", group: "C", flag: "🇵🇱" },

  // Grupo D
  { code: "FRA", name: "França", group: "D", flag: "🇫🇷" },
  { code: "AUS", name: "Austrália", group: "D", flag: "🇦🇺" },
  { code: "DEN", name: "Dinamarca", group: "D", flag: "🇩🇰" },
  { code: "TUN", name: "Tunísia", group: "D", flag: "🇹🇳" },

  // Grupo E
  { code: "ESP", name: "Espanha", group: "E", flag: "🇪🇸" },
  { code: "CRC", name: "Costa Rica", group: "E", flag: "🇨🇷" },
  { code: "ALE", name: "Alemanha", group: "E", flag: "🇩🇪" },
  { code: "JPN", name: "Japão", group: "E", flag: "🇯🇵" },

  // Grupo F
  { code: "BEL", name: "Bélgica", group: "F", flag: "🇧🇪" },
  { code: "CAN", name: "Canadá", group: "F", flag: "🇨🇦" },
  { code: "MAR", name: "Marrocos", group: "F", flag: "🇲🇦" },
  { code: "CRO", name: "Croácia", group: "F", flag: "🇭🇷" },

  // Grupo G
  { code: "BRA", name: "Brasil", group: "G", flag: "🇧🇷" },
  { code: "SRB", name: "Sérvia", group: "G", flag: "🇷🇸" },
  { code: "SUI", name: "Suíça", group: "G", flag: "🇨🇭" },
  { code: "CMR", name: "Camarões", group: "G", flag: "🇨🇲" },

  // Grupo H
  { code: "POR", name: "Portugal", group: "H", flag: "🇵🇹" },
  { code: "GHA", name: "Gana", group: "H", flag: "🇬🇭" },
  { code: "URU", name: "Uruguai", group: "H", flag: "🇺🇾" },
  { code: "KOR", name: "Coreia do Sul", group: "H", flag: "🇰🇷" },

  // Grupo I
  { code: "COL", name: "Colômbia", group: "I", flag: "🇨🇴" },
  { code: "CHI", name: "Chile", group: "I", flag: "🇨🇱" },
  { code: "PAR", name: "Paraguai", group: "I", flag: "🇵🇾" },
  { code: "PER", name: "Peru", group: "I", flag: "🇵🇪" },

  // Grupo J
  { code: "NGA", name: "Nigéria", group: "J", flag: "🇳🇬" },
  { code: "EGY", name: "Egito", group: "J", flag: "🇪🇬" },
  { code: "CIV", name: "Costa do Marfim", group: "J", flag: "🇨🇮" },
  { code: "ALG", name: "Argélia", group: "J", flag: "🇩🇿" },

  // Grupo K
  { code: "ITA", name: "Itália", group: "K", flag: "🇮🇹" },
  { code: "AUT", name: "Áustria", group: "K", flag: "🇦🇹" },
  { code: "UKR", name: "Ucrânia", group: "K", flag: "🇺🇦" },
  { code: "SCO", name: "Escócia", group: "K", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },

  // Grupo L
  { code: "NOR", name: "Noruega", group: "L", flag: "🇳🇴" },
  { code: "SUE", name: "Suécia", group: "L", flag: "🇸🇪" },
  { code: "TUR", name: "Turquia", group: "L", flag: "🇹🇷" },
  { code: "CZE", name: "República Tcheca", group: "L", flag: "🇨🇿" },

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
