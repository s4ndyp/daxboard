import { useEffect, useState } from "react";
import { Palette, Trash2, X } from "lucide-react";
import type { Link, Section } from "../types";
import { getSectionStyles, isValidHexColor } from "../utils";
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
  onUpdateSectionColor: (id: string, color: string) => Promise<void>;
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
  onUpdateSectionColor,
}: SectionBlockProps) {
  const [name, setName] = useState(section.name);
  const [savingName, setSavingName] = useState(false);
  const [savingColor, setSavingColor] = useState(false);

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

  const handleColorChange = async (value: string) => {
    if (!isValidHexColor(value)) return;
    if (value === section.color) return;

    setSavingColor(true);
    try {
      await onUpdateSectionColor(section.id, value);
    } finally {
      setSavingColor(false);
    }
  };

  const handleClearColor = async () => {
    if (!section.color) return;

    setSavingColor(true);
    try {
      await onUpdateSectionColor(section.id, "");
    } finally {
      setSavingColor(false);
    }
  };

  const sectionStyles = getSectionStyles(section.color);

  return (
    <section
      className="animate-fade-in rounded-2xl border border-[var(--color-border-muted)] bg-[var(--color-surface-raised)]/50 p-4 sm:p-5"
      style={sectionStyles}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
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

          {editMode && (
            <div className="flex shrink-0 items-center gap-1">
              <label
                className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                title="Sectiekleur kiezen"
              >
                <Palette className="pointer-events-none h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                <input
                  type="color"
                  value={section.color || "#58a6ff"}
                  disabled={savingColor}
                  onChange={(e) => void handleColorChange(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Sectiekleur kiezen"
                />
              </label>
              {section.color && (
                <button
                  type="button"
                  onClick={() => void handleClearColor()}
                  disabled={savingColor}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-danger)]/40 hover:text-[var(--color-danger)]"
                  title="Kleur verwijderen"
                  aria-label="Kleur verwijderen"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {editMode && (
          <button
            type="button"
            onClick={() => onDeleteSection(section.id)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--color-danger)]/30 px-2.5 py-1 text-xs font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Sectie
          </button>
        )}
      </div>

      {links.length === 0 ? (
        editMode ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-2.5 md:grid-cols-6">
            <button
              type="button"
              onClick={() => onAddLink(section.id)}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
            >
              <span className="text-2xl leading-none">+</span>
              <span className="text-[10px] font-medium">Toevoegen</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] py-8 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Geen links in deze sectie
            </p>
          </div>
        )
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
              <span className="text-2xl leading-none">+</span>
              <span className="text-[10px] font-medium">Toevoegen</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
