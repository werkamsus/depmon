# depmon

Terminal UI for monitoring Pulumi stack deployments and GitHub Actions runs.

Built with [OpenTUI](https://github.com/anomalyco/opentui). Requires [Bun](https://bun.sh), [Pulumi CLI](https://www.pulumi.com/docs/install/), and [GitHub CLI](https://cli.github.com/).

## Install

```bash
bun install -g github:werkamsus/depmon
```

## Configure

depmon needs to know where your Pulumi project lives and which GitHub repo to query. It resolves config in this order:

1. **Environment variables** (highest priority)
2. **Config file** at `~/.config/depmon/config.json`
3. **Auto-detect** — walks up from cwd looking for `Pulumi.yaml`, runs `gh repo view` for the repo

```bash
mkdir -p ~/.config/depmon
cat > ~/.config/depmon/config.json << 'EOF'
{
  "pulumiDir": "/path/to/your/repo",
  "pulumiPkg": "packages/pulumi-infra",
  "ghRepo": "org/repo"
}
EOF
```

| Key | What it does | Env var | Auto-detect |
|-----|-------------|---------|-------------|
| `pulumiDir` | Root directory for `pulumi` commands | `DEPMON_PULUMI_DIR` | Walks up from cwd for `Pulumi.yaml` |
| `pulumiPkg` | `--cwd` passed to pulumi (relative to pulumiDir) | `DEPMON_PULUMI_PKG` | Defaults to `.` |
| `ghRepo` | GitHub repo for `gh run list` | `DEPMON_GH_REPO` | Runs `gh repo view` in cwd |

Nothing is hardcoded in the source — all paths come from your config.

## Usage

```bash
depmon
```

### Keybindings

| Key | Action |
|-----|--------|
| `j/k` or arrows | Navigate |
| `tab` or `1/2/3` | Switch tab (Stacks / Deploys / Activity) |
| `enter` | Expand stack deploy history |
| `/` | Filter stacks by name, branch, author, or message |
| `s` | Toggle sort (recent / name) |
| `p` | Open in Pulumi Cloud |
| `g` | Open in GitHub Actions |
| `r` | Refresh data |
| `esc` | Back / clear filter |
| `q` | Quit |

### Tabs

- **Stacks** — all Pulumi stacks with dual status (Pulumi + GitHub Actions), branch, last commit, author, resource count. Core stacks (dev/stg/prod) pinned to bottom.
- **Deploys** — recent GitHub Actions Pulumi workflow runs.
- **Activity** — timeline of latest deploy per stack, sorted by recency.

### Caching

State is cached at `~/.cache/depmon/state.json`. On startup, cached data displays instantly while fresh data loads in the background. Auto-refreshes every 60s.
