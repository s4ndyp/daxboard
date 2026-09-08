import { useEffect, useState } from "react";
import {
  linkHealth,
  type LinkHealthStatus,
} from "../lib/linkHealth";

export function useLinkStatus(url: string, visible: boolean): LinkHealthStatus {
  const [status, setStatus] = useState<LinkHealthStatus>("unknown");

  useEffect(() => {
    return linkHealth.subscribe(url, setStatus);
  }, [url]);

  useEffect(() => {
    if (visible) {
      linkHealth.requestCheck(url, "high");
    }
  }, [url, visible]);

  return status;
}

export function useLinkHealthBatch(urls: string[], enabled: boolean): void {
  useEffect(() => {
    if (!enabled || urls.length === 0) return;

    linkHealth.checkMany(urls, "low");

    const interval = window.setInterval(() => {
      linkHealth.invalidate();
      linkHealth.checkMany(urls, "low");
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [urls, enabled]);
}
