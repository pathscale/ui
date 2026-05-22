import { describe, expect, it, mock } from "bun:test";
import h from "solid-js/h";
import {
  capturePasswordToggleSnapshot,
  createPasswordFieldInputContract,
  getPasswordInputType,
  preventPasswordTogglePointerDown,
  restorePasswordFieldAfterToggle,
  selectPasswordToggleIcon,
  type PasswordToggleSnapshot,
} from "../../../src/components/password-field/PasswordField";

type MockField = {
  value: string;
  selectionStart: number | null;
  selectionEnd: number | null;
  selectionDirection: "forward" | "backward" | "none" | null;
  focus: ReturnType<typeof mock>;
  setSelectionRange: ReturnType<typeof mock>;
  dispatchEvent: ReturnType<typeof mock>;
};

const createMockField = (overrides: Partial<MockField> = {}): MockField => ({
  value: "secret-pass",
  selectionStart: 2,
  selectionEnd: 5,
  selectionDirection: "forward",
  focus: mock(() => {}),
  setSelectionRange: mock(() => {}),
  dispatchEvent: mock(() => true),
  ...overrides,
});

describe("PasswordField helpers", () => {
  it("switches input type by visibility", () => {
    expect(getPasswordInputType(false)).toBe("password");
    expect(getPasswordInputType(true)).toBe("text");
  });

  it("captures focus/selection/value snapshot", () => {
    const field = createMockField();
    const snapshot = capturePasswordToggleSnapshot(field, field as unknown as EventTarget);

    expect(snapshot.hadFocus).toBeTrue();
    expect(snapshot.selectionStart).toBe(2);
    expect(snapshot.selectionEnd).toBe(5);
    expect(snapshot.selectionDirection).toBe("forward");
    expect(snapshot.valueBeforeToggle).toBe("secret-pass");
  });

  it("restores focus and caret when toggle started focused", () => {
    const field = createMockField();
    const snapshot: PasswordToggleSnapshot = {
      hadFocus: true,
      selectionStart: 1,
      selectionEnd: 4,
      selectionDirection: "backward",
      valueBeforeToggle: "secret-pass",
    };

    restorePasswordFieldAfterToggle(field, snapshot);

    expect(field.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(field.setSelectionRange).toHaveBeenCalledWith(1, 4, "backward");
    expect(field.dispatchEvent).not.toHaveBeenCalled();
  });

  it("restores value and dispatches input when browser desyncs value", () => {
    const field = createMockField({ value: "" });
    const snapshot: PasswordToggleSnapshot = {
      hadFocus: false,
      selectionStart: null,
      selectionEnd: null,
      selectionDirection: null,
      valueBeforeToggle: "typed-password-123",
    };

    restorePasswordFieldAfterToggle(field, snapshot);

    expect(field.value).toBe("typed-password-123");
    expect(field.dispatchEvent).toHaveBeenCalledTimes(1);
    const dispatched = field.dispatchEvent.mock.calls[0]?.[0] as Event;
    expect(dispatched.type).toBe("input");
    expect(field.focus).not.toHaveBeenCalled();
  });

  it("does not dispatch input if value stays in sync", () => {
    const field = createMockField({ value: "typed-password-123" });
    const snapshot: PasswordToggleSnapshot = {
      hadFocus: false,
      selectionStart: null,
      selectionEnd: null,
      selectionDirection: null,
      valueBeforeToggle: "typed-password-123",
    };

    restorePasswordFieldAfterToggle(field, snapshot);

    expect(field.dispatchEvent).not.toHaveBeenCalled();
  });

  it("prevents pointerdown default to preserve focus ownership", () => {
    const preventDefault = mock(() => {});

    preventPasswordTogglePointerDown({ preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("selects hidden/visible custom icons based on visibility state", () => {
    const hidden = h("span", { "data-icon": "hidden" }, "hidden");
    const visible = h("span", { "data-icon": "visible" }, "visible");
    const fallback = h("span", { "data-icon": "fallback" }, "fallback");

    expect(selectPasswordToggleIcon(false, visible, hidden, fallback)).toBe(hidden);
    expect(selectPasswordToggleIcon(true, visible, hidden, fallback)).toBe(visible);
    expect(selectPasswordToggleIcon(true, undefined, undefined, fallback)).toBe(fallback);
  });
});

describe("PasswordField contract", () => {
  it("forwards id/required/autofocus/aria-describedby and disabled state into input contract", () => {
    const contract = createPasswordFieldInputContract({
      id: "pw",
      name: "password",
      label: "Password",
      isVisible: false,
      placeholder: "placeholder",
      required: true,
      autofocus: true,
      autocomplete: "current-password",
      "aria-describedby": "pw-help",
      value: "secret-pass",
      disabled: true,
      invalid: true,
      startIcon: undefined,
      inputClass: "input-class",
    });

    expect(contract.id).toBe("pw");
    expect(contract.name).toBe("password");
    expect(contract.required).toBeTrue();
    expect(contract.autofocus).toBeTrue();
    expect(contract["aria-describedby"]).toBe("pw-help");
    expect(contract.isDisabled).toBeTrue();
    expect(contract.isInvalid).toBeTrue();
    expect(contract.class).toContain("w-full");
    expect(contract.class).toContain("input-class");
  });
});
