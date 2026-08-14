export { AddressLayout as default, AddressLayout as Address } from "./Address.generated";
export type { AddressProps, AddressTruncate } from "./Address.generated";
export { address } from "./Address.recipe";
export {
  truncateAddress,
  copyAddress,
  COPY_FEEDBACK_MS,
  DEFAULT_LEAD,
  DEFAULT_TAIL,
} from "./Address.interactions";
export type { TruncateOptions } from "./Address.interactions";
