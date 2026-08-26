import { describe, expect, it, mock } from "bun:test";
import {
  bindInlineEditWindowDismissal,
  createInlineEditInteractions,
} from "../../../src/components/inline-edit/InlineEdit.interactions";

const setup = (disabled = false) => {
  let value = "Original title";
  const openChanges: boolean[] = [];
  const commits: string[] = [];
  const focus = mock(() => {});
  const select = mock(() => {});
  const field = { value: "", focus, select };
  const interactions = createInlineEditInteractions({
    value: () => value,
    disabled: () => disabled,
    field: () => field,
    onOpenChange: (open) => openChanges.push(open),
    onCommit: (next) => commits.push(next),
  });

  return {
    interactions,
    field,
    focus,
    select,
    openChanges,
    commits,
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
    expect(result.openChanges).toEqual([true]);
    expect(result.focus).toHaveBeenCalledTimes(1);
    expect(result.select).toHaveBeenCalledTimes(1);
  });

  it("does nothing when disabled", async () => {
    const result = setup(true);

    result.interactions.start();
    await Promise.resolve();

    expect(result.interactions.isOpen()).toBeFalse();
    expect(result.openChanges).toEqual([]);
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
    expect(result.openChanges.at(-1)).toBe(false);
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
    expect(result.openChanges.at(-1)).toBe(false);
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

  it("binds window defocus without relying on document-global events", () => {
    const listeners = new Map<string, (event: Event) => void>();
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
    result.interactions.input("Window title");

    const cleanup = bindInlineEditWindowDismissal(
      windowSource,
      result.interactions.windowBlur,
    );
    listeners.get("window:blur")?.(new Event("blur"));

    expect(windowAddEventListener).toHaveBeenCalledTimes(1);
    expect(windowAddEventListener.mock.calls[0]?.[0]).toBe("blur");
    expect(result.interactions.isOpen()).toBeFalse();
    expect(result.commits).toEqual(["Window title"]);

    cleanup();
    expect(windowRemoveEventListener).toHaveBeenCalledTimes(1);
  });

  it("closes when the edited project value changes under a reused component", () => {
    const result = setup();
    result.interactions.start();
    result.interactions.input("Draft from the first project");

    result.setValue("Second project");
    result.interactions.syncValue("Second project");

    expect(result.interactions.isOpen()).toBeFalse();
    expect(result.field.value).toBe("Second project");
    expect(result.commits).toEqual([]);
    expect(result.openChanges.at(-1)).toBe(false);
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
