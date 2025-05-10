/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import "./index.css";

// biome-ignore lint: root
render(() => <App />, document.getElementById("root")!);
