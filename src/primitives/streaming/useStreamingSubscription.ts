import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js";

type MaybeAccessor<T> = T | Accessor<T>;

const resolveOption = <T>(value: MaybeAccessor<T>): T => {
  if (typeof value === "function") {
    return (value as Accessor<T>)();
  }
  return value;
};

const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(typeof error === "string" ? error : "Unknown streaming error");
};

export interface StreamingSubscriptionObserver<TEvent> {
  next: (event: TEvent) => void;
  error: (error: unknown) => void;
  open: () => void;
  close: () => void;
  readonly signal: AbortSignal;
  readonly isStopped: boolean;
}

export type StreamingSubscribeFn<TEvent> = (
  observer: StreamingSubscriptionObserver<TEvent>,
) => void | (() => void) | Promise<void | (() => void)>;

export interface UseStreamingSubscriptionOptions<TEvent> {
  subscribe: StreamingSubscribeFn<TEvent>;
  enabled?: MaybeAccessor<boolean>;
  onData?: (event: TEvent) => void;
  onError?: (error: Error) => void;
}

export interface UseStreamingSubscriptionResult {
  isLive: Accessor<boolean>;
  isConnecting: Accessor<boolean>;
  error: Accessor<Error | null>;
  eventCount: Accessor<number>;
  start: () => Promise<void>;
  stop: () => void;
}

export const useStreamingSubscription = <TEvent>(
  options: UseStreamingSubscriptionOptions<TEvent>,
): UseStreamingSubscriptionResult => {
  const [isLive, setIsLive] = createSignal(false);
  const [isConnecting, setIsConnecting] = createSignal(false);
  const [error, setError] = createSignal<Error | null>(null);
  const [eventCount, setEventCount] = createSignal(0);

  let isRunning = false;
  let teardown: (() => void) | undefined;
  let activeController: AbortController | null = null;
  let runToken = 0;

  const clearTeardown = () => {
    const currentTeardown = teardown;
    teardown = undefined;
    if (currentTeardown) {
      currentTeardown();
    }
  };

  const stop = () => {
    runToken += 1;
    isRunning = false;

    if (activeController) {
      activeController.abort();
      activeController = null;
    }

    clearTeardown();
    setIsConnecting(false);
    setIsLive(false);
  };

  const start = async () => {
    if (isRunning) return;

    stop();

    isRunning = true;
    setError(null);
    setIsConnecting(true);
    setIsLive(false);

    const token = runToken;
    const controller = new AbortController();
    activeController = controller;

    const observer: StreamingSubscriptionObserver<TEvent> = {
      next: (event) => {
        if (!isRunning || token !== runToken || controller.signal.aborted) return;
        setEventCount((count) => count + 1);
        options.onData?.(event);
      },
      error: (nextError) => {
        if (!isRunning || token !== runToken || controller.signal.aborted) return;

        const normalized = toError(nextError);

        if (activeController === controller) {
          activeController.abort();
          activeController = null;
        }

        clearTeardown();
        setError(normalized);
        setIsConnecting(false);
        setIsLive(false);
        isRunning = false;
        options.onError?.(normalized);
      },
      open: () => {
        if (!isRunning || token !== runToken || controller.signal.aborted) return;
        setIsConnecting(false);
        setIsLive(true);
      },
      close: () => {
        if (token !== runToken) return;

        if (activeController === controller) {
          activeController = null;
        }

        clearTeardown();
        setIsConnecting(false);
        setIsLive(false);
        isRunning = false;
      },
      get signal() {
        return controller.signal;
      },
      get isStopped() {
        return controller.signal.aborted || token !== runToken || !isRunning;
      },
    };

    try {
      const maybeTeardown = await options.subscribe(observer);

      if (token !== runToken || controller.signal.aborted) {
        if (typeof maybeTeardown === "function") {
          maybeTeardown();
        }
        return;
      }

      teardown = typeof maybeTeardown === "function" ? maybeTeardown : undefined;

      // If the transport does not explicitly call observer.open,
      // consider successful subscription as live.
      setIsConnecting(false);
      setIsLive(true);
    } catch (nextError) {
      observer.error(nextError);
    }
  };

  createEffect(() => {
    const shouldEnable = resolveOption(options.enabled ?? true);

    if (!shouldEnable) {
      stop();
      return;
    }

    if (!isRunning) {
      void start();
    }
  });

  onCleanup(() => {
    stop();
  });

  return {
    isLive,
    isConnecting,
    error,
    eventCount,
    start,
    stop,
  };
};
