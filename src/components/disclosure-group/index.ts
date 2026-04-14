import type { ComponentProps } from "solid-js";

import DisclosureGroup, { DisclosureGroupRoot } from "./DisclosureGroup";
import { useDisclosureGroupNavigation } from "./useDisclosureGroupNavigation";

export type DisclosureGroupProps = ComponentProps<typeof DisclosureGroupRoot>;
export type DisclosureGroupRootProps = ComponentProps<typeof DisclosureGroupRoot>;
export type UseDisclosureGroupNavigationProps = Parameters<typeof useDisclosureGroupNavigation>[0];
export type UseDisclosureGroupNavigationReturn = ReturnType<typeof useDisclosureGroupNavigation>;

export { DisclosureGroupRoot, useDisclosureGroupNavigation };
export default DisclosureGroup;
