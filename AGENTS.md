# Working agreement — UI

The operating contract for **any** coding agent working in this repository. This file is
the single source of truth for the rules: Codex, Cursor and Gemini CLI read `AGENTS.md`
natively, and Claude Code loads it through the `@AGENTS.md` import in
[`CLAUDE.md`](CLAUDE.md). **Never fork these rules into a per-vendor file.**

**JavaScript/TypeScript library** (`@pathscale/ui`), built with `bun`.

## Invariants (don't break these)

- **[`docs/ui-usage.md`](docs/ui-usage.md) is the source of truth for how this
  library is consumed** — theming, component conventions, forms, table, toast,
  icons. Every consuming app links here instead of keeping its own copy. If you
  change a public component API, update that file in the same change.
- **Read [`docs/frontend-conventions.md`](docs/frontend-conventions.md) before opening
  implementation files.** It is the frontend working agreement: SolidJS/`@pathscale/ui`
  conventions, and a context-efficient workflow. Reading it first keeps
  context small and avoids re-deriving patterns that already exist.
- **Releases are automatic — never run `npm publish` by hand.** Pushing to `master`
  runs [`.github/workflows/release.yml`](.github/workflows/release.yml), which derives the
  version from the conventional commits since the last release, bumps `package.json`,
  publishes through npm Trusted Publishing (OIDC) and tags it. There is no `NPM_TOKEN` in
  this repository, so a local publish cannot authenticate anyway, and a hand-written
  version bump only fights the workflow. Publishing is irreversible and a version can
  never be reused, so if a release looks wrong, read the workflow run before touching
  anything.
- **After a merge, confirm the fix actually published.** The automatic release has one
  hole and it is easy to walk into: if the release job for the *previous* merge is still
  running when yours lands, the new tag can end up pointing at your commit while npm
  never receives it. `bun run scripts/next-version.ts` then reports "no releasable
  commits", because the range it inspects is already empty. The symptom is a merged fix
  that a consumer cannot install.

  So check, every time:

  ```sh
  npm view @pathscale/ui version          # what consumers can actually install
  git log --oneline -1                    # what master says
  git tag --points-at HEAD                # a tag here with no npm release is the hole
  ```

  If master is ahead of npm, push a one-line `chore(release): <next>` bump to `master`
  to trigger the workflow. That is the one case where touching the version by hand is
  correct, and it is a repair, not the normal path.
- **One open PR per repository. Add to it.** If a PR is already open here, push your
  commits onto that branch instead of opening a second one. Two open PRs against the
  same library mean two releases, two version bumps, and a consumer that has to wait for
  both — and whichever lands second can hit the tag hole above.
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
- **`bun run lint` rewrites your working tree.** `lint:code` is `biome lint --write`, so it
  is a fixer, not a check: it will quietly reformat files your change never touched. Run it
  *before* you stage, check `git diff --name-only` afterwards, and never assume a clean exit
  means nothing moved. `bun run build` regenerates `*.generated.tsx` from the `*.layout.tsx`
  sources, so a stray edit there reaches the build even when your own diff looks right.

## PR discipline

**Always paste the full PR URL** (`https://github.com/pathscale/UI/pull/<n>`), not just the number, so it's
clickable.

## Keeping docs honest

Hit a factual error here — a stale path, a wrong command, a moved status? Fix it in the same
change. Don't open cosmetic rewording PRs.

Learned something durable — a gotcha, a decision, a constraint? It belongs **in this repo's
docs**, not in your agent's private memory. Repo docs are versioned, reviewable, and visible
to every agent and human; private memory dies with your machine.

## Git workflow

- **Always specify the branch when pushing**: `git push origin branch-name`
- **Branch naming**: `fix/issue-description` or `feat/issue-description`
- **Force-push your own branch freely.** Rebasing a feature branch onto a moved
  base, or amending before review, is normal and correct — use
  `--force-with-lease` so you don't clobber someone else's push.
- **Never force-push the default branch.** That is the history everyone else builds on,
  and it is protected server-side for a reason.
- **Never create merge commits — this is a hard ban.** Not locally, not to refresh a
  branch, not to land a pull request. If your branch
  has fallen behind, **rebase** it onto the moved base (`git rebase origin/master`, then
  `--force-with-lease`). `git merge <default-branch>` into a feature branch is not an
  acceptable shortcut: it adds a commit whose only content is the fact that you were behind, and it
  turns a readable line of work into a diamond. Merge commits are disabled server-side on
  these repositories — that is a backstop, not a licence to rely on it.
- **Rebase is the default everywhere** — refreshing a branch, and landing a pull request.
  Individual commits carry information: what was tried, in what order, and why. A rebase
  merge keeps that granularity on the base branch, so write commits worth keeping and land
  them intact.
- **Landing a pull request means rebase, then fast-forward.** `git rebase origin/master`
  on the branch, then `git merge --ff-only <branch>` on the base, then push. Those two
  commands are the whole job, so don't reach for `gh pr merge`: its default writes a
  merge commit. Rebasing rewrites the commit SHAs, so GitHub cannot always detect that
  a branch landed — close such pull requests explicitly and say why.
- **Don't delete remote branches by hand.** Once the work is on the default branch it is
  reaped automatically. Deleting your own local copy is fine.
- **Squash is acceptable** where it genuinely makes things easier or is the more
  appropriate shape for the branch — one logical change scattered across fixup commits, or
  a long branch whose intermediate states aren't worth preserving. It is a judgement call,
  not a violation. Merging is the only thing that is never allowed.
- **Delete what is deprecated.** A superseded file, flag, branch or code path gets removed
  in the change that supersedes it, not left behind with a deprecation note.

## Guardrails

[`.claude/settings.json`](.claude/settings.json) and [`.claude/hooks/`](.claude/hooks/) make
Claude Code prompt a human before prod-affecting or destructive commands — pushes, publishing
to a registry, `gh pr merge`, cloud CLIs, recursive deletes, deploy scripts.

**Other agents don't get that net automatically.** Apply the same rule yourself: ask before
running any command family listed in
[`.claude/hooks/ask-before-risky-commands.sh`](.claude/hooks/ask-before-risky-commands.sh).
It is one layer of defence, not a guarantee — a pattern match over a command string is
best-effort.

## No AI attribution

Never add AI attribution to anything in this repo or leaving it: no "Generated with
Claude Code" / robot-emoji footers, no `Co-Authored-By: Claude` (or any AI) trailers,
and no AI credit in commit messages, PR or issue titles/bodies, changelogs, release
notes, or code comments. Applies to every agent and every vendor. Work product should
be indistinguishable from a human teammate's.
