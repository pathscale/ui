import { describe, expect, it, mock } from "bun:test";
import {
  bindInlineEditDismissals,
  createInlineEditInteractions,
} from "../../../src/components/inline-edit/InlineEdit.interactions";

const setup = (disabled = false) => {
  let value = "Original title";
  const toggles: Array<[string, boolean | undefined]> = [];
  const commits: string[] = [];
  const focus = mock(() => {});
  const select = mock(() => {});
  const field = { value: "", focus, select };
  const inside = {} as Node;
  const interactions = createInlineEditInteractions({
    value: () => value,
    disabled: () => disabled,
    root: () => ({
      classList: {
        toggle: (name: string, force?: boolean) => {
          toggles.push([name, force]);
          return Boolean(force);
        },
      } as DOMTokenList,
      contains: (target: Node | null) => target === inside,
    }),
    field: () => field,
    editingClass: "inline-edit--editing",
    onCommit: (next) => commits.push(next),
  });

  return {
    interactions,
    field,
    focus,
    select,
    toggles,
    commits,
    inside,
    setValue: (next: string) => {
      value = next;
    },
  };
};

describe("InlineEdit interactions", () => {
  it("opens from the pencil and focuses the populated field", async () => {
    const result = setup();

    result.interactions.start();
    await Promise.resolve();

    expect(result.interactions.isOpen()).toBeTrue();
    expect(result.field.value).toBe("Original title");
    expect(result.toggles).toEqual([["inline-edit--editing", true]]);
    expect(result.focus).toHaveBeenCalledTimes(1);
    expect(result.select).toHaveBeenCalledTimes(1);
  });

  it("does nothing when disabled", async () => {
    const result = setup(true);

    result.interactions.start();
    await Promise.resolve();

    expect(result.interactions.isOpen()).toBeFalse();
    expect(result.toggles).toEqual([]);
    expect(result.focus).not.toHaveBeenCalled();
  });

  it("Escape restores the current value and closes without committing", () => {
    const result = setup();
    const preventDefault = mock(() => {});
    result.interactions.start();
    result.interactions.input("Abandoned title");
    result.setValue("Current title");

    result.interactions.keyDown("Escape", preventDefault);

    expect(result.field.value).toBe("Current title");
    expect(result.interactions.isOpen()).toBeFalse();
    expect(result.commits).toEqual([]);
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(result.toggles.at(-1)).toEqual(["inline-edit--editing", false]);
  });

  it("closes blank and unchanged drafts without committing", () => {
    const blank = setup();
    blank.interactions.start();
    blank.interactions.input("   ");
    blank.interactions.commit();

    const unchanged = setup();
    unchanged.interactions.start();
    unchanged.interactions.input(" Original title ");
    unchanged.interactions.commit();

    expect(blank.interactions.isOpen()).toBeFalse();
    expect(blank.commits).toEqual([]);
    expect(unchanged.interactions.isOpen()).toBeFalse();
    expect(unchanged.commits).toEqual([]);
  });

  it("commits a trimmed draft and closes", () => {
    const result = setup();
    const preventDefault = mock(() => {});
    result.interactions.start();
    result.interactions.input("  Renamed title  ");

    result.interactions.keyDown("Enter", preventDefault);

    expect(result.commits).toEqual(["Renamed title"]);
    expect(result.interactions.isOpen()).toBeFalse();
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(result.toggles.at(-1)).toEqual(["inline-edit--editing", false]);
  });

  it("commits on blur only after the field received focus", () => {
    const openingBlur = setup();
    openingBlur.interactions.start();
    openingBlur.interactions.input("Should stay open");
    openingBlur.interactions.blur();

    expect(openingBlur.interactions.isOpen()).toBeTrue();
    expect(openingBlur.commits).toEqual([]);

    openingBlur.interactions.focus();
    openingBlur.interactions.blur();

    expect(openingBlur.interactions.isOpen()).toBeFalse();
    expect(openingBlur.commits).toEqual(["Should stay open"]);
  });

  it("commits on an outside pointer even when the destination does not take focus", () => {
    const result = setup();
    result.interactions.start();
    result.interactions.input("Pointer title");

    result.interactions.outside(result.inside);

    expect(result.interactions.isOpen()).toBeTrue();
    expect(result.commits).toEqual([]);

    result.interactions.outside({} as Node);

    expect(result.interactions.isOpen()).toBeFalse();
    expect(result.commits).toEqual(["Pointer title"]);
    expect(result.toggles.at(-1)).toEqual(["inline-edit--editing", false]);
  });

  it("binds pointer and keyboard focus-away through document bubbling", () => {
    const listeners = new Map<string, (event: Event) => void>();
    const addEventListener = mock((type: string, next: (event: Event) => void) => {
      listeners.set(type, next);
    });
    const removeEventListener = mock(() => {});
    const documentSource = {
      addEventListener,
      removeEventListener,
    } as unknown as Pick<Document, "addEventListener" | "removeEventListener">;
    const windowAddEventListener = mock((type: string, next: (event: Event) => void) => {
      listeners.set(`window:${type}`, next);
    });
    const windowRemoveEventListener = mock(() => {});
    const windowSource = {
      addEventListener: windowAddEventListener,
      removeEventListener: windowRemoveEventListener,
    } as unknown as Pick<Window, "addEventListener" | "removeEventListener">;
    const result = setup();
    result.interactions.start();
    result.interactions.input("Keyboard focus title");

    const cleanup = bindInlineEditDismissals(
      documentSource,
      windowSource,
      result.interactions.outside,
      result.interactions.windowBlur,
    );
    listeners.get("focusin")?.({ target: {} as Node } as FocusEvent);

    expect(addEventListener).toHaveBeenCalledTimes(2);
    expect(addEventListener.mock.calls[0]?.length).toBe(2);
    expect(addEventListener.mock.calls[1]?.length).toBe(2);
    expect(result.interactions.isOpen()).toBeFalse();
    expect(result.commits).toEqual(["Keyboard focus title"]);

    cleanup();
    expect(removeEventListener).toHaveBeenCalledTimes(2);
    expect(windowRemoveEventListener).toHaveBeenCalledTimes(1);
  });

  it("closes when the edited project value changes under a reused component", () => {
    const result = setup();
    result.interactions.start();
    result.interactions.input("Draft from the first project");

    result.setValue("Second project");
    result.interactions.syncValue();

    expect(result.interactions.isOpen()).toBeFalse();
    expect(result.field.value).toBe("Second project");
    expect(result.commits).toEqual([]);
    expect(result.toggles.at(-1)).toEqual(["inline-edit--editing", false]);
  });

  it("closes on window defocus", () => {
    const result = setup();
    result.interactions.start();
    result.interactions.input("Window blur title");

    result.interactions.windowBlur();

    expect(result.interactions.isOpen()).toBeFalse();
    expect(result.commits).toEqual(["Window blur title"]);
  });

  it("ignores unrelated keys", () => {
    const result = setup();
    const preventDefault = mock(() => {});
    result.interactions.start();
    result.interactions.input("Draft title");

    result.interactions.keyDown("ArrowRight", preventDefault);

    expect(result.interactions.isOpen()).toBeTrue();
    expect(result.commits).toEqual([]);
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
