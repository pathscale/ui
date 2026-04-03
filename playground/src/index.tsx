/* @refresh reload */
import { render } from "solid-js/web";
import { animate } from "popmotion";
import { enablePopmotion } from "@pathscale/ui";
import App from "./App";
import "./index.css";

enablePopmotion(animate);

// biome-ignore lint: root
render(() => <App />, document.getElementById("root")!);
