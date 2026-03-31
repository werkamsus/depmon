import { useTerminalDimensions } from "@opentui/react";
import { C } from "../lib/colors.ts";

export function Divider({ indent = 1 }: { indent?: number }) {
  const { width } = useTerminalDimensions();
  const len = Math.max(10, width - indent * 2 - 2);
  return (
    <box width="100%" paddingX={indent}>
      <text fg={C.border}>{"─".repeat(len)}</text>
    </box>
  );
}
