export type SpringKeyframeOptions = {
  stiffness: number;
  damping: number;
  mass: number;
};

const frameRate = 60;
const maximumDuration = 5;
const precision = 0.001;

/**
 * Sample a unit spring response at 60 Hz. The returned numbers run from 0 to
 * 1 and can be passed as the values for one property in PropertyIndexedKeyframes.
 */
export const springKeyframes = ({
  stiffness,
  damping,
  mass,
}: SpringKeyframeOptions): number[] => {
  if (
    !Number.isFinite(stiffness) ||
    !Number.isFinite(damping) ||
    !Number.isFinite(mass) ||
    stiffness <= 0 ||
    damping < 0 ||
    mass <= 0
  ) {
    return [0, 1];
  }

  const naturalFrequency = Math.sqrt(stiffness / mass);
  const decay = damping / (2 * mass);
  const discriminant = naturalFrequency ** 2 - decay ** 2;
  if (
    !Number.isFinite(naturalFrequency) ||
    !Number.isFinite(decay) ||
    !Number.isFinite(discriminant)
  ) {
    return [0, 1];
  }
  const maximumFrames = Math.ceil(frameRate * maximumDuration);

  let positionAt: (time: number) => number;
  let velocityAt: (time: number) => number;

  if (discriminant > 1e-8) {
    const frequency = Math.sqrt(discriminant);
    positionAt = (time) => {
      const envelope = Math.exp(-decay * time);
      return (
        1 -
        envelope *
          (Math.cos(frequency * time) +
            (decay / frequency) * Math.sin(frequency * time))
      );
    };
    velocityAt = (time) =>
      Math.exp(-decay * time) *
      ((naturalFrequency ** 2 / frequency) * Math.sin(frequency * time));
  } else if (discriminant >= -1e-8) {
    positionAt = (time) =>
      1 - Math.exp(-naturalFrequency * time) * (1 + naturalFrequency * time);
    velocityAt = (time) =>
      naturalFrequency ** 2 * time * Math.exp(-naturalFrequency * time);
  } else {
    const split = Math.sqrt(-discriminant);
    const slowRoot = -decay + split;
    const fastRoot = -decay - split;
    positionAt = (time) =>
      1 +
      (fastRoot / (2 * split)) * Math.exp(slowRoot * time) -
      (slowRoot / (2 * split)) * Math.exp(fastRoot * time);
    velocityAt = (time) =>
      ((fastRoot * slowRoot) / (2 * split)) *
      (Math.exp(slowRoot * time) - Math.exp(fastRoot * time));
  }

  const frames = [0];
  for (let index = 1; index <= maximumFrames; index += 1) {
    const time = index / frameRate;
    const position = positionAt(time);
    frames.push(position);
    if (
      Math.abs(1 - position) <= precision &&
      Math.abs(velocityAt(time)) <= precision
    ) {
      frames.push(1);
      return frames;
    }
  }

  frames.push(1);
  return frames;
};
