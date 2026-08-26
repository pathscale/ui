import { describe, expect, it, mock } from "bun:test";
import { createInlineEditInteractions } from "../../../src/components/inline-edit/InlineEdit.interactions";

const setup = (disabled = false) => {
  let value = "Original title";
  const toggles: Array<[string, boolean | undefined]> = [];
  const commits: string[] = [];
  const focus = mock(() => {});
  const select = mock(() => {});
  const field = { value: "", focus, select };
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

  it("commits on click-away only after the field received focus", () => {
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
