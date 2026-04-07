/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App";

document.documentElement.setAttribute("data-theme", "dark");

// biome-ignore lint: root
render(() => <App />, document.getElementById("root")!);
