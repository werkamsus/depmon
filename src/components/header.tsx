import { C } from "../lib/colors.ts";
import type { TabName } from "../lib/types.ts";
import { Divider } from "./divider.tsx";

const TABS: { key: TabName; label: string }[] = [
  { key: "stacks", label: "Stacks" },
  { key: "deploys", label: "Deploys" },
  { key: "activity", label: "Activity" },
];

export function Header({
  activeTab,
  loading,
  lastRefresh,
  fromCache,
}: {
  activeTab: TabName;
  loading: boolean;
  lastRefresh: Date | null;
  fromCache: boolean;
}) {
  const refreshText = loading
    ? "refreshing…"
    : lastRefresh
      ? `${lastRefresh.toLocaleTimeString()}${fromCache ? " (cached)" : ""}`
      : "";

  return (
    <box flexDirection="column" width="100%">
      <box flexDirection="row" justifyContent="space-between" width="100%" paddingX={1}>
        <box flexDirection="row" gap={1} alignItems="flex-end">
          <ascii-font text="depmon" font="tiny" color={C.blue} />
        </box>
        <box alignItems="flex-end" justifyContent="flex-end">
          <text fg={C.fgDark}>
            {refreshText} {loading ? <span fg={C.yellow}>●</span> : <span fg={C.green}>●</span>}
          </text>
        </box>
      </box>
      <box flexDirection="row" gap={2} paddingX={2}>
        {TABS.map((t) => (
          <text key={t.key} fg={activeTab === t.key ? C.blue : C.fgMuted}>
            {activeTab === t.key ? (
              <span fg={C.blue}><strong>▸ {t.label}</strong></span>
            ) : (
              `  ${t.label}`
            )}
          </text>
        ))}
      </box>
      <Divider />
    </box>
  );
}
