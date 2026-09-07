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
}

export default function SectionBlock({
  section,
  links,
  editMode,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onDeleteSection,
}: SectionBlockProps) {
  return (
    <section className="animate-fade-in rounded-2xl border border-[var(--color-border-muted)] bg-[var(--color-surface-raised)]/50 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">
          {section.name}
        </h2>
        <div className="flex items-center gap-2">
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
