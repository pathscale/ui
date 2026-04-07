import "./Tabs.css";
import {
  createContext,
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
    "className",
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
      "tabs",
      local.variant === "secondary" && "tabs--secondary",
      local.class,
      local.className,
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
  const [local, others] = splitProps(props, ["class", "className", "children"]);
  return (
    <div
      {...others}
      class={twMerge("tabs__list-container", local.class, local.className)}
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
  const [local, others] = splitProps(props, ["class", "className", "children"]);

  if (!ctx) {
    return <div {...others}>{local.children}</div>;
  }

  return (
    <div
      {...others}
      role="tablist"
      aria-orientation={ctx.orientation}
      class={twMerge("tabs__list", local.class, local.className)}
      data-slot="tabs-list"
      data-orientation={ctx.orientation}
    >
      {local.children}
    </div>
  );
};

type TabItemContextValue = {
  isSelected: Accessor<boolean>;
};

const TabItemContext = createContext<TabItemContextValue>();

type TabProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "id"> & {
  id: TabKey;
  isDisabled?: boolean;
};

const Tab = (props: TabProps): JSX.Element => {
  const ctx = useContext(TabsContext);
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "children",
    "id",
    "isDisabled",
    "onClick",
    "onKeyDown",
  ]);

  let tabRef: HTMLButtonElement | undefined;

  if (!ctx) {
    return (
      <button {...others} class={twMerge("tabs__tab", local.class, local.className)}>
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
    local.onKeyDown?.(event);
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
    local.onClick?.(event);
    if (event.defaultPrevented) return;
    if (isDisabled()) return;
    ctx.setSelectedKey(local.id);
  };

  const classes = () => twMerge("tabs__tab", local.class, local.className);

  return (
    <TabItemContext.Provider value={{ isSelected }}>
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
    </TabItemContext.Provider>
  );
};

type TabIndicatorProps = JSX.HTMLAttributes<HTMLSpanElement>;

const TabIndicator = (props: TabIndicatorProps): JSX.Element | null => {
  const item = useContext(TabItemContext);
  if (!item?.isSelected()) return null;
  const [local, others] = splitProps(props, ["class", "className"]);

  return (
    <span
      {...others}
      class={twMerge("tabs__indicator", local.class, local.className)}
      data-slot="tabs-indicator"
    />
  );
};

type TabPanelProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "id"> & {
  id: TabKey;
};

const TabPanel = (props: TabPanelProps): JSX.Element => {
  const ctx = useContext(TabsContext);
  const [local, others] = splitProps(props, ["class", "className", "children", "id"]);

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
      class={twMerge("tabs__panel", local.class, local.className)}
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
  const [local, others] = splitProps(props, ["class", "className"]);
  return (
    <span
      {...others}
      aria-hidden="true"
      class={twMerge("tabs__separator", local.class, local.className)}
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
