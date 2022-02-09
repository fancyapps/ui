import { isScrollable } from "../../../../src/shared/utils/isScrollable.js";

export class ScrollLock {
  constructor(fancybox) {
    this.fancybox = fancybox;
    this.viewport = null;

    this.pendingUpdate = null;

    for (const methodName of ["onReady", "onResize", "onTouchstart", "onTouchmove"]) {
      this[methodName] = this[methodName].bind(this);
    }
  }

  /**
   * Process `initLayout` event to attach event listeners and resize viewport if needed
   */
  onReady() {
    //* Support Visual Viewport API
    // https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
    const viewport = window.visualViewport;

    if (viewport) {
      this.viewport = viewport;
      this.startY = 0;

      viewport.addEventListener("resize", this.onResize);

      this.updateViewport();
    }

    //* Prevent bouncing while scrolling on mobile devices
    window.addEventListener("touchstart", this.onTouchstart, { passive: false });
    window.addEventListener("touchmove", this.onTouchmove, { passive: false });

    //* Prevent window scrolling with mouse wheel
    window.addEventListener("wheel", this.onWheel, { passive: false });
  }

  /**
   * Handle `resize` event to call `updateViewport`
   */
  onResize() {
    this.updateViewport();
  }

  /**
   * Scale $container proportionally to actually fit inside browser,
   * e.g., disable viewport zooming
   */
  updateViewport() {
    const fancybox = this.fancybox,
      viewport = this.viewport,
      scale = viewport.scale || 1,
      $container = fancybox.$container;

    if (!$container) {
      return;
    }

    let width = "",
      height = "",
      transform = "";

    if (scale - 1 > 0.1) {
      width = `${viewport.width * scale}px`;
      height = `${viewport.height * scale}px`;
      transform = `translate3d(${viewport.offsetLeft}px, ${viewport.offsetTop}px, 0) scale(${1 / scale})`;
    }

    $container.style.width = width;
    $container.style.height = height;
    $container.style.transform = transform;
  }

  /**
   * Handle `touchstart` event to mark drag start position
   * @param {Object} event
   */
  onTouchstart(event) {
    this.startY = event.touches ? event.touches[0].screenY : event.screenY;
  }

  /**
   * Handle `touchmove` event to fix scrolling on mobile devices (iOS)
   * @param {Object} event
   */
  onTouchmove(event) {
    const startY = this.startY;
    const zoom = window.innerWidth / window.document.documentElement.clientWidth;

    if (!event.cancelable) {
      return;
    }

    if (event.touches.length > 1 || zoom !== 1) {
      return;
    }

    const el = isScrollable(event.composedPath()[0]);

    if (!el) {
      event.preventDefault();
      return;
    }

    const style = window.getComputedStyle(el);
    const height = parseInt(style.getPropertyValue("height"), 10);

    const curY = event.touches ? event.touches[0].screenY : event.screenY;

    const isAtTop = startY <= curY && el.scrollTop === 0;
    const isAtBottom = startY >= curY && el.scrollHeight - el.scrollTop === height;

    if (isAtTop || isAtBottom) {
      event.preventDefault();
    }
  }

  /**
   * Handle `wheel` event
   */
  onWheel(event) {
    if (!isScrollable(event.composedPath()[0])) {
      event.preventDefault();
    }
  }

  /**
   * Clean everything up
   */
  cleanup() {
    if (this.pendingUpdate) {
      cancelAnimationFrame(this.pendingUpdate);
      this.pendingUpdate = null;
    }

    const viewport = this.viewport;

    if (viewport) {
      viewport.removeEventListener("resize", this.onResize);
      this.viewport = null;
    }

    window.removeEventListener("touchstart", this.onTouchstart, false);
    window.removeEventListener("touchmove", this.onTouchmove, false);

    window.removeEventListener("wheel", this.onWheel, { passive: false });
  }

  attach() {
    this.fancybox.on("initLayout", this.onReady);
  }

  detach() {
    this.fancybox.off("initLayout", this.onReady);

    this.cleanup();
  }
}
