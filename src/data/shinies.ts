import { SECTIONS, STICKERS_PER_SECTION, getStickerNumber } from "./teams";

const SHINY = new Set<string>();

for (const section of SECTIONS) {
  const total = section.stickerCount ?? STICKERS_PER_SECTION;

  if (section.code === "FWC") {
    // Intro section: every sticker is a logo/historical — all shiny.
    for (let i = 1; i <= total; i++) {
      SHINY.add(`${section.code}${getStickerNumber(section.code, i)}`);
    }
  } else if (section.group) {
    // National team: only the shield (position 1) is shiny.
    SHINY.add(`${section.code}1`);
  } else {
    // Sponsor section (e.g. COCA): all stickers are shiny.
    for (let i = 1; i <= total; i++) {
      SHINY.add(`${section.code}${getStickerNumber(section.code, i)}`);
    }
  }
}

export const SHINY_CODES: ReadonlySet<string> = SHINY;

export const isShiny = (stickerId: string): boolean => SHINY.has(stickerId);
