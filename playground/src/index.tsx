/* @refresh reload */
import { render } from "solid-js/web";
import { animate } from "popmotion";
import { enablePopmotion } from "@pathscale/ui";
import App from "./App";
import "./index.css";

enablePopmotion(animate);

const SUPPORTED_THEMES = new Set(["light", "dark", "custom"]);
const activeTheme = document.documentElement.getAttribute("data-theme");
if (!activeTheme || !SUPPORTED_THEMES.has(activeTheme)) {
  document.documentElement.setAttribute("data-theme", "dark");
}

// biome-ignore lint: root
render(() => <App />, document.getElementById("root")!);
