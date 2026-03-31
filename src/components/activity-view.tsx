import { useMemo } from "react";
import { useTerminalDimensions } from "@opentui/react";
import { C } from "../lib/colors.ts";
import { statusIcon, statusColor, shortBranch, truncate, timeAgo, isCoreName } from "../lib/helpers.ts";
import type { DeployData } from "../lib/types.ts";

export function ActivityView({ data }: { data: DeployData }) {
  const { height } = useTerminalDimensions();

  const activities = useMemo(() => {
    const items: {
      stack: string;
      message: string;
      author: string;
      time: string;
      status: string;
      branch: string;
    }[] = [];

    for (const [name, h] of data.history) {
      items.push({
        stack: name,
        message: h.message,
        author: h.author,
        time: h.startTime,
        status: h.status,
        branch: shortBranch(h.branch),
      });
    }

    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return items;
  }, [data.history]);

  return (
    <box flexDirection="column" width="100%" flexGrow={1}>
      <box paddingX={2} height={1}>
        <text fg={C.fgDark}>Recent activity across all stacks (latest deploy per stack)</text>
      </box>
      <scrollbox height={Math.max(5, height - 8)}>
        {activities.map((a) => {
          const isCore = isCoreName(a.stack);
          return (
            <box key={a.stack} flexDirection="column" paddingX={2}>
              <box flexDirection="row" gap={1}>
                <text fg={statusColor(a.status)}>{statusIcon(a.status)}</text>
                <text fg={isCore ? C.orange : C.cyan}><strong>{a.stack}</strong></text>
                <text fg={C.fgDark}>·</text>
                <text fg={C.magenta}>{a.branch}</text>
                <text fg={C.fgDark}>·</text>
                <text fg={C.fgDark}>{a.author}</text>
                <text fg={C.fgDark}>·</text>
                <text fg={C.fgDark}>{timeAgo(a.time)}</text>
              </box>
              <box paddingLeft={3}>
                <text fg={C.fg}>{truncate(a.message, 90)}</text>
              </box>
            </box>
          );
        })}
      </scrollbox>
    </box>
  );
}
