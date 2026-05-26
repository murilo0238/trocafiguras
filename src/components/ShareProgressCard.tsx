import { useRef } from "react";
import { Share2 } from "lucide-react";
import { SECTIONS, STICKERS_PER_SECTION, getStickerNumber } from "@/data/teams";

interface Props {
  displayName: string;
  collection: Record<string, { collected: boolean; duplicates: number }>;
  total: number;
  collected: number;
}

const ShareProgressCard = ({ displayName, collection, total, collected }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCard = (): HTMLCanvasElement => {
    const canvas = canvasRef.current!;
    const W = 800, H = 420;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0d1f2d");
    bg.addColorStop(1, "#09090b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.beginPath();
    ctx.arc(W - 40, 40, 150, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,107,53,0.07)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(30, H + 20, 120, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,107,53,0.05)";
    ctx.fill();

    // App label
    ctx.font = "bold 20px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#FF6B35";
    ctx.fillText("⚽ TrocaFig  •  Copa 2026", 52, 58);

    // Divider line
    ctx.beginPath();
    ctx.moveTo(52, 72);
    ctx.lineTo(W - 52, 72);
    ctx.strokeStyle = "rgba(255,107,53,0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Name
    ctx.font = `bold ${displayName.length > 16 ? 40 : 48}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(displayName, 52, 138);

    // Count
    const pct = Math.round((collected / total) * 100);
    ctx.font = "bold 38px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#FF6B35";
    const collectedStr = `${collected}`;
    ctx.fillText(collectedStr, 52, 196);
    const cw = ctx.measureText(collectedStr).width;
    ctx.font = "22px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText(`/${total} figurinhas  •  ${pct}% completo`, 52 + cw + 6, 196);

    // Progress bar
    const bx = 52, by = 218, bw = W - 104, bh = 16;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 8);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();

    const fill = bw * Math.min(collected / total, 1);
    const grad = ctx.createLinearGradient(bx, 0, bx + fill, 0);
    grad.addColorStop(0, "#FF6B35");
    grad.addColorStop(1, "#f59e0b");
    ctx.beginPath();
    ctx.roundRect(bx, by, fill, bh, 8);
    ctx.fillStyle = grad;
    ctx.fill();

    // Completed sections
    const completedFlags: string[] = [];
    SECTIONS.forEach((section) => {
      const sCount = section.stickerCount ?? STICKERS_PER_SECTION;
      let c = 0;
      for (let i = 1; i <= sCount; i++) {
        if (collection[`${section.code}${getStickerNumber(section.code, i)}`]?.collected) c++;
      }
      if (c === sCount && section.flag) completedFlags.push(section.flag);
    });

    if (completedFlags.length > 0) {
      ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillText(`SELEÇÕES COMPLETAS  (${completedFlags.length})`, 52, 260);
      ctx.font = "28px serif";
      ctx.fillText(completedFlags.slice(0, 26).join(" "), 52, 298);
    } else {
      ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillText("Nenhuma seleção completa ainda — continue colando! 💪", 52, 270);
    }

    // Footer
    ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText("Troca Figurinha — álbum entre amigos", 52, H - 22);

    return canvas;
  };

  const handleShare = async () => {
    const canvas = drawCard();

    const tryShare = async (blob: Blob) => {
      const file = new File([blob], "progresso.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${displayName} — ${collected}/${total} figurinhas` });
        return true;
      }
      return false;
    };

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const shared = await tryShare(blob).catch(() => false);
      if (!shared) {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "progresso-album.png";
        a.click();
      }
    }, "image/png");
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" aria-hidden />
      <button
        onClick={handleShare}
        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
      >
        <Share2 className="w-3 h-3" />
        Compartilhar progresso
      </button>
    </>
  );
};

export default ShareProgressCard;
