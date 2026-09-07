import { getFaviconUrl, getInitial, isEmoji } from "../utils";

interface LinkIconProps {
  title: string;
  url: string;
  icon?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-10 w-10 text-lg",
  md: "h-14 w-14 text-2xl",
  lg: "h-16 w-16 text-3xl",
};

export default function LinkIcon({
  title,
  url,
  icon,
  size = "md",
}: LinkIconProps) {
  const className = `${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-overlay)] ring-1 ring-[var(--color-border-muted)] overflow-hidden`;

  if (icon && isEmoji(icon)) {
    return <div className={className}>{icon}</div>;
  }

  if (icon && (icon.startsWith("http://") || icon.startsWith("https://"))) {
    return (
      <div className={className}>
        <img src={icon} alt="" className="h-full w-full object-cover" />
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
