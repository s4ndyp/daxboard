import type { ReactNode } from "react";
import { getFaviconUrl, getInitial, isEmoji, isImageUrl } from "../utils";

interface LinkIconProps {
  title: string;
  url: string;
  icon?: string;
  size?: "xs" | "sm" | "md" | "lg";
  fill?: boolean;
  scale?: number;
}

const sizeClasses = {
  xs: "h-7 w-7 text-sm",
  sm: "h-9 w-9 text-base",
  md: "h-11 w-11 text-xl",
  lg: "h-14 w-14 text-2xl",
};

const fillTextScale: Record<number, string> = {
  0.5: "text-base",
  0.65: "text-lg",
  0.78: "text-xl",
  0.88: "text-2xl",
};

function getFillTextClass(scale: number): string {
  const entries = Object.entries(fillTextScale).sort(
    (a, b) => Math.abs(Number(a[0]) - scale) - Math.abs(Number(b[0]) - scale)
  );
  return entries[0]?.[1] ?? "text-lg";
}

export default function LinkIcon({
  title,
  url,
  icon,
  size = "sm",
  fill = false,
  scale = 0.65,
}: LinkIconProps) {
  const clampedScale = Math.min(Math.max(scale, 0.4), 0.95);

  const fixedClassName = `${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-overlay)] ring-1 ring-[var(--color-border-muted)] overflow-hidden aspect-square`;

  const renderFillContent = (content: ReactNode) => (
    <div className="flex h-full w-full items-center justify-center p-0.5">
      <div
        className="flex aspect-square max-h-full max-w-full items-center justify-center overflow-hidden rounded-md"
        style={{
          width: `${clampedScale * 100}%`,
          height: `${clampedScale * 100}%`,
        }}
      >
        {content}
      </div>
    </div>
  );

  if (icon && isEmoji(icon)) {
    if (fill) {
      return renderFillContent(
        <span className={`${getFillTextClass(clampedScale)} leading-none`}>
          {icon}
        </span>
      );
    }
    return <div className={fixedClassName}>{icon}</div>;
  }

  if (icon && isImageUrl(icon)) {
    const image = (
      <img
        src={icon}
        alt=""
        className="h-full w-full object-contain"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<span class="font-semibold text-[var(--color-accent)]">${getInitial(title)}</span>`;
          }
        }}
      />
    );

    if (fill) {
      return renderFillContent(image);
    }

    return <div className={fixedClassName}>{image}</div>;
  }

  const favicon = getFaviconUrl(url);
  if (favicon) {
    const image = (
      <img
        src={favicon}
        alt=""
        className="h-full w-full object-contain"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<span class="font-semibold text-[var(--color-accent)]">${getInitial(title)}</span>`;
          }
        }}
      />
    );

    if (fill) {
      return renderFillContent(image);
    }

    return <div className={fixedClassName}>{image}</div>;
  }

  const initial = (
    <span
      className={`font-semibold text-[var(--color-accent)] ${fill ? getFillTextClass(clampedScale) : ""}`}
    >
      {getInitial(title)}
    </span>
  );

  if (fill) {
    return renderFillContent(initial);
  }

  return <div className={fixedClassName}>{initial}</div>;
}
