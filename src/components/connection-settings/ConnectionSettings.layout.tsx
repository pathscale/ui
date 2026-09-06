import "./ConnectionSettings.css";
import type { JSX } from "@solidjs/web";
import {
  type Component,
  createSignal,
  createUniqueId,
  For,
  omit,
  Show,
} from "solid-js";
import type { ConnectionSettingsStore } from "../../hooks/connection";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import Input from "../input";
import Switch from "../switch";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, componentRecipe } from "./ConnectionSettings.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

/** One backend, as this panel presents it. `name` matches the store's endpoint. */
export type ConnectionSettingsEndpointLabel = {
  name: string;
  label: string;
  /** Shown under the field. The place to say what the default is for. */
  hint?: string;
  placeholder?: string;
};

export type ConnectionSettingsLabels = {
  /** The switch's own label. */
  useCustom: string;
  useCustomDescription?: string;
  appPublicId?: string;
  save: string;
  reset: string;
  /** Prefix for the read-only "this is where you are pointed" lines. */
  current?: string;
};

export type ConnectionSettingsProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onSubmit"
> &
  UIBaseProps & {
    /** From `createConnectionSettings`. The panel reads and writes it directly. */
    store: ConnectionSettingsStore;
    endpoints: readonly ConnectionSettingsEndpointLabel[];
    labels: ConnectionSettingsLabels;
    /** Omit to hide the app id field entirely. */
    showAppPublicId?: boolean;
    /**
     * Rendered inside the revealed region, after the endpoint fields.
     *
     * Every site has one field the others do not: an app id, a second backend,
     * a network selector. Putting them here keeps them inside the same reveal
     * instead of forcing a second copy of the panel.
     */
    children?: JSX.Element;
    /** Called after the store has applied. For a toast, or navigation. */
    onSaved?: () => void;
    /** Called when applying threw. The panel also shows the message itself. */
    onSaveFailed?: (error: unknown) => void;
    onResetDone?: () => void;
  };

/* -------------------------------------------------------------------------------------------------
 * ConnectionSettings
 * -----------------------------------------------------------------------------------------------*/

export const ConnectionSettingsLayout: Layout<
  typeof componentRecipe,
  ConnectionSettingsProps
> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "store",
    "endpoints",
    "labels",
    "showAppPublicId",
    "onSaved",
    "onSaveFailed",
    "onResetDone",
  );

  const uid = createUniqueId();
  const fieldId = (name: string) => `connection-settings-${uid}-${name}`;

  /*
   * The switch reads its own signal rather than the store, and writes to both.
   *
   * Reading `store.state` here would work, but every copy of this panel that
   * got it wrong got it wrong the same way: the flag was read once, outside a
   * tracked scope, so the switch flipped and the fields never appeared. A
   * signal owned by this component cannot be read untracked by accident.
   */
  const [open, setOpen] = createSignal(
    props.endpoints.some((e) => props.store.isOverridden(e.name)),
  );

  /*
   * The fields edit a draft, and Save commits it.
   *
   * Writing straight through to the store on every keystroke is what made the
   * first version of this panel look broken: the "current URL" line updated as
   * you typed, so pressing Save changed nothing you could see and the button
   * read as dead. A draft also gives Reset something to discard.
   */
  const [draft, setDraft] = createSignal<Record<string, string>>({});
  const [appIdDraft, setAppIdDraft] = createSignal<string | undefined>(
    undefined,
  );
  const [failure, setFailure] = createSignal<string | undefined>(undefined);

  const fieldValue = (name: string) =>
    draft()[name] ?? props.store.state.urls[name] ?? "";
  const appIdValue = () => appIdDraft() ?? props.store.state.appPublicId;
  const edit = (name: string, value: string) =>
    setDraft({ ...draft(), [name]: value });

  const setUseCustom = (next: boolean) => {
    setOpen(next);
    props.store.setUseCustom(next);
  };

  const save = async () => {
    setFailure(undefined);
    for (const [name, value] of Object.entries(draft())) {
      props.store.setUrl(name, value);
    }
    const id = appIdDraft();
    if (id !== undefined) props.store.setAppPublicId(id);
    setDraft({});
    setAppIdDraft(undefined);
    try {
      await props.store.apply();
      props.onSaved?.();
    } catch (error) {
      /*
       * A failed apply is the interesting case and it used to vanish: the
       * settings were saved, the reconnect threw, and the panel reported
       * nothing at all. Reported here, and handed to the caller.
       */
      setFailure(error instanceof Error ? error.message : String(error));
      props.onSaveFailed?.(error);
    }
  };

  const reset = async () => {
    setFailure(undefined);
    setDraft({});
    setAppIdDraft(undefined);
    props.store.reset();
    setOpen(false);
    try {
      await props.store.apply();
      props.onResetDone?.();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : String(error));
      props.onSaveFailed?.(error);
    }
  };

  return (
    <div
      {...others}
      {...{
        class: twMerge(
          CLASSES.base,
          open() && CLASSES.flag.open,
          props.store.isApplying && CLASSES.flag.applying,
          props.class,
        ),
      }}
      data-slot="connection-settings"
    >
      <div class={CLASSES.slot.header}>
        <div>
          <p class={CLASSES.slot.title}>{props.labels.useCustom}</p>
          <Show when={props.labels.useCustomDescription}>
            <p class={CLASSES.slot.description}>
              {props.labels.useCustomDescription}
            </p>
          </Show>
        </div>
        <Switch
          class={CLASSES.slot.switch}
          id={fieldId("use-custom")}
          aria-label={props.labels.useCustom}
          checked={open()}
          disabled={props.store.isApplying}
          onChange={() => setUseCustom(!open())}
        />
      </div>

      {/*
        Mounted only while open. `Show` removes the fields from the renderer
        rather than hiding them, which is what makes "the toggle reveals the
        fields" an outcome something can observe.
      */}
      <Show when={open()}>
        <div
          class={CLASSES.slot.fields}
          data-slot="connection-settings-fields"
        >
          <For each={props.endpoints}>
            {(endpoint) => (
              <div class={CLASSES.slot.field}>
                <label
                  class={CLASSES.slot.label}
                  for={fieldId(endpoint.name)}
                >
                  {endpoint.label}
                </label>
                <Input.Field
                  class={CLASSES.slot.input}
                  id={fieldId(endpoint.name)}
                  name={endpoint.name}
                  type="text"
                  aria-label={endpoint.label}
                  placeholder={endpoint.placeholder}
                  value={fieldValue(endpoint.name)}
                  disabled={props.store.isApplying}
                  onInput={(event) =>
                    edit(endpoint.name, event.currentTarget.value)
                  }
                />
                <Show when={endpoint.hint}>
                  <p class={CLASSES.slot.hint}>{endpoint.hint}</p>
                </Show>
              </div>
            )}
          </For>
          {children}
        </div>
      </Show>

      <Show when={props.showAppPublicId && props.labels.appPublicId}>
        <div class={CLASSES.slot.field}>
          <label
            class={CLASSES.slot.label}
            for={fieldId("app-public-id")}
          >
            {props.labels.appPublicId}
          </label>
          <Input.Field
            class={CLASSES.slot.input}
            id={fieldId("app-public-id")}
            type="text"
            aria-label={props.labels.appPublicId}
            value={appIdValue()}
            disabled={props.store.isApplying}
            onInput={(event) => setAppIdDraft(event.currentTarget.value)}
          />
        </div>
      </Show>

      {/* Where the application is actually pointed, overrides resolved. */}
      <div
        class={CLASSES.slot.current}
        data-slot="connection-settings-current"
      >
        <For each={props.endpoints}>
          {(endpoint) => (
            <span>
              {props.labels.current ? `${props.labels.current} ` : ""}
              {endpoint.label}: {props.store.urls[endpoint.name]}
            </span>
          )}
        </For>
      </div>

      {/* A failed apply is named where the person who pressed Save is looking. */}
      <Show when={failure()}>
        <p
          class={CLASSES.slot.hint}
          role="alert"
        >
          {failure()}
        </p>
      </Show>

      <div class={CLASSES.slot.actions}>
        <button
          type="button"
          disabled={props.store.isApplying}
          onClick={save}
        >
          {props.labels.save}
        </button>
        <button
          type="button"
          disabled={props.store.isApplying}
          onClick={reset}
        >
          {props.labels.reset}
        </button>
      </div>
    </div>
  );
};
