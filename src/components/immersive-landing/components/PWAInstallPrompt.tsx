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
import { CLASSES } from "../ImmersiveLanding.classes";
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
        class={CLASSES.pwaPrompt.dialog}
      >
        <Card variant="shadow" class={CLASSES.pwaPrompt.card}>
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            class={CLASSES.pwaPrompt.closeButton}
            onClick={handleDismiss}
            aria-label={texts().closeLabel}
          >
            X
          </Button>

          <Card.Body class={CLASSES.pwaPrompt.body}>
            <Flex align="start" gap="md" class={CLASSES.pwaPrompt.media}>
              <div class={CLASSES.pwaPrompt.appIconWrap}>
                <img src={appIcon()} alt={appName()} class={CLASSES.pwaPrompt.appIcon} />
              </div>

              <Flex direction="col" gap="sm" class={CLASSES.pwaPrompt.textWrap}>
                <h3 id="pwa-install-title" class={CLASSES.pwaPrompt.title}>
                  {texts().title}
                </h3>
                <p class={CLASSES.pwaPrompt.description}>
                  {texts().description}
                </p>
              </Flex>
            </Flex>
          </Card.Body>
          <Card.Footer class={CLASSES.pwaPrompt.footer}>
            <Button variant="primary" class={CLASSES.pwaPrompt.action} onClick={handleInstall}>
              {texts().installButton}
            </Button>
            <Button variant="ghost" class={CLASSES.pwaPrompt.action} onClick={handleDismiss}>
              {texts().notNowButton}
            </Button>
          </Card.Footer>
        </Card>
      </div>
    </Show>
  );
};
