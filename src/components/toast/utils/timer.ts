export default class Timer {
  private callback: () => void;
  private delay: number;
  private startedAt: number;
  private timer: number;

  constructor(callback: () => void, delay: number) {
    this.callback = callback;
    this.delay = delay;
    this.startedAt = Date.now();
    this.timer = window.setTimeout(callback, delay);
  }

  pause() {
    this.stop();
    this.delay -= Date.now() - this.startedAt;
  }

  resume() {
    this.stop();
    this.startedAt = Date.now();
    this.timer = window.setTimeout(this.callback, this.delay);
  }

  stop() {
    clearTimeout(this.timer);
  }
}
