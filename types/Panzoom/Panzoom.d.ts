import { Base } from '../shared/Base/Base';
import { PointerTracker } from '../shared/utils/PointerTracker';

export class Panzoom extends Base {
  /**
   * Panzoom constructor
   * @constructs Panzoom
   * @param {HTMLElement} $viewport Panzoom container
   * @param {Object} [options] Options for Panzoom
   */
  constructor($container: any, options?: any);

  state: string;
  $container: any;
  $content: any;
  $viewport: any;
  updateRate: any;
  container: {
    width: any;
    height: any;
  };
  viewport: any;
  content: any;
  transform: any;
  changedDelta: number;
  lockAxis: string;
  _dragOffset: {
    x: number;
    y: number;
    scale: number;
    time: number;
  };
  friction: any;
  pointerTracker: PointerTracker;
  resizeObserver: ResizeObserver;
  updateTimer: any;
  velocity: {
    x: number;
    y: number;
    scale: number;
  };
  dragStart: {
    rect: any;
    x: any;
    y: any;
    scale: any;
  };
  dragPosition: any;
  dragOffset: {
    x: number;
    y: number;
    scale: number;
    time: number;
  };

  rAF: number;

  /**
   * Create references to container, viewport and content elements
   */
  initLayout(): void;

  /**
   * Restore instance variables to default values
   */
  resetValues(): void;

  /**
   * Handle `load` event
   * @param {Event} event
   */
  onLoad(event: Event): void;

  /**
   * Handle `click` event
   * @param {Event} event
   */
  onClick(event: Event): void;

  /**
   * Handle `wheel` event
   * @param {Event} event
   */
  onWheel(event: Event): void;

  /**
   * Change zoom level depending on scroll direction
   * @param {Event} event `wheel` event
   */
  zoomWithWheel(event: Event): void;

  /**
   * Change zoom level depending on click coordinates
   * @param {Event} event `click` event
   */
  zoomWithClick(event: Event): void;

  /**
   * Attach load, wheel and click event listeners, initialize `resizeObserver` and `PointerTracker`
   */
  attachEvents(): void;

  initObserver(): void;

  /**
   * Restore drag related variables to default values
   */
  resetDragPosition(): void;

  /**
   * Trigger update events before/after resizing content and viewport
   * @param {Boolean} silently Should trigger `afterUpdate` event at the end
   */
  updateMetrics(silently: boolean): void;

  /**
   * Increase zoom level
   * @param {Number} [step] Zoom ratio; `0.5` would increase scale from 1 to 1.5
   */
  zoomIn(step?: number): void;

  /**
   * Decrease zoom level
   * @param {Number} [step] Zoom ratio; `0.5` would decrease scale from 1.5 to 1
   */
  zoomOut(step?: number): void;

  /**
   * Toggles zoom level between max and base levels
   * @param {Object} [options] Additional options
   */
  toggleZoom(props?: {}): void;

  /**
   * Animate to given zoom level
   * @param {Number} scale New zoom level
   * @param {Object} [options] Additional options
   */
  zoomTo(scale?: number, {x, y}?: any): void;

  /**
   * Calculate difference for top/left values if content would scale at given coordinates
   * @param {Number} scale
   * @param {Number} x
   * @param {Number} y
   * @returns {Object}
   */
  getZoomDelta(scale: number, x?: number, y?: number): any;

  /**
   * Animate to given positon and/or zoom level
   * @param {Object} [options] Additional options
   */
  panTo({x, y, scale, friction, ignoreBounds}?: any): void;

  /**
   * Start animation loop
   */
  startAnimation(): void;

  /**
   * Process animation frame
   */
  animate(): void;

  /**
   * Calculate boundaries
   */
  getBounds(scale: any): {
    boundX: any;
    boundY: any;
  };

  /**
   * Change animation velocity if boundary is reached
   */
  setEdgeForce(): void;

  /**
   * Change dragging position if boundary is reached
   */
  setDragResistance(): void;

  /**
   * Set velocity to move content to drag position
   */
  setDragForce(): void;

  /**
   * Update end values based on current velocity and friction;
   */
  recalculateTransform(): void;

  /**
   * Check if content is currently animating
   * @returns {Boolean}
   */
  isAnimating(): boolean;

  /**
   * Set content `style.transform` value based on current animation frame
   */
  setTransform(final: any): void;

  /**
   * Stop animation loop
   */
  endAnimation(silently: any): void;

  /**
   * Update the class name depending on whether the content is scaled
   */
  handleCursor(): void;

  /**
   * Remove observation and detach event listeners
   */
  detachEvents(): void;

  /**
   * Clean up
   */
  destroy(): void;
}

export type PanzoomRatioFn = () => number;
export type PanzoomEventCallback = () => void;

export interface PanzoomOptions {
  // Enable touch guestures
  touch: boolean,

  // Enable zooming
  zoom: boolean,

  // Enable pinch gesture to zoom in/out using two fingers
  pinchToZoom: boolean,

  // Disable dragging if scale level is equal to value of `baseScale` option
  panOnlyZoomed: boolean,

  // Lock axis while dragging,
  // possible values: false | "x" | "y" | "xy"
  lockAxis: boolean | 'x' | 'y' | 'xy',

  // * All friction values are inside [0, 1) interval,
  // * where 0 would change instantly, but 0.99 would update extremely slowly

  // Friction while panning/dragging
  friction: number,

  // Friction while decelerating after drag end
  decelFriction: number,

  // Friction while scaling
  zoomFriction: number,

  // Bounciness after hitting the edge
  bounceForce: number,

  // Initial scale level
  baseScale: number,

  // Minimum scale level
  minScale: number,

  // Maximum scale level
  maxScale: number,

  // Default scale step while zooming
  step: number,

  // Allow to select text,
  // if enabled, dragging will be disabled when text selection is detected
  textSelection: boolean,

  // Add `click` event listener,
  // possible values: true | false | function | "toggleZoom"
  click: boolean | 'toggleZoom' | PanzoomEventCallback,

  // Add `wheel` event listener,
  // possible values: true | false | function |  "zoom"
  wheel: boolean | 'zoom' | PanzoomEventCallback,

  // Value for zoom on mouse wheel
  wheelFactor: number,

  // Number of wheel events after which it should stop preventing default behaviour of mouse wheel
  wheelLimit: number,

  // Class name added to `$viewport` element to indicate if content is draggable
  draggableClass: string,

  // Class name added to `$viewport` element to indicate that user is currently dragging
  draggingClass: string,

  // Content will be scaled by this number,
  // this can also be a function which should return a number, for example:
  // ratio: function() { return 1 / (window.devicePixelRatio || 1) }
  ratio: number | PanzoomRatioFn,
}
