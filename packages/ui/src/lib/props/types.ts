export type OverrideProps<T, P> = Omit<T, keyof P> & P;
