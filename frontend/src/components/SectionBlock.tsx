import { useEffect, useState } from "react";
import { Palette, Trash2, X } from "lucide-react";
import type { Link, Section } from "../types";
import { getSectionStyles, isValidHexColor } from "../utils";
import LinkCard from "./LinkCard";

interface SectionBlockProps {
  section: Section;
  links: Link[];
  editMode: boolean;
  iconScale: number;
  showAddLink: boolean;
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
  iconScale,
  showAddLink,
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

  const addLinkTile = showAddLink ? (
    <button
      type="button"
      onClick={() => onAddLink(section.id)}
      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
      aria-label="Link toevoegen"
    >
      <span className="text-2xl leading-none">+</span>
      <span className="text-[10px] font-medium">Toevoegen</span>
    </button>
  ) : null;

  return (
    <div className="animate-fade-in flex flex-col">
      <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
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
              className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-sm font-semibold tracking-tight outline-none transition-colors focus:border-[var(--color-accent)] sm:text-base"
              aria-label="Sectienaam"
            />
          ) : (
            <h2 className="min-w-0 flex-1 text-sm font-semibold tracking-tight sm:text-base">
              {section.name}
            </h2>
          )}

          {editMode && (
            <div className="flex shrink-0 items-center gap-1">
              <label
                className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                title="Sectiekleur kiezen"
              >
                <Palette className="pointer-events-none h-3 w-3 text-[var(--color-text-muted)]" />
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
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-danger)]/40 hover:text-[var(--color-danger)]"
                  title="Kleur verwijderen"
                  aria-label="Kleur verwijderen"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {editMode && (
          <button
            type="button"
            onClick={() => onDeleteSection(section.id)}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--color-danger)]/30 px-2 py-0.5 text-xs font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/10"
          >
            <Trash2 className="h-3 w-3" />
            Sectie
          </button>
        )}
      </div>

      <section
        className="rounded-xl border border-[var(--color-border-muted)] bg-[var(--color-surface-raised)]/50 p-2 sm:p-2.5"
        style={sectionStyles}
      >
        {links.length === 0 && !showAddLink ? (
          <div className="py-6 text-center text-sm text-[var(--color-text-muted)]">
            Geen resultaten
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2 md:grid-cols-6">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                editMode={editMode}
                iconScale={iconScale}
                onEdit={onEditLink}
                onDelete={onDeleteLink}
              />
            ))}
            {addLinkTile}
          </div>
        )}
      </section>
    </div>
  );
}
