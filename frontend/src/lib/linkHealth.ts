export type LinkHealthStatus = "unknown" | "checking" | "online" | "offline";

type Listener = (status: LinkHealthStatus) => void;

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
  private cache = new Map<string, "online" | "offline">();
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

  checkMany(urls: string[]): void {
    const unique = [...new Set(urls.map(normalizeUrl).filter(Boolean))];
    for (const url of unique) {
      this.requestCheck(url);
    }
  }

  private requestCheck(key: string): void {
    if (!key) return;

    if (this.cache.has(key)) {
      this.notify(key, this.cache.get(key)!);
      return;
    }

    if (this.inFlight.has(key)) {
      this.notify(key, "checking");
      return;
    }

    if (this.queued.has(key)) {
      return;
    }

    this.queued.add(key);
    this.queue.push(key);
    this.notify(key, "checking");
    this.pump();
  }

  private getStatus(key: string): LinkHealthStatus {
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
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

      if (this.cache.has(key)) {
        this.notify(key, this.cache.get(key)!);
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

    this.cache.set(key, status);
    this.notify(key, status);
  }
}

export const linkHealth = new LinkHealthService();
