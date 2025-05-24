import SelectShowcase from "../../src/components/select/SelectShowcase";
import CheckboxShowcase from "../../src/components/checkbox/CheckboxShowcase";

import { createSignal, onMount } from "solid-js";

import ButtonShowcase from "../../src/components/button/ButtonShowcase";
import InputShowcase from "../../src/components/input/InputShowcase";

const NAV_ITEMS = [
  { id: "button", label: "Button" },
  { id: "input", label: "Input" },
];


export default function App() {
  const [theme, setTheme] = createSignal<"light" | "dark">("light");

  onMount(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  });

  const toggleTheme = () => {
    const next = theme() === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <main class="min-h-screen">
      <SelectShowcase />
    </main>
  );
}
