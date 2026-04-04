import type { ColumnDef, PaginationState } from "@tanstack/solid-table";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import {
  Button,
  Checkbox,
  Drawer,
  Dropdown,
  EnhancedTable,
  FileInput,
  GlassPanel,
  Input,
  LiveChatBubble,
  LiveChatPanel,
  Modal,
  Radio,
  Range,
  Select,
  Tabs,
  Textarea,
  type ChatMessage,
  type SendMessagePayload,
  type SendMessageResponse,
} from "@pathscale/ui";

type DemoRow = {
  id: number;
  account: string;
  network: string;
  status: "Active" | "Pending" | "Paused";
  volume: number;
};

type ScrollMetrics = {
  viewport: string;
  pageOverflowPx: number;
  tableCanScroll: boolean;
  tableClientHeight: number;
  tableScrollHeight: number;
  tableScrollTop: number;
};

const createRows = (count: number): DemoRow[] =>
  Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    const network = id % 2 === 0 ? "Honey" : "NoFilter";
    const status: DemoRow["status"] =
      id % 3 === 0 ? "Paused" : id % 5 === 0 ? "Pending" : "Active";

    return {
      id,
      account: `wallet-${String(id).padStart(4, "0")}`,
      network,
      status,
      volume: id * 73,
    };
  });

const LARGE_DATA = createRows(240);
const SMALL_DATA = createRows(6);

const columns: ColumnDef<DemoRow>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "account", header: "Account" },
  { accessorKey: "network", header: "Network" },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "volume",
    header: "Volume",
    cell: (context) => context.getValue<number>().toLocaleString("en-US"),
  },
];

const createChatMessages = (prefix: string, count = 24): ChatMessage[] =>
  Array.from({ length: count }, (_, index) => ({
    messageId: `${prefix}-${index + 1}`,
    content: `${prefix.toUpperCase()} seed message ${index + 1}`,
    sender: index % 2 === 0 ? "agent" : "user",
    timestamp: Date.now() - (count - index) * 60000,
  }));

export default function App() {
  const [demoView, setDemoView] = createSignal<"table" | "chat" | "glass" | "groupA" | "groupB">("table");
  const [datasetMode, setDatasetMode] = createSignal<"large" | "small">("large");
  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [autoScrollOnNewMessage, setAutoScrollOnNewMessage] = createSignal(true);
  const [autoScrollBehavior, setAutoScrollBehavior] =
    createSignal<"instant" | "smooth">("instant");
  const [stickToBottomThreshold, setStickToBottomThreshold] = createSignal(100);
  const [panelMessages, setPanelMessages] = createSignal<ChatMessage[]>(
    createChatMessages("panel"),
  );
  const [bubbleMessages, setBubbleMessages] = createSignal<ChatMessage[]>(
    createChatMessages("bubble"),
  );
  const [metrics, setMetrics] = createSignal<ScrollMetrics>({
    viewport: "-",
    pageOverflowPx: 0,
    tableCanScroll: false,
    tableClientHeight: 0,
    tableScrollHeight: 0,
    tableScrollTop: 0,
  });
  const [modalOpen, setModalOpen] = createSignal(false);
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const [tabValue, setTabValue] = createSignal<"overview" | "settings" | "advanced">("overview");
  const [dropdownSelection, setDropdownSelection] = createSignal("none");
  const [modalCloseCount, setModalCloseCount] = createSignal(0);
  const [interactionLog, setInteractionLog] = createSignal<string[]>([]);
  const [formSize, setFormSize] = createSignal<"xs" | "sm" | "md" | "lg" | "xl">("md");
  const [formColor, setFormColor] =
    createSignal<"primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error">("primary");
  const [formGhost, setFormGhost] = createSignal(false);
  const [formDisabled, setFormDisabled] = createSignal(false);
  const [inputValue, setInputValue] = createSignal("");
  const [selectValue, setSelectValue] = createSignal("");
  const [textareaValue, setTextareaValue] = createSignal("");
  const [fileValue, setFileValue] = createSignal("none");
  const [checkboxValue, setCheckboxValue] = createSignal(true);
  const [radioValue, setRadioValue] = createSignal<"one" | "two">("one");
  const [rangeValue, setRangeValue] = createSignal(35);

  let tableHostRef: HTMLDivElement | undefined;
  let panelOutgoingCount = 0;
  let panelIncomingCount = 0;
  let bubbleOutgoingCount = 0;
  let bubbleIncomingCount = 0;

  const activeData = createMemo(() =>
    datasetMode() === "large" ? LARGE_DATA : SMALL_DATA,
  );

  const pushInteraction = (label: string) => {
    const stamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setInteractionLog((prev) => [`${stamp} - ${label}`, ...prev].slice(0, 10));
  };

  const collectMetrics = () => {
    const root = document.documentElement;
    const scrollNode = tableHostRef?.querySelector<HTMLDivElement>(
      ".enhanced-table-scroll",
    );

    setMetrics({
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      pageOverflowPx: Math.max(0, root.scrollHeight - window.innerHeight),
      tableCanScroll: !!scrollNode && scrollNode.scrollHeight > scrollNode.clientHeight,
      tableClientHeight: scrollNode?.clientHeight ?? 0,
      tableScrollHeight: scrollNode?.scrollHeight ?? 0,
      tableScrollTop: scrollNode?.scrollTop ?? 0,
    });
  };

  const resetChatMessages = () => {
    panelOutgoingCount = 0;
    panelIncomingCount = 0;
    bubbleOutgoingCount = 0;
    bubbleIncomingCount = 0;
    setPanelMessages(createChatMessages("panel"));
    setBubbleMessages(createChatMessages("bubble"));
  };

  const appendPanelIncoming = () => {
    panelIncomingCount += 1;
    setPanelMessages((prev) => [
      ...prev,
      {
        messageId: `panel-incoming-${panelIncomingCount}`,
        content: `Panel incoming message ${panelIncomingCount}`,
        sender: "agent",
        timestamp: Date.now(),
      },
    ]);
  };

  const appendBubbleIncoming = () => {
    bubbleIncomingCount += 1;
    setBubbleMessages((prev) => [
      ...prev,
      {
        messageId: `bubble-incoming-${bubbleIncomingCount}`,
        content: `Bubble incoming message ${bubbleIncomingCount}`,
        sender: "agent",
        timestamp: Date.now(),
      },
    ]);
  };

  const appendPanelBurst = () => {
    for (let index = 0; index < 8; index += 1) {
      setTimeout(() => appendPanelIncoming(), index * 80);
    }
  };

  const appendBubbleBurst = () => {
    for (let index = 0; index < 8; index += 1) {
      setTimeout(() => appendBubbleIncoming(), index * 80);
    }
  };

  const handlePanelSend = async (
    payload: SendMessagePayload,
  ): Promise<SendMessageResponse> => {
    panelOutgoingCount += 1;
    const messageId = `panel-outgoing-${panelOutgoingCount}`;
    const timestamp = Date.now();
    setPanelMessages((prev) => [
      ...prev,
      {
        messageId,
        content: payload.message,
        sender: "user",
        timestamp,
      },
    ]);
    return { messageId, timestamp };
  };

  const handleBubbleSend = async (
    payload: SendMessagePayload,
  ): Promise<SendMessageResponse> => {
    bubbleOutgoingCount += 1;
    const messageId = `bubble-outgoing-${bubbleOutgoingCount}`;
    const timestamp = Date.now();
    setBubbleMessages((prev) => [
      ...prev,
      {
        messageId,
        content: payload.message,
        sender: "user",
        timestamp,
      },
    ]);
    return { messageId, timestamp };
  };

  onMount(() => {
    const onViewportChange = () => collectMetrics();

    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    const scrollNode = tableHostRef?.querySelector<HTMLDivElement>(
      ".enhanced-table-scroll",
    );
    const onTableScroll = () => collectMetrics();
    scrollNode?.addEventListener("scroll", onTableScroll);

    requestAnimationFrame(collectMetrics);

    onCleanup(() => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
      scrollNode?.removeEventListener("scroll", onTableScroll);
    });
  });

  createEffect(() => {
    datasetMode();
    setPagination({ pageIndex: 0, pageSize: 10 });
    requestAnimationFrame(collectMetrics);
  });

  createEffect(() => {
    pagination();
    requestAnimationFrame(collectMetrics);
  });

  return (
    <div class="h-screen overflow-hidden bg-base-200 text-base-content">
      <header class="fixed inset-x-0 top-0 z-40 h-14 border-b border-base-300 bg-base-100/95 px-6 backdrop-blur">
        <div class="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-3">
          <h1 class="text-sm font-semibold tracking-wide">
            {demoView() === "table"
              ? "EnhancedTable Vertical Scroll Containment Test"
              : demoView() === "chat"
                ? "LiveChat Auto-Scroll Test Section"
                : demoView() === "groupA"
                  ? "Group A Overlay Primitives Interaction Test"
                  : demoView() === "groupB"
                    ? "Group B Form Primitives Compatibility Test"
                  : "GlassPanel Showcase"}
          </h1>
          <div class="flex items-center gap-2">
            <Button
              size="xs"
              color={demoView() === "table" ? "primary" : "ghost"}
              onClick={() => setDemoView("table")}
            >
              EnhancedTable
            </Button>
            <Button
              size="xs"
              color={demoView() === "chat" ? "primary" : "ghost"}
              onClick={() => setDemoView("chat")}
            >
              LiveChat
            </Button>
            <Button
              size="xs"
              color={demoView() === "glass" ? "primary" : "ghost"}
              onClick={() => setDemoView("glass")}
            >
              GlassPanel
            </Button>
            <Button
              size="xs"
              color={demoView() === "groupA" ? "primary" : "ghost"}
              onClick={() => setDemoView("groupA")}
            >
              Overlay Primitives
            </Button>
            <Button
              size="xs"
              color={demoView() === "groupB" ? "primary" : "ghost"}
              onClick={() => setDemoView("groupB")}
            >
              Form Primitives
            </Button>
          </div>
        </div>
      </header>

      <main class="h-full px-6 pb-16 pt-16">
        <div class="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-4">
          <Show when={demoView() === "glass"}>
            <section
              data-theme="dark"
              class="relative flex-1 min-h-0 overflow-auto rounded-box p-6"
              style={{
                background: "#0f172a",
                "background-image": "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
                "background-size": "24px 24px",
              }}
            >
              {/* Colorful blobs behind panels to show the glass blur */}
              <div class="pointer-events-none absolute inset-0 overflow-hidden">
                <div class="absolute top-20 left-1/4 h-48 w-48 rounded-full bg-blue-500/30 blur-3xl" />
                <div class="absolute top-60 right-1/4 h-40 w-40 rounded-full bg-purple-500/25 blur-3xl" />
                <div class="absolute bottom-40 left-1/3 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
                <div class="absolute bottom-20 right-1/3 h-36 w-36 rounded-full bg-rose-500/20 blur-3xl" />
              </div>

              <div class="relative space-y-6">
                {/* --- Default glass panel --- */}
                <div>
                  <h2 class="text-sm font-semibold mb-3 text-white/80">Default</h2>
                  <GlassPanel>
                    <p class="text-white/70">Default glass panel — <code class="text-blue-300">blur="md"</code>, <code class="text-blue-300">size="md"</code></p>
                  </GlassPanel>
                </div>

                {/* --- Blur variants --- */}
                <div>
                  <h2 class="text-sm font-semibold mb-3 text-white/80">Blur Variants</h2>
                  <div class="grid gap-3 md:grid-cols-3">
                    <GlassPanel blur="sm" size="sm">
                      <p class="text-xs text-white/70">blur="sm" (4px)</p>
                    </GlassPanel>
                    <GlassPanel blur="md" size="sm">
                      <p class="text-xs text-white/70">blur="md" (12px) — default</p>
                    </GlassPanel>
                    <GlassPanel blur="xl" size="sm">
                      <p class="text-xs text-white/70">blur="xl" (24px)</p>
                    </GlassPanel>
                  </div>
                </div>

                {/* --- With glow --- */}
                <div>
                  <h2 class="text-sm font-semibold mb-3 text-white/80">Inner Glow</h2>
                  <GlassPanel glow>
                    <p class="text-white/70">Glass panel with inner glow shadow</p>
                  </GlassPanel>
                </div>

                {/* --- Accent borders --- */}
                <div>
                  <h2 class="text-sm font-semibold mb-3 text-white/80">Accent Borders</h2>
                  <div class="grid gap-3 md:grid-cols-3">
                    <GlassPanel accent="primary" size="sm">
                      <p class="text-xs text-white/70">accent="primary"</p>
                    </GlassPanel>
                    <GlassPanel accent="secondary" size="sm">
                      <p class="text-xs text-white/70">accent="secondary"</p>
                    </GlassPanel>
                    <GlassPanel accent="accent" size="sm">
                      <p class="text-xs text-white/70">accent="accent"</p>
                    </GlassPanel>
                    <GlassPanel accent="success" size="sm">
                      <p class="text-xs text-white/70">accent="success"</p>
                    </GlassPanel>
                    <GlassPanel accent="warning" size="sm">
                      <p class="text-xs text-white/70">accent="warning"</p>
                    </GlassPanel>
                    <GlassPanel accent="error" size="sm">
                      <p class="text-xs text-white/70">accent="error"</p>
                    </GlassPanel>
                  </div>
                </div>

                {/* --- Collapsible panels (Layouts / Performance / Controls) --- */}
                <div>
                  <h2 class="text-sm font-semibold mb-3 text-white/80">Collapsible Panels (Layouts / Performance / Controls)</h2>
                  <div class="space-y-2">
                    <GlassPanel collapsible title="Layouts" defaultOpen accent="primary">
                      <div class="grid grid-cols-3 gap-2">
                        <div class="aspect-video rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/50">Side by Side</div>
                        <div class="aspect-video rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/50">Picture in Picture</div>
                        <div class="aspect-video rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/50">Solo</div>
                      </div>
                    </GlassPanel>
                    <GlassPanel collapsible title="Performance" defaultOpen={false} accent="secondary">
                      <div class="flex gap-3">
                        <span class="rounded-md bg-white/10 border border-white/10 px-3 py-1 text-xs text-white/70">720p</span>
                        <span class="rounded-md bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs text-blue-300">1080p</span>
                        <span class="rounded-md bg-white/10 border border-white/10 px-3 py-1 text-xs text-white/70">4K</span>
                      </div>
                    </GlassPanel>
                    <GlassPanel collapsible title="Controls" defaultOpen accent="accent">
                      <div class="flex gap-2">
                        <Button size="sm" class="!rounded-lg !bg-blue-500/80 !text-white backdrop-blur-sm hover:!bg-blue-500">Record</Button>
                        <Button size="sm" class="!rounded-lg !bg-purple-500/80 !text-white backdrop-blur-sm hover:!bg-purple-500">Broadcast</Button>
                        <Button size="sm" class="!rounded-lg !bg-white/10 !border-white/10 !text-white/70 backdrop-blur-sm hover:!bg-white/15">Settings</Button>
                      </div>
                    </GlassPanel>
                  </div>
                </div>

                {/* --- Sizes --- */}
                <div>
                  <h2 class="text-sm font-semibold mb-3 text-white/80">Sizes</h2>
                  <div class="space-y-2">
                    <GlassPanel size="xs"><p class="text-xs text-white/70">size="xs" — p-2</p></GlassPanel>
                    <GlassPanel size="sm"><p class="text-xs text-white/70">size="sm" — p-3</p></GlassPanel>
                    <GlassPanel size="md"><p class="text-xs text-white/70">size="md" — p-4</p></GlassPanel>
                    <GlassPanel size="lg"><p class="text-xs text-white/70">size="lg" — p-5</p></GlassPanel>
                    <GlassPanel size="xl"><p class="text-xs text-white/70">size="xl" — p-6</p></GlassPanel>
                  </div>
                </div>

                {/* --- Transparent --- */}
                <div>
                  <h2 class="text-sm font-semibold mb-3 text-white/80">Transparent (border only)</h2>
                  <GlassPanel transparent>
                    <p class="text-white/70">No background, no blur — just the border frame</p>
                  </GlassPanel>
                </div>
              </div>
            </section>
          </Show>

          <Show when={demoView() === "groupA"}>
            <section class="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
              <div class="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  color="primary"
                  onClick={() => {
                    setModalOpen(true);
                    pushInteraction("open modal");
                  }}
                >
                  Open modal
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  onClick={() => {
                    setDrawerOpen(true);
                    pushInteraction("open drawer");
                  }}
                >
                  Open drawer
                </Button>
                <Button
                  size="sm"
                  color="ghost"
                  onClick={() => {
                    setInteractionLog([]);
                    pushInteraction("cleared interaction log");
                  }}
                >
                  Clear log
                </Button>
                <span class="ml-auto text-xs opacity-70">
                  modal closes: {modalCloseCount()} | dropdown: {dropdownSelection()} | tab: {tabValue()}
                </span>
              </div>
            </section>

            <section class="flex-1 min-h-0 overflow-auto rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
              <div class="grid gap-4 lg:grid-cols-2">
                <div class="space-y-4">
                  <h2 class="text-sm font-semibold">Dropdown + Tabs</h2>

                  <Dropdown class="w-full max-w-xs">
                    <Dropdown.Toggle
                      button
                      class="btn btn-sm btn-outline w-full justify-between"
                      aria-haspopup="menu"
                    >
                      Priority: {dropdownSelection()}
                    </Dropdown.Toggle>
                    <Dropdown.Menu class="w-full">
                      <Dropdown.Item
                        onClick={() => {
                          setDropdownSelection("low");
                          pushInteraction("dropdown select low");
                        }}
                      >
                        Low priority
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          setDropdownSelection("medium");
                          pushInteraction("dropdown select medium");
                        }}
                      >
                        Medium priority
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          setDropdownSelection("high");
                          pushInteraction("dropdown select high");
                        }}
                      >
                        High priority
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Tabs variant="boxed" size="sm" class="w-fit">
                    <Tabs.Tab
                      href="#"
                      active={tabValue() === "overview"}
                      onClick={(event) => {
                        event.preventDefault();
                        setTabValue("overview");
                        pushInteraction("tabs -> overview");
                      }}
                    >
                      Overview
                    </Tabs.Tab>
                    <Tabs.Tab
                      href="#"
                      active={tabValue() === "settings"}
                      onClick={(event) => {
                        event.preventDefault();
                        setTabValue("settings");
                        pushInteraction("tabs -> settings");
                      }}
                    >
                      Settings
                    </Tabs.Tab>
                    <Tabs.Tab
                      href="#"
                      active={tabValue() === "advanced"}
                      onClick={(event) => {
                        event.preventDefault();
                        setTabValue("advanced");
                        pushInteraction("tabs -> advanced");
                      }}
                    >
                      Advanced
                    </Tabs.Tab>
                  </Tabs>

                  <div class="rounded-box border border-base-300 bg-base-200 p-3 text-sm">
                    <Show when={tabValue() === "overview"}>
                      <p>Overview tab content visible.</p>
                    </Show>
                    <Show when={tabValue() === "settings"}>
                      <p>Settings tab content visible.</p>
                    </Show>
                    <Show when={tabValue() === "advanced"}>
                      <p>Advanced tab content visible.</p>
                    </Show>
                  </div>
                </div>

                <div class="space-y-3">
                  <h2 class="text-sm font-semibold">Interaction Log</h2>
                  <div class="rounded-box border border-base-300 bg-base-200 p-3 text-xs min-h-56 max-h-80 overflow-auto">
                    <Show
                      when={interactionLog().length > 0}
                      fallback={<p class="opacity-60">No events yet. Interact with modal/drawer/dropdown/tabs.</p>}
                    >
                      <ul class="space-y-1">
                        {interactionLog().map((entry) => (
                          <li>{entry}</li>
                        ))}
                      </ul>
                    </Show>
                  </div>
                </div>
              </div>
            </section>

            <Drawer
              open={drawerOpen()}
              onClickOverlay={() => {
                setDrawerOpen(false);
                pushInteraction("drawer overlay close");
              }}
              side={
                <aside class="h-full w-80 p-4 space-y-3 bg-base-100">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-semibold">Drawer Test</h3>
                    <Button
                      size="xs"
                      color="ghost"
                      onClick={() => {
                        setDrawerOpen(false);
                        pushInteraction("drawer close button");
                      }}
                    >
                      Close
                    </Button>
                  </div>
                  <p class="text-xs opacity-70">
                    Verify slide in/out, overlay close behavior, and stacking.
                  </p>
                </aside>
              }
            >
              <div />
            </Drawer>

            <Modal
              open={modalOpen()}
              backdrop
              closeOnEsc
              closeOnOutsideClick
              onClose={() => {
                setModalOpen(false);
                setModalCloseCount((count) => count + 1);
                pushInteraction("modal close");
              }}
              size="md"
            >
              <Modal.Header class="mb-3 text-lg font-semibold">Modal Test</Modal.Header>
              <Modal.Body class="space-y-3">
                <p class="text-sm opacity-80">
                  Verify backdrop, close on outside click, and ESC behavior.
                </p>
              </Modal.Body>
              <Modal.Actions class="mt-4 flex justify-end gap-2">
                <Button
                  size="sm"
                  color="ghost"
                  onClick={() => {
                    setModalOpen(false);
                    pushInteraction("modal dismiss");
                  }}
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  onClick={() => {
                    setModalOpen(false);
                    pushInteraction("modal confirm");
                  }}
                >
                  Confirm
                </Button>
              </Modal.Actions>
            </Modal>
          </Show>

          <Show when={demoView() === "groupB"}>
            <section class="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
              <div class="flex flex-wrap items-center gap-3">
                <label class="flex items-center gap-2 text-sm">
                  <span class="opacity-70">Size</span>
                  <Select
                    size="sm"
                    value={formSize()}
                    onChange={(event) =>
                      setFormSize(event.currentTarget.value as "xs" | "sm" | "md" | "lg" | "xl")
                    }
                  >
                    <option value="xs">xs</option>
                    <option value="sm">sm</option>
                    <option value="md">md</option>
                    <option value="lg">lg</option>
                    <option value="xl">xl</option>
                  </Select>
                </label>
                <label class="flex items-center gap-2 text-sm">
                  <span class="opacity-70">Color</span>
                  <Select
                    size="sm"
                    value={formColor()}
                    onChange={(event) =>
                      setFormColor(
                        event.currentTarget.value as
                          | "primary"
                          | "secondary"
                          | "accent"
                          | "info"
                          | "success"
                          | "warning"
                          | "error",
                      )
                    }
                  >
                    <option value="primary">primary</option>
                    <option value="secondary">secondary</option>
                    <option value="accent">accent</option>
                    <option value="info">info</option>
                    <option value="success">success</option>
                    <option value="warning">warning</option>
                    <option value="error">error</option>
                  </Select>
                </label>
                <label class="label cursor-pointer gap-2 px-0 py-0">
                  <Checkbox
                    size="sm"
                    checked={formGhost()}
                    onChange={(event) => setFormGhost(event.currentTarget.checked)}
                  />
                  <span class="text-sm">ghost fields</span>
                </label>
                <label class="label cursor-pointer gap-2 px-0 py-0">
                  <Checkbox
                    size="sm"
                    checked={formDisabled()}
                    onChange={(event) => setFormDisabled(event.currentTarget.checked)}
                  />
                  <span class="text-sm">disabled</span>
                </label>
              </div>
            </section>

            <section class="flex-1 min-h-0 overflow-auto rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
              <div class="grid gap-4 lg:grid-cols-2">
                <div class="space-y-4">
                  <h2 class="text-sm font-semibold">Input Family</h2>
                  <div class="space-y-3 rounded-box border border-base-300 bg-base-200 p-3">
                    <Input
                      size={formSize()}
                      color={formGhost() ? "ghost" : formColor()}
                      variant={formGhost() ? "ghost" : "bordered"}
                      placeholder="Input primitive"
                      value={inputValue()}
                      disabled={formDisabled()}
                      onInput={(event) => setInputValue(event.currentTarget.value)}
                    />
                    <Select
                      size={formSize()}
                      color={formGhost() ? "ghost" : formColor()}
                      value={selectValue()}
                      disabled={formDisabled()}
                      onChange={(event) => setSelectValue(event.currentTarget.value)}
                    >
                      <option value="alpha">Alpha</option>
                      <option value="beta">Beta</option>
                      <option value="gamma">Gamma</option>
                    </Select>
                    <Textarea
                      size={formSize()}
                      color={formGhost() ? "ghost" : formColor()}
                      disabled={formDisabled()}
                      placeholder="Textarea primitive"
                      value={textareaValue()}
                      onInput={(event) => setTextareaValue(event.currentTarget.value)}
                    />
                    <FileInput
                      size={formSize()}
                      color={formGhost() ? "ghost" : formColor()}
                      bordered
                      disabled={formDisabled()}
                      onChange={(event) => {
                        const selected = event.currentTarget.files?.[0]?.name ?? "none";
                        setFileValue(selected);
                      }}
                    />
                    <div class="text-xs opacity-70">
                      file: {fileValue() || "none"}
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <h2 class="text-sm font-semibold">Choice Controls</h2>
                  <div class="space-y-4 rounded-box border border-base-300 bg-base-200 p-3">
                    <label class="label cursor-pointer justify-start gap-2 px-0 py-0">
                      <Checkbox
                        size={formSize()}
                        color={formColor()}
                        checked={checkboxValue()}
                        disabled={formDisabled()}
                        onChange={(event) => setCheckboxValue(event.currentTarget.checked)}
                      />
                      <span class="text-sm">Checkbox primitive</span>
                    </label>

                    <div class="flex items-center gap-4">
                      <label class="label cursor-pointer justify-start gap-2 px-0 py-0">
                        <Radio
                          name="group-b-radio"
                          size={formSize()}
                          color={formColor()}
                          checked={radioValue() === "one"}
                          disabled={formDisabled()}
                          onChange={() => setRadioValue("one")}
                        />
                        <span class="text-sm">Option one</span>
                      </label>
                      <label class="label cursor-pointer justify-start gap-2 px-0 py-0">
                        <Radio
                          name="group-b-radio"
                          size={formSize()}
                          color={formColor()}
                          checked={radioValue() === "two"}
                          disabled={formDisabled()}
                          onChange={() => setRadioValue("two")}
                        />
                        <span class="text-sm">Option two</span>
                      </label>
                    </div>

                    <div class="space-y-2">
                      <Range
                        size={formSize()}
                        color={formColor()}
                        min={0}
                        max={100}
                        step={0.1}
                        value={rangeValue()}
                        disabled={formDisabled()}
                        onInput={(event) => setRangeValue(Number(event.currentTarget.value))}
                      />
                      <div class="text-xs opacity-70">range: {rangeValue()}</div>
                    </div>
                  </div>

                  <div class="rounded-box border border-base-300 bg-base-200 p-3 text-xs">
                    <div>input: {inputValue() || "(empty)"}</div>
                    <div>select: {selectValue() || "(empty)"}</div>
                    <div>textarea: {textareaValue() || "(empty)"}</div>
                    <div>checkbox: {String(checkboxValue())}</div>
                    <div>radio: {radioValue()}</div>
                  </div>
                </div>
              </div>
            </section>
          </Show>

          <Show
            when={demoView() === "table"}
            fallback={
              <Show when={demoView() === "chat"}>
              <>
                <section class="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div class="flex flex-wrap items-center gap-2">
                    <label class="label cursor-pointer gap-2 px-0 py-0">
                      <Checkbox
                        size="sm"
                        checked={autoScrollOnNewMessage()}
                        onChange={(event) => setAutoScrollOnNewMessage(event.currentTarget.checked)}
                      />
                      <span class="text-sm">autoScrollOnNewMessage</span>
                    </label>
                    <Select
                      size="sm"
                      class="w-32"
                      value={autoScrollBehavior()}
                      onChange={(event) =>
                        setAutoScrollBehavior(event.currentTarget.value as "instant" | "smooth")
                      }
                    >
                      <option value="instant">instant</option>
                      <option value="smooth">smooth</option>
                    </Select>
                    <Input
                      size="sm"
                      type="number"
                      min="0"
                      class="w-32"
                      leftIcon={<span class="text-xs">threshold</span>}
                      value={stickToBottomThreshold()}
                      onInput={(event) => {
                        const nextValue = Number(event.currentTarget.value);
                        setStickToBottomThreshold(Number.isNaN(nextValue) ? 0 : nextValue);
                      }}
                    />
                    <Button size="sm" color="ghost" onClick={resetChatMessages}>
                      Reset messages
                    </Button>
                    <Button size="sm" color="ghost" onClick={appendPanelIncoming}>
                      Panel + incoming
                    </Button>
                    <Button size="sm" color="ghost" onClick={appendPanelBurst}>
                      Panel burst x8
                    </Button>
                    <Button size="sm" color="ghost" onClick={appendBubbleIncoming}>
                      Bubble + incoming
                    </Button>
                    <Button size="sm" color="ghost" onClick={appendBubbleBurst}>
                      Bubble burst x8
                    </Button>
                  </div>
                  <p class="mt-3 text-xs opacity-70">
                    Scroll either chat list upward, then click append controls to verify it does not
                    force-scroll until you return within threshold from bottom.
                  </p>
                </section>

                <section class="flex-1 min-h-0 overflow-auto rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div class="grid gap-4 lg:grid-cols-2">
                    <div class="space-y-2">
                      <h2 class="text-sm font-semibold">LiveChatPanel</h2>
                      <LiveChatPanel
                        onClose={() => {}}
                        title="Panel Under Test"
                        messages={panelMessages()}
                        onSendMessage={handlePanelSend}
                        autoScrollOnNewMessage={autoScrollOnNewMessage()}
                        autoScrollBehavior={autoScrollBehavior()}
                        stickToBottomThreshold={stickToBottomThreshold()}
                        class="!static !inset-auto !w-full !max-w-none !h-[34rem] !shadow-md"
                      />
                    </div>

                    <div class="space-y-2">
                      <h2 class="text-sm font-semibold">LiveChatBubble</h2>
                      <div class="relative h-[34rem] overflow-hidden rounded-box border border-base-300 bg-base-200">
                        <LiveChatBubble
                          aria-label="Open chat"
                          class="!absolute !bottom-4 !right-4"
                          autoScrollOnNewMessage={autoScrollOnNewMessage()}
                          autoScrollBehavior={autoScrollBehavior()}
                          stickToBottomThreshold={stickToBottomThreshold()}
                          panelProps={{
                            title: "Bubble Panel Under Test",
                            messages: bubbleMessages(),
                            onSendMessage: handleBubbleSend,
                            autoScrollOnNewMessage: autoScrollOnNewMessage(),
                            autoScrollBehavior: autoScrollBehavior(),
                            stickToBottomThreshold: stickToBottomThreshold(),
                            class:
                              "!absolute !inset-3 !w-auto !h-auto !max-w-none !max-h-none !min-h-0 !shadow-md",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </>
              </Show>
            }
          >
            <section class="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">Dataset</span>
                  <Button
                    size="sm"
                    color={datasetMode() === "large" ? "primary" : "ghost"}
                    onClick={() => setDatasetMode("large")}
                  >
                    Large (overflow)
                  </Button>
                  <Button
                    size="sm"
                    color={datasetMode() === "small" ? "primary" : "ghost"}
                    onClick={() => setDatasetMode("small")}
                  >
                    Small (no overflow)
                  </Button>
                </div>
                <div class="text-xs opacity-70">Viewport: {metrics().viewport}</div>
              </div>

              <div class="mt-3 grid gap-2 text-xs opacity-80 md:grid-cols-2">
                <div>Page overflow px: {metrics().pageOverflowPx}</div>
                <div>Table can scroll: {String(metrics().tableCanScroll)}</div>
                <div>Table client height: {metrics().tableClientHeight}</div>
                <div>Table scroll height: {metrics().tableScrollHeight}</div>
                <div>Table scroll top: {Math.round(metrics().tableScrollTop)}</div>
                <div>
                  Footer expectation: visible and stable while table body scrolls
                </div>
              </div>
            </section>

            <section class="flex-1 min-h-0 rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
              <div
                ref={tableHostRef}
                class="h-full min-h-0"
              >
                <EnhancedTable
                  class="w-full"
                  data={activeData()}
                  columns={columns}
                  pagination={pagination}
                  setPagination={setPagination}
                  enablePagination
                  paginationPosition="bottomRight"
                  filterIcon={<span class="text-xs">F</span>}
                  sortAscIcon={<span class="text-xs">↑</span>}
                  sortDescIcon={<span class="text-xs">↓</span>}
                  sortNeutralIcon={<span class="text-xs opacity-50">↕</span>}
                />
              </div>
            </section>
          </Show>
        </div>
      </main>

      <footer class="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-base-300 bg-base-100/95 px-6 backdrop-blur">
        <div class="mx-auto flex h-full w-full max-w-6xl items-center text-sm opacity-70">
          {demoView() === "table"
            ? "Fixed footer boundary (dashboard chrome simulation)."
            : demoView() === "chat"
              ? "LiveChat mode: use controls to append incoming messages and validate auto-scroll behavior."
              : demoView() === "groupA"
                ? "Overlay primitives mode: validate modal/drawer/dropdown/tabs interactions and event log."
                : demoView() === "groupB"
                  ? "Form primitives mode: validate input/select/textarea/file-input/checkbox/radio/range states."
                : "GlassPanel mode: visual showcase for blur, accents, and collapsible variants."}
        </div>
      </footer>
    </div>
  );
}
