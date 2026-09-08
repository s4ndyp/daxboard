export type LinkHealthStatus = "unknown" | "checking" | "online" | "offline";

type Listener = (status: LinkHealthStatus) => void;

interface CacheEntry {
  status: "online" | "offline";
  expiresAt: number;
}

const CACHE_TTL_MS = 60_000;
const CHECK_TIMEOUT_MS = 4_000;
const MAX_CONCURRENT = 6;

function normalizeUrl(url: string): string {
  return url.trim();
}

async function probeUrl(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    await fetch(url, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

class LinkHealthService {
  private cache = new Map<string, CacheEntry>();
  private listeners = new Map<string, Set<Listener>>();
  private inFlight = new Map<string, Promise<void>>();
  private queue: string[] = [];
  private queued = new Set<string>();
  private running = 0;

  subscribe(url: string, listener: Listener): () => void {
    const key = normalizeUrl(url);
    if (!key) {
      listener("unknown");
      return () => {};
    }

    let listeners = this.listeners.get(key);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(key, listeners);
    }
    listeners.add(listener);
    listener(this.getStatus(key));

    return () => {
      listeners?.delete(listener);
      if (listeners?.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  requestCheck(url: string, priority: "high" | "low" = "low"): void {
    const key = normalizeUrl(url);
    if (!key) return;

    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      this.notify(key, cached.status);
      return;
    }

    if (this.inFlight.has(key)) {
      this.notify(key, "checking");
      return;
    }

    if (this.queued.has(key)) {
      if (priority === "high") {
        this.queue = this.queue.filter((item) => item !== key);
        this.queue.unshift(key);
      }
      return;
    }

    this.queued.add(key);
    if (priority === "high") {
      this.queue.unshift(key);
    } else {
      this.queue.push(key);
    }

    this.notify(key, "checking");
    this.pump();
  }

  checkMany(urls: string[], priority: "high" | "low" = "low"): void {
    const unique = [...new Set(urls.map(normalizeUrl).filter(Boolean))];
    for (const url of unique) {
      this.requestCheck(url, priority);
    }
  }

  invalidate(url?: string): void {
    if (url) {
      this.cache.delete(normalizeUrl(url));
      return;
    }
    this.cache.clear();
  }

  private getStatus(key: string): LinkHealthStatus {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.status;
    }
    if (this.inFlight.has(key) || this.queued.has(key)) {
      return "checking";
    }
    return "unknown";
  }

  private notify(key: string, status: LinkHealthStatus): void {
    this.listeners.get(key)?.forEach((listener) => listener(status));
  }

  private pump(): void {
    while (this.running < MAX_CONCURRENT && this.queue.length > 0) {
      const key = this.queue.shift();
      if (!key) break;

      this.queued.delete(key);

      const cached = this.cache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        this.notify(key, cached.status);
        continue;
      }

      if (this.inFlight.has(key)) {
        continue;
      }

      this.running += 1;
      const task = this.runCheck(key).finally(() => {
        this.running -= 1;
        this.inFlight.delete(key);
        this.pump();
      });
      this.inFlight.set(key, task);
    }
  }

  private async runCheck(key: string): Promise<void> {
    this.notify(key, "checking");
    const online = await probeUrl(key);
    const status: "online" | "offline" = online ? "online" : "offline";

    this.cache.set(key, {
      status,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    this.notify(key, status);
  }
}

export const linkHealth = new LinkHealthService();
