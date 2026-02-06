import { createContext, useContext } from "solid-js";
import type { ImmersiveLandingContextValue } from "./types";

export const ImmersiveLandingContext = createContext<ImmersiveLandingContextValue>();

export function useImmersiveLandingContext() {
  const context = useContext(ImmersiveLandingContext);
  if (!context) {
    throw new Error("useImmersiveLandingContext must be used within an ImmersiveLanding component");
  }
  return context;
}
