import type { StackInfo, StackHistory, GHRun } from "../lib/types.ts";
import { loadConfig } from "../lib/config.ts";

const cfg = loadConfig();

async function runCmd(cmd: string[], cwd?: string): Promise<string> {
  const proc = Bun.spawn(cmd, {
    cwd: cwd ?? undefined,
    stdout: "pipe",
    stderr: "pipe",
  });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text;
}

function parseHistoryEntry(e: any): StackHistory {
  const branch = e.environment?.["git.headName"] || "unknown";
  const author = e.environment?.["git.author"] || "unknown";
  const ghRunUrl = e.environment?.["ci.build.url"] || "";
  const repo = e.environment?.["github.repository"] || "";

  const startTime = e.startTime || "";
  const endTime = e.endTime || "";
  let duration = "";
  if (startTime && endTime) {
    const diffSec = Math.floor(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
    );
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    duration = mins > 0 ? `${mins}m${secs}s` : `${secs}s`;
  }

  const rc = e.resourceChanges || {};
  const changes = Object.entries(rc)
    .filter(([k]) => k !== "same")
    .map(([k, v]) => `${k}:${v}`)
    .join(" ");

  return {
    version: e.version || 0,
    status: e.result || "unknown",
    kind: e.kind || "update",
    message: e.message || "",
    branch,
    author,
    duration,
    resourceChanges: changes,
    startTime,
    endTime,
    ghRunUrl,
    repo,
  };
}

export async function fetchStackList(): Promise<StackInfo[]> {
  const text = await runCmd(
    ["pulumi", "--cwd", cfg.pulumiPkg, "stack", "ls", "--json"],
    cfg.pulumiDir
  );
  try {
    const stacks = JSON.parse(text);
    return stacks.map((s: any) => ({
      name: s.name,
      lastUpdate: s.lastUpdate || "n/a",
      resourceCount: String(s.resourceCount ?? "n/a"),
      url: s.url || "",
      updateInProgress: s.updateInProgress ?? false,
    }));
  } catch {
    return [];
  }
}

export async function fetchStackHistory(
  stackName: string,
  pageSize = 1
): Promise<StackHistory[]> {
  const text = await runCmd(
    [
      "pulumi", "--cwd", cfg.pulumiPkg, "stack", "history",
      "--stack", stackName,
      "--json", "--show-secrets=false",
      "--page-size", String(pageSize),
    ],
    cfg.pulumiDir
  );
  try {
    const entries = JSON.parse(text);
    if (!entries || entries.length === 0) return [];
    return entries.map(parseHistoryEntry);
  } catch {
    return [];
  }
}

export async function fetchGHRuns(): Promise<GHRun[]> {
  const text = await runCmd([
    "gh", "run", "list",
    "--json", "name,status,conclusion,startedAt,updatedAt,headBranch,displayTitle,url,workflowName,event",
    "--limit", "30",
    "-R", cfg.ghRepo,
  ]);
  try {
    const runs: GHRun[] = JSON.parse(text);
    return runs.filter((r) => r.workflowName?.toLowerCase().includes("pulumi"));
  } catch {
    return [];
  }
}

export async function fetchGHRunLogs(runUrl: string): Promise<string> {
  // Extract run ID from URL
  const match = runUrl.match(/\/runs\/(\d+)/);
  if (!match) return "Could not parse run URL";
  const runId = match[1]!;
  const text = await runCmd([
    "gh", "run", "view", runId,
    "-R", cfg.ghRepo,
  ]);
  return text;
}
