import {type Accessor, type Component, Show, createEffect, onCleanup, omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";

import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./VideoPreview.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./VideoPreview.recipe";

type VideoPreviewBaseProps = {
  /**
   * Reactive accessor for the MediaStream to display
   */
  stream: Accessor<MediaStream | null>;

  /**
   * Whether the video should be muted
   * @default true
   */
  muted?: boolean;

  /**
   * Whether to mirror the video (applies scaleX(-1))
   * @default false
   */
  mirror?: boolean;
};

export type VideoPreviewProps = VideoPreviewBaseProps &
  UIBaseProps &
  Omit<JSX.VideoHTMLAttributes<HTMLVideoElement>, keyof VideoPreviewBaseProps>;

export const VideoPreview: Layout<typeof componentRecipe, VideoPreviewProps> = () => {
  const others = omit(props, "stream", "muted", "mirror", "dataTheme", "class", "style");

  const muted = () => props.muted ?? true;
  const mirror = () => props.mirror ?? false;

  return (
    <Show when={props.stream()}>
      {(stream) => {
        let videoRef!: HTMLVideoElement;

        createEffect(() => {
          videoRef.srcObject = stream();
        });

        onCleanup(() => {
          videoRef.srcObject = null;
        });

        return (
          <video
            {...others}
            ref={videoRef}
            autoplay
            playsinline
            muted={muted()}
            data-theme={props.dataTheme}
            {...{ class: twMerge(mirror() && CLASSES.mirror, props.class) }}
            style={props.style}
          />
        );
      }}
    </Show>
  );
};

export default VideoPreview;
