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
#
# WHAT THIS SWEEP ASSERTS, AND WHAT IT CANNOT
#
# The tree dump carries five tab-separated columns:
#
#     id    role    name    x,y,w,h    visible
#
# which is enough to decide the static expectations: `PaintsNamed` (a node with
# this role and this name), `Paints` (that node has a box with area and is
# visible), and `PaintsMore` against a baseline.
#
# It was not always. The dump used to carry `id role name` only, and the name
# was never on the node that had the role: blitz-dom sets a `value` on the text
# node and links the element to it with `push_labelled_by`, so `Button` and the
# text "Button" were two different nodes. Measured over 71 components, 159 nodes
# had a name and every one had role `TextRun`, so no `role:name` subject could
# match anything. It also carried no geometry, so `Paints` was undecidable.
# Both are fixed in `blitz-preview`'s dump (`main.rs`), which now folds the
# labelling text onto the element and takes boxes from the layout tree.
#
# What it still cannot decide is anything that requires acting on the page:
# `NameChanges`, `Vanishes`, and the `-opens` and `-changes` checks all mean
# "click this, then look again", and a dump is a single still frame written once
# at the end of a headless run. Those need a live socket, which is what ps-qa
# does; they are counted as SKIP here rather than reported as passes, because an
# assertion that cannot fail is not coverage.
#
#
# One process per component is the whole point rather than an inefficiency: a
# shared process is what makes checks order-dependent, and a component that
# wedges the renderer would take every component after it down with it. Each run
# here starts from a fresh page, so a verdict describes its own component and
# nothing else.
#
# Usage: qa/run-all.sh [component-id ...]      (default: every component)
set -uo pipefail

# THE GUARD RUNS FIRST. Nothing executable may be added above it.
#
# A machine check, not a comment: a comment did not stop this happening.
#
# It is first because a guard only protects the lines after it. An earlier
# version sat below the variable block, and a windowed call inserted into that
# block ran nine lines before the refusal could fire, which opened a window on
# the owner's desktop while the script then correctly reported that it was
# refusing to run. Position is the whole protection.
#
# Comments are stripped before the grep runs. The header above has to name the
# banned flags in order to explain them, and a guard that cannot tell an
# explanation from a use fires on its own documentation, which is exactly what
# the first version of this did. Only executable lines are checked.
#
# The patterns are assembled from fragments rather than written whole, because a
# guard that greps for a literal it also contains matches its own source and
# refuses to run every time. Splitting each one keeps the pattern out of the
# file as a contiguous string while still matching any real use.
banned="--blitz""-control|--off""screen|BLITZ_PREVIEW""_DIST="
if sed 's/#.*//' "${BASH_SOURCE[0]}" | grep -v '^banned=' | grep -qE -- "$banned"; then
  echo "REFUSING TO RUN: this script contains a windowed flag on an" >&2
  echo "executable line. The sweep must be headless." >&2
  echo "Use AGENCYZERO_BLITZ_TREE with BLITZ_CAPTURE_DIST." >&2
  exit 2
fi

# Everything executable in this file is below the guard, and the check above
# also enforces that: a windowed flag anywhere, including above this point,
# refuses the run.
readonly ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly PREVIEW="${BLITZ_PREVIEW:-$HOME/code/agencyzero/apps/blitz-preview/target/release/agencyzero-blitz-preview}"
readonly LOG="${QA_LOG:-/tmp/qa-all.txt}"
readonly WORK="${QA_WORK:-/tmp/qa-sweep}"

if [[ ! -x "$PREVIEW" ]]; then
  echo "no blitz-preview at $PREVIEW; build it or set BLITZ_PREVIEW" >&2
  echo "  cargo build --release --features capture \\" >&2
  echo "    --manifest-path ~/code/agencyzero/apps/blitz-preview/Cargo.toml" >&2
  exit 1
fi

# The capture feature is what provides the headless path. Without it the binary
# builds and runs but writes no tree, which would read as 71 components that all
# mounted to nothing.
if ! "$PREVIEW" --help 2>&1 | grep -qi 'capture\|BLITZ_CAPTURE_DIST' \
   && [[ -z "${QA_SKIP_FEATURE_CHECK:-}" ]]; then
  : # --help may not advertise it; the per-component tree check below is the real guard.
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

if [[ ${#ids[@]} -eq 0 ]]; then
  echo "no component ids found in $ROOT/qa/components.ts" >&2
  exit 1
fi

mkdir -p "$WORK"
: > "$LOG"
passed=0
failed=0
skipped=0

# The name a component's page heading renders, taken from `components.ts` so a
# renamed component does not silently stop being checked. `id` and `component`
# sit on adjacent lines of the same record.
component_name_for() {
  local id="$1"
  grep -A4 "id: \"$id\"" "$ROOT/qa/components.ts" \
    | grep -oE 'component: "[^"]+"' \
    | head -1 \
    | sed 's/component: "//;s/"//'
}

for id in "${ids[@]}"; do
  staged="$WORK/dist-$id"
  tree="$WORK/$id.tree"
  png="$WORK/$id.png"
  runlog="$WORK/$id.log"

  rm -f "$tree"

  if ! bun run "$ROOT/qa/stage.ts" "$id" "$staged" > "$runlog" 2>&1; then
    echo "FAIL $id (could not stage)" | tee -a "$LOG"
    failed=$((failed + 1))
    continue
  fi

  # The headless invocation. No window, no display server, no control socket.
  # `BLITZ_CAPTURE_DIST` is the capture path's dist variable and is not the
  # windowed one; the PNG it insists on is written to the work directory and
  # ignored.
  AGENCYZERO_BLITZ_CAPTURE="$png" \
  AGENCYZERO_BLITZ_TREE="$tree" \
  BLITZ_CAPTURE_DIST="$staged" \
    "$PREVIEW" >> "$runlog" 2>&1
  status=$?

  if [[ ! -s "$tree" ]]; then
    if [[ $status -ne 0 ]]; then
      echo "FAIL $id (preview exited $status, no tree; see $runlog)" | tee -a "$LOG"
    else
      echo "FAIL $id (no tree written; is the binary built --features capture?)" | tee -a "$LOG"
    fi
    failed=$((failed + 1))
    continue
  fi

  checks_file="$ROOT/qa/checks/$id.ron"
  if [[ ! -f "$checks_file" ]]; then
    echo "FAIL $id (no checks at $checks_file; run bun run qa:checks)" | tee -a "$LOG"
    failed=$((failed + 1))
    continue
  fi

  # Judge this component's checks against its tree.
  #
  # `judge.awk` holds the actual assertions. It is a separate file because this
  # is the part with real logic in it, and because a check that cannot be
  # decided must be reported as a skip rather than quietly counted either way.
  verdicts="$(awk -f "$ROOT/qa/judge.awk" \
    -v tree="$tree" -v component="$(component_name_for "$id")" \
    "$checks_file")"

  component_failed=0
  while IFS=$'\t' read -r verdict check_id detail; do
    case "$verdict" in
      PASS) passed=$((passed + 1)) ;;
      SKIP) skipped=$((skipped + 1)) ;;
      FAIL)
        failed=$((failed + 1))
        component_failed=1
        echo "  fail, $check_id: $detail" | tee -a "$LOG"
        ;;
    esac
  done <<< "$verdicts"

  n_pass=$(grep -c '^PASS' <<< "$verdicts")
  n_fail=$(grep -c '^FAIL' <<< "$verdicts")
  n_skip=$(grep -c '^SKIP' <<< "$verdicts")

  if [[ $component_failed -eq 0 ]]; then
    echo "PASS $id ($n_pass ok, $n_skip skipped)" | tee -a "$LOG"
  else
    # Print the failure line after its details, so the component being reported
    # on is the last thing on screen next to its verdict.
    echo "FAIL $id ($n_pass ok, $n_fail failed, $n_skip skipped)" | tee -a "$LOG"
    # The named nodes that were there, which is what makes a failure diagnosable
    # rather than just a verdict.
    awk -F'\t' '$3 != "" { printf "    saw: %s [%s] %s\n", $2, $3, $4 }' "$tree" \
      | sort -u | head -10 | tee -a "$LOG"
  fi
done

echo | tee -a "$LOG"
echo "passed: $passed  failed: $failed  of ${#ids[@]} component(s)" | tee -a "$LOG"
echo "skipped: $skipped check(s) a tree dump cannot decide (see the header)" | tee -a "$LOG"
echo "trees and logs: $WORK" | tee -a "$LOG"
[[ $failed -eq 0 ]]
