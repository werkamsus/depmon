import { C } from "../lib/colors.ts";
import { statusIcon, statusColor, shortBranch, truncate, isCoreName } from "../lib/helpers.ts";
import type { StackInfo, StackHistory, GHRun } from "../lib/types.ts";
import { Divider } from "./divider.tsx";

export function StackDetail({
  stack,
  history,
  ghRun,
}: {
  stack: StackInfo;
  history?: StackHistory;
  ghRun?: GHRun;
}) {
  if (!history) {
    return (
      <box paddingX={3}>
        <text fg={C.fgDark}>
          No deployment history for <span fg={C.cyan}>{stack.name}</span>
        </text>
      </box>
    );
  }

  const isCore = isCoreName(stack.name);
  const pSc = statusColor(history.status);
  const br = shortBranch(history.branch);

  const gSc = ghRun ? statusColor(ghRun.status, ghRun.conclusion) : C.fgDark;
  const gIcon = ghRun ? statusIcon(ghRun.status, ghRun.conclusion) : "·";
  const gLabel = ghRun
    ? ghRun.status === "completed"
      ? ghRun.conclusion || "done"
      : ghRun.status
    : "no run";

  return (
    <box flexDirection="column" paddingX={2}>
      <Divider indent={2} />
      <box flexDirection="row" gap={1} paddingX={1}>
        <text fg={isCore ? C.orange : C.cyan}><strong>{stack.name}</strong></text>
        <text fg={C.fgDark}>v{String(history.version)}</text>
        <text fg={C.fgDark}>|</text>
        <text fg={pSc}>{statusIcon(history.status)} {history.kind}:{history.status}</text>
        <text fg={gSc}>{gIcon} gh:{gLabel}</text>
        {history.duration && <text fg={C.fgDark}>| {history.duration}</text>}
      </box>
      <box flexDirection="row" gap={1} paddingX={1}>
        <text fg={C.fgDark}>{"  "}</text>
        <text fg={C.magenta}>{br}</text>
        <text fg={C.fgDark}>|</text>
        <text fg={C.fg}>{history.author}</text>
        <text fg={C.fgDark}>|</text>
        <text fg={C.fg}>{truncate(history.message, 55)}</text>
      </box>
      {history.resourceChanges && (
        <box paddingX={1}>
          <text fg={C.fgDark}>{"  "}{history.resourceChanges}</text>
        </box>
      )}
    </box>
  );
}
