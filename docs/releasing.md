# Releasing

CI and Release run by manual dispatch on `master`. Set the intended version
in `package.json` as part of the reviewed source change. After owner-authorized
local QA, dispatch Release on `master` with the full current commit SHA in
`master_sha`.

Release uses that manifest version. The workflow checks that the version is
available, builds the selected revision, and packs the tarball for
`bun publish`. The workflow checks the current `master` SHA before
preparation and again before publishing. Git history and tags are managed
separately from publication.

CI and Release verify the SHA-256 digest of the Linux x64 Bun release archive
before extracting it. Update the archive version and digest in both workflows
when upgrading Bun.

The release operator configures a registry credential for the publish job.
That job uses a GitHub Actions environment and passes the credential only to
the publish step.

## Local verification

The local package build uses Bun 1.4.4 or newer and the dependencies in
`package.json`. Oxc emits isolated declarations during distribution and
watch builds. Use Bun for type checking. Registry credentials are only
needed when publishing.

From the repository root, set `SMOKE_WORK_DIR` to an existing absolute
directory allocated for the task, then run these checks before dispatching
Release.

```sh
TMPDIR="$SMOKE_WORK_DIR" bun run --bun build &&
  bun check --no-script &&
  bun run check:api &&
  bun run check:package &&
  bun run smoke
```

The package check pairs every published JavaScript wildcard export with its
declaration in the archive. The smoke check removes its generated fixture
and archive when it exits.
Set `SMOKE_TARBALL` to check an existing archive. The manually dispatched
CI workflow is available for the rendered component checks.

Release generates layouts and builds the distribution, then packs and
records the archive digest. The publish job verifies the downloaded
archive against that digest. Contract, type, package and consumer checks
run as part of local QA before dispatch.

## Confirming a release

Compare `bun info @pathscale/ui version` with `package.json` at the SHA used
for the successful Release run. If a run fails, inspect the failed step and
check whether the version is already on npm before dispatching again.
