export function getFaviconUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return "";
  }
}

export function getInitial(title: string): string {
  return title.trim().charAt(0).toUpperCase() || "?";
}

export function isEmoji(str: string): boolean {
  if (!str) return false;
  const emojiRegex =
    /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*$/u;
  return emojiRegex.test(str.trim());
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Extract icon URL from plain URL, emoji, or pasted `<img src="...">` HTML. */
export function parseIconInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const imgTagMatch = trimmed.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  if (imgTagMatch) {
    return imgTagMatch[1].trim();
  }

  const srcMatch = trimmed.match(/\bsrc=["']([^"']+)["']/i);
  if (srcMatch && /<img\b/i.test(trimmed)) {
    return srcMatch[1].trim();
  }

  return trimmed;
}

export function isImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getSectionStyles(
  color?: string
): { backgroundColor: string; borderColor: string } | undefined {
  if (!color || !isValidHexColor(color)) return undefined;
  return {
    backgroundColor: hexToRgba(color, 0.1),
    borderColor: hexToRgba(color, 0.28),
  };
}

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportLinksToCsv(
  links: Array<{ title: string; url: string; icon?: string; section: string }>,
  sections: Array<{ id: string; name: string }>
): void {
  const sectionNames = new Map(sections.map((section) => [section.id, section.name]));
  const headers = ["sectie", "icoon", "url"];
  const rows = links.map((link) => [
    sectionNames.get(link.section) ?? "",
    link.icon ?? "",
    link.url,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `daxboard-links-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
