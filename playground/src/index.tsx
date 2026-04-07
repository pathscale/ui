/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import "./index.css";

document.documentElement.setAttribute("data-theme", "dark");

// biome-ignore lint: root
render(() => <App />, document.getElementById("root")!);
