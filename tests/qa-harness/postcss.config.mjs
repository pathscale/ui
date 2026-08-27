/*
 * Tailwind, for the harness build only.
 *
 * `src/index.css` declares the design tokens in an `@theme` block, and every
 * component rule bottoms out in Tailwind's own palette (`--color-gray-900` and
 * friends). Without this pass those never resolve: the page renders, and every
 * component in it is transparent and unconstrained. The first harness build
 * showed a Dropdown trigger 1168px wide with `bg=#00000000` for exactly that
 * reason, which reads as a broken component rather than a missing compile step.
 *
 * The library build deliberately does *not* do this. It ships `@theme` raw so
 * the consuming application resolves tokens against its own Tailwind config,
 * which is what AgencyZero does. The harness is a consumer, so it needs its own.
 */
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
