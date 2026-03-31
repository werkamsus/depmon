import { C } from "../lib/colors.ts";
import { statusIcon, statusColor, shortBranch, truncate, pad, isCoreName, timeAgo } from "../lib/helpers.ts";
import type { StackInfo, StackHistory, GHRun } from "../lib/types.ts";

export function StackRow({
  stack,
  history,
  ghRun,
  selected,
  width,
}: {
  stack: StackInfo;
  history?: StackHistory;
  ghRun?: GHRun;
  selected: boolean;
  width: number;
}) {
  const bg = selected ? C.bgSelected : "transparent";
  const nameW = 14;
  const branchW = Math.max(20, Math.floor((width - 85) * 0.4));
  const msgW = Math.max(16, Math.floor((width - 85) * 0.45));

  // Pulumi status
  const pStatus = history?.status || "unknown";
  const pIcon = statusIcon(pStatus);
  const pColor = statusColor(pStatus);

  // GH Actions status
  const gIcon = ghRun ? statusIcon(ghRun.status, ghRun.conclusion) : "·";
  const gColor = ghRun ? statusColor(ghRun.status, ghRun.conclusion) : C.fgDark;

  const branch = history ? shortBranch(history.branch) : "—";
  const msg = history ? truncate(history.message, msgW) : "never deployed";
  const author = history?.author?.split(" ")[0] || "—";
  const ago = stack.lastUpdate !== "n/a" ? timeAgo(stack.lastUpdate) : "never";
  const nameColor = isCoreName(stack.name) ? C.orange : C.cyan;

  return (
    <box flexDirection="row" width="100%" backgroundColor={bg} paddingX={2} height={1}>
      <text fg={pColor}>{pIcon}</text>
      <text fg={gColor}>{pad(gIcon, 3)}</text>
      <text fg={nameColor}><strong>{pad(stack.name, nameW)}</strong></text>
      <text fg={C.magenta}>{pad(truncate(branch, branchW), branchW + 1)}</text>
      <text fg={C.fg}>{pad(truncate(msg, msgW), msgW + 1)}</text>
      <text fg={C.fgDark}>{pad(author, 9)}</text>
      <text fg={C.fgDark}>{pad(ago, 9)}</text>
      <text fg={C.fgDark}>{stack.resourceCount}</text>
    </box>
  );
}
