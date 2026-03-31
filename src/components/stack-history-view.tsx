import { useState, useEffect } from "react";
import { useTerminalDimensions } from "@opentui/react";
import { C } from "../lib/colors.ts";
import { statusIcon, statusColor, shortBranch, truncate, pad, timeAgo } from "../lib/helpers.ts";
import type { StackInfo, StackHistory } from "../lib/types.ts";
import { fetchStackHistory, fetchGHRunLogs } from "../data/fetchers.ts";
import { Divider } from "./divider.tsx";

export function StackHistoryView({
  stack,
  selectedIdx,
  inspecting,
  onEntriesLoaded,
}: {
  stack: StackInfo;
  selectedIdx: number;
  inspecting: boolean;
  onEntriesLoaded?: (entries: StackHistory[]) => void;
}) {
  const { width, height } = useTerminalDimensions();
  const [entries, setEntries] = useState<StackHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [inspectText, setInspectText] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchStackHistory(stack.name, 15, true).then((h) => {
      setEntries(h);
      setLoading(false);
      onEntriesLoaded?.(h);
    });
  }, [stack.name]);

  // Inspect failed deploy
  useEffect(() => {
    if (!inspecting || !entries[selectedIdx]) {
      setInspectText(null);
      return;
    }
    const entry = entries[selectedIdx];
    if (entry.status === "failed" && entry.ghRunUrl) {
      setInspectText("Loading run details…");
      fetchGHRunLogs(entry.ghRunUrl).then((text) => {
        setInspectText(text);
      });
    } else {
      setInspectText(null);
    }
  }, [inspecting, selectedIdx, entries]);

  if (loading) {
    return (
      <box flexGrow={1} justifyContent="center" alignItems="center">
        <text fg={C.blue}>Loading history for {stack.name}…</text>
      </box>
    );
  }

  if (entries.length === 0) {
    return (
      <box flexGrow={1} justifyContent="center" alignItems="center">
        <text fg={C.fgDark}>No deploy history for {stack.name}</text>
      </box>
    );
  }

  return (
    <box flexDirection="column" width="100%" flexGrow={1}>
      <box paddingX={2} height={1}>
        <text fg={C.fg}>
          Deploy history for <span fg={C.cyan}><strong>{stack.name}</strong></span>
          <span fg={C.fgDark}> ({String(entries.length)} deploys)</span>
        </text>
      </box>

      {/* Column headers */}
      <box flexDirection="row" paddingX={2}>
        <text fg={C.fgDark}><strong>{pad("", 3)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("VER", 6)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("KIND", 9)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("STATUS", 12)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("DUR", 8)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("BRANCH", 20)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("MESSAGE", Math.max(14, width - 80))}</strong></text>
        <text fg={C.fgDark}><strong>WHEN</strong></text>
      </box>

      <Divider />

      <scrollbox height={inspecting && inspectText ? Math.floor(height / 2) - 4 : Math.max(5, height - 12)}>
        {entries.map((e, i) => {
          const bg = i === selectedIdx ? C.bgSelected : "transparent";
          const sc = statusColor(e.status);
          return (
            <box key={e.version} flexDirection="row" width="100%" backgroundColor={bg} paddingX={2} height={1}>
              <text fg={sc}>{pad(statusIcon(e.status), 3)}</text>
              <text fg={C.fgDark}>{pad(`v${e.version}`, 6)}</text>
              <text fg={e.kind === "update" ? C.fg : C.fgDark}>{pad(e.kind, 9)}</text>
              <text fg={sc}>{pad(e.status, 12)}</text>
              <text fg={C.fgDark}>{pad(e.duration || "—", 8)}</text>
              <text fg={C.magenta}>{pad(truncate(shortBranch(e.branch), 18), 20)}</text>
              <text fg={C.fg}>{pad(truncate(e.message, Math.max(12, width - 82)), Math.max(14, width - 80))}</text>
              <text fg={C.fgDark}>{timeAgo(e.startTime)}</text>
            </box>
          );
        })}
      </scrollbox>

      {/* Inspect panel for failed deploys */}
      {inspecting && inspectText && (
        <box flexDirection="column" width="100%">
          <Divider />
          <box paddingX={2} height={1}>
            <text fg={C.red}><strong>Run Details</strong></text>
          </box>
          <scrollbox height={Math.floor(height / 2) - 2}>
            <box paddingX={2}>
              <text fg={C.fg}>{inspectText}</text>
            </box>
          </scrollbox>
        </box>
      )}
    </box>
  );
}
