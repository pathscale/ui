import "./Tabs.css";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { CLASSES } from "./Tabs.classes";

type TabsOrientation = "horizontal" | "vertical";
type TabsVariant = "primary" | "secondary";
type TabKey = string | number;

type TabInfo = {
  key: TabKey;
  ref: HTMLElement;
  disabled: boolean;
};

type TabsContextValue = {
  orientation: TabsOrientation;
  variant: TabsVariant;
  selectedKey: Accessor<TabKey | undefined>;
  setSelectedKey: (key: TabKey) => void;
  registerTab: (info: TabInfo) => void;
  unregisterTab: (key: TabKey) => void;
  tabs: Accessor<TabInfo[]>;
  getTabId: (key: TabKey) => string;
  getPanelId: (key: TabKey) => string;
};

const TabsContext = createContext<TabsContextValue>();

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

type TabsRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  children: JSX.Element;
  orientation?: TabsOrientation;
  variant?: TabsVariant;
  selectedKey?: TabKey;
  defaultSelectedKey?: TabKey;
  onSelectionChange?: (key: TabKey) => void;
};

const TabsRoot = (props: TabsRootProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "orientation",
    "variant",
    "selectedKey",
    "defaultSelectedKey",
    "onSelectionChange",
  ]);

  const baseId = createUniqueId();
  const [internalSelectedKey, setInternalSelectedKey] = createSignal<TabKey | undefined>(
    local.defaultSelectedKey,
  );
  const [tabs, setTabs] = createSignal<TabInfo[]>([]);

  const isControlled = () => local.selectedKey !== undefined;
  const selectedKey = () => (isControlled() ? local.selectedKey : internalSelectedKey());

  const setSelectedKey = (key: TabKey) => {
    if (isControlled()) {
      local.onSelectionChange?.(key);
      return;
    }
    setInternalSelectedKey(key);
    local.onSelectionChange?.(key);
  };

  const registerTab = (info: TabInfo) => {
    setTabs((prev) => {
      const next = prev.filter((item) => item.key !== info.key);
      next.push(info);
      return next;
    });

    if (!isControlled() && internalSelectedKey() === undefined) {
      setInternalSelectedKey(info.key);
    }
  };

  const unregisterTab = (key: TabKey) => {
    setTabs((prev) => prev.filter((item) => item.key !== key));
  };

  const getTabId = (key: TabKey) => `${baseId}-tab-${String(key)}`;
  const getPanelId = (key: TabKey) => `${baseId}-panel-${String(key)}`;

  const classes = () =>
    twMerge(
      CLASSES.base,
      local.variant === "secondary" && CLASSES.variant.secondary,
      local.class,
    );

  const context = createMemo<TabsContextValue>(() => ({
    orientation: local.orientation ?? "horizontal",
    variant: local.variant ?? "primary",
    selectedKey,
    setSelectedKey,
    registerTab,
    unregisterTab,
    tabs,
    getTabId,
    getPanelId,
  }));

  return (
    <TabsContext.Provider value={context()}>
      <div
        {...others}
        class={classes()}
        data-slot="tabs"
        data-orientation={local.orientation ?? "horizontal"}
      >
        {local.children}
      </div>
    </TabsContext.Provider>
  );
};

type TabListContainerProps = JSX.HTMLAttributes<HTMLDivElement>;

const TabListContainer = (props: TabListContainerProps): JSX.Element => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <div
      {...others}
      class={twMerge(CLASSES.slot.listContainer, local.class)}
      data-slot="tabs-list-container"
    >
      {local.children}
    </div>
  );
};

type TabListProps = JSX.HTMLAttributes<HTMLDivElement> & {
  "aria-label"?: string;
};

const TabList = (props: TabListProps): JSX.Element => {
  const ctx = useContext(TabsContext);
  const [local, others] = splitProps(props, ["class", "children", "ref"]);

  const [indicatorStyle, setIndicatorStyle] = createSignal<JSX.CSSProperties>({
    "--tabs-indicator-x": "0px",
    "--tabs-indicator-y": "0px",
    "--tabs-indicator-width": "0px",
    "--tabs-indicator-height": "0px",
  });
  const [indicatorVisible, setIndicatorVisible] = createSignal(false);
  const [indicatorReady, setIndicatorReady] = createSignal(false);
  let listRef: HTMLDivElement | undefined;
  let rafId: number | undefined;

  if (!ctx) {
    return <div {...others}>{local.children}</div>;
  }

  const setListRef = (element: HTMLDivElement) => {
    listRef = element;
    if (typeof local.ref === "function") {
      local.ref(element);
    }
  };

  const measureIndicator = () => {
    if (!listRef) return;
    const selectedTab = ctx.tabs().find((tab) => tab.key === ctx.selectedKey());
    if (!selectedTab) {
      setIndicatorVisible(false);
      return;
    }

    const listRect = listRef.getBoundingClientRect();
    const tabRect = selectedTab.ref.getBoundingClientRect();

    let x = tabRect.left - listRect.left + listRef.scrollLeft;
    let y = tabRect.top - listRect.top + listRef.scrollTop;
    let width = tabRect.width;
    let height = tabRect.height;

    if (ctx.variant === "secondary" && ctx.orientation === "horizontal") {
      y += height - 2;
      height = 2;
    }

    if (ctx.variant === "secondary" && ctx.orientation === "vertical") {
      x = 0;
      width = 2;
    }

    setIndicatorStyle({
      "--tabs-indicator-x": `${x}px`,
      "--tabs-indicator-y": `${y}px`,
      "--tabs-indicator-width": `${width}px`,
      "--tabs-indicator-height": `${height}px`,
    });
    setIndicatorVisible(true);
    setIndicatorReady(true);
  };

  const scheduleMeasure = () => {
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      rafId = undefined;
      measureIndicator();
    });
  };

  createEffect(() => {
    ctx.selectedKey();
    ctx.tabs();
    scheduleMeasure();
  });

  createEffect(() => {
    if (!listRef) return;
    const observer = new ResizeObserver(() => scheduleMeasure());
    observer.observe(listRef);
    for (const tab of ctx.tabs()) {
      observer.observe(tab.ref);
    }
    onCleanup(() => observer.disconnect());
  });

  onMount(() => {
    scheduleMeasure();
    window.addEventListener("resize", scheduleMeasure);
    onCleanup(() => {
      window.removeEventListener("resize", scheduleMeasure);
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
    });
  });

  return (
    <div
      {...others}
      ref={setListRef}
      role="tablist"
      aria-orientation={ctx.orientation}
      class={twMerge(CLASSES.slot.list, local.class)}
      data-slot="tabs-list"
      data-orientation={ctx.orientation}
    >
      {local.children}
      <span
        class={CLASSES.slot.indicator}
        data-slot="tabs-indicator"
        data-ready={indicatorReady() ? "true" : "false"}
        data-visible={indicatorVisible() ? "true" : "false"}
        style={indicatorStyle()}
      />
    </div>
  );
};

type TabProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "id"> & {
  id: TabKey;
  isDisabled?: boolean;
};

const Tab = (props: TabProps): JSX.Element => {
  const ctx = useContext(TabsContext);
  const [local, others] = splitProps(props, [
    "class",
    "children",
    "id",
    "isDisabled",
    "onClick",
    "onKeyDown",
  ]);

  let tabRef: HTMLButtonElement | undefined;

  if (!ctx) {
    return (
      <button {...others} class={twMerge(CLASSES.slot.tab, local.class)}>
        {local.children}
      </button>
    );
  }

  const isSelected = createMemo(() => ctx.selectedKey() === local.id);
  const isDisabled = () => Boolean(local.isDisabled);

  onMount(() => {
    if (tabRef) {
      ctx.registerTab({ key: local.id, ref: tabRef, disabled: isDisabled() });
    }
  });

  onCleanup(() => {
    ctx.unregisterTab(local.id);
  });

  const focusTab = (info: TabInfo) => {
    info.ref.focus();
    ctx.setSelectedKey(info.key);
  };

  const moveFocus = (direction: 1 | -1) => {
    const list = ctx.tabs().filter((tab) => !tab.disabled);
    if (!list.length) return;
    const index = list.findIndex((tab) => tab.key === local.id);
    if (index === -1) return;
    const nextIndex = (index + direction + list.length) % list.length;
    focusTab(list[nextIndex]);
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented) return;

    if (isDisabled()) return;

    const isHorizontal = ctx.orientation === "horizontal";
    const key = event.key;

    if (key === "Home" || key === "End") {
      event.preventDefault();
      const list = ctx.tabs().filter((tab) => !tab.disabled);
      if (!list.length) return;
      const target = key === "Home" ? list[0] : list[list.length - 1];
      focusTab(target);
      return;
    }

    if (isHorizontal && (key === "ArrowLeft" || key === "ArrowRight")) {
      event.preventDefault();
      moveFocus(key === "ArrowRight" ? 1 : -1);
      return;
    }

    if (!isHorizontal && (key === "ArrowUp" || key === "ArrowDown")) {
      event.preventDefault();
      moveFocus(key === "ArrowDown" ? 1 : -1);
    }
  };

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    ctx.setSelectedKey(local.id);
  };

  const classes = () => twMerge(CLASSES.slot.tab, local.class);

  return (
    <button
      {...others}
      ref={tabRef}
      id={ctx.getTabId(local.id)}
      role="tab"
      class={classes()}
      data-slot="tabs-tab"
      data-selected={isSelected() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      aria-selected={isSelected()}
      aria-controls={ctx.getPanelId(local.id)}
      aria-disabled={isDisabled()}
      disabled={isDisabled()}
      tabIndex={isSelected() ? 0 : -1}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      {local.children}
    </button>
  );
};

type TabIndicatorProps = JSX.HTMLAttributes<HTMLSpanElement>;

const TabIndicator = (): JSX.Element | null => {
  return null;
};

type TabPanelProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "id"> & {
  id: TabKey;
};

const TabPanel = (props: TabPanelProps): JSX.Element => {
  const ctx = useContext(TabsContext);
  const [local, others] = splitProps(props, ["class", "children", "id"]);

  if (!ctx) {
    return <div {...others}>{local.children}</div>;
  }

  const isSelected = () => ctx.selectedKey() === local.id;

  return (
    <div
      {...others}
      id={ctx.getPanelId(local.id)}
      role="tabpanel"
      aria-labelledby={ctx.getTabId(local.id)}
      class={twMerge(CLASSES.slot.panel, local.class)}
      data-slot="tabs-panel"
      data-orientation={ctx.orientation}
      hidden={!isSelected()}
    >
      {local.children}
    </div>
  );
};

type TabSeparatorProps = JSX.HTMLAttributes<HTMLSpanElement>;

const TabSeparator = (props: TabSeparatorProps): JSX.Element => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <span
      {...others}
      aria-hidden="true"
      class={twMerge(CLASSES.slot.separator, local.class)}
      data-slot="tabs-separator"
    />
  );
};

const Tabs = Object.assign(TabsRoot, {
  Root: TabsRoot,
  ListContainer: TabListContainer,
  List: TabList,
  Tab,
  Indicator: TabIndicator,
  Separator: TabSeparator,
  Panel: TabPanel,
});

export {
  Tabs as default,
  Tabs,
  TabsRoot,
  TabListContainer,
  TabList,
  Tab,
  TabIndicator,
  TabSeparator,
  TabPanel,
};

export type {
  TabsRootProps,
  TabListContainerProps,
  TabListProps,
  TabProps,
  TabIndicatorProps,
  TabSeparatorProps,
  TabPanelProps,
};
