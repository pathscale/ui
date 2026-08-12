import { Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import type { Layout } from "solid-layouts";
import type { AlertStatus } from "./Alert.context";
import { AlertContext, useAlertContext } from "./Alert.context";
import { STATUS_ICON } from "./Alert.icons";
import type { alert } from "./Alert.recipe";

/**
 * Alert's markup, and nothing else.
 *
 * The one thing here that is not a tag: the root provides the context. It sits
 * in the markup rather than in a `setup` because the value *is* presentation —
 * `status` is a recipe axis, and `setup` only ever receives behaviour, so the
 * logic layer cannot see it. The alternative was driving the fallback icon
 * from CSS off `[data-status]`, which is the better long-term shape but a
 * larger change than porting one component.
 */

/**
 * `stable.children` rather than a destructured `children`, and this is the one
 * place in the library where the difference bites.
 *
 * `children` is a getter that resolves the JSX. Destructuring it in the
 * parameter list resolves it *here*, before the provider below exists, so the
 * indicator is created outside the context and throws. Reading it inside the
 * provider's children defers resolution into that scope.
 */
export const AlertRootLayout: Layout<typeof alert> = (stable, props) => (
  <AlertContext.Provider value={{ status: () => props.status as AlertStatus }}>
    {/* `data-status` is written here because the recipe mirrors state to
        attributes, and `status` is a presentation prop rather than state.
        Callers and tests already rely on it. */}
    <div
      {...stable.slot.root}
      role="alert"
      data-status={props.status as string}
    >
      {stable.children}
    </div>
  </AlertContext.Provider>
);

export const AlertIndicatorLayout: Layout<typeof alert> = ({
  slot,
  children,
}) => {
  const ctx = useAlertContext();
  return (
    <div {...slot.indicator}>
      <Show
        when={children}
        fallback={<Dynamic component={STATUS_ICON[ctx.status()]} />}
      >
        {children}
      </Show>
    </div>
  );
};

export const AlertContentLayout: Layout<typeof alert> = ({
  slot,
  children,
}) => <div {...slot.content}>{children}</div>;

export const AlertTitleLayout: Layout<typeof alert> = ({ slot, children }) => (
  <p {...slot.title}>{children}</p>
);

export const AlertDescriptionLayout: Layout<typeof alert> = ({
  slot,
  children,
}) => <span {...slot.description}>{children}</span>;
