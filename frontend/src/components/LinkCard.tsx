import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { Link } from "../types";
import LinkIcon from "./LinkIcon";

interface LinkCardProps {
  link: Link;
  editMode: boolean;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
}

export default function LinkCard({
  link,
  editMode,
  onEdit,
  onDelete,
}: LinkCardProps) {
  const handleClick = () => {
    if (editMode) {
      onEdit(link);
      return;
    }
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="group relative aspect-square">
      <button
        type="button"
        onClick={handleClick}
        className={`flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border-muted)] bg-[var(--color-surface-raised)] p-2 transition-all duration-200 ${
          editMode
            ? "cursor-pointer hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-overlay)]"
            : "cursor-pointer hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-overlay)] hover:shadow-md hover:shadow-black/20 active:scale-[0.97]"
        }`}
      >
        <LinkIcon title={link.title} url={link.url} icon={link.icon} size="xs" />
        <span className="line-clamp-2 w-full px-0.5 text-center text-[11px] font-medium leading-tight text-[var(--color-text)]">
          {link.title}
        </span>
        {!editMode && (
          <ExternalLink className="absolute right-1.5 top-1.5 h-3 w-3 text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
        )}
        {editMode && (
          <Pencil className="absolute right-1.5 top-1.5 h-3 w-3 text-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>

      {editMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(link.id);
          }}
          className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-danger)] text-white shadow-lg transition-transform hover:scale-110"
          aria-label={`Verwijder ${link.title}`}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
