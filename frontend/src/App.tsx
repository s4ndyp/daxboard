import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  LayoutDashboard,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Server,
  X,
} from "lucide-react";
import AddSectionGhost from "./components/AddSectionGhost";
import LinkModal from "./components/LinkModal";
import AddSectionModal from "./components/AddSectionModal";
import SectionBlock from "./components/SectionBlock";
import { useLinkHealthBatch } from "./hooks/useLinkStatus";
import pb from "./lib/pocketbase";
import {
  getIconScale,
  ICON_SIZE_OPTIONS,
  loadIconSize,
  saveIconSize,
  type IconSize,
} from "./lib/iconSize";
import type { Link, LinkFormData, Section, SectionFormData } from "./types";
import { exportLinksToCsv } from "./utils";

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
  const [iconSize, setIconSize] = useState<IconSize>(() => loadIconSize());
  const [searchQuery, setSearchQuery] = useState("");

  const iconScale = getIconScale(iconSize);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;

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

  const filteredLinksBySection = useMemo(() => {
    const map = new Map<string, Link[]>();
    for (const section of sections) {
      const sectionLinks = linksBySection.get(section.id) ?? [];
      if (!isSearching) {
        map.set(section.id, sectionLinks);
        continue;
      }
      map.set(
        section.id,
        sectionLinks.filter((link) =>
          link.title.toLowerCase().includes(normalizedSearch)
        )
      );
    }
    return map;
  }, [sections, linksBySection, isSearching, normalizedSearch]);

  const visibleSections = useMemo(() => {
    if (!isSearching) return sections;
    return sections.filter(
      (section) => (filteredLinksBySection.get(section.id)?.length ?? 0) > 0
    );
  }, [sections, filteredLinksBySection, isSearching]);

  const linkUrls = useMemo(
    () => [...new Set(links.map((link) => link.url.trim()).filter(Boolean))],
    [links]
  );

  useLinkHealthBatch(linkUrls, !loading && linkUrls.length > 0);

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

  const handleRenameSection = async (id: string, name: string) => {
    await pb.collection("sections").update(id, { name });
    await fetchData();
  };

  const handleUpdateSectionColor = async (id: string, color: string) => {
    await pb.collection("sections").update(id, { color });
    await fetchData();
  };

  const handleExportCsv = () => {
    exportLinksToCsv(links, sections);
  };

  const handleIconSizeChange = (value: IconSize) => {
    setIconSize(value);
    saveIconSize(value);
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
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
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
                onClick={handleExportCsv}
                disabled={loading || links.length === 0}
                className="rounded-xl border border-[var(--color-border)] p-2.5 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Exporteer links naar CSV"
                title="Exporteer naar CSV"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => fetchData()}
                className="rounded-xl border border-[var(--color-border)] p-2.5 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-text)]"
                aria-label="Vernieuwen"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              {editMode && (
                <select
                  value={iconSize}
                  onChange={(e) =>
                    handleIconSizeChange(e.target.value as IconSize)
                  }
                  className="max-w-[6.5rem] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2.5 text-xs text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)] sm:max-w-none sm:px-3 sm:text-sm"
                  aria-label="Icoongrootte"
                  title="Icoongrootte"
                >
                  {ICON_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className={`flex min-w-[7.5rem] items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  editMode
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-text)]"
                }`}
              >
                <Pencil className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">
                  {editMode ? "Klaar" : "Bewerken"}
                </span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek op titel..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
              aria-label="Zoek links op titel"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text)]"
                aria-label="Zoekopdracht wissen"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
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
        ) : sections.length === 0 && !editMode ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] py-20 text-center">
            <LayoutDashboard className="mb-4 h-12 w-12 text-[var(--color-text-muted)]" />
            <h2 className="text-lg font-semibold">Nog geen secties</h2>
            <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">
              Schakel bewerkmodus in om je eerste sectie toe te voegen.
            </p>
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-surface)] transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              <Pencil className="h-4 w-4" />
              Bewerken
            </button>
          </div>
        ) : isSearching && visibleSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] py-16 text-center">
            <Search className="mb-3 h-10 w-10 text-[var(--color-text-muted)]" />
            <h2 className="text-lg font-semibold">Geen resultaten</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Geen links gevonden voor &quot;{searchQuery.trim()}&quot;
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
            {visibleSections.map((section) => (
              <SectionBlock
                key={section.id}
                section={section}
                links={filteredLinksBySection.get(section.id) ?? []}
                editMode={editMode}
                iconScale={iconScale}
                showAddLink={!isSearching}
                onAddLink={openAddLink}
                onEditLink={openEditLink}
                onDeleteLink={handleDeleteLink}
                onDeleteSection={handleDeleteSection}
                onRenameSection={handleRenameSection}
                onUpdateSectionColor={handleUpdateSectionColor}
              />
            ))}
            {editMode && (
              <AddSectionGhost onClick={() => setShowAddSection(true)} />
            )}
          </div>
        )}
      </main>

      {sections.length > 0 && (
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
