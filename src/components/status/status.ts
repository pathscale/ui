import type { JSX } from "@solidjs/web";

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

/**
 * `flapping` earns a value rather than a boolean because it is a condition
 * people name and treat specifically — a link that keeps returning just long
 * enough to look fine is not merely "degraded", and the remedy differs: back
 * off rather than retry harder.
 *
 * It ranks between `degraded` and `reconnecting`. Worse than degraded, because
 * nothing can be relied on; better than reconnecting, because it does work
 * sometimes.
 *
 * `reconnecting` is a value for the same reason: it is a condition a user asks
 * about by name — "was I ever connected?" — and it is not `down`, because down
 * is over and this is in progress.
 *
 * `connecting` and `reconnecting` are separate values because a user reads
 * them differently: the first says be patient, the second says something that
 * was working just broke. "Was I ever connected?" is the question, and only
 * `reconnecting` carries evidence that the answer is yes.
 *
 *   down > reconnecting > connecting > flapping > degraded > unknown > ok
 *
 * `connecting` outranks `flapping` because a flapping link at least serves
 * some traffic, and outranks nothing above it because a first attempt is
 * expected rather than broken.
 */
export type Health =
  | "ok"
  | "degraded"
  | "flapping"
  | "connecting"
  | "reconnecting"
  | "down"
  | "unknown";

/**
 * How well it is working, given that it *is* working.
 *
 * Orthogonal to `Health` on purpose. nofilter.io proves the need: a call can
 * be `connected` and simultaneously "Quality critical", which is why its chip
 * ends up concatenating two sentences with a separator. Folding quality into
 * health would force a choice between "up" and "bad" when both are true.
 */
export type Quality = "good" | "fair" | "poor" | "unknown";

/** Worst first. `degraded` outranks `unknown`: a known impairment beats a shrug. */
const RANK: Record<Health, number> = {
  down: 6,
  reconnecting: 5,
  connecting: 4,
  flapping: 3,
  degraded: 2,
  unknown: 1,
  ok: 0,
};

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

  /** Working, but how well. Independent of `health`. */
  quality?: Quality;

  /**
   * Can this recover on its own?
   *
   * ICE distinguishes `disconnected` — dropped, may come back — from `failed`,
   * which will not. That difference decides whether the UI shows a spinner or
   * a retry button, and collapsing both to `down` loses it.
   */
  recoverable?: boolean;

  /** Mid-transition: connecting, checking, reconnecting. Drives the pulse. */
  transitioning?: boolean;

  /**
   * Has this ever been healthy in this session?
   *
   * The difference between "Connecting" and "Reconnecting", which the user
   * reads very differently: the first says be patient, the second says
   * something that was working just broke. Same spinner, different sentence.
   */
  everHealthy?: boolean;

  /**
   * How many times this has flipped recently.
   *
   * Flapping is worse than being cleanly down: the connection keeps coming
   * back just long enough for the app to re-run its reconnect work, and a
   * chip that says "connected" between flaps is lying about the experience.
   */
  recentChanges?: number;
}

/** Flips within the window above which a connection is treated as unstable. */
export const FLAPPING_THRESHOLD = 3;

export interface StatusSummary {
  /**
   * The worst health among **causes**, not symptoms.
   *
   * Symptoms inherit their severity from what broke them, so counting them
   * would report the consequence and bury the cause: a server that is
   * reconnecting takes its media down with it, and "reconnecting" is both
   * truer and more useful than "down".
   */
  health: Health;
  /** Worst quality among items that are otherwise healthy. */
  quality: Quality;
  /**
   * What to call the attempt in progress, if any.
   *
   * `connecting` has never worked; `reconnecting` did and stopped. Answers
   * "was I ever connected?", which is the question behind the spinner.
   */
  attempting?: "connecting" | "reconnecting";
  /** Flipping repeatedly. Not the same as down, and worse to live with. */
  flapping: boolean;
  /** True when the only problems can recover on their own — wait, do not retry. */
  recovering: boolean;
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
export function summarizeStatus(input: StatusItem[]): StatusSummary {
  // A declared health of `flapping` wins; otherwise enough recent flips is
  // what flapping *means*, so it is derived rather than left to the caller.
  const items = input.map((i) => {
    if (
      i.health === "flapping" ||
      i.health === "reconnecting" ||
      i.health === "connecting"
    ) {
      return i;
    }
    // Enough recent flips is what flapping means, so derive rather than ask.
    if ((i.recentChanges ?? 0) >= FLAPPING_THRESHOLD)
      return { ...i, health: "flapping" as const };
    // Trying, and whether it ever worked is the whole distinction.
    if (i.transitioning && isUnhealthy(i)) {
      return {
        ...i,
        health: i.everHealthy
          ? ("reconnecting" as const)
          : ("connecting" as const),
      };
    }
    return i;
  });
  const byId = new Map(items.map((i) => [i.id, i]));
  const unhealthy = items
    .filter(isUnhealthy)
    .sort((a, b) => RANK[b.health] - RANK[a.health]);

  const worstQuality = (list: StatusItem[]): Quality => {
    const rank: Record<Quality, number> = {
      poor: 3,
      fair: 2,
      unknown: 1,
      good: 0,
    };
    return list.reduce<Quality>(
      (worst, i) =>
        i.quality && rank[i.quality] > rank[worst] ? i.quality : worst,
      "good",
    );
  };

  const flapping = items.some((i) => i.health === "flapping");

  const attempting = (list: StatusItem[]): StatusSummary["attempting"] => {
    const trying = list.find((i) => i.transitioning);
    if (!trying) return undefined;
    return trying.everHealthy ? "reconnecting" : "connecting";
  };

  if (unhealthy.length === 0) {
    return {
      health: "ok",
      // A connection that keeps dropping is not a good one, whatever it says
      // between flaps.
      quality: flapping ? "poor" : worstQuality(items),
      attempting: attempting(items),
      flapping,
      recovering: false,
      failing: [],
      symptoms: [],
    };
  }

  const explainedByUpstream = (
    item: StatusItem,
    seen = new Set<string>(),
  ): boolean => {
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
    const actionable = (i: StatusItem) =>
      (i.scope === "local" ? 1 : 0) + (i.onRetry ? 1 : 0);
    return actionable(b) - actionable(a);
  });

  return {
    // Worst among *causes*, not symptoms. A symptom's severity is inherited
    // from whatever broke it, so letting "media down" outrank "server
    // reconnecting" would report the consequence and hide the fact that
    // something is actively recovering.
    health: ranked[0]?.health ?? unhealthy[0].health,
    quality: flapping
      ? "poor"
      : worstQuality(items.filter((i) => !isUnhealthy(i))),
    attempting: attempting(unhealthy),
    flapping,
    // Only claim recovery when every failure can recover and something is trying.
    recovering:
      unhealthy.every((i) => i.recoverable !== false) &&
      unhealthy.some((i) => i.transitioning || i.recoverable),
    cause: ranked[0],
    failing: unhealthy,
    symptoms,
  };
}

/* -------------------------------------------------------------------------------------------------
 * Transitions
 *
 * `connected` is a state — you are in it for hours. "Became connected" is an
 * event — it happens at an instant. Both are real and they are not the same
 * thing, and the confusion between them is why `quality-restored` feels odd:
 * it is an event wearing a state's clothes. It is the *transition* into better
 * quality, rendered for a few seconds and then gone.
 *
 * Transitions have to be emitted rather than merely rendered, because
 * reconnecting commonly triggers work elsewhere: refetch what went stale,
 * resubscribe channels, flush queued writes, re-authenticate, resync. An
 * indicator that only paints a colour leaves every app to diff the state
 * itself, which is where missed resubscribes come from.
 * -----------------------------------------------------------------------------------------------*/

export interface StatusTransition {
  previous: StatusSummary;
  current: StatusSummary;
  /** Items that just became unhealthy. */
  degraded: StatusItem[];
  /** Items that just became healthy — what "reconnected" is made of. */
  recovered: StatusItem[];
  /** Overall health changed direction. */
  healthChanged: boolean;
  /** Quality moved while health stayed put — nofilter's `quality-restored`/`unstable`. */
  qualityChanged: boolean;
}

const QUALITY_RANK: Record<Quality, number> = {
  poor: 3,
  fair: 2,
  unknown: 1,
  good: 0,
};

/**
 * Diff two summaries into the transition between them.
 *
 * Pure, so the caller owns when to run it and how long to show anything. A
 * transient like "quality restored" is `qualityChanged` plus an improvement,
 * displayed for a while by whoever is rendering — the model does not hold a
 * timer, because a timer in a pure function is how you get a status that lies
 * after a tab has been backgrounded.
 */
export function diffStatus(
  previous: StatusSummary,
  current: StatusSummary,
  items: { previous: StatusItem[]; current: StatusItem[] },
): StatusTransition {
  const wasUnhealthy = new Set(
    items.previous.filter(isUnhealthy).map((i) => i.id),
  );
  const isNowUnhealthy = new Set(
    items.current.filter(isUnhealthy).map((i) => i.id),
  );

  return {
    previous,
    current,
    degraded: items.current.filter(
      (i) => isNowUnhealthy.has(i.id) && !wasUnhealthy.has(i.id),
    ),
    recovered: items.current.filter(
      (i) => !isNowUnhealthy.has(i.id) && wasUnhealthy.has(i.id),
    ),
    healthChanged: previous.health !== current.health,
    qualityChanged:
      QUALITY_RANK[previous.quality] !== QUALITY_RANK[current.quality],
  };
}
