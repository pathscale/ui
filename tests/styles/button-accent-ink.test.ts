import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A variant that spends the accent as ink must not be handed a surface.
 *
 * `variant="outline" flavor="neutral"` rendered a completely invisible
 * control. `outline` assigns the accent to both the label colour and the
 * border, and `neutral` sets that accent to `--color-base-300`, which is a
 * surface token by construction: it is the page, one step darker. On a
 * consumer palette it resolved to #e6e4e3 on a #f5f5f4 page. Label contrast
 * 1.16:1, and a capture of the control's own box reported 0 of 1288 pixels
 * different from the background behind it. Correct role, correct name, correct
 * 46x28 box, clickable, invisible.
 *
 * The combination is reachable by any consumer, which is why this is a rule
 * about the cross product rather than a fix to one call site. `--button-accent`
 * is what the accent is *as a surface*; `--button-accent-ink` is what it is
 * *as ink*. A variant has to spend the right one, and a flavor whose accent is
 * a surface has to say what its ink is.
 *
 * These assert the property, not the spelling: the rule is that no ink-spending
 * declaration resolves to a surface token, whatever the flavor is called. A
 * theme adding its own flavor sets `--button-accent` alone and inherits ink
 * from it, which is correct precisely because a theme flavor is an accent
 * colour rather than a page colour.
 */

const read = (...parts: string[]) =>
  readFileSync(join(import.meta.dir, "..", "..", ...parts), "utf8");

const BUTTON_CSS = read("src", "components", "button", "Button.css");
const ALERT_CSS = read("src", "components", "alert", "Alert.css");
const LIGHT_CSS = read("src", "styles", "themes", "light.css");
const DARK_CSS = read("src", "styles", "themes", "dark.css");

/**
 * The tokens that name the page rather than something drawn on it.
 *
 * `base-100/200/300` are the surface ramp and `--b1/--b2/--b3` are their
 * daisy-compatible aliases. Nothing here is legible against the page, because
 * each of them *is* a version of the page.
 */
const SURFACE_TOKENS = new Set([
  "--color-base-100",
  "--color-base-200",
  "--color-base-300",
  "--b1",
  "--b2",
  "--b3",
]);

/** The declarations of one rule, by selector, as authored. */
const ruleBody = (css: string, selector: string): string => {
  const at = css.indexOf(`${selector} {`);
  expect(at, `${selector} is not in the stylesheet`).toBeGreaterThanOrEqual(0);
  return css.slice(at, css.indexOf("\n  }", at));
};

/** Every `--name: value;` in a chunk of CSS, last one winning. */
const declarations = (body: string): Map<string, string> => {
  const found = new Map<string, string>();
  for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    found.set(match[1], match[2].replace(/\s+/g, " ").trim());
  }
  return found;
};

/** The custom properties a value reads through `var()`. */
const references = (value: string): string[] =>
  [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((match) => match[1]);

/**
 * Follow a theme's `--a: var(--b)` chain to whatever it finally names.
 *
 * Stops at the first token that is not itself an alias, which is the one the
 * surface test asks about.
 */
const resolveThemeToken = (themeCss: string, token: string): string => {
  const seen = new Set<string>();
  let current = token;
  while (!seen.has(current)) {
    seen.add(current);
    const match = themeCss.match(
      new RegExp(`${current}\\s*:\\s*var\\(\\s*(--[\\w-]+)\\s*\\)`),
    );
    if (!match) return current;
    current = match[1];
  }
  return current;
};

const FLAVORS = [
  "neutral",
  "primary",
  "secondary",
  "accent",
  "destructive",
  "success",
  "warning",
  "info",
];

describe("the button accent has a separate value for ink", () => {
  it("declares an ink default that follows the accent", () => {
    const root = declarations(ruleBody(BUTTON_CSS, ".button"));
    expect(root.get("--button-accent-ink")).toBe("var(--button-accent)");
  });

  /*
   * The three variants that paint the accent on the page rather than under it.
   * `solid` is deliberately absent: it paints the accent as a background and
   * writes on it with --button-accent-fg, which is the pairing that has always
   * been correct.
   */
  for (const variant of ["outline", "soft", "plain"]) {
    it(`spends ink rather than the accent in ${variant}`, () => {
      const rule = declarations(ruleBody(BUTTON_CSS, `.button--${variant}`));

      for (const property of ["--button-fg", "--button-border"]) {
        const value = rule.get(property);
        if (value === undefined || value === "transparent") continue;
        expect(
          references(value),
          `${variant} paints ${property} with the raw accent`,
        ).not.toContain("--button-accent");
      }

      expect(rule.get("--button-fg")).toBe("var(--button-accent-ink)");
    });
  }

  it("draws the focus ring in ink", () => {
    const focus = BUTTON_CSS.slice(
      BUTTON_CSS.indexOf('.button[data-focus-visible="true"]'),
      BUTTON_CSS.indexOf("\n  }", BUTTON_CSS.indexOf("data-focus-visible")),
    );
    const outline = focus.match(/outline:\s*([^;]+);/)?.[1] ?? "";
    expect(references(outline)).toContain("--button-accent-ink");
    expect(references(outline)).not.toContain("--button-accent");
  });
});

/**
 * The same fault, found by reading the neighbours rather than by a report.
 *
 * Alert shares Button's accent mechanism and spends the accent as ink in
 * exactly one variant, `plain`. Its `outline`, `soft` and `ghost` already read
 * --color-base-content directly, so only `plain` was affected; nothing in the
 * fleet has reported it, and the cross product is reachable the same way.
 */
describe("alert spends ink where it writes on the page", () => {
  it("declares an ink default that follows the accent", () => {
    const root = declarations(ruleBody(ALERT_CSS, ".alert"));
    expect(root.get("--alert-accent-ink")).toBe("var(--alert-accent)");
  });

  it("gives neutral an ink that is not the page", () => {
    const neutral = declarations(ruleBody(ALERT_CSS, ".alert--flavor-neutral"));
    expect(neutral.get("--alert-accent-ink")).toBe("var(--color-base-content)");
  });

  it("writes plain in ink rather than in the accent", () => {
    const plain = declarations(ruleBody(ALERT_CSS, ".alert--plain"));
    expect(plain.get("--alert-fg")).toBe("var(--alert-accent-ink)");
  });
});

describe("no flavor leaves its ink pointing at the page", () => {
  for (const flavor of FLAVORS) {
    it(`resolves ${flavor} ink to something drawn on the page`, () => {
      const rule = declarations(ruleBody(BUTTON_CSS, `.button--flavor-${flavor}`));
      const ink = rule.get("--button-accent-ink") ?? rule.get("--button-accent");
      expect(ink, `${flavor} sets neither an accent nor an ink`).toBeDefined();

      for (const token of references(ink as string)) {
        for (const [theme, css] of [
          ["light", LIGHT_CSS],
          ["dark", DARK_CSS],
        ] as const) {
          const start = resolveThemeToken(css, token);
          expect(
            SURFACE_TOKENS.has(token) || SURFACE_TOKENS.has(start),
            `${flavor} ink is the ${theme} page colour ${token}`,
          ).toBeFalse();
        }
      }
    });
  }
});
