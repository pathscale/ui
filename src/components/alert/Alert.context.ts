import { createContext, useContext } from "solid-js";

export type AlertStatus =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";

type AlertContextValue = {
  status: () => AlertStatus;
};

export const AlertContext = createContext<AlertContextValue>();

export const useAlertContext = (): AlertContextValue => {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("Alert compound components must be used within <Alert>");
  }
  return ctx;
};
