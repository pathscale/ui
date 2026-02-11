// TypeScript interface for PWA BeforeInstallPromptEvent
// This event is fired when the browser determines the app can be installed
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }
  