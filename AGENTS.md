# Working agreement — UI

The operating contract for **any** coding agent working in this repository. This file is
the single source of truth for the rules: Codex, Cursor and Gemini CLI read `AGENTS.md`
natively, and Claude Code loads it through the `@AGENTS.md` import in
[`CLAUDE.md`](CLAUDE.md). **Never fork these rules into a per-vendor file.**

**JavaScript/TypeScript library** (`@pathscale/ui`), built with `bun`.

## Invariants (don't break these)

- **Publishing to npm is irreversible.** A version can never be reused. Check the built artifact before releasing.
- **`bun` is the package manager** — its lockfile is authoritative. Don't introduce a second one by running npm/yarn/pnpm here.
- **Docs describe what is true now.** If you change behaviour, update the README and any affected doc in the same change.

## Build & run

```bash
bun install
bun run dev
bun run build
bun run lint
```

## Verification

Run what you build before reporting it done. Type-checks and tests verify code correctness,
not feature correctness — **if you can't run it, say so explicitly** rather than implying
success.

- Compare against the base branch rather than asserting: a pre-existing failing test or lint
  error is not something you introduced, and saying so requires checking.
- A build that finishes suspiciously fast was cached, not rebuilt. Force a real rebuild when
  the rebuild is the thing you're verifying.

## PR discipline

**Always paste the full PR URL** (`https://github.com/pathscale/UI/pull/<n>`), not just the number, so it's
clickable.

<!-- DORMANT — CI-green gating. Do not follow this rule yet; re-enable it as its own project.

Why it's off: CI here does not reliably attach checks to pull requests, so
`statusCheckRollup` comes back empty and "wait for green" would teach an agent to wait on
nothing. Verify per repo before switching this on.

To enable: ensure the workflow runs on `pull_request:`, confirm checks attach to a PR, then
uncomment the rule below.

    After any push or PR, **check CI and don't call it done until it's green**:

    ```bash
    gh pr view <number> --repo pathscale/UI --json statusCheckRollup
    ```

    CI running → wait and recheck. CI failed → read the logs, fix, push, wait for green.
-->

## Keeping docs honest

Hit a factual error here — a stale path, a wrong command, a moved status? Fix it in the same
change. Don't open cosmetic rewording PRs.

Learned something durable — a gotcha, a decision, a constraint? It belongs **in this repo's
docs**, not in your agent's private memory. Repo docs are versioned, reviewable, and visible
to every agent and human; private memory dies with your machine.

## Git workflow

- **Always specify the branch when pushing**: `git push origin branch-name`
- **Branch naming**: `fix/issue-description` or `feat/issue-description`
- **No force-pushing** during PR review

## Guardrails

[`.claude/settings.json`](.claude/settings.json) and [`.claude/hooks/`](.claude/hooks/) make
Claude Code prompt a human before prod-affecting or destructive commands — pushes, publishing
to a registry, `gh pr merge`, cloud CLIs, recursive deletes, deploy scripts.

**Other agents don't get that net automatically.** Apply the same rule yourself: ask before
running any command family listed in
[`.claude/hooks/ask-before-risky-commands.sh`](.claude/hooks/ask-before-risky-commands.sh).
It is one layer of defence, not a guarantee — a pattern match over a command string is
best-effort.
