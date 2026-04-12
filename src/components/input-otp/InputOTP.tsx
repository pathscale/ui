import "./InputOTP.css";
import {
  For,
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onMount,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type InputOTPVariant = "primary" | "secondary";

const VARIANT_CLASS_MAP: Record<InputOTPVariant, string> = {
  primary: "input-otp--primary",
  secondary: "input-otp--secondary",
};

export const REGEXP_ONLY_DIGITS = "^\\d+$";
export const REGEXP_ONLY_CHARS = "^[a-zA-Z]+$";
export const REGEXP_ONLY_DIGITS_AND_CHARS = "^[a-zA-Z0-9]+$";

type InputOTPContextValue = {
  value: Accessor<string>;
  chars: Accessor<string[]>;
  maxLength: Accessor<number>;
  variant: Accessor<InputOTPVariant>;
  isDisabled: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  isFocused: Accessor<boolean>;
  activeIndex: Accessor<number>;
  setActiveIndex: (index: number) => void;
  focusInputAt: (index: number) => void;
};

const InputOTPContext = createContext<InputOTPContextValue>();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const invokeEventHandler = <T extends Event>(handler: unknown, event: T) => {
  if (typeof handler === "function") {
    (handler as (event: T) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type InputOTPRootProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange" | "onInput"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    maxLength?: number;
    variant?: InputOTPVariant;
    pattern?: string;
    name?: string;
    autoFocus?: boolean;
    isDisabled?: boolean;
    disabled?: boolean;
    isInvalid?: boolean;
    inputClassName?: string;
    inputMode?: JSX.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  };

export type InputOTPGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type InputOTPSlotProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    index: number;
  };

export type InputOTPSeparatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

const InputOTPRoot: ParentComponent<InputOTPRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "value",
    "defaultValue",
    "onChange",
    "onComplete",
    "maxLength",
    "variant",
    "pattern",
    "name",
    "autoFocus",
    "isDisabled",
    "disabled",
    "isInvalid",
    "inputClassName",
    "inputMode",
    "onMouseDown",
    "onFocusOut",
    "aria-invalid",
    "ref",
  ]);

  let inputRef: HTMLInputElement | undefined;
  let rootRef: HTMLDivElement | undefined;

  const [internalValue, setInternalValue] = createSignal(local.defaultValue ?? "");
  const [activeIndex, setActiveIndexSignal] = createSignal(0);
  const [isFocused, setIsFocused] = createSignal(false);

  const maxLength = () => {
    const parsed = Number(local.maxLength);
    if (!Number.isFinite(parsed)) return 6;
    return Math.max(1, Math.floor(parsed));
  };

  const patternRegex = createMemo(() => {
    if (!local.pattern) return undefined;

    try {
      return new RegExp(local.pattern);
    } catch {
      return undefined;
    }
  });

  const isAllowedCharacter = (char: string) => {
    const regex = patternRegex();
    if (!regex) return true;
    return regex.test(char);
  };

  const sanitizeValue = (rawValue: string | undefined) => {
    if (!rawValue) return "";

    const result: string[] = [];
    for (const char of Array.from(rawValue)) {
      if (!isAllowedCharacter(char)) continue;
      result.push(char);
      if (result.length >= maxLength()) break;
    }

    return result.join("");
  };

  const normalizedControlledValue = createMemo(() => sanitizeValue(local.value ?? ""));

  const value = createMemo(() =>
    local.value !== undefined ? normalizedControlledValue() : sanitizeValue(internalValue()),
  );

  const chars = createMemo(() => {
    const current = value();
    return Array.from({ length: maxLength() }, (_, index) => current[index] ?? "");
  });

  const variant = () => local.variant ?? "primary";
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const isInvalid = () =>
    Boolean(local.isInvalid) ||
    Boolean(local["aria-invalid"]) ||
    local["aria-invalid"] === "true";

  const setValue = (nextValue: string) => {
    const normalized = sanitizeValue(nextValue);
    const current = value();

    if (normalized === current) return;

    if (local.value === undefined) {
      setInternalValue(normalized);
    }

    local.onChange?.(normalized);

    if (normalized.length === maxLength()) {
      local.onComplete?.(normalized);
    }
  };

  const normalizeIndex = (index: number) => {
    const bounded = clamp(index, 0, maxLength());
    return bounded;
  };

  const resolveActiveSlot = (caret: number) => {
    const bounded = normalizeIndex(caret);

    if (bounded >= maxLength()) {
      return maxLength() - 1;
    }

    return bounded;
  };

  const syncActiveFromInputCaret = () => {
    const caret = inputRef?.selectionStart;

    if (caret == null) {
      const firstEmpty = chars().findIndex((char) => char.length === 0);
      setActiveIndexSignal(firstEmpty >= 0 ? firstEmpty : maxLength() - 1);
      return;
    }

    setActiveIndexSignal(resolveActiveSlot(caret));
  };

  const focusInputAt = (index: number) => {
    if (isDisabled()) return;

    const bounded = normalizeIndex(index);
    const input = inputRef;
    if (!input) return;

    input.focus();
    input.setSelectionRange(bounded, bounded);
    setActiveIndexSignal(resolveActiveSlot(bounded));
  };

  const handleRootMouseDown: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onMouseDown, event);
    if (event.defaultPrevented || isDisabled()) return;

    const target = event.target as HTMLElement;
    if (target.closest('[data-slot="input-otp-slot"]')) return;

    event.preventDefault();
    focusInputAt(value().length);
  };

  const handleFocusOut: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onFocusOut, event);
    if (event.defaultPrevented) return;

    const nextTarget = event.relatedTarget as Node | null;
    if (rootRef?.contains(nextTarget)) return;

    setIsFocused(false);
  };

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    if (isDisabled()) return;

    setValue(event.currentTarget.value);
    queueMicrotask(syncActiveFromInputCaret);
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = (event) => {
    if (event.defaultPrevented || isDisabled()) return;

    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "Backspace" ||
      event.key === "Delete" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      queueMicrotask(syncActiveFromInputCaret);
    }
  };

  createEffect(() => {
    const current = value();
    if (current.length > maxLength()) {
      setValue(current.slice(0, maxLength()));
    }
  });

  createEffect(() => {
    if (local.value !== undefined) return;

    const normalized = sanitizeValue(internalValue());
    if (normalized !== internalValue()) {
      setInternalValue(normalized);
    }
  });

  createEffect(() => {
    if (!isFocused()) return;

    const active = clamp(activeIndex(), 0, maxLength());
    inputRef?.setSelectionRange(active, active);
  });

  onMount(() => {
    if (!local.autoFocus || isDisabled()) return;
    queueMicrotask(() => {
      focusInputAt(value().length);
    });
  });

  return (
    <InputOTPContext.Provider
      value={{
        value,
        chars,
        maxLength,
        variant,
        isDisabled,
        isInvalid,
        isFocused,
        activeIndex,
        setActiveIndex: (index) => setActiveIndexSignal(resolveActiveSlot(index)),
        focusInputAt,
      }}
    >
      <div
        {...others}
        ref={(node) => {
          rootRef = node;
          if (typeof local.ref === "function") {
            local.ref(node);
          }
        }}
        class={twMerge(
          "input-otp",
          VARIANT_CLASS_MAP[variant()],
          local.class,
          local.className,
        )}
        data-slot="input-otp"
        data-disabled={isDisabled() ? "true" : undefined}
        data-invalid={isInvalid() ? "true" : undefined}
        data-theme={local.dataTheme}
        style={local.style}
        onMouseDown={handleRootMouseDown}
        onFocusOut={handleFocusOut}
      >
        <input
          ref={inputRef}
          class={twMerge("input-otp__input", local.inputClassName)}
          data-slot="input-otp-input"
          type="text"
          inputMode={local.inputMode}
          pattern={local.pattern}
          maxLength={maxLength()}
          value={value()}
          name={local.name}
          disabled={isDisabled()}
          aria-disabled={isDisabled() ? "true" : undefined}
          aria-invalid={isInvalid() ? "true" : undefined}
          autocomplete="one-time-code"
          onFocus={() => {
            setIsFocused(true);
            syncActiveFromInputCaret();
          }}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onSelect={() => syncActiveFromInputCaret()}
        />

        {local.children ?? (
          <InputOTPGroup>
            <For each={Array.from({ length: maxLength() }, (_, index) => index)}>
              {(index) => <InputOTPSlot index={index} />}
            </For>
          </InputOTPGroup>
        )}
      </div>
    </InputOTPContext.Provider>
  );
};

const InputOTPGroup: ParentComponent<InputOTPGroupProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      class={twMerge("input-otp__group", local.class, local.className)}
      data-slot="input-otp-group"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const InputOTPSlot: Component<InputOTPSlotProps> = (props) => {
  const context = useContext(InputOTPContext);

  const [local, others] = splitProps(props, [
    "index",
    "class",
    "className",
    "dataTheme",
    "style",
    "onMouseDown",
  ]);

  const char = () => context?.chars()[local.index] ?? "";
  const isActive = () =>
    Boolean(context?.isFocused()) &&
    !Boolean(context?.isDisabled()) &&
    (context?.activeIndex() ?? 0) === local.index;

  const handleMouseDown: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onMouseDown, event);
    if (event.defaultPrevented || context?.isDisabled()) return;

    event.preventDefault();
    context?.setActiveIndex(local.index);
    context?.focusInputAt(local.index);
  };

  return (
    <div
      {...others}
      class={twMerge("input-otp__slot", local.class, local.className)}
      data-slot="input-otp-slot"
      data-active={isActive() ? "true" : undefined}
      data-filled={char().length > 0 ? "true" : undefined}
      data-disabled={context?.isDisabled() ? "true" : undefined}
      data-invalid={context?.isInvalid() ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
      onMouseDown={handleMouseDown}
    >
      <Show when={char().length > 0}>
        <div class="input-otp__slot-value" data-slot="input-otp-slot-value">
          {char()}
        </div>
      </Show>
      <Show when={isActive() && char().length === 0}>
        <div class="input-otp__caret" data-slot="input-otp-caret" />
      </Show>
    </div>
  );
};

const InputOTPSeparator: ParentComponent<InputOTPSeparatorProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      class={twMerge("input-otp__separator", local.class, local.className)}
      data-slot="input-otp-separator"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const InputOTP = Object.assign(InputOTPRoot, {
  Root: InputOTPRoot,
  Group: InputOTPGroup,
  Slot: InputOTPSlot,
  Separator: InputOTPSeparator,
});

export default InputOTP;
export {
  InputOTP,
  InputOTPRoot,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
};
export type { InputOTPRootProps as InputOTPProps };
