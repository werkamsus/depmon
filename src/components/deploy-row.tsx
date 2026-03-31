import { C } from "../lib/colors.ts";
import { statusIcon, statusColor, truncate, pad, isCoreName, timeAgo, extractStackName } from "../lib/helpers.ts";
import type { GHRun } from "../lib/types.ts";

export function DeployRow({
  run,
  selected,
  width,
}: {
  run: GHRun;
  selected: boolean;
  width: number;
}) {
  const bg = selected ? C.bgSelected : "transparent";
  const icon = statusIcon(run.status, run.conclusion);
  const color = statusColor(run.status, run.conclusion);
  const stackName = extractStackName(run.name);
  const isCore = isCoreName(stackName);
  const branchW = Math.max(22, Math.floor((width - 60) * 0.35));
  const titleW = Math.max(25, Math.floor((width - 60) * 0.45));

  return (
    <box flexDirection="row" width="100%" backgroundColor={bg} paddingX={2} height={1}>
      <text fg={color}>{pad(`${icon}`, 3)}</text>
      <text fg={isCore ? C.orange : C.cyan}><strong>{pad(stackName, 14)}</strong></text>
      <text fg={C.magenta}>{pad(truncate(run.headBranch, branchW), branchW + 1)}</text>
      <text fg={C.fg}>{pad(truncate(run.displayTitle, titleW), titleW + 1)}</text>
      <text fg={C.fgDark}>{pad(run.event === "workflow_dispatch" ? "manual" : run.event, 10)}</text>
      <text fg={C.fgDark}>{timeAgo(run.startedAt)}</text>
    </box>
  );
}
