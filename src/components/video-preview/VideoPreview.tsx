import { type Accessor, type Component, Show, createEffect, onCleanup, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./VideoPreview.classes";

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
  IComponentBaseProps &
  Omit<JSX.VideoHTMLAttributes<HTMLVideoElement>, keyof VideoPreviewBaseProps>;

export const VideoPreview: Component<VideoPreviewProps> = (props) => {
  const [local, others] = splitProps(props, [
    "stream",
    "muted",
    "mirror",
    "dataTheme",
    "class",
    "className",
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
            {...{ class: twMerge(mirror() && CLASSES.mirror, local.class, local.className) }}
            style={local.style}
          />
        );
      }}
    </Show>
  );
};

export default VideoPreview;
