import { useTerminalDimensions } from "@opentui/react";
import { C } from "../lib/colors.ts";
import { pad } from "../lib/helpers.ts";
import type { DeployData, SortMode, StackInfo } from "../lib/types.ts";
import { Divider } from "./divider.tsx";
import { StackRow } from "./stack-row.tsx";
import { StackDetail } from "./stack-detail.tsx";

export function StacksView({
  data,
  sorted,
  selectedIdx,
  sortMode,
  filterText,
}: {
  data: DeployData;
  sorted: StackInfo[];
  selectedIdx: number;
  sortMode: SortMode;
  filterText: string;
}) {
  const { width, height } = useTerminalDimensions();

  if (sorted.length === 0 && !data.loading) {
    return (
      <box justifyContent="center" alignItems="center" flexGrow={1}>
        <text fg={C.fgDark}>
          {filterText ? `No stacks matching "${filterText}"` : "No stacks found. Check pulumi configuration."}
        </text>
      </box>
    );
  }

  const succeeded = [...data.history.values()].filter((h) => h.status === "succeeded").length;
  const failed = [...data.history.values()].filter((h) => h.status === "failed").length;
  const total = data.stacks.length;
  const showing = sorted.length;
  const sortLabel = sortMode === "recent" ? "recent" : "name";

  const branchW = Math.max(18, Math.floor((width - 80) * 0.4));
  const msgW = Math.max(18, Math.floor((width - 80) * 0.5));

  return (
    <box flexDirection="column" width="100%" flexGrow={1}>
      {/* Stats bar */}
      <box flexDirection="row" gap={3} paddingX={2} height={1}>
        <text fg={C.fg}>
          <span fg={C.fgDark}>stacks:</span> <strong>{String(showing)}</strong>
          {showing !== total && <span fg={C.fgDark}>/{String(total)}</span>}
        </text>
        <text fg={C.green}>
          <span fg={C.fgDark}>healthy:</span> <strong>{String(succeeded)}</strong>
        </text>
        {failed > 0 && (
          <text fg={C.red}>
            <span fg={C.fgDark}>failed:</span> <strong>{String(failed)}</strong>
          </text>
        )}
        <text fg={C.fgDark}>
          sort: <span fg={C.blue}>{sortLabel}</span>
        </text>
      </box>

      {/* Column headers */}
      <box flexDirection="row" paddingX={2} width="100%">
        <text fg={C.fgDark}>{pad("", 3)}</text>
        <text fg={C.fgDark}><strong>{pad("STACK", 16)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("BRANCH", branchW + 1)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("MESSAGE", msgW + 1)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("AUTHOR", 10)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("UPDATED", 10)}</strong></text>
        <text fg={C.fgDark}><strong>RES</strong></text>
      </box>

      <Divider />

      {/* Stack rows */}
      <scrollbox height={Math.max(5, height - 16)}>
        {sorted.map((stack, i) => (
          <StackRow
            key={stack.name}
            stack={stack}
            history={data.history.get(stack.name)}
            selected={i === selectedIdx}
            width={width}
          />
        ))}
      </scrollbox>

      {/* Detail panel for selected stack */}
      {sorted[selectedIdx] && (
        <StackDetail
          stack={sorted[selectedIdx]}
          history={data.history.get(sorted[selectedIdx].name)}
        />
      )}
    </box>
  );
}
