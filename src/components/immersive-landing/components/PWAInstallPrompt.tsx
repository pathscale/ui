import {
  type Component,
  createSignal,
  onMount,
  onCleanup,
  Show,
} from "solid-js";
import { PWAInstallPromptProps } from "../types";
import Button from "../../button";
import Card from "../../card";
import Flex from "../../flex";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const defaultTexts = {
  title: "Install App",
  description: "Add this app to your home screen for a better experience.",
  installButton: "Install",
  notNowButton: "Not now",
  closeLabel: "Close",
};

export const PWAInstallPrompt: Component<PWAInstallPromptProps> = (props) => {
    const STORAGE_KEY = () => props.storageKey ?? "app_pwa_dismissed";
    const appName = () => props.appName ?? "My App";
    const appIcon = () => props.appIcon ?? "/icon-192.png";

  const texts = () => ({
    title: props.texts?.title ?? defaultTexts.title,
    description: props.texts?.description ?? defaultTexts.description,
    installButton: props.texts?.installButton ?? defaultTexts.installButton,
    notNowButton: props.texts?.notNowButton ?? defaultTexts.notNowButton,
    closeLabel: props.texts?.closeLabel ?? defaultTexts.closeLabel,
  });

  const [deferredPrompt, setDeferredPrompt] =
    createSignal<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = createSignal(false);

  const checkDismissalStatus = (): boolean => {
    const dismissed = localStorage.getItem(STORAGE_KEY());
    if (!dismissed) return true;

    const dismissedTime = Number.parseInt(dismissed, 10);
    const now = Date.now();

    if (now - dismissedTime > DISMISS_DURATION) {
      localStorage.removeItem(STORAGE_KEY());
      return true;
    }

    return false;
  };

  const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
    e.preventDefault();
    setDeferredPrompt(e);

    if (checkDismissalStatus()) {
      setShowPrompt(true);
    }
  };

  const handleInstall = async () => {
    const prompt = deferredPrompt();
    if (!prompt) return;

    try {
      prompt.prompt();
      const result = await prompt.userChoice;

      if (result.outcome === "accepted") {
        setShowPrompt(false);
        setDeferredPrompt(null);
        props.onInstall?.();
      }
    } catch (error) {
      console.debug("PWA install prompt failed:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(STORAGE_KEY(), Date.now().toString());
    props.onDismiss?.();
  };

  const handleAppInstalled = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  onMount(() => {
    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );
    window.addEventListener("appinstalled", handleAppInstalled);
  });

  onCleanup(() => {
    window.removeEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );
    window.removeEventListener("appinstalled", handleAppInstalled);
  });

  return (
    <Show when={showPrompt()}>
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="pwa-install-title"
        class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-51 animate-slide-up"
      >
        <Card
          shadow="lg"
          background="base-100"
          class="relative border border-base-300"
        >
          <Button
            size="sm"
            color="ghost"
            shape="circle"
            class="absolute top-2 right-2"
            onClick={handleDismiss}
            aria-label={texts().closeLabel}
          >
            X
          </Button>

          <Card.Body>
            <Flex align="start" gap="md">
              <div class="w-14 h-14 flex-shrink-0 rounded-xl bg-base-200 p-2">
                <img src={appIcon()} alt={appName()} class="w-full h-full" />
              </div>

              <Flex direction="col" gap="sm" class="flex-1 min-w-0 pr-6">
                <Card.Title id="pwa-install-title" tag="h3" class="text-base">
                  {texts().title}
                </Card.Title>
                <p class="text-sm text-base-content/70">
                  {texts().description}
                </p>
              </Flex>
            </Flex>

            <Card.Actions class="mt-4">
              <Button color="primary" class="flex-1" onClick={handleInstall}>
              {texts().installButton}
              </Button>
              <Button color="ghost" class="flex-1" onClick={handleDismiss}>
              {texts().notNowButton}
              </Button>
            </Card.Actions>
          </Card.Body>
        </Card>
      </div>
    </Show>
  );
};
