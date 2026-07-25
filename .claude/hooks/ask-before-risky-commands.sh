#!/usr/bin/env bash
# Claude Code PreToolUse(Bash) gate — pathscale backend service.
#
# Prompts before prod-affecting / destructive commands in ANY wrapper form
# (env VAR=val …, tool -C <dir> …, chained with ; && |, multi-line, quoted via
# bash -c '…'). For everything else it stays SILENT (exit 0, no decision), so the
# normal permission rules — permissions.allow / ask / deny in .claude/settings.json
# and the session's permission mode — decide as usual.
#
# This is one layer of defense, not a replacement for the permission system: a
# pattern match over a command string is best-effort (quoting and indirection can
# evade any blocklist). It backs up the declarative permissions.ask list in
# .claude/settings.json — KEEP THE TWO IN SYNC — and for fully autonomous runs,
# prefer OS-level sandboxing on top.
#
# Adapted from PakhomovAlexander/project-hub. Edit RISKY_WORDS for this repo;
# tooling; further branches below gate `git`/`docker push`, `git clean`, recursive
# `rm`, `find -delete`, package publishing, PR-merge/release via `gh`, and a deploy
# script run by path. Add your own command families (e.g. `ssh`, a bespoke deploy
# CLI) to RISKY_WORDS, or trim what you don't use — and mirror the change in
# permissions.ask in .claude/settings.json.
set -u

# --- the watchlist: command words that should prompt before running ----------------
RISKY_WORDS="aws|gcloud|az|kubectl|helm|terraform|terragrunt|flyctl|fly"
# -----------------------------------------------------------------------------------

# Pull the command out of the hook's stdin JSON (jq if available, else python3).
if command -v jq >/dev/null 2>&1; then
  cmd="$(jq -r '.tool_input.command // ""' 2>/dev/null)"
else
  cmd="$(python3 -c 'import sys, json; print(json.load(sys.stdin).get("tool_input", {}).get("command", ""))' 2>/dev/null)"
fi

# Couldn't read the command → stay neutral, let normal permission rules decide.
[ -z "$cmd" ] && exit 0

# A command word counts as "at a command position" after start-of-line, whitespace,
# ; & | ( or a quote — and ends before whitespace, a quote, ) ; & | or end-of-line —
# so `bash -c 'git push'` is still seen.
b="(^|[[:space:];&|(\"'\`])"
e="([[:space:];&|)\"'\`]|$)"
# Global options that may sit between a tool and its subcommand (git -C dir push).
opts='([[:space:]]+(-[A-Za-z-]+|[-_A-Za-z0-9]+=[^[:space:]]+|-C[[:space:]]+[^[:space:]]+))*'

re="${b}(${RISKY_WORDS})${e}"
# git push / git clean, docker push — allowing global options before the subcommand.
re="$re|${b}git${opts}[[:space:]]+(push|clean)${e}"
re="$re|${b}docker${opts}[[:space:]]+push${e}"
# recursive rm (-r / -R / -fr / --recursive), with flags/paths in any order.
re="$re|${b}rm([[:space:]]+[^[:space:]]+)*[[:space:]]+(-[A-Za-z]*[rR]|--recursive)"
# find … -delete — irreversible bulk delete.
re="$re|${b}find([[:space:]]+[^[:space:]]+)*[[:space:]]+-delete${e}"
# package publishing — ships artifacts to a registry.
re="$re|${b}(npm|pnpm|yarn|bun|cargo|gem)([[:space:]]+[^[:space:]]+)*[[:space:]]+publish${e}"
re="$re|${b}twine([[:space:]]+[^[:space:]]+)*[[:space:]]+upload${e}"
# gh mutations that merge, ship, or destroy.
re="$re|${b}gh[[:space:]]+(pr[[:space:]]+merge|repo[[:space:]]+delete|release[[:space:]]+(create|delete))${e}"
re="$re|${b}gh[[:space:]]+api([[:space:]]+[^[:space:]]+)*[[:space:]]+(-X|--method)[[:space:]]+(POST|PUT|PATCH|DELETE)${e}"
# a deploy script invoked by path, e.g. ./scripts/deploy.sh — a word-list can't see it.
re="$re|${b}([./A-Za-z0-9_-]*/)?deploy(\.[A-Za-z]+)?${e}"
# WorkTable data migrations and endpoint regeneration rewrite committed artifacts.
re="$re|${b}([./A-Za-z0-9_-]*/)?regenerate_endpoints(\.[A-Za-z]+)?${e}"

if printf '%s\n' "$cmd" | grep -Eq "$re"; then
  printf '%s' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Prod-affecting / destructive command — confirm before running."}}'
fi
# No match → no output: fall through to the normal permission flow.
exit 0
