export interface StackInfo {
  name: string;
  lastUpdate: string;
  resourceCount: string;
  url: string;
  updateInProgress: boolean;
}

export interface StackHistory {
  version: number;
  status: string;
  kind: string;
  message: string;
  branch: string;
  author: string;
  duration: string;
  resourceChanges: string;
  startTime: string;
  endTime: string;
  ghRunUrl: string;
  repo: string;
}

export interface GHRun {
  name: string;
  status: string;
  conclusion: string;
  startedAt: string;
  updatedAt: string;
  headBranch: string;
  displayTitle: string;
  url: string;
  workflowName: string;
  event: string;
}

export interface DeployData {
  stacks: StackInfo[];
  history: Map<string, StackHistory>;
  ghRuns: GHRun[];
  loading: boolean;
  lastRefresh: Date | null;
  error: string | null;
  fromCache: boolean;
}

export type TabName = "stacks" | "deploys" | "activity";
export type SortMode = "name" | "recent";

export interface StackHistoryEntry extends StackHistory {
  stackName: string;
}
