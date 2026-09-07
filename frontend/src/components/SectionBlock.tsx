import { Plus, Trash2 } from "lucide-react";
import type { Link, Section } from "../types";
import LinkCard from "./LinkCard";

interface SectionBlockProps {
  section: Section;
  links: Link[];
  editMode: boolean;
  onAddLink: (sectionId: string) => void;
  onDeleteLink: (id: string) => void;
  onDeleteSection: (id: string) => void;
}

export default function SectionBlock({
  section,
  links,
  editMode,
  onAddLink,
  onDeleteLink,
  onDeleteSection,
}: SectionBlockProps) {
  return (
    <section className="animate-fade-in rounded-2xl border border-[var(--color-border-muted)] bg-[var(--color-surface-raised)]/50 p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
          {section.name}
        </h2>
        <div className="flex items-center gap-2">
          {editMode && (
            <>
              <button
                type="button"
                onClick={() => onAddLink(section.id)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Link
              </button>
              <button
                type="button"
                onClick={() => onDeleteSection(section.id)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-danger)]/30 px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Sectie
              </button>
            </>
          )}
        </div>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] py-10 text-center">
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              editMode={editMode}
              onDelete={onDeleteLink}
            />
          ))}
          {editMode && (
            <button
              type="button"
              onClick={() => onAddLink(section.id)}
              className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
            >
              <Plus className="h-6 w-6" />
              <span className="text-xs font-medium">Toevoegen</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
