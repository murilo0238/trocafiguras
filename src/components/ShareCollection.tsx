import { Share2 } from "lucide-react";
import { useState } from "react";
import { SECTIONS, STICKERS_PER_SECTION } from "@/data/teams";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StickerData {
  collected: boolean;
  duplicates: number;
}

type StickerCollection = Record<string, StickerData>;

interface ShareCollectionProps {
  collection: StickerCollection;
}

type ShareType = "missing" | "duplicates";

const generateText = (collection: StickerCollection, type: ShareType): string => {
  const lines: string[] = [];
  const title = type === "missing" ? "📋 FIGURINHAS FALTANTES" : "🔄 FIGURINHAS REPETIDAS";
  lines.push(title);
  lines.push("Troca Figurinha - Copa 2026\n");

  let total = 0;

  for (const section of SECTIONS) {
    const items: string[] = [];
    for (let i = 1; i <= STICKERS_PER_SECTION; i++) {
      const id = `${section.code}${i}`;
      const data = collection[id];
      if (type === "missing" && !data?.collected) {
        items.push(id);
      } else if (type === "duplicates" && (data?.duplicates || 0) > 0) {
        items.push(`${id} (${data!.duplicates}x)`);
      }
    }
    if (items.length > 0) {
      lines.push(`${section.flag} ${section.name}: ${items.join(", ")}`);
      total += items.length;
    }
  }

  lines.push(`\nTotal: ${total}`);
  return lines.join("\n");
};

const ShareCollection = ({ collection }: ShareCollectionProps) => {
  const [open, setOpen] = useState(false);
  const [shareType, setShareType] = useState<ShareType>("missing");

  const text = generateText(collection, shareType);
  const encoded = encodeURIComponent(text);

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: "💬",
      url: `https://wa.me/?text=${encoded}`,
    },
    {
      name: "Facebook",
      icon: "📘",
      url: `https://www.facebook.com/sharer/sharer.php?quote=${encoded}`,
    },
    {
      name: "E-mail",
      icon: "📧",
      url: `mailto:?subject=${encodeURIComponent(shareType === "missing" ? "Figurinhas Faltantes - Copa 2026" : "Figurinhas Repetidas - Copa 2026")}&body=${encoded}`,
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-2 rounded-full hover:bg-muted transition-colors"
          title="Compartilhar"
        >
          <Share2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-primary">Compartilhar Lista</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={shareType === "missing" ? "default" : "outline"}
            size="sm"
            onClick={() => setShareType("missing")}
            className="flex-1"
          >
            Faltantes
          </Button>
          <Button
            variant={shareType === "duplicates" ? "default" : "outline"}
            size="sm"
            onClick={() => setShareType("duplicates")}
            className="flex-1"
          >
            Repetidas
          </Button>
        </div>

        <div className="bg-muted rounded-lg p-3 max-h-40 overflow-y-auto mb-4">
          <pre className="text-xs text-foreground whitespace-pre-wrap font-sans">
            {text}
          </pre>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {shareOptions.map((opt) => (
            <a
              key={opt.name}
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-accent transition-colors text-sm font-medium text-foreground"
            >
              <span className="text-lg">{opt.icon}</span>
              {opt.name}
            </a>
          ))}
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-accent transition-colors text-sm font-medium text-foreground"
          >
            <span className="text-lg">📋</span>
            Copiar texto
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCollection;
