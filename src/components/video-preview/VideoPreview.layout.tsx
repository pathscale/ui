import { type Accessor, type Component, Show, createEffect, onCleanup, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

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
  const [local, others] = splitProps(props, [
    "stream",
    "muted",
    "mirror",
    "dataTheme",
    "class",
    "style",
  ]);

  const muted = () => local.muted ?? true;
  const mirror = () => local.mirror ?? false;

  return (
    <Show when={local.stream()}>
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
            data-theme={local.dataTheme}
            {...{ class: twMerge(mirror() && CLASSES.mirror, local.class) }}
            style={local.style}
          />
        );
      }}
    </Show>
  );
};

export default VideoPreview;
