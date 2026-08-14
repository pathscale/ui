import type { JSX } from "solid-js";

/**
 * Aggregate status: combining many conditions into one indicator without
 * losing the one fact that matters.
 *
 * A realtime call has at least seven independent conditions — is my internet
 * up, am I on the server, is my mic working, is my camera working, is the
 * other party connected, is their mic working, is their camera working — and
 * the naive answer, "show the worst one", is wrong in the way that costs
 * support time: if the internet is down then six of the seven are also down,
 * and reporting "their camera is off" is true, useless, and sends the user to
 * fix the wrong thing.
 *
 * These conditions are not peers. They form a dependency graph, and the useful
 * report is the **root cause**: the deepest failing item whose own
 * dependencies are all healthy. Everything downstream of it is a symptom.
 */

export type Health = "ok" | "degraded" | "down" | "unknown";

/** Worst first. `degraded` outranks `unknown`: a known impairment beats a shrug. */
const RANK: Record<Health, number> = { down: 3, degraded: 2, unknown: 1, ok: 0 };

export interface StatusItem {
  id: string;
  health: Health;
  /**
   * Whose problem is it. Only `local` is actionable by this user, which is
   * what decides whether to offer a fix or an explanation.
   */
  scope?: "local" | "remote";
  /** Ids this depends on. Internet before server, server before media. */
  dependsOn?: string[];
  label?: JSX.Element;
  detail?: JSX.Element;
  /** Present when the user can do something about it. */
  onRetry?: () => void;
}

export interface StatusSummary {
  /** The worst health present. */
  health: Health;
  /**
   * The item to actually tell the user about: the deepest failure whose own
   * dependencies are healthy. Undefined when everything is `ok`.
   */
  cause?: StatusItem;
  /** Every unhealthy item, worst first — the breakdown behind the summary. */
  failing: StatusItem[];
  /** Failures explained by something upstream. Shown as consequences, not causes. */
  symptoms: StatusItem[];
}

const isUnhealthy = (i: StatusItem) => i.health !== "ok";

/**
 * Combine many conditions into one.
 *
 * `health` is the worst present, so the indicator never looks better than
 * reality. `cause` is the root: an item is only a cause if everything it
 * depends on is healthy, which is what stops "camera off" being reported when
 * the real answer is "no internet".
 *
 * Cycles and unknown ids are tolerated — a dependency that is not in the list
 * counts as healthy, so a partial set still produces a sane answer.
 */
export function summarizeStatus(items: StatusItem[]): StatusSummary {
  const byId = new Map(items.map((i) => [i.id, i]));
  const unhealthy = items.filter(isUnhealthy).sort((a, b) => RANK[b.health] - RANK[a.health]);

  if (unhealthy.length === 0) return { health: "ok", failing: [], symptoms: [] };

  const explainedByUpstream = (item: StatusItem, seen = new Set<string>()): boolean => {
    if (seen.has(item.id)) return false; // cycle: treat as its own cause
    seen.add(item.id);
    return (item.dependsOn ?? []).some((id) => {
      const dep = byId.get(id);
      return dep ? isUnhealthy(dep) : false;
    });
  };

  const causes = unhealthy.filter((i) => !explainedByUpstream(i));
  const symptoms = unhealthy.filter((i) => explainedByUpstream(i));

  // Prefer a cause the user can act on: a local problem with a retry beats a
  // remote one they can only wait out.
  const ranked = [...causes].sort((a, b) => {
    const byHealth = RANK[b.health] - RANK[a.health];
    if (byHealth !== 0) return byHealth;
    const actionable = (i: StatusItem) => (i.scope === "local" ? 1 : 0) + (i.onRetry ? 1 : 0);
    return actionable(b) - actionable(a);
  });

  return {
    health: unhealthy[0].health,
    cause: ranked[0],
    failing: unhealthy,
    symptoms,
  };
}
