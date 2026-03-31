import { useTerminalDimensions } from "@opentui/react";
import { C } from "../lib/colors.ts";
import { pad } from "../lib/helpers.ts";
import type { DeployData } from "../lib/types.ts";
import { Divider } from "./divider.tsx";
import { DeployRow } from "./deploy-row.tsx";

export function DeploysView({
  data,
  selectedIdx,
}: {
  data: DeployData;
  selectedIdx: number;
}) {
  const { width, height } = useTerminalDimensions();
  const runs = data.ghRuns;
  const inProgress = runs.filter(
    (r) => r.status === "in_progress" || r.status === "queued" || r.status === "waiting"
  );
  const completed = runs.filter((r) => r.status === "completed");
  const branchW = Math.max(22, Math.floor((width - 60) * 0.35));
  const titleW = Math.max(25, Math.floor((width - 60) * 0.45));

  return (
    <box flexDirection="column" width="100%" flexGrow={1}>
      {/* Stats */}
      <box flexDirection="row" gap={3} paddingX={2} height={1}>
        <text fg={C.fg}>
          <span fg={C.fgDark}>total:</span> <strong>{String(runs.length)}</strong>
        </text>
        {inProgress.length > 0 && (
          <text fg={C.blue}>
            <span fg={C.fgDark}>deploying:</span> <strong>{String(inProgress.length)}</strong>
          </text>
        )}
        <text fg={C.green}>
          <span fg={C.fgDark}>completed:</span> <strong>{String(completed.length)}</strong>
        </text>
      </box>

      {/* In-progress */}
      {inProgress.length > 0 && (
        <>
          <box paddingX={2}>
            <text fg={C.blue}><strong>▸ In Progress</strong></text>
          </box>
          {inProgress.map((run, i) => (
            <DeployRow key={run.url} run={run} selected={selectedIdx === i} width={width} />
          ))}
          <Divider />
        </>
      )}

      {/* Column headers */}
      <box flexDirection="row" paddingX={2}>
        <text fg={C.fgDark}>{pad("", 3)}</text>
        <text fg={C.fgDark}><strong>{pad("STACK", 14)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("BRANCH", branchW + 1)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("COMMIT", titleW + 1)}</strong></text>
        <text fg={C.fgDark}><strong>{pad("TRIGGER", 10)}</strong></text>
        <text fg={C.fgDark}><strong>WHEN</strong></text>
      </box>

      <Divider />

      {/* Completed */}
      <scrollbox height={Math.max(5, height - 12)}>
        {completed.map((run, i) => (
          <DeployRow
            key={run.url}
            run={run}
            selected={selectedIdx === i + inProgress.length}
            width={width}
          />
        ))}
      </scrollbox>
    </box>
  );
}
