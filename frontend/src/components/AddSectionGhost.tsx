import { Plus } from "lucide-react";

interface AddSectionGhostProps {
  onClick: () => void;
}

export default function AddSectionGhost({ onClick }: AddSectionGhostProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="animate-fade-in flex min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-raised)]/20 p-6 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-raised)]/40 hover:text-[var(--color-accent)]"
      aria-label="Nieuwe sectie toevoegen"
    >
      <Plus className="h-12 w-12 stroke-[1.5]" />
      <span className="mt-3 text-sm font-medium">Nieuwe sectie</span>
    </button>
  );
}
