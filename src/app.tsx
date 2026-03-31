import { useState, useMemo } from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import { C } from "./lib/colors.ts";
import { sortStacks } from "./lib/helpers.ts";
import type { TabName, SortMode } from "./lib/types.ts";
import { useDeployData } from "./data/use-deploy-data.ts";
import { Header } from "./components/header.tsx";
import { StatusBar } from "./components/status-bar.tsx";
import { StacksView } from "./components/stacks-view.tsx";
import { DeploysView } from "./components/deploys-view.tsx";
import { ActivityView } from "./components/activity-view.tsx";
import { StackHistoryView } from "./components/stack-history-view.tsx";
import { FilterBar } from "./components/filter-bar.tsx";

const TABS: TabName[] = ["stacks", "deploys", "activity"];

export function App() {
  const renderer = useRenderer();
  const { data, refresh } = useDeployData();
  const [activeTab, setActiveTab] = useState<TabName>("stacks");
  const [selectedIdx, setSelectedIdx] = useState(0);
  // Sub-view: when user presses Enter on a stack, show full history
  const [expandedStack, setExpandedStack] = useState<string | null>(null);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [inspecting, setInspecting] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<import("./lib/types.ts").StackHistory[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const SORT_MODES: SortMode[] = ["name", "recent"];
  const [filterActive, setFilterActive] = useState(false);
  const [filterText, setFilterText] = useState("");

  const sorted = useMemo(() => {
    const s = sortStacks(data.stacks, sortMode, data.history);
    if (!filterText) return s;
    const q = filterText.toLowerCase();
    return s.filter((stack) => {
      const h = data.history.get(stack.name);
      return (
        stack.name.toLowerCase().includes(q) ||
        h?.branch.toLowerCase().includes(q) ||
        h?.author.toLowerCase().includes(q) ||
        h?.message.toLowerCase().includes(q)
      );
    });
  }, [data.stacks, sortMode, data.history, filterText]);

  const maxItems = useMemo(() => {
    if (activeTab === "stacks") return sorted.length;
    if (activeTab === "deploys") return data.ghRuns.length;
    return [...data.history.values()].length;
  }, [activeTab, data, sorted]);

  useKeyboard((key) => {
    // Quit (but not while filtering)
    if (!filterActive && (key.name === "q" || (key.ctrl && key.name === "c"))) {
      renderer.destroy();
      return;
    }
    if (filterActive && (key.ctrl && key.name === "c")) {
      renderer.destroy();
      return;
    }

    // Filter mode
    if (filterActive) {
      if (key.name === "escape") {
        setFilterActive(false);
        setFilterText("");
        setSelectedIdx(0);
        return;
      }
      if (key.name === "enter" || key.name === "return") {
        setFilterActive(false);
        setSelectedIdx(0);
        return;
      }
      // Let the input component handle all other keys
      return;
    }

    // Activate filter
    if (key.name === "/" && !expandedStack) {
      setFilterActive(true);
      setSelectedIdx(0);
      return;
    }

    // If we're in expanded history view
    if (expandedStack) {
      if (key.name === "escape" || key.name === "backspace") {
        if (inspecting) {
          setInspecting(false);
        } else {
          setExpandedStack(null);
          setHistoryIdx(0);
          setInspecting(false);
        }
        return;
      }
      if (key.name === "j" || key.name === "down") {
        setHistoryIdx((i) => i + 1); // clamped in view
        return;
      }
      if (key.name === "k" || key.name === "up") {
        setHistoryIdx((i) => Math.max(0, i - 1));
        return;
      }
      if (key.name === "enter" || key.name === "return" || key.name === "i") {
        setInspecting((v) => !v);
        return;
      }
      // Open in Pulumi Cloud
      if (key.name === "p") {
        const stack = data.stacks.find((s) => s.name === expandedStack);
        const entry = historyEntries[historyIdx];
        if (stack?.url && entry) {
          Bun.spawn(["open", `${stack.url}/updates/${entry.version}`], { stdout: "ignore", stderr: "ignore" });
        } else if (stack?.url) {
          Bun.spawn(["open", stack.url], { stdout: "ignore", stderr: "ignore" });
        }
        return;
      }
      // Open in GitHub Actions
      if (key.name === "g") {
        const entry = historyEntries[historyIdx];
        if (entry?.ghRunUrl) {
          Bun.spawn(["open", entry.ghRunUrl], { stdout: "ignore", stderr: "ignore" });
        }
        return;
      }
      if (key.name === "r") {
        refresh();
        return;
      }
      return;
    }

    // Refresh
    if (key.name === "r") {
      refresh();
      return;
    }

    // Tab navigation
    if (key.name === "tab" || key.name === "right") {
      const idx = TABS.indexOf(activeTab);
      setActiveTab(TABS[(idx + 1) % TABS.length]!);
      setSelectedIdx(0);
      return;
    }
    if ((key.shift && key.name === "tab") || key.name === "left") {
      const idx = TABS.indexOf(activeTab);
      setActiveTab(TABS[(idx - 1 + TABS.length) % TABS.length]!);
      setSelectedIdx(0);
      return;
    }

    // Vim navigation
    if (key.name === "j" || key.name === "down") {
      setSelectedIdx((i) => Math.min(maxItems - 1, i + 1));
      return;
    }
    if (key.name === "k" || key.name === "up") {
      setSelectedIdx((i) => Math.max(0, i - 1));
      return;
    }

    // Enter: expand stack history
    if (key.name === "enter" || key.name === "return") {
      if (activeTab === "stacks" && sorted[selectedIdx]) {
        setExpandedStack(sorted[selectedIdx].name);
        setHistoryIdx(0);
        setInspecting(false);
        return;
      }
      if (activeTab === "deploys" && data.ghRuns[selectedIdx]) {
        const url = data.ghRuns[selectedIdx].url;
        if (url) Bun.spawn(["open", url], { stdout: "ignore", stderr: "ignore" });
        return;
      }
    }

    // Open in Pulumi Cloud
    if (key.name === "p") {
      if (activeTab === "stacks") {
        const stack = sorted[selectedIdx];
        if (stack?.url) Bun.spawn(["open", stack.url], { stdout: "ignore", stderr: "ignore" });
      }
      return;
    }

    // Open in GitHub Actions
    if (key.name === "g") {
      if (activeTab === "stacks") {
        const name = sorted[selectedIdx]?.name;
        const h = name ? data.history.get(name) : undefined;
        if (h?.ghRunUrl) Bun.spawn(["open", h.ghRunUrl], { stdout: "ignore", stderr: "ignore" });
      } else if (activeTab === "deploys") {
        const url = data.ghRuns[selectedIdx]?.url;
        if (url) Bun.spawn(["open", url], { stdout: "ignore", stderr: "ignore" });
      }
      return;
    }

    // Toggle sort mode
    if (key.name === "s" && activeTab === "stacks") {
      setSortMode((m) => SORT_MODES[(SORT_MODES.indexOf(m) + 1) % SORT_MODES.length]!);
      setSelectedIdx(0);
      return;
    }

    // Number keys for tabs
    if (key.name === "1") { setActiveTab("stacks"); setSelectedIdx(0); }
    if (key.name === "2") { setActiveTab("deploys"); setSelectedIdx(0); }
    if (key.name === "3") { setActiveTab("activity"); setSelectedIdx(0); }
  });

  // Sub-view: expanded stack history
  if (expandedStack) {
    const stack = data.stacks.find((s) => s.name === expandedStack);
    if (!stack) {
      setExpandedStack(null);
      return null;
    }
    return (
      <box flexDirection="column" width="100%" height="100%" backgroundColor={C.bg}>
        <Header activeTab={activeTab} loading={data.loading} lastRefresh={data.lastRefresh} fromCache={data.fromCache} />
        <box flexGrow={1}>
          <StackHistoryView stack={stack} selectedIdx={historyIdx} inspecting={inspecting} onEntriesLoaded={setHistoryEntries} />
        </box>
        <StatusBar hint={
          inspecting
            ? "esc close  j/k nav  p pulumi  g github"
            : "esc back  j/k nav  enter inspect  p pulumi  g github"
        } />
      </box>
    );
  }

  return (
    <box flexDirection="column" width="100%" height="100%" backgroundColor={C.bg}>
      <Header activeTab={activeTab} loading={data.loading} lastRefresh={data.lastRefresh} fromCache={data.fromCache} />

      {data.loading && data.stacks.length === 0 ? (
        <box flexGrow={1} justifyContent="center" alignItems="center">
          <text fg={C.blue}>Loading deployment data…</text>
        </box>
      ) : data.error ? (
        <box flexGrow={1} justifyContent="center" alignItems="center">
          <text fg={C.red}>Error: {data.error}</text>
        </box>
      ) : (
        <box flexGrow={1}>
          {activeTab === "stacks" && <StacksView data={data} sorted={sorted} selectedIdx={selectedIdx} sortMode={sortMode} filterText={filterText} />}
          {activeTab === "deploys" && <DeploysView data={data} selectedIdx={selectedIdx} />}
          {activeTab === "activity" && <ActivityView data={data} />}
        </box>
      )}

      {filterActive ? (
        <FilterBar value={filterText} onChange={(v) => { setFilterText(v); setSelectedIdx(0); }} />
      ) : (
        <StatusBar />
      )}
    </box>
  );
}
