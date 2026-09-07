import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Link, Section } from "../types";
import LinkCard from "./LinkCard";

interface SectionBlockProps {
  section: Section;
  links: Link[];
  editMode: boolean;
  onAddLink: (sectionId: string) => void;
  onEditLink: (link: Link) => void;
  onDeleteLink: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onRenameSection: (id: string, name: string) => Promise<void>;
}

export default function SectionBlock({
  section,
  links,
  editMode,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onDeleteSection,
  onRenameSection,
}: SectionBlockProps) {
  const [name, setName] = useState(section.name);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    setName(section.name);
  }, [section.name]);

  const commitRename = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(section.name);
      return;
    }
    if (trimmed === section.name) return;

    setSavingName(true);
    try {
      await onRenameSection(section.id, trimmed);
    } catch {
      setName(section.name);
    } finally {
      setSavingName(false);
    }
  };

  return (
    <section className="animate-fade-in rounded-2xl border border-[var(--color-border-muted)] bg-[var(--color-surface-raised)]/50 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        {editMode ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => void commitRename()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
              if (e.key === "Escape") {
                setName(section.name);
                e.currentTarget.blur();
              }
            }}
            disabled={savingName}
            className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-base font-semibold tracking-tight outline-none transition-colors focus:border-[var(--color-accent)] sm:text-lg"
            aria-label="Sectienaam"
          />
        ) : (
          <h2 className="min-w-0 flex-1 text-base font-semibold tracking-tight sm:text-lg">
            {section.name}
          </h2>
        )}
        <div className="flex shrink-0 items-center gap-2">
          {editMode && (
            <>
              <button
                type="button"
                onClick={() => onAddLink(section.id)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Link
              </button>
              <button
                type="button"
                onClick={() => onDeleteSection(section.id)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-danger)]/30 px-2.5 py-1 text-xs font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Sectie
              </button>
            </>
          )}
        </div>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] py-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Geen links in deze sectie
          </p>
          {editMode && (
            <button
              type="button"
              onClick={() => onAddLink(section.id)}
              className="mt-3 flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:underline"
            >
              <Plus className="h-4 w-4" />
              Eerste link toevoegen
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-2.5 md:grid-cols-6">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              editMode={editMode}
              onEdit={onEditLink}
              onDelete={onDeleteLink}
            />
          ))}
          {editMode && (
            <button
              type="button"
              onClick={() => onAddLink(section.id)}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[10px] font-medium">Toevoegen</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
