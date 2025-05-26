import { createSignal, onMount } from "solid-js";

import AccordionShowcase from "../../src/components/accordion/AccordionShowcase";
import AlertShowcase from "../../src/components/alert/AlertShowcase";
import AvatarShowcase from "../../src/components/avatar/AvatarShowcase";
import BadgeShowcase from "../../src/components/badge/BadgeShowcase";
import BreadcrumbsShowcase from "../../src/components/breadcrumbs/BreadcrumbShowcase";
import ButtonShowcase from "../../src/components/button/ButtonShowcase";
import CheckboxShowcase from "../../src/components/checkbox/CheckboxShowcase";
import FileInputShowcase from "../../src/components/fileinput/FileInputShowcase";
import InputShowcase from "../../src/components/input/InputShowcase";
import MenuShowcase from "../../src/components/menu/MenuShowcase";
import ModalShowcase from "../../src/components/modal/ModalShowcase";
import PaginationShowcase from "../../src/components/pagination/PaginationShowcase";
import SelectShowcase from "../../src/components/select/SelectShowcase";
import StepsShowcase from "../../src/components/steps/StepsShowcase";
import SwapShowcase from "../../src/components/swap/SwapShowcase";
import TextareaShowcase from "../../src/components/textarea/TextareaShowcase";
import ToastShowcase from "../../src/components/toast/ToastShowcase";
import ToggleShowcase from "../../src/components/toggle/ToggleShowcase";
import TooltipShowcase from "../../src/components/tooltip/TooltipShowcase";

export default function App() {
  const [theme, setTheme] = createSignal<"light" | "dark">("light");

  const items = [
    { id: "accordion", label: "Accordion" },
    { id: "alert", label: "Alert" },
    { id: "avatar", label: "Avatar" },
    { id: "badge", label: "Badge" },
    { id: "bottom-navigation", label: "Bottom Navigation" },
    { id: "breadcrumbs", label: "Breadcrumbs" },
    { id: "button", label: "Button" },
    { id: "card", label: "Card" },
    { id: "carousel", label: "Carousel" },
    { id: "chat-bubble", label: "Chat Bubble" },
    { id: "checkbox", label: "Checkbox" },
    { id: "countdown", label: "Countdown" },
    { id: "data-display", label: "Data Display" },
    { id: "data-input", label: "Data Input" },
    { id: "diff", label: "Diff" },
    { id: "dropdown-a", label: "Dropdown" },
    { id: "file-input", label: "File Input" },
    { id: "feedback", label: "Feedback" },
    { id: "input", label: "Input" },
    { id: "kbd", label: "Kbd" },
    { id: "link", label: "Link" },
    { id: "menu", label: "Menu" },
    { id: "modal", label: "Modal" },
    { id: "navbar-a", label: "Navbar" },
    { id: "pagination", label: "Pagination" },
    { id: "progress", label: "Progress" },
    { id: "radio", label: "Radio" },
    { id: "radial-progress", label: "Radial Progress" },
    { id: "range", label: "Range" },
    { id: "rating", label: "Rating" },
    { id: "select", label: "Select" },
    { id: "skeleton", label: "Skeleton" },
    { id: "stats", label: "Stats" },
    { id: "steps", label: "Steps" },
    { id: "swap", label: "Swap" },
    { id: "table", label: "Table" },
    { id: "tabs", label: "Tabs" },
    { id: "textarea", label: "Textarea" },
    { id: "timeline", label: "Timeline" },
    { id: "toast", label: "Toast" },
    { id: "toggle", label: "Toggle" },
    { id: "tooltip", label: "Tooltip" },
  ];

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
    <div class="flex min-h-screen bg-base-100 text-base-content">
      <aside class="w-48 border-r border-base-300 p-4 flex flex-col sticky top-0 h-screen bg-base-200">
        <nav class="flex-1 overflow-y-auto pr-1 space-y-2">
          {items.map((item) => (
            <a
              href={`#${item.id}`}
              class="block px-3 py-2 rounded hover:bg-base-300 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          onClick={toggleTheme}
          class="mt-4 px-3 py-2 rounded bg-base-300 hover:bg-base-100 transition-colors"
        >
          {theme() === "light" ? "Dark" : "Light"}
        </button>
      </aside>

      <main class="flex-1 p-8 space-y-16 scroll-smooth">
        <section id="accordion">
          <AccordionShowcase />
        </section>
        <section id="alert">
          <AlertShowcase />
        </section>
        <section id="avatar">
          <AvatarShowcase />
        </section>
        <section id="badge">
          <BadgeShowcase />
        </section>
        <section id="breadcrumbs">
          <BreadcrumbsShowcase />
        </section>
        <section id="button">
          <ButtonShowcase />
        </section>
        <section id="checkbox">
          <CheckboxShowcase />
        </section>
        <section id="file-input">
          <FileInputShowcase />
        </section>
        <section id="input">
          <InputShowcase />
        </section>
        <section id="menu">
          <MenuShowcase />
        </section>
        <section id="modal">
          <ModalShowcase />
        </section>
        <section id="pagination">
          <PaginationShowcase />
        </section>
        <section id="select">
          <SelectShowcase />
        </section>
        <section id="steps">
          <StepsShowcase />
        </section>
        <section id="swap">
          <SwapShowcase />
        </section>
        <section id="textarea">
          <TextareaShowcase />
        </section>
        <section id="toast">
          <ToastShowcase />
        </section>
        <section id="toggle">
          <ToggleShowcase />
        </section>
        <section id="tooltip">
          <TooltipShowcase />
        </section>
      </main>
    </div>
  );
}
