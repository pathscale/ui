import { describe, expect, it } from "bun:test";
import { applyBooleanStateRequest } from "../../../src/components/_shared/controlledState";

describe("Popover open-state requests", () => {
  it("notifies after changing uncontrolled state", () => {
    let internal = true;
    const changes: boolean[] = [];

    const changed = applyBooleanStateRequest({
      current: internal,
      next: false,
      controlled: false,
      setInternal: (next) => {
        internal = next;
      },
      onChange: (next) => changes.push(next),
    });

    expect(changed).toBe(true);
    expect(internal).toBe(false);
    expect(changes).toEqual([false]);
  });

  it("notifies the owner without mutating controlled state", () => {
    let internal = true;
    const changes: boolean[] = [];

    applyBooleanStateRequest({
      current: true,
      next: false,
      controlled: true,
      setInternal: (next) => {
        internal = next;
      },
      onChange: (next) => changes.push(next),
    });

    expect(internal).toBe(true);
    expect(changes).toEqual([false]);
  });

  it("does not emit duplicate state", () => {
    const changes: boolean[] = [];

    const changed = applyBooleanStateRequest({
      current: false,
      next: false,
      controlled: false,
      setInternal: () => {
        throw new Error("duplicate state must not mutate");
      },
      onChange: (next) => changes.push(next),
    });

    expect(changed).toBe(false);
    expect(changes).toEqual([]);
  });
});
