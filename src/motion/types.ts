export type MotionState = {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
};

export type MotionEasing =
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "linear"
  | ((t: number) => number);

export type MotionTransition = {
  duration?: number;
  easing?: MotionEasing;
  delay?: number;
};

export type MotionPreset = {
  initial: MotionState;
  animate: MotionState;
  exit: MotionState;
  transition?: MotionTransition;
};

export type MotionTokens = {
  durations: Record<string, number>;
  easings: Record<string, MotionEasing>;
  distances: Record<string, number>;
};

export type MotionTokenOverrides = {
  durations?: Partial<Record<string, number>>;
  easings?: Partial<Record<string, MotionEasing>>;
  distances?: Partial<Record<string, number>>;
};

export type MotionDriverOptions = {
  from: number;
  to: number;
  duration: number;
  ease: (t: number) => number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
};

export type MotionDriver = (options: MotionDriverOptions) => {
  stop: () => void;
};
