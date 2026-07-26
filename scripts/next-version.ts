/**
 * Compute the next semver from conventional commits, so releases need no
 * manual version bump.
 *
 * Baseline is the newest version actually on npm — not a git tag. Tags here have
 * drifted before (newest was v1.1.51 while npm was on 1.2.11), and npm is the
 * thing we must not collide with.
 *
 * Bump rules, standard conventional-commits:
 *   BREAKING CHANGE / type!  -> major
 *   feat                     -> minor
 *   fix | perf | revert      -> patch
 *   docs | chore | ci | ...  -> no release on their own
 *
 * Prints the next version to stdout, or nothing if there is no releasable
 * change. Run: bun run scripts/next-version.ts
 */
import { execSync } from "node:child_process";

const PKG = "@pathscale/ui";

const sh = (cmd: string) => execSync(cmd, { encoding: "utf8" }).trim();

/** Newest version on npm, via dist-tags.latest. */
const publishedLatest = (): string => {
  const raw = sh(`npm view ${PKG} version`);
  if (!/^\d+\.\d+\.\d+/.test(raw)) throw new Error(`unexpected npm version: ${raw}`);
  return raw;
};

/**
 * Commits to consider. Prefer the tag matching the published version; if it is
 * missing — which is the normal case here, since tagging lapsed — fall back to
 * the commit that set that version in package.json.
 */
const sinceRef = (version: string): string | null => {
  for (const tag of [`v${version}`, version]) {
    try {
      sh(`git rev-parse --verify --quiet "refs/tags/${tag}"`);
      return tag;
    } catch {
      /* not present */
    }
  }
  // The commit that last touched the version line.
  try {
    const sha = sh(
      `git log -1 --format=%H -S'"version": "${version}"' -- package.json`,
    );
    return sha || null;
  } catch {
    return null;
  }
};

const base = publishedLatest();
const ref = sinceRef(base);
const range = ref ? `${ref}..HEAD` : "HEAD";

const subjects = sh(`git log ${range} --format=%s%x00%b%x1e`)
  .split("\x1e")
  .map((c) => c.trim())
  .filter(Boolean)
  .map((c) => {
    const [subject, body = ""] = c.split("\x00");
    return { subject, body };
  });

let bump: "major" | "minor" | "patch" | null = null;
const rank = { patch: 1, minor: 2, major: 3 } as const;
const raise = (next: "major" | "minor" | "patch") => {
  if (!bump || rank[next] > rank[bump]) bump = next;
};

for (const { subject, body } of subjects) {
  const m = /^(\w+)(\([^)]*\))?(!)?:/.exec(subject);
  if (!m) continue;
  const [, type, , bang] = m;

  if (bang || /^BREAKING[ -]CHANGE:/m.test(body)) {
    raise("major");
    continue;
  }
  if (type === "feat") raise("minor");
  else if (type === "fix" || type === "perf" || type === "revert") raise("patch");
}

if (!bump) {
  process.stderr.write(
    `no releasable commits in ${range} (${subjects.length} inspected)\n`,
  );
  process.exit(0);
}

const [major, minor, patch] = base.split(".").map(Number);
const next =
  bump === "major"
    ? `${major + 1}.0.0`
    : bump === "minor"
      ? `${major}.${minor + 1}.0`
      : `${major}.${minor}.${patch + 1}`;

process.stderr.write(
  `baseline ${base} (from npm), range ${range}, ${subjects.length} commits, bump ${bump}\n`,
);
process.stdout.write(next);
