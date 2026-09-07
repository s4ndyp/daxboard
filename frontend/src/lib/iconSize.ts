export type IconSize = "small" | "medium" | "large" | "xlarge";

export const ICON_SIZE_STORAGE_KEY = "daxboard-icon-size";

export const ICON_SIZE_OPTIONS: Array<{ value: IconSize; label: string }> = [
  { value: "small", label: "Klein" },
  { value: "medium", label: "Normaal" },
  { value: "large", label: "Groot" },
  { value: "xlarge", label: "Extra groot" },
];

export const ICON_SIZE_SCALE: Record<IconSize, number> = {
  small: 0.5,
  medium: 0.65,
  large: 0.78,
  xlarge: 0.88,
};

export function isIconSize(value: string): value is IconSize {
  return value in ICON_SIZE_SCALE;
}

export function loadIconSize(): IconSize {
  try {
    const stored = localStorage.getItem(ICON_SIZE_STORAGE_KEY);
    if (stored && isIconSize(stored)) {
      return stored;
    }
  } catch {
    // ignore storage errors
  }
  return "medium";
}

export function saveIconSize(size: IconSize): void {
  try {
    localStorage.setItem(ICON_SIZE_STORAGE_KEY, size);
  } catch {
    // ignore storage errors
  }
}

export function getIconScale(size: IconSize): number {
  return ICON_SIZE_SCALE[size];
}
