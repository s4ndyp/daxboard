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
