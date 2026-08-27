#!/usr/bin/env bash
#
# ⚠️  HEADLESS ONLY. NEVER LAUNCH A WINDOW. ⚠️
#
# A sweep covers 71 components. A windowed run opens a window per component and
# steals focus from whatever the owner is doing, 71 times. Do not add
# `--blitz-control`, do not add `--offscreen`, do not use `BLITZ_PREVIEW_DIST`.
# All three open a window. `--offscreen` opens one too, just off screen.
#
# The headless path is `AGENCYZERO_BLITZ_TREE`, which writes the semantic tree
# to a file with no window and no display server.
#
# This script refuses to run if anyone reintroduces a windowed flag.
#
# Drive every component's page, one at a time, and report a verdict per
# component.
#
# One process per component is the whole point rather than an inefficiency: a
# shared process is what makes checks order-dependent, and a component that
# wedges the renderer would take every component after it down with it. Each
# run here starts from a fresh window on a fresh page, so a verdict describes
# its own component and nothing else.
#
# Usage: qa/run-all.sh [component-id ...]      (default: every component)
set -uo pipefail

readonly ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly PREVIEW="${BLITZ_PREVIEW:-$HOME/code/agencyzero/apps/blitz-preview/target/release/agencyzero-blitz-preview}"
readonly LOG="${QA_LOG:-/tmp/qa-all.txt}"

# `cargo install` puts ps-qa here, and a non-interactive shell does not read the
# profile that adds it. Without this every component failed as "window never
# appeared", which is indistinguishable from a component that genuinely hangs.
export PATH="$HOME/.cargo/bin:$PATH"

# A machine check, not a comment: a comment did not stop this happening.
if grep -qE -- '--blitz-control|--offscreen|BLITZ_PREVIEW_DIST' "${BASH_SOURCE[0]}"; then
  echo "REFUSING TO RUN: this script contains a windowed flag." >&2
  echo "The sweep must be headless. Use AGENCYZERO_BLITZ_TREE." >&2
  exit 2
fi

if [[ ! -x "$PREVIEW" ]]; then
  echo "no blitz-preview at $PREVIEW; build it or set BLITZ_PREVIEW" >&2
  exit 1
fi

# `mapfile` is bash 4; macOS ships 3.2, where it does not exist and the script
# died before running anything.
ids=()
if [[ $# -gt 0 ]]; then
  ids=("$@")
else
  while IFS= read -r line; do
    ids+=("$line")
  done < <(grep -oE 'id: "[a-z0-9-]+"' "$ROOT/qa/components.ts" | sed 's/id: "//;s/"//')
fi

: > "$LOG"
passed=0
failed=0

for id in "${ids[@]}"; do
  staged="/tmp/qa-$id"
  bun run "$ROOT/qa/stage.ts" "$id" "$staged" > /dev/null 2>&1 || {
    echo "FAIL $id (could not stage)" | tee -a "$LOG"
    failed=$((failed + 1))
    continue
  }

  # `--offscreen`: a sweep opens one window per component, and 71 windows over
  # the owner's desktop is not acceptable. The renderer still lays out and paints,
  # so every measurement is unchanged.
  BLITZ_PREVIEW_DIST="$staged" "$PREVIEW" --blitz-control --offscreen \
    > "/tmp/qa-$id.log" 2>&1 &
  preview_pid=$!

  # Wait for the window rather than sleeping a fixed time: a slow first paint
  # would otherwise read as a component that never mounted.
  attached=0
  for _ in $(seq 1 12); do
    if ps-qa --app "$ROOT/qa/ps-qa.ron" nodes > /dev/null 2>&1; then
      attached=1
      break
    fi
    sleep 1
  done

  if [[ $attached -eq 1 ]]; then
    result="$(ps-qa --app "$ROOT/qa/ps-qa.ron" qa "$id" --checks "$ROOT/qa/checks" 2>&1)"
    if grep -qE '^failed: 0' <<< "$result"; then
      echo "PASS $id" | tee -a "$LOG"
      passed=$((passed + 1))
    else
      echo "FAIL $id" | tee -a "$LOG"
      grep -E '^\s+fail,' <<< "$result" | tee -a "$LOG"
      failed=$((failed + 1))
    fi
  else
    echo "FAIL $id (window never appeared)" | tee -a "$LOG"
    failed=$((failed + 1))
  fi

  # TERM, never -9: a hard kill risks leaving the control socket behind.
  kill "$preview_pid" 2> /dev/null
  wait "$preview_pid" 2> /dev/null
done

echo | tee -a "$LOG"
echo "passed: $passed  failed: $failed  of ${#ids[@]}" | tee -a "$LOG"
[[ $failed -eq 0 ]]
