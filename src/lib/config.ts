import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

export interface DepmonConfig {
  pulumiDir: string;
  pulumiPkg: string;
  ghRepo: string;
}

const CONFIG_DIR = join(homedir(), ".config", "depmon");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

function findPulumiRoot(): string | null {
  // Walk up from cwd looking for Pulumi.yaml
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, "Pulumi.yaml"))) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function detectGhRepo(): string | null {
  try {
    const proc = Bun.spawnSync(["gh", "repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], {
      stdout: "pipe", stderr: "pipe",
    });
    const out = new TextDecoder().decode(proc.stdout).trim();
    return out || null;
  } catch {
    return null;
  }
}

export function loadConfig(): DepmonConfig {
  // 1. Env vars take priority
  const envDir = process.env.DEPMON_PULUMI_DIR;
  const envPkg = process.env.DEPMON_PULUMI_PKG;
  const envRepo = process.env.DEPMON_GH_REPO;

  // 2. Try config file
  let fileConfig: Partial<DepmonConfig> = {};
  if (existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    } catch {}
  }

  // 3. Auto-detect fallbacks
  const pulumiRoot = findPulumiRoot();

  const config: DepmonConfig = {
    pulumiDir: envDir || fileConfig.pulumiDir || pulumiRoot || process.cwd(),
    pulumiPkg: envPkg || fileConfig.pulumiPkg || ".",
    ghRepo: envRepo || fileConfig.ghRepo || detectGhRepo() || "",
  };

  return config;
}

export function saveConfig(config: DepmonConfig) {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}

export function configExists(): boolean {
  return existsSync(CONFIG_FILE);
}
