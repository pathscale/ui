import {omit, useContext, createMemo} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "tailwind-merge";
import type { ImmersiveLandingPageProps } from "./types";
import { ImmersiveLandingContext } from "./ImmersiveLandingContext";
import { CLASSES } from "./ImmersiveLanding.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ImmersiveLanding.recipe";

const ImmersiveLandingPage: Layout<typeof componentRecipe, ImmersiveLandingPageProps> = () => {
  const others = omit(props, "id", "children", "class", "style");

  const context = useContext(ImmersiveLandingContext);

  const isActive = createMemo(() => context?.activePage() === props.id);
  const fadeDurationMs = 200;

  const classes = () =>
    twMerge(
      CLASSES.page.base,
      isActive() ? CLASSES.page.active : CLASSES.page.inactive,
      props.class,
    );

  return (
    <section
      id={props.id}
      role="region"
      aria-label={`${props.id} section`}
      {...{ class: classes() }}
      style={{
        "transition-duration": `${fadeDurationMs}ms`,
        "transition-delay": isActive() ? `${fadeDurationMs}ms` : "0ms",
        ...props.style,
      }}
      aria-hidden={!isActive()}
      {...others}
    >
      <div {...{ class: CLASSES.page.content }}>{props.children}</div>
    </section>
  );
};

export default ImmersiveLandingPage;
