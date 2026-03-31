import { useState, useEffect, useCallback } from "react";
import type { DeployData, StackHistory } from "../lib/types.ts";
import { fetchStackList, fetchStackHistory, fetchGHRuns } from "./fetchers.ts";
import { readCache, writeCache } from "./cache.ts";

export function useDeployData() {
  const [data, setData] = useState<DeployData>(() => {
    // Try loading from cache on first render for instant display
    const cached = readCache();
    if (cached) {
      return {
        stacks: cached.stacks,
        history: cached.history,
        ghRuns: cached.ghRuns,
        loading: true, // Still loading fresh data
        lastRefresh: new Date(Date.now() - cached.age),
        error: null,
        fromCache: true,
      };
    }
    return {
      stacks: [],
      history: new Map(),
      ghRuns: [],
      loading: true,
      lastRefresh: null,
      error: null,
      fromCache: false,
    };
  });

  const refresh = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [stacks, ghRuns] = await Promise.all([
        fetchStackList(),
        fetchGHRuns(),
      ]);

      const historyEntries = await Promise.all(
        stacks
          .filter((s) => s.lastUpdate !== "n/a")
          .map(async (s) => {
            const entries = await fetchStackHistory(s.name, 1);
            return [s.name, entries[0] ?? null] as const;
          })
      );

      const history = new Map<string, StackHistory>();
      for (const [name, h] of historyEntries) {
        if (h) history.set(name, h);
      }

      // Write to disk cache
      writeCache(stacks, history, ghRuns);

      setData({
        stacks,
        history,
        ghRuns,
        loading: false,
        lastRefresh: new Date(),
        error: null,
        fromCache: false,
      });
    } catch (e) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: e instanceof Error ? e.message : "Unknown error",
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, refresh };
}
