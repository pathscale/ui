import type { ColumnDef, PaginationState } from "@tanstack/solid-table";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { EnhancedTable } from "../../src/components/table";
import {
  LiveChatBubble,
  LiveChatPanel,
  type ChatMessage,
  type SendMessagePayload,
  type SendMessageResponse,
} from "../../src/components/live-chat";

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
  const [demoView, setDemoView] = createSignal<"table" | "chat">("table");
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

  let tableHostRef: HTMLDivElement | undefined;
  let panelOutgoingCount = 0;
  let panelIncomingCount = 0;
  let bubbleOutgoingCount = 0;
  let bubbleIncomingCount = 0;

  const activeData = createMemo(() =>
    datasetMode() === "large" ? LARGE_DATA : SMALL_DATA,
  );

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
              : "LiveChat Auto-Scroll Test Section"}
          </h1>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class={`btn btn-xs ${demoView() === "table" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setDemoView("table")}
            >
              EnhancedTable
            </button>
            <button
              type="button"
              class={`btn btn-xs ${demoView() === "chat" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setDemoView("chat")}
            >
              LiveChat
            </button>
          </div>
        </div>
      </header>

      <main class="h-full px-6 pb-16 pt-16">
        <div class="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-4">
          <Show
            when={demoView() === "table"}
            fallback={
              <>
                <section class="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div class="flex flex-wrap items-center gap-2">
                    <label class="label cursor-pointer gap-2 px-0 py-0">
                      <input
                        type="checkbox"
                        class="checkbox checkbox-sm"
                        checked={autoScrollOnNewMessage()}
                        onChange={(event) => setAutoScrollOnNewMessage(event.currentTarget.checked)}
                      />
                      <span class="text-sm">autoScrollOnNewMessage</span>
                    </label>
                    <select
                      class="select select-sm select-bordered"
                      value={autoScrollBehavior()}
                      onChange={(event) =>
                        setAutoScrollBehavior(event.currentTarget.value as "instant" | "smooth")
                      }
                    >
                      <option value="instant">instant</option>
                      <option value="smooth">smooth</option>
                    </select>
                    <label class="input input-sm input-bordered flex items-center gap-2">
                      <span class="text-xs">threshold</span>
                      <input
                        type="number"
                        min="0"
                        value={stickToBottomThreshold()}
                        onInput={(event) => {
                          const nextValue = Number(event.currentTarget.value);
                          setStickToBottomThreshold(Number.isNaN(nextValue) ? 0 : nextValue);
                        }}
                        class="w-20"
                      />
                    </label>
                    <button type="button" class="btn btn-sm btn-ghost" onClick={resetChatMessages}>
                      Reset messages
                    </button>
                    <button type="button" class="btn btn-sm btn-ghost" onClick={appendPanelIncoming}>
                      Panel + incoming
                    </button>
                    <button type="button" class="btn btn-sm btn-ghost" onClick={appendPanelBurst}>
                      Panel burst x8
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-ghost"
                      onClick={appendBubbleIncoming}
                    >
                      Bubble + incoming
                    </button>
                    <button type="button" class="btn btn-sm btn-ghost" onClick={appendBubbleBurst}>
                      Bubble burst x8
                    </button>
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
            }
          >
            <section class="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">Dataset</span>
                  <button
                    type="button"
                    class={`btn btn-sm ${datasetMode() === "large" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setDatasetMode("large")}
                  >
                    Large (overflow)
                  </button>
                  <button
                    type="button"
                    class={`btn btn-sm ${datasetMode() === "small" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setDatasetMode("small")}
                  >
                    Small (no overflow)
                  </button>
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
            : "LiveChat mode: use controls to append incoming messages and validate auto-scroll behavior."}
        </div>
      </footer>
    </div>
  );
}
