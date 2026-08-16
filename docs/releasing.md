# Releasing

Releases are automatic. Push to `master` and the `Release` workflow decides
whether to publish, computes the version, publishes to npm and tags it. There
is no version-bump PR and no manual step.

You do not run `npm publish`. There is no `NPM_TOKEN` in this repository.

## What decides the version

`scripts/next-version.ts` reads the conventional-commit subjects since the last
published version:

| commit type | bump |
|---|---|
| `type!` or `BREAKING CHANGE` | major |
| `feat` | minor |
| `fix`, `perf`, `revert` | patch |
| `docs`, `chore`, `test`, `ci`, `style`, `refactor` | nothing |

A docs- or chore-only push releases nothing, and that is not a failure. If you
meant to ship, the commit type was wrong.

## The two modes

The workflow recovers from a half-finished release on its own:

- **`package.json`'s version is not on npm** — publish it as-is. This covers a
  previous run that built but did not publish, and a deliberate hand-written
  bump someone committed.
- **it is on npm** — compute the next version, bump it on `master`, publish,
  tag.

## Authentication

Publishing uses npm Trusted Publishing (OIDC), configured once on npmjs.com:

    @pathscale/ui -> Settings -> Trusted Publisher -> GitHub Actions
    repository: pathscale/ui, workflow: release.yml

Without it the publish step fails closed rather than publishing
unauthenticated.

## The gates, and why they run twice

Every gate in `Release` also runs in `CI`, deliberately. **npm forbids
replacing a published version**, so a gate that only fires during a release
costs a version number when it trips, rather than a re-run.

`Release` runs, in order: contract check, type check, build, **package check**,
`publint --strict`, and the consumer smoke test (advisory there, blocking in
CI).

The package check (`bun run check:package`) resolves the manifest's exports and
**every import written in `README.md`** against the actual packed tarball. It
is the gate that catches a document promising a module that no longer ships.

That is not hypothetical: 2.6.0's first release attempt failed on

    README imports a file that is not shipped
      @pathscale/ui/primitives/virtualizer -> ./dist/primitives/virtualizer/index.d.ts

`useVirtualRows` had gone out with TanStack `solid-virtual`, and the README's
subpath-export example still imported it. CI was green, because CI did not run
this check at the time. It does now.

## If a release fails

1. Read which step failed. The gates are ordered cheapest-first, so the first
   failure is the real one.
2. Fix it on a branch, open a PR, merge with `--rebase`.
3. The merge is a push to `master`, which triggers `Release` again. Do not
   re-run the failed job against the old commit.

If the failure came after `npm publish` succeeded, do not bump manually to
"get past it" — the recovery mode above already handles a version that is in
`package.json` but not on npm.

## Checking what actually shipped

    npm view @pathscale/ui version

A merged PR is not a published version. The two can disagree for as long as a
release is failing, which is exactly what the 2.6.0 case looked like: `master`
carried 2.6.0 while npm still served 2.5.0.
