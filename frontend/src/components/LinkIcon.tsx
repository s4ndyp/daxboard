import { getFaviconUrl, getInitial, isEmoji, isImageUrl } from "../utils";

interface LinkIconProps {
  title: string;
  url: string;
  icon?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeClasses = {
  xs: "h-7 w-7 text-sm",
  sm: "h-9 w-9 text-base",
  md: "h-11 w-11 text-xl",
  lg: "h-14 w-14 text-2xl",
};

export default function LinkIcon({
  title,
  url,
  icon,
  size = "sm",
}: LinkIconProps) {
  const className = `${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-overlay)] ring-1 ring-[var(--color-border-muted)] overflow-hidden aspect-square`;

  if (icon && isEmoji(icon)) {
    return <div className={className}>{icon}</div>;
  }

  if (icon && isImageUrl(icon)) {
    return (
      <div className={className}>
        <img
          src={icon}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="font-semibold text-[var(--color-accent)]">${getInitial(title)}</span>`;
            }
          }}
        />
      </div>
    );
  }

  const favicon = getFaviconUrl(url);
  if (favicon) {
    return (
      <div className={className}>
        <img
          src={favicon}
          alt=""
          className="h-2/3 w-2/3 object-contain"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="font-semibold text-[var(--color-accent)]">${getInitial(title)}</span>`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${className} font-semibold text-[var(--color-accent)]`}>
      {getInitial(title)}
    </div>
  );
}
