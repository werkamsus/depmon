import { C } from "../lib/colors.ts";
import { statusIcon, statusColor, shortBranch, truncate, isCoreName } from "../lib/helpers.ts";
import type { StackInfo, StackHistory } from "../lib/types.ts";
import { Divider } from "./divider.tsx";

export function StackDetail({
  stack,
  history,
}: {
  stack: StackInfo;
  history?: StackHistory;
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
  const sc = statusColor(history.status);
  const br = shortBranch(history.branch);

  return (
    <box flexDirection="column" paddingX={2}>
      <Divider indent={2} />
      <box flexDirection="row" gap={1} paddingX={1}>
        <text fg={sc}>{statusIcon(history.status)}</text>
        <text fg={isCore ? C.orange : C.cyan}><strong>{stack.name}</strong></text>
        <text fg={C.fgDark}>v{String(history.version)}</text>
        <text fg={sc}>{history.status}</text>
        {history.duration && <text fg={C.fgDark}>{history.duration}</text>}
        <text fg={C.fgDark}>|</text>
        <text fg={C.magenta}>{br}</text>
        <text fg={C.fgDark}>|</text>
        <text fg={C.fg}>{history.author}</text>
      </box>
      <box paddingX={1}>
        <text fg={C.fg}>{"  "}{truncate(history.message, 72)}</text>
      </box>
      {history.resourceChanges && (
        <box paddingX={1}>
          <text fg={C.fgDark}>{"  "}{history.resourceChanges}</text>
        </box>
      )}
    </box>
  );
}
