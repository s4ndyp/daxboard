import { useEffect, useRef, useState } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useLinkStatus } from "../hooks/useLinkStatus";
import type { LinkHealthStatus } from "../lib/linkHealth";
import type { Link } from "../types";
import LinkIcon from "./LinkIcon";

interface LinkCardProps {
  link: Link;
  editMode: boolean;
  iconScale: number;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
}

function getStatusBorderClass(
  status: LinkHealthStatus,
  editMode: boolean
): string {
  if (editMode) {
    return "border-[var(--color-border-muted)]";
  }

  switch (status) {
    case "online":
      return "border-[var(--color-success)]/80";
    case "offline":
      return "border-[var(--color-danger)]/80";
    default:
      return "border-[var(--color-border-muted)]";
  }
}

export default function LinkCard({
  link,
  editMode,
  iconScale,
  onEdit,
  onDelete,
}: LinkCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const status = useLinkStatus(link.url, visible);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    if (editMode) {
      onEdit(link);
      return;
    }
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  const borderClass = getStatusBorderClass(status, editMode);

  return (
    <div ref={rootRef} className="group relative aspect-square">
      <button
        type="button"
        onClick={handleClick}
        className={`flex h-full w-full flex-col items-stretch justify-end gap-0.5 rounded-xl border bg-transparent p-1 transition-all duration-300 ${borderClass} ${
          editMode
            ? "cursor-pointer hover:border-[var(--color-accent)]/40 hover:bg-black/5"
            : "cursor-pointer hover:shadow-md hover:shadow-black/10 active:scale-[0.97]"
        }`}
        title={
          !editMode && status === "online"
            ? "Online"
            : !editMode && status === "offline"
              ? "Offline"
              : undefined
        }
      >
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-md bg-transparent">
          <LinkIcon
            title={link.title}
            url={link.url}
            icon={link.icon}
            fill
            scale={iconScale}
          />
        </div>
        <span className="line-clamp-1 w-full px-0.5 text-center text-[10px] font-medium leading-tight text-[var(--color-text)]">
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
