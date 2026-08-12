import { recipe } from "solid-layouts";

/**
 * The old slot map put two classes in one string,
 * `"noise-background__layer noise-background__layer--0"`, because the layer
 * needed both and a map of single names could not say so. A slot's `base`
 * takes the pair directly, which is the same output with the structure kept.
 */
export const noiseBackground = recipe({
  component: "noise-background",
  element: "div",
  slots: {
    root: { base: "noise-background" },
    layer0: { base: "noise-background__layer noise-background__layer--0" },
    layer1: { base: "noise-background__layer noise-background__layer--1" },
    layer2: { base: "noise-background__layer noise-background__layer--2" },
    strip: { base: "noise-background__strip" },
    noiseWrap: { base: "noise-background__noise-wrap" },
    noiseImage: { base: "noise-background__noise-image" },
    content: { base: "noise-background__content" },
  },
  props: {
    backdropBlur: { true: "noise-background--backdrop-blur" },
  },
});
