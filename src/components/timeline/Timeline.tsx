import { type Component, For, type JSX } from "solid-js";
import {
  timelineWrapperClass,
  timelineLineClass,
  timelineItemClass,
  timelineMarkerWrapperClass,
  timelineMarkerClass,
  timelineContentClass,
  timelineNumberClass,
} from "./Timeline.styles";
import { classes } from "@src/lib/style";

type TimelineStage = {
  active?: boolean;
  error?: boolean;
  [key: string]: any;
};

export type TimelineProps<T = TimelineStage> = {
  stages: T[];
  renderStage?: (stage: T, index: number) => JSX.Element;
};

const Timeline: Component<TimelineProps> = (props) => {
  return (
    <ol class={timelineWrapperClass}>
      <For each={props.stages}>
        {(stage, index) => {
          const state =
            stage.error === true
              ? "error"
              : stage.active === true
              ? "active"
              : "default";

          return (
            <li class={timelineItemClass({ state })}>
              <div class={timelineMarkerWrapperClass}>
                <div class={timelineLineClass} />
                <span
                  class={classes(
                    timelineMarkerClass,
                    state === "active" && "bg-green-500",
                    state === "error" && "bg-red-500"
                  )}
                />
                <span class={timelineNumberClass({ state })}>
                  {index() + 1}.
                </span>
              </div>
              <div class={timelineContentClass}>
                {props.renderStage
                  ? props.renderStage(stage, index())
                  : stage.title}
              </div>
            </li>
          );
        }}
      </For>
    </ol>
  );
};

export default Timeline;
