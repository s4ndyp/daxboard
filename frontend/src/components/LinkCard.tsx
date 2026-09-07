import { ExternalLink, Trash2 } from "lucide-react";
import type { Link } from "../types";
import LinkIcon from "./LinkIcon";

interface LinkCardProps {
  link: Link;
  editMode: boolean;
  onDelete: (id: string) => void;
}

export default function LinkCard({ link, editMode, onDelete }: LinkCardProps) {
  const handleClick = () => {
    if (editMode) return;
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleClick}
        className={`flex w-full flex-col items-center gap-3 rounded-2xl border border-[var(--color-border-muted)] bg-[var(--color-surface-raised)] p-4 transition-all duration-200 ${
          editMode
            ? "cursor-default opacity-90"
            : "cursor-pointer hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-overlay)] hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]"
        }`}
      >
        <LinkIcon title={link.title} url={link.url} icon={link.icon} />
        <span className="line-clamp-2 text-center text-sm font-medium leading-tight text-[var(--color-text)]">
          {link.title}
        </span>
        {!editMode && (
          <ExternalLink className="absolute right-3 top-3 h-3.5 w-3.5 text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>

      {editMode && (
        <button
          type="button"
          onClick={() => onDelete(link.id)}
          className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-danger)] text-white shadow-lg transition-transform hover:scale-110"
          aria-label={`Verwijder ${link.title}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
