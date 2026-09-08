import { useEffect, useRef, useState } from "react";
import {
  linkHealth,
  type LinkHealthStatus,
} from "../lib/linkHealth";

export function useLinkStatus(url: string): LinkHealthStatus {
  const [status, setStatus] = useState<LinkHealthStatus>("unknown");

  useEffect(() => linkHealth.subscribe(url, setStatus), [url]);

  return status;
}

export function useLinkHealthBatch(urls: string[], enabled: boolean): void {
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!enabled || urls.length === 0 || hasCheckedRef.current) return;

    hasCheckedRef.current = true;
    linkHealth.checkMany(urls);
  }, [urls, enabled]);
}
