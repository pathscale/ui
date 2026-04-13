import { type Component, createSignal, onMount, Show } from "solid-js";
import { BrowserType, FirefoxPWABannerProps } from "../types";
import Button from "../../button";
import Card from "../../card";
import Flex from "../../flex";
import Icon from "../../icon";
import { CLASSES } from "../ImmersiveLanding.classes";

const defaultTexts = {
  title: "Install App on Firefox",
  description:
    "Firefox does not support direct app installation. Install our helper extension to enable PWA support.",
  installButton: "Install Extension",
  dismissButton: "Maybe later",
  closeLabel: "Close",
};
/**
 * Detect browser type and PWA support
 */
const detectBrowser = (): BrowserType => {
  const ua = navigator.userAgent.toLowerCase();

  // Check if beforeinstallprompt is supported (Chromium browsers)
  if ("BeforeInstallPromptEvent" in globalThis) {
    return "supported";
  }

  // Detect specific browsers
  if (ua.includes("firefox")) {
    return "firefox";
  }

  if (ua.includes("safari") && !ua.includes("chrome")) {
    return "safari";
  }

  return "other";
};

/**
 * Check if running on mobile
 */
const isMobile = (): boolean => {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
};

/**
 * Check if PWA is already installed (running in standalone mode)
 */
const isPWAInstalled = (): boolean => {
  return globalThis.matchMedia("(display-mode: standalone)").matches;
};

/**
 * PWAUnsupportedBanner Component
 *
 * Shows a dismissible banner for browsers that don't support native PWA installation
 * (beforeinstallprompt). Currently shows for Firefox desktop with extension recommendation.
 */
export const FirefoxPWABanner: Component<FirefoxPWABannerProps> = (props) => {
  const [showBanner, setShowBanner] = createSignal(false);
  const [browser, setBrowser] = createSignal<BrowserType>("supported");

  const STORAGE_KEY = () => props.storageKey ?? "app_firefox_pwa_dismissed";
  const extensionUrl = () =>
    props.extensionUrl ?? "https://addons.mozilla.org/";
  const texts = () => ({
    title: props.texts?.title ?? defaultTexts.title,
    description: props.texts?.description ?? defaultTexts.description,
    installButton: props.texts?.installButton ?? defaultTexts.installButton,
    dismissButton: props.texts?.dismissButton ?? defaultTexts.dismissButton,
    closeLabel: props.texts?.closeLabel ?? defaultTexts.closeLabel,
  });

  const checkShouldShow = (): boolean => {
    const detectedBrowser = detectBrowser();
    setBrowser(detectedBrowser);

    // Only show for unsupported browsers on desktop
    if (detectedBrowser === "supported") return false;
    if (isMobile()) return false;

    // For now, only show for Firefox (has extension solution)
    // Safari users can use "Add to Dock" manually
    if (detectedBrowser !== "firefox") return false;

    // Don't show if already running as PWA
    if (isPWAInstalled()) return false;

    // Don't show if user has dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY());
    if (dismissed === "true") return false;

    return true;
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(STORAGE_KEY(), "true");
    props.onDismiss?.();
  };

  const handleAction = () => {
    if (browser() === "firefox") {
      globalThis.open(extensionUrl(), "_blank", "noopener,noreferrer");
      props.onInstall?.();
    }
  };

  onMount(() => {
    if (checkShouldShow()) {
      // Small delay to not overwhelm user immediately
      setTimeout(() => setShowBanner(true), 2000);
    }
  });

  return (
    <Show when={showBanner()}>
      <div
        aria-labelledby="pwa-unsupported-title"
        {...{ class: CLASSES.firefoxBanner.dialog }}
      >
        <Card variant="shadow" class={CLASSES.firefoxBanner.card}>
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            class={CLASSES.firefoxBanner.closeButton}
            onClick={handleDismiss}
            aria-label={texts().closeLabel}
          >
            <Icon name="icon-[mdi--close]" width={16} height={16} />
          </Button>

          <Card.Body class={CLASSES.firefoxBanner.body}>
            <Flex align="start" gap="md" class={CLASSES.firefoxBanner.media}>
              <div {...{ class: CLASSES.firefoxBanner.iconWrap }}>
                <Show when={browser() === "firefox"}>
                  <Icon
                    name="icon-[mdi--firefox]"
                    width={40}
                    height={40}
                    class={CLASSES.firefoxBanner.browserIcon}
                  />
                </Show>
              </div>

              <Flex direction="col" gap="sm" class={CLASSES.firefoxBanner.textWrap}>
                <h3 id="pwa-unsupported-title" {...{ class: CLASSES.firefoxBanner.title }}>
                  {texts().title}
                </h3>
                <p {...{ class: CLASSES.firefoxBanner.description }}>
                  {texts().description}
                </p>
              </Flex>
            </Flex>
          </Card.Body>
          <Card.Footer class={CLASSES.firefoxBanner.footer}>
            <Button variant="primary" class={CLASSES.firefoxBanner.action} onClick={handleAction}>
              {texts().installButton}
            </Button>
            <Button variant="ghost" class={CLASSES.firefoxBanner.action} onClick={handleDismiss}>
              {texts().dismissButton}
            </Button>
          </Card.Footer>
        </Card>
      </div>
    </Show>
  );
};
