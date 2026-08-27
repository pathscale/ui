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
# Usage: qa/run-all.sh [component-id ...]      (default: every component)
set -uo pipefail

readonly ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly HOST="${BLITZ_PREVIEW:-$HOME/code/agencyzero/apps/blitz-preview/target/release/agencyzero-blitz-preview}"
readonly DISTS="${QA_DISTS:-/tmp/qa-dists}"

# `cargo install` puts ps-qa here, and a non-interactive shell does not read the
# profile that adds it.
export PATH="$HOME/.cargo/bin:$PATH"

if ! command -v ps-qa > /dev/null; then
  echo "ps-qa is not on PATH; cargo install ps-qa" >&2
  exit 1
fi

if [[ ! -x "$HOST" ]]; then
  echo "no blitz-preview at $HOST; build it or set BLITZ_PREVIEW" >&2
  echo "  cargo build --release --manifest-path \\" >&2
  echo "    ~/code/agencyzero/apps/blitz-preview/Cargo.toml" >&2
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
  done < <(grep -oE 'id: "[a-z0-9-]+"' "$ROOT/qa/components.ts" | sed 's/id: "//;s/"//')
fi

# Build each component's page. One directory per id is the layout
# `sweep-components` expects, and it is also what keeps the components isolated:
# each host is pointed at exactly one component's bundle.
mkdir -p "$DISTS"
for id in "${ids[@]}"; do
  if ! bun run "$ROOT/qa/stage.ts" "$id" "$DISTS/$id" > /dev/null 2>&1; then
    echo "could not stage $id" >&2
    exit 1
  fi
done

# `--app` is not optional here. Every check resolves through the profile,
# and without one ps-qa panics rather than guessing at an application it
# knows nothing about.
exec ps-qa --app "$ROOT/qa/ps-qa.ron" sweep-components \
  --host "$HOST" \
  --dists "$DISTS" \
  --checks "$ROOT/qa/checks" \
  "${ids[@]}"
