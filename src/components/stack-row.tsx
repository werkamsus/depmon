import { C } from "../lib/colors.ts";
import { statusIcon, statusColor, shortBranch, truncate, pad, isCoreName, timeAgo } from "../lib/helpers.ts";
import type { StackInfo, StackHistory } from "../lib/types.ts";

export function StackRow({
  stack,
  history,
  selected,
  width,
}: {
  stack: StackInfo;
  history?: StackHistory;
  selected: boolean;
  width: number;
}) {
  const bg = selected ? C.bgSelected : "transparent";
  const nameW = 16;
  const branchW = Math.max(18, Math.floor((width - 80) * 0.4));
  const msgW = Math.max(18, Math.floor((width - 80) * 0.5));

  const status = history?.status || "unknown";
  const icon = statusIcon(status);
  const color = statusColor(status);
  const branch = history ? shortBranch(history.branch) : "—";
  const msg = history ? truncate(history.message, msgW) : "never deployed";
  const author = history?.author?.split(" ")[0] || "—";
  const ago = stack.lastUpdate !== "n/a" ? timeAgo(stack.lastUpdate) : "never";
  const nameColor = isCoreName(stack.name) ? C.orange : C.cyan;

  return (
    <box flexDirection="row" width="100%" backgroundColor={bg} paddingX={2} height={1}>
      <text fg={color}>{pad(`${icon}`, 3)}</text>
      <text fg={nameColor}><strong>{pad(stack.name, nameW)}</strong></text>
      <text fg={C.magenta}>{pad(truncate(branch, branchW), branchW + 1)}</text>
      <text fg={C.fg}>{pad(truncate(msg, msgW), msgW + 1)}</text>
      <text fg={C.fgDark}>{pad(author, 10)}</text>
      <text fg={C.fgDark}>{pad(ago, 10)}</text>
      <text fg={C.fgDark}>{stack.resourceCount}</text>
    </box>
  );
}
