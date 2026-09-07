import { useEffect, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import type { Link, LinkFormData, Section } from "../types";
import { normalizeUrl } from "../utils";

interface LinkModalProps {
  open: boolean;
  sections: Section[];
  link?: Link;
  defaultSectionId?: string;
  onClose: () => void;
  onSubmit: (data: LinkFormData) => Promise<void>;
}

const emptyForm: LinkFormData = {
  title: "",
  url: "",
  icon: "",
  section: "",
};

export default function LinkModal({
  open,
  sections,
  link,
  defaultSectionId,
  onClose,
  onSubmit,
}: LinkModalProps) {
  const isEditing = Boolean(link);
  const [form, setForm] = useState<LinkFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (link) {
        setForm({
          title: link.title,
          url: link.url,
          icon: link.icon ?? "",
          section: link.section,
        });
      } else {
        setForm({
          ...emptyForm,
          section: defaultSectionId || sections[0]?.id || "",
        });
      }
      setError("");
    }
  }, [open, link, defaultSectionId, sections]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim() || !form.section) {
      setError("Vul alle verplichte velden in.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        url: normalizeUrl(form.url),
        icon: form.icon.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Sluiten"
      />
      <div className="animate-fade-in relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Link bewerken" : "Link toevoegen"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
              Naam
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="bijv. Proxmox"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
              URL
            </label>
            <input
              type="text"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://server.local"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
              Sectie
            </label>
            <select
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
              Icoon <span className="text-xs">(emoji of URL, optioneel)</span>
            </label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="🖥️"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-surface)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                {loading ? "Opslaan..." : "Opslaan"}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {loading ? "Opslaan..." : "Toevoegen"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
