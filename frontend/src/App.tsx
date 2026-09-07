import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Server,
} from "lucide-react";
import LinkModal from "./components/LinkModal";
import AddSectionModal from "./components/AddSectionModal";
import SectionBlock from "./components/SectionBlock";
import pb from "./lib/pocketbase";
import type { Link, LinkFormData, Section, SectionFormData } from "./types";

export default function App() {
  const [sections, setSections] = useState<Section[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>();
  const [editingLink, setEditingLink] = useState<Link>();

  const fetchData = useCallback(async () => {
    setError("");
    try {
      const [sectionsResult, linksResult] = await Promise.all([
        pb.collection("sections").getFullList<Section>({
          sort: "sort_order,name",
        }),
        pb.collection("links").getFullList<Link>({
          sort: "sort_order,title",
          expand: "section",
        }),
      ]);
      setSections(sectionsResult);
      setLinks(linksResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kon gegevens niet laden. Is PocketBase actief?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const linksBySection = useMemo(() => {
    const map = new Map<string, Link[]>();
    for (const section of sections) {
      map.set(section.id, []);
    }
    for (const link of links) {
      const list = map.get(link.section);
      if (list) {
        list.push(link);
      }
    }
    return map;
  }, [sections, links]);

  const handleSaveLink = async (data: LinkFormData) => {
    if (editingLink) {
      await pb.collection("links").update(editingLink.id, {
        title: data.title,
        url: data.url,
        icon: data.icon,
        section: data.section,
      });
    } else {
      const sectionLinks = links.filter((l) => l.section === data.section);
      const maxOrder = sectionLinks.reduce(
        (max, l) => Math.max(max, l.sort_order ?? 0),
        0
      );

      await pb.collection("links").create({
        title: data.title,
        url: data.url,
        icon: data.icon,
        section: data.section,
        sort_order: maxOrder + 1,
      });
    }

    await fetchData();
  };

  const handleAddSection = async (data: SectionFormData) => {
    const maxOrder = sections.reduce(
      (max, s) => Math.max(max, s.sort_order ?? 0),
      0
    );

    await pb.collection("sections").create({
      name: data.name,
      sort_order: maxOrder + 1,
    });

    await fetchData();
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze link wilt verwijderen?")) return;
    await pb.collection("links").delete(id);
    await fetchData();
  };

  const handleDeleteSection = async (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (
      !confirm(
        `Weet je zeker dat je sectie "${section?.name}" wilt verwijderen? Alle links in deze sectie worden ook verwijderd.`
      )
    ) {
      return;
    }
    await pb.collection("sections").delete(id);
    await fetchData();
  };

  const openAddLink = (sectionId?: string) => {
    setEditingLink(undefined);
    setActiveSectionId(sectionId);
    setShowLinkModal(true);
  };

  const openEditLink = (link: Link) => {
    setEditingLink(link);
    setActiveSectionId(link.section);
    setShowLinkModal(true);
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setEditingLink(undefined);
  };

  return (
    <div className="min-h-dvh bg-[var(--color-surface)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border-muted)] bg-[var(--color-surface)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 ring-1 ring-[var(--color-accent)]/25">
              <LayoutDashboard className="h-5 w-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                DaxBoard
              </h1>
              <p className="hidden text-xs text-[var(--color-text-muted)] sm:block">
                Homelab LAN Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchData()}
              className="rounded-xl border border-[var(--color-border)] p-2.5 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-text)]"
              aria-label="Vernieuwen"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                editMode
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-text)]"
              }`}
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">
                {editMode ? "Klaar" : "Bewerken"}
              </span>
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => setShowAddSection(true)}
                className="hidden items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)] sm:flex"
              >
                <Plus className="h-4 w-4" />
                Sectie
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--color-text-muted)]">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[var(--color-accent)]" />
            <p className="text-sm">Dashboard laden...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-6 text-center">
            <Server className="mx-auto mb-3 h-8 w-8 text-[var(--color-danger)]" />
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              className="mt-4 rounded-xl bg-[var(--color-surface-overlay)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-border-muted)]"
            >
              Opnieuw proberen
            </button>
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] py-20 text-center">
            <LayoutDashboard className="mb-4 h-12 w-12 text-[var(--color-text-muted)]" />
            <h2 className="text-lg font-semibold">Nog geen secties</h2>
            <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">
              Voeg een sectie toe om je homelab servers te organiseren.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditMode(true);
                setShowAddSection(true);
              }}
              className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-surface)] transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              <Plus className="h-4 w-4" />
              Eerste sectie toevoegen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {sections.map((section) => (
              <SectionBlock
                key={section.id}
                section={section}
                links={linksBySection.get(section.id) ?? []}
                editMode={editMode}
                onAddLink={openAddLink}
                onEditLink={openEditLink}
                onDeleteLink={handleDeleteLink}
                onDeleteSection={handleDeleteSection}
              />
            ))}
          </div>
        )}
      </main>

      {editMode && sections.length > 0 && (
        <button
          type="button"
          onClick={() => openAddLink()}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-surface)] shadow-lg shadow-[var(--color-accent)]/25 transition-transform hover:scale-105 active:scale-95 sm:hidden"
          aria-label="Link toevoegen"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <LinkModal
        open={showLinkModal}
        sections={sections}
        link={editingLink}
        defaultSectionId={activeSectionId}
        onClose={closeLinkModal}
        onSubmit={handleSaveLink}
      />

      <AddSectionModal
        open={showAddSection}
        onClose={() => setShowAddSection(false)}
        onSubmit={handleAddSection}
      />
    </div>
  );
}
