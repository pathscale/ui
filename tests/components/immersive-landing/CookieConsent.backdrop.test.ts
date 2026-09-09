import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { dismissesOnBackdropPress } from "../../../src/components/immersive-landing/components/CookieConsent.interactions";

/**
 * Pressing a cookie category must not dismiss the preferences dialog.
 *
 * Measured on two sites: pressing Analytics or Marketing closed the whole
 * dialog and recorded nothing, so no category could ever be changed. The
 * closing backdrop is an ancestor of the panel, and the panel's guard against
 * that was `stopPropagation()` in its own click handler.
 *
 * That guard does not hold in the browser engine the fleet ships.
 * `stopPropagation` is defined there, but event dispatch is deferred: the host
 * has finished propagating by the time it calls into the page, so the call
 * compiles, runs, and does nothing. The engine carries the same intent as an
 * `EventFlags { stop_propagation }` fixed when the listener is registered,
 * which is to say no runtime call can ever express it and no engine fix is
 * coming. `ps-blitz/packages/dom-abi/src/template.rs` and
 * `blitz-wasm/src/events.rs` both say so.
 *
 * Comparing the press target against the element the handler is bound to needs
 * nothing from the engine beyond two properties every event already carries,
 * so it holds in both.
 */

const backdrop = { id: "backdrop" } as unknown as EventTarget;
const panel = { id: "panel" } as unknown as EventTarget;
const categoryCheckbox = { id: "analytics-checkbox" } as unknown as EventTarget;

describe("dismissesOnBackdropPress", () => {
  it("dismisses a press that landed on the backdrop itself", () => {
    expect(
      dismissesOnBackdropPress({ target: backdrop, currentTarget: backdrop }),
    ).toBe(true);
  });

  /*
   * The reported press. Under the shipping engine this event reaches the
   * backdrop handler with propagation already finished, and the only thing
   * that separates it from a real backdrop press is its target.
   */
  it("ignores a press that started on a category control", () => {
    expect(
      dismissesOnBackdropPress({
        target: categoryCheckbox,
        currentTarget: backdrop,
      }),
    ).toBe(false);
  });

  it("ignores a press anywhere else inside the panel", () => {
    expect(
      dismissesOnBackdropPress({ target: panel, currentTarget: backdrop }),
    ).toBe(false);
  });
});

describe("CookieConsent", () => {
  const source = readFileSync(
    join(
      import.meta.dir,
      "../../../src/components/immersive-landing/components/CookieConsent.tsx",
    ),
    "utf8",
  );

  /*
   * The predicate above is only worth having if the backdrop actually asks it.
   * Binding the close handler straight to the backdrop is the bug, and it is a
   * one-token edit away from returning, so read the backdrop's own attributes
   * rather than the file as a whole: the X and Cancel buttons close the dialog
   * directly and should go on doing exactly that.
   */
  const lines = source.split("\n");
  const backdropStart = lines.findIndex((line) =>
    line.includes("CLASSES.cookie.modalBackdrop"),
  );
  const backdropEnd = lines.findIndex(
    (line, index) => index > backdropStart && line.trim() === ">",
  );
  const backdropAttributes = lines.slice(backdropStart, backdropEnd).join("\n");

  it("finds the backdrop element", () => {
    expect(backdropStart).toBeGreaterThan(-1);
    expect(backdropEnd).toBeGreaterThan(backdropStart);
  });

  it("does not bind the close handler straight to the backdrop", () => {
    expect(backdropAttributes).not.toContain("onClick={handleManageClose}");
  });

  it("routes the backdrop press through the predicate", () => {
    expect(backdropAttributes).toContain("onClick={handleBackdropClick}");
    expect(source).toContain("dismissesOnBackdropPress(event)");
  });

  /*
   * A category press sets a signal and Save is what commits it, which is by
   * design and is not what was broken. Both halves have to stay reachable once
   * the dialog stops closing under them, so this pins the wiring the fix
   * exists to make usable.
   */
  it("keeps a category press writing to its own signal", () => {
    expect(source).toContain(
      "onChange={(e) => setAnalyticsEnabled(e.currentTarget.checked)}",
    );
    expect(source).toContain(
      "onChange={(e) => setMarketingEnabled(e.currentTarget.checked)}",
    );
  });

  it("keeps Save committing both signals", () => {
    expect(source).toContain(
      "localStorage.setItem(ANALYTICS_KEY(), analyticsEnabled().toString())",
    );
    expect(source).toContain(
      "localStorage.setItem(MARKETING_KEY(), marketingEnabled().toString())",
    );
    expect(source).toContain('emitChange("custom")');
  });
});
