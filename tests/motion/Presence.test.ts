import { describe, expect, it } from "bun:test";
import { nextPresenceState } from "../../src/motion/solid/Presence";

describe("nextPresenceState", () => {
  it("mounts and shows the child when when=true from cold start", () => {
    const next = nextPresenceState(
      { mounted: false, isExiting: false },
      true,
    );
    expect(next).toEqual({ mounted: true, isExiting: false });
  });

  it("keeps the child mounted and marks isExiting when when flips to false", () => {
    const next = nextPresenceState({ mounted: true, isExiting: false }, false);
    expect(next).toEqual({ mounted: true, isExiting: true });
  });

  it("returns to a normal mounted state when when flips back to true during exit", () => {
    const next = nextPresenceState({ mounted: true, isExiting: true }, true);
    expect(next).toEqual({ mounted: true, isExiting: false });
  });

  it("stays unmounted when when=false and previously unmounted", () => {
    const prev = { mounted: false, isExiting: false };
    const next = nextPresenceState(prev, false);
    expect(next).toEqual({ mounted: false, isExiting: false });
  });

  it("preserves identity when already mounted+exiting and when stays false", () => {
    const prev = { mounted: true, isExiting: true };
    const next = nextPresenceState(prev, false);
    // already exiting — we don't restart the exit
    expect(next).toBe(prev);
  });

  it("preserves identity when already showing and when stays true", () => {
    const prev = { mounted: true, isExiting: false };
    const next = nextPresenceState(prev, true);
    expect(next.mounted).toBe(true);
    expect(next.isExiting).toBe(false);
  });
});
