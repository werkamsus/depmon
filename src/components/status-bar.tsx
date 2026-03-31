import { C } from "../lib/colors.ts";
import { loadConfig } from "../lib/config.ts";

const cfg = loadConfig();

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
            <span fg={C.fgMuted}>j/k</span> nav{"  "}
            <span fg={C.fgMuted}>tab</span> view{"  "}
            <span fg={C.fgMuted}>enter</span> expand{"  "}
            <span fg={C.fgMuted}>/</span> filter{"  "}
            <span fg={C.fgMuted}>s</span> sort{"  "}
            <span fg={C.fgMuted}>p</span> pulumi{"  "}
            <span fg={C.fgMuted}>g</span> github{"  "}
            <span fg={C.fgMuted}>r</span> refresh{"  "}
            <span fg={C.fgMuted}>c</span> config{"  "}
            <span fg={C.fgMuted}>q</span> quit
          </>
        )}
      </text>
      <text fg={C.fgDark}>{cfg.ghRepo || "depmon"}</text>
    </box>
  );
}
