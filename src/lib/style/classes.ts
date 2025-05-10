export type ClassArgs =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassArgs[];

export type ClassProps = {
  class?: ClassArgs;
};

export type OmitUndefined<T> = T extends undefined ? never : T;
export type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;

export type ConfigSchema = Record<string, Record<string, ClassArgs>>;

export type ConfigVariants<T extends ConfigSchema> = {
  [Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | null | undefined;
};
export type ConfigVariantsMulti<T extends ConfigSchema> = {
  [Variant in keyof T]?:
    | StringToBoolean<keyof T[Variant]>
    | StringToBoolean<keyof T[Variant]>[]
    | undefined;
};

export type Config<T> = T extends ConfigSchema
  ? {
      variants?: T;
      defaultVariants?: ConfigVariants<T>;
      compoundVariants?: (T extends ConfigSchema
        ? (ConfigVariants<T> | ConfigVariantsMulti<T>) & ClassProps
        : ClassProps)[];
    }
  : never;

export type VariantKeys<T extends ConfigSchema> = keyof T;
export type VariantProps<Component extends (...args: []) => unknown> = Omit<
  OmitUndefined<Parameters<Component>[0]>,
  "class"
>;
/**
 * Joins classes into a single string.
 *
 * @param args The args to join.
 * @returns A string of joined class names, excluding any falsy values.
 */
export function classes(...args: ClassArgs[]): string {
  return args.flat().filter(Boolean).join(" ");
}

export function falsyToString<T>(value: T): string | T {
  return typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
}

export type CvaProps<T> = T extends ConfigSchema
  ? ConfigVariants<T> & ClassProps
  : ClassProps;

export function cva<T extends ConfigSchema>(
  base?: ClassArgs,
  config?: Config<T>,
) {
  const fn = (props?: CvaProps<T>) => {
    if (config?.variants == null) return classes(base, props?.class);

    const { variants, defaultVariants } = config;

    const getVariantClassNames = Object.keys(variants).map((variant) => {
      const variantProp = props?.[variant as keyof typeof props];
      const defaultVariantProp = defaultVariants?.[variant];

      if (variantProp === null) return null;

      const variantKey = (falsyToString(variantProp) ||
        falsyToString(
          defaultVariantProp,
        )) as keyof (typeof variants)[typeof variant];

      return variants[variant]?.[variantKey];
    });

    const propsWithoutUndefined = Object.entries(props || {}).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );

    const getCompoundVariantClassNames = config?.compoundVariants?.reduce(
      (acc, { class: cvClass, ...compoundVariantOptions }) => {
        const isMatch = Object.entries(compoundVariantOptions).every(
          ([key, value]) => {
            const currentValue = {
              ...defaultVariants,
              ...propsWithoutUndefined,
            }[key];

            return Array.isArray(value)
              ? value.includes(currentValue as string)
              : currentValue === value;
          },
        );

        // biome-ignore lint: valid
        return isMatch ? [...acc, cvClass] : acc;
      },
      [] as ClassArgs[],
    );

    return classes(
      base,
      getVariantClassNames,
      getCompoundVariantClassNames,
      props?.class,
    );
  };

  fn.variantKeys = config?.variants
    ? (Object.keys(config.variants) as VariantKeys<T>[])
    : [];

  return fn;
}
