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
import Button from "../button";
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
  JSX.FormHTMLAttributes<HTMLFormElement>,
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
    "onSubmit",
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
  const resolvedUrls = () => props.store.urls;
  const edit = (name: string, value: string) =>
    setDraft({ ...draft(), [name]: value });

  /*
   * The switch is draft state too, and commits with everything else.
   *
   * Writing the override flags on the flip persisted them immediately, because
   * the store saves on every change: opening the panel, looking, and navigating
   * away left the application overridden with the fields still showing drafts
   * that were never saved. The one control that was not a draft was the one
   * that decides whether any of the others count.
   */
  const setUseCustom = (next: boolean) => setOpen(next);

  /*
   * Save arrives from two places -- the button and the form -- and a renderer
   * decides which. Guarding on re-entry rather than on which event fired: the
   * whole of this runs before the first `await`, so a second call inside the
   * first's flight is the case to refuse, and that is a fact about the
   * operation rather than a guess about event ordering.
   */
  let saving = false;

  const save = async () => {
    if (saving) return;
    saving = true;
    try {
      await commit();
    } finally {
      saving = false;
    }
  };

  const commit = async () => {
    setFailure(undefined);

    const values = new Map(
      props.endpoints.map((endpoint) => [
        endpoint.name,
        fieldValue(endpoint.name),
      ]),
    );

    /*
     * Refused here rather than at the transport. An address that cannot be
     * parsed is saved, fails to connect, and is still saved on the next launch
     * with nothing on screen explaining it.
     */
    if (open()) {
      for (const [name, value] of values) {
        const problem = props.store.validate(name, value);
        if (problem) {
          setFailure(problem);
          props.onSaveFailed?.(new Error(problem));
          return;
        }
      }
    }

    /*
     * Per endpoint, and only for the endpoints this panel shows.
     *
     * `setUseCustom` flips every endpoint the store was configured with,
     * including any this panel does not render, and it marks an endpoint
     * overridden even when its value is the fallback. Both matter later: an
     * endpoint pinned to a value that merely happens to equal today's default
     * stays pinned when that default moves.
     */
    for (const endpoint of props.endpoints) {
      const value = values.get(endpoint.name) ?? "";
      const fallback = props.store.fallbacks[endpoint.name];
      const overridden = open() && value !== "" && value !== fallback;
      props.store.setOverride(endpoint.name, overridden);
      if (overridden) props.store.setUrl(endpoint.name, value);
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
    /*
     * A form, so Enter in a URL field saves. Someone typing an address and
     * pressing Enter is the ordinary way to use this, and on a plain `div` it
     * did nothing at all.
     */
    <form
      {...others}
      {...{
        class: twMerge(
          CLASSES.base,
          open() && CLASSES.flag.open,
          props.store.isApplying && CLASSES.flag.applying,
          props.class,
        ),
      }}
      style={props.style}
      data-theme={props.dataTheme}
      data-slot="connection-settings"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
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
        {/*
          `urls` resolved once for the whole list. It builds its record per
          read, so calling it inside the row made this pass quadratic in the
          number of endpoints for a value that is the same for every row.
        */}
        <For each={props.endpoints}>
          {(endpoint) => (
            <span>
              {props.labels.current ? `${props.labels.current} ` : ""}
              {endpoint.label}: {resolvedUrls()[endpoint.name]}
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

      {/*
        The library's Button, not a bare `<button>`. A component shipped from
        here that styles its own actions is the thing every consuming
        application is told not to do, and these two had none of the disabled,
        focus or flavour states the rest of the library has.
      */}
      <div class={CLASSES.slot.actions}>
        {/*
          `type="button"` with an explicit handler, not a submit button.
          Blitz's form submission builds an entry list and navigates without
          ever dispatching `submit` to script, so a submit button here would
          leave the page rather than save. The surrounding `<form>` still
          carries `onSubmit`, for a browser that submits on Enter.
        */}
        <Button
          type="button"
          flavor="primary"
          disabled={props.store.isApplying}
          onClick={() => void save()}
        >
          {props.labels.save}
        </Button>
        <Button
          type="button"
          flavor="secondary"
          disabled={props.store.isApplying}
          onClick={reset}
        >
          {props.labels.reset}
        </Button>
      </div>
    </form>
  );
};
