#!/usr/bin/env bash
#
# Drive every component and report a verdict per component.
#
# This is a thin wrapper. The sweep itself is `ps-qa sweep-components`, because
# launching a host, waiting for it to serve, attaching and judging is the same
# work for any component library and belongs in the harness rather than in one
# project's shell script. What lives here is what is specific to this library:
# where the built pages are, where the checks are, and which host to run.
#
# NO WINDOWS. The host serves the inspection socket itself and opens nothing, so
# a full sweep runs next to someone using their machine and on a CI box with no
# display server. This used to drive `--blitz-control --offscreen`, which opened
# one window per component, 71 times, over whatever the owner was doing.
#
# Usage: tests/qa-harness/run-all.sh [component-id ...]      (default: every component)
set -uo pipefail

# The harness directory itself, and the repository root above it. The script
# reads its own files from HERE and the checks from the repository's
# `tests/ps-qa`, so it needs both.
readonly HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly ROOT="$(cd "$HERE/../.." && pwd)"
# Before either lookup below: `cargo install` puts both binaries here, and a
# non-interactive shell does not read the profile that adds it. Resolving the
# host first reported a freshly installed one as missing.
export PATH="$HOME/.cargo/bin:$PATH"

# Published, so a contributor installs it rather than cloning a sibling. A local
# checkout still wins through `QA_HOST`, which is what to use when changing the
# host and the harness together.
readonly HOST="${QA_HOST:-$(command -v qa-inspect-host || true)}"
readonly PS_QA="${QA_PS_QA:-$(command -v ps-qa || true)}"

if [[ -z "$PS_QA" || ! -x "$PS_QA" ]]; then
  echo "ps-qa is not on PATH; cargo install ps-qa" >&2
  exit 1
fi

if [[ -z "$HOST" || ! -x "$HOST" ]]; then
  echo "qa-inspect-host is not on PATH; cargo install qa-inspect-host" >&2
  echo "  (or set QA_HOST to a local build)" >&2
  exit 1
fi

ids=()
if [[ $# -gt 0 ]]; then
  ids=("$@")
else
  # `mapfile` is bash 4; macOS ships 3.2, where it does not exist and the
  # script died before running anything.
  while IFS= read -r line; do
    ids+=("$line")
  done < <(grep -oE 'id: "[a-z0-9-]+"' "$HERE/components.ts" | sed 's/id: "//;s/"//')
fi

# Refuse to sweep a stale build.
#
# The sweep reads the prebuilt pages under `dist/`; nothing here compiles. So an
# edit to `mount.tsx` or a fixture is silently ignored until someone runs
# `qa:build`, and the sweep reports confidently on hours-old code. That cost an
# afternoon: a new fixture was written, the sweep was re-run three times, and
# every run judged the previous bundle.
#
# Comparing timestamps rather than rebuilding: a rebuild is a minute for 71
# pages, and doing it silently on every run would hide which source changed.
if [[ ! -d "$HERE/dist" ]]; then
  echo "no build at $HERE/dist; run: bun run qa:build" >&2
  exit 1
fi

# The bundles, not a page: rsbuild emits `<id>.html` per component and no
# `index.html`, so there is no single file that stands for the whole build.
# Any built script is younger than the compile that produced it.
reference="$(ls -t "$HERE/dist/static/js/"*.js 2>/dev/null | head -1)"
if [[ -z "$reference" ]]; then
  echo "no bundles under $HERE/dist/static/js; run: bun run qa:build" >&2
  exit 1
fi

# `\( ... \)` around the alternation: without the group, `-newer` binds to the
# last `-o` branch alone, so a stale `.tsx` was never reported and the guard
# passed on exactly the file it exists to catch.
# Only what the bundle is built from. The generators run outside the build and
# never reach a page, so editing one was reported as a stale bundle and blocked
# the sweep for no reason.
newest_source="$(find "$HERE" \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' \) -newer "$reference" 2>/dev/null | grep -vE 'entries/|/dist/|/node_modules/|generate-.*\.ts$|rsbuild\.config\.ts$' | head -1)"
if [[ -n "$newest_source" ]]; then
  echo "the build is older than $newest_source" >&2
  echo "run: bun run qa:build   (or set QA_ALLOW_STALE=1 to sweep anyway)" >&2
  # `[[ ... ]] && exit 1` was wrong here: when the test is false the compound
  # returns 1, which is the last status of the script under `set -uo pipefail`
  # and reports a refusal as a clean run. Written out so the exit is explicit.
  if [[ -z "${QA_ALLOW_STALE:-}" ]]; then
    exit 1
  fi
fi

# No staging. The build already emits one page per component, `button.html`
# beside `button.js`, and both the sweep and the host take a page directly, so
# there is nothing to copy anywhere first.

# `--app` is not optional here. Every check resolves through the profile,
# and without one ps-qa panics rather than guessing at an application it
# knows nothing about.
# `--checks` is still passed, but at the standard location rather than a
# project-specific one: ps-qa resolves its default `tests/ps-qa` against the
# working directory, and this script runs from wherever it was invoked.
exec "$PS_QA" --app "$HERE/ps-qa.ron" sweep-components \
  --host "$HOST" \
  --dists "$HERE/dist" \
  --checks "$ROOT/tests/ps-qa" \
  --mode sweep \
  "${ids[@]}"
