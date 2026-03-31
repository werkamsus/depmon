import { C } from "../lib/colors.ts";

export function StatusBar({ hint }: { hint?: string }) {
  return (
    <box
      flexDirection="row"
      justifyContent="space-between"
      width="100%"
      height={1}
      paddingX={2}
      backgroundColor={C.bgDark}
    >
      <text fg={C.fgDark}>
        {hint ?? (
          <>
            <span fg={C.fgMuted}>j/k</span> navigate{"  "}
            <span fg={C.fgMuted}>tab</span> view{"  "}
            <span fg={C.fgMuted}>enter</span> expand{"  "}
            <span fg={C.fgMuted}>s</span> sort{"  "}
            <span fg={C.fgMuted}>r</span> refresh{"  "}
            <span fg={C.fgMuted}>o</span> open{"  "}
            <span fg={C.fgMuted}>q</span> quit
          </>
        )}
      </text>
      <text fg={C.fgDark}>temper/unnbound-infra</text>
    </box>
  );
}
