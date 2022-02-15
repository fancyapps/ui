import { Fancybox } from '../../Fancybox';

export class ScrollLock {
  fancybox: Fancybox;
  viewport: VisualViewport;
  pendingUpdate: any;
  startY: any;

  constructor(fancybox: Fancybox);

  /**
   * Process `initLayout` event to attach event listeners and resize viewport if needed
   */
  onReady(): void;

  /**
   * Handle `resize` event to call `updateViewport`
   */
  onResize(): void;

  /**
   * Scale $container proportionally to actually fit inside browser,
   * e.g., disable viewport zooming
   */
  updateViewport(): void;

  /**
   * Handle `touchstart` event to mark drag start position
   * @param {Object} event
   */
  onTouchstart(event: any): void;

  /**
   * Handle `touchmove` event to fix scrolling on mobile devices (iOS)
   * @param {Object} event
   */
  onTouchmove(event: any): void;

  /**
   * Handle `wheel` event
   */
  onWheel(event: any): void;

  /**
   * Clean everything up
   */
  cleanup(): void;

  attach(): void;

  detach(): void;
}
