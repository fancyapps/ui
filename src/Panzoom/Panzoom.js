import { extend } from "../shared/utils/extend.js";
import { round } from "../shared/utils/round.js";

import { ResizeObserver } from "../shared/utils/ResizeObserver.js";

import { clearTextSelection } from "../shared/utils/clearTextSelection.js";

import { isScrollable } from "../shared/utils/isScrollable.js";
import { getTextNodeFromPoint } from "../shared/utils/getTextNodeFromPoint.js";

import { getFullWidth, getFullHeight } from "../shared/utils/getDimensions.js";

import { Base } from "../shared/Base/Base.js";

import { Plugins } from "./plugins/index.js";

const defaults = {
  // Disable dragging if scale level is equal to value of `baseScale` option
  panOnlyZoomed: false,

  // Lock axis while dragging,
  // possible values: false | "x" | "y" | "xy"
  lockAxis: false,

  // * Friction values are inside [0, 1), where 0 would change instantly, but 0.99 would update extremely slowly

  // Friction while panning/dragging
  friction: 0.72,

  // Friction while decelerating after drag end
  decelFriction: 0.92,

  // Friction while scaling
  zoomFriction: 0.72,

  // Bounciness after hitting the edge
  bounceForce: 0.1,

  // Initial scale level
  baseScale: 1,

  // Minimum scale level
  minScale: 1,

  // Maximum scale level
  maxScale: 2,

  // Default scale step while scaling
  step: 0.5,

  // Should content be centered while scaling or moved towards given coordintes,
  // if coordinates are outside the content
  zoomInCentered: true,

  // Enable pinch gesture to zoom in/out using two fingers
  pinchToZoom: true,

  // Allow to select text,
  // if enabled, dragging will be disabled when text selection is detected
  textSelection: true,

  // Add `click` event listener,
  // possible values: true | false | function | "toggleZoom"
  click: "toggleZoom",

  // Delay required for two consecutive clicks to be interpreted as a double-click
  clickDelay: 250,

  // Enable `doubleClick` event,
  // possible values: true | false | function | "toggleZoom"
  doubleClick: false,

  // Add `wheel` event listener,
  // possible values: true | false | function |  "zoom"
  wheel: "zoom",

  // Value for zoom on mouse wheel
  wheelFactor: 30,

  // Number of wheel events after which it should stop preventing default behaviour of mouse wheel
  wheelLimit: 3,

  // Enable touch guestures
  touch: true,

  // Class name added to `$viewport` element to indicate if content is draggable
  draggableClass: "is-draggable",

  // Class name added to `$viewport` element to indicate that user is currently dragging
  draggingClass: "is-dragging",
};

export class Panzoom extends Base {
  /**
   * Panzoom constructor
   * @constructs Panzoom
   * @param {HTMLElement} $viewport Panzoom container
   * @param {Object} [options] Options for Panzoom
   */
  constructor($viewport, options = {}) {
    options = extend(true, {}, defaults, options);

    super(options);

    if (!($viewport instanceof HTMLElement)) {
      throw new Error("Viewport not found");
    }

    this.state = "init";

    this.$viewport = $viewport;

    // Bind event handlers for referencability
    for (const methodName of ["onPointerDown", "onPointerMove", "onPointerUp", "onWheel", "onClick"]) {
      this[methodName] = this[methodName].bind(this);
    }

    // Make sure content element exists
    this.$content = this.option("content");

    if (!this.$content) {
      this.$content = this.$viewport.querySelector(".panzoom__content");
    }

    if (!this.$content) {
      throw new Error("Content not found");
    }

    if (this.option("textSelection") === false) {
      this.$viewport.classList.add("not-selectable");
    }

    this.resetValues();

    this.attachPlugins(Panzoom.Plugins);

    this.trigger("init");

    this.handleContent();

    this.attachEvents();

    this.trigger("ready");

    // Finalize initialization
    if (this.state === "init") {
      const baseScale = this.option(`baseScale`);

      if (baseScale === 1) {
        this.state = "ready";

        this.handleCursor();
      } else {
        this.panTo({ scale: baseScale, friction: 0 });
      }
    }
  }

  /**
   * Check content type, add `load` and `error` callbacks for image
   */
  handleContent() {
    if (this.$content instanceof HTMLImageElement) {
      // Callback to be called after image has finished loading
      const done = () => {
        const imgWidth = this.$content.naturalWidth;
        this.maxScale = this.option("maxScale");

        this.options.maxScale = function () {
          const wrapWidth = this.contentDim.width;

          return imgWidth > 0 && wrapWidth > 0 ? (imgWidth / wrapWidth) * this.maxScale : this.maxScale;
        };

        this.updateMetrics();

        this.trigger(imgWidth > 0 ? "load" : "error");
      };

      if (this.$content.complete !== true) {
        this.$content.onload = () => done();
        this.$content.onerror = () => done();
      } else {
        done();
      }
    } else {
      this.updateMetrics();
    }
  }

  /**
   * Restore instance variables to default values
   */
  resetValues() {
    this.viewportDim = {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    };

    this.contentDim = {
      width: 0,
      height: 0,
    };

    this.friction = this.option("friction");

    this.current = { x: 0, y: 0, scale: 1 };
    this.velocity = { x: 0, y: 0, scale: 0 };

    this.pan = { x: 0, y: 0, scale: 1 };

    this.drag = {
      startTime: null,

      firstPosition: null,

      startPosition: null,
      startPoint: null,
      startDistance: null,

      endPosition: null,
      endPoint: null,

      distance: 0,
      distanceX: 0,
      distanceY: 0,

      elapsedTime: 0,
    };

    this.lockAxis = null;

    this.pendingAnimateUpdate = null;
    this.pendingResizeUpdate = null;

    this.pointers = [];
  }

  /**
   * Update readings of viewport and content dimensions
   */
  updateMetrics() {
    let { top, left, width, height } = this.$viewport.getBoundingClientRect();

    const styles = window.getComputedStyle(this.$viewport);

    width -= parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    height -= parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

    this.viewportDim = { top, left, width, height };

    this.contentDim = {
      width: this.option("width", getFullWidth(this.$content)),
      height: this.option("hidth", getFullHeight(this.$content)),
    };

    this.trigger("updateMetrics");

    this.updateBounds();
  }

  /**
   * Update current boundaries
   * @param {number} [scale] Optional scale of content
   */
  updateBounds(scale) {
    const boundX = { from: 0, to: 0 };
    const boundY = { from: 0, to: 0 };

    if (!scale) {
      scale = this.velocity.scale ? this.pan.scale : this.current.scale;
    }

    if (scale < 1) {
      return [boundX, boundY];
    }

    const contentDim = this.contentDim;
    const viewportDim = this.viewportDim;

    const currentWidth = contentDim.width * scale;
    const currentHeight = contentDim.height * scale;

    boundX.to = round((currentWidth - contentDim.width) * 0.5);

    if (contentDim.width > viewportDim.width) {
      boundX.from = round(boundX.to + viewportDim.width - currentWidth);
    } else {
      boundX.from = round(boundX.to * -1);
    }

    boundY.to = round((currentHeight - contentDim.height) * 0.5);

    if (contentDim.height > viewportDim.height) {
      boundY.from = round(boundY.to + viewportDim.height - currentHeight);
    } else {
      boundY.from = round(boundY.to * -1);
    }

    this.boundX = boundX;
    this.boundY = boundY;

    this.trigger("updateBounds", scale);

    return [this.boundX, this.boundY];
  }

  /**
   * Increase zoom level
   * @param {Number} [step] Zoom ratio; `0.5` would increase scale from 1 to 1.5
   */
  zoomIn(step) {
    this.zoomTo(this.current.scale + (step || this.option("step")));
  }

  /**
   * Decrease zoom level
   * @param {Number} [step] Zoom ratio; `0.5` would decrease scale from 1.5 to 1
   */
  zoomOut(step) {
    this.zoomTo(this.current.scale - (step || this.option("step")));
  }

  /**
   * Toggles zoom level between max and base levels
   * @param {Object} [options] Additional options
   */
  toggleZoom(props = {}) {
    const maxScale = this.option("maxScale");
    const baseScale = this.option("baseScale");

    this.zoomTo(this.current.scale > baseScale + (maxScale - baseScale) * 0.5 ? baseScale : maxScale, props);
  }

  /**
   * Animates to given zoom level
   * @param {Number} scale New zoom level
   * @param {Object} [options] Additional options
   */
  zoomTo(scale, options = {}) {
    let { x = null, y = null, friction = this.option("zoomFriction") } = options;

    if (!scale) {
      scale = this.option("baseScale");
    }

    scale = Math.max(Math.min(scale, this.option("maxScale")), this.option("minScale"));

    const width = this.contentDim.width;
    const height = this.contentDim.height;

    const currentWidth = width * this.current.scale;
    const currentHeight = height * this.current.scale;

    const nextWidth = width * scale;
    const nextHeight = height * scale;

    if (x === null) {
      x = currentWidth * 0.5;
    }

    if (y === null) {
      y = currentHeight * 0.5;
    }

    if (this.option("zoomInCentered") === false) {
      if (x < currentWidth * 0.5) {
        x = currentWidth;
      }

      if (x > currentWidth) {
        x = 0;
      }

      if (y < 0) {
        y = currentHeight;
      }

      if (y > currentHeight) {
        y = 0;
      }
    }

    const percentXInCurrentBox = currentWidth > 0 ? x / currentWidth : 0;
    const percentYInCurrentBox = currentHeight > 0 ? y / currentHeight : 0;

    let deltaX = (nextWidth - currentWidth) * (percentXInCurrentBox - 0.5);
    let deltaY = (nextHeight - currentHeight) * (percentYInCurrentBox - 0.5);

    if (Math.abs(deltaX) < 1) {
      deltaX = 0;
    }

    if (Math.abs(deltaY) < 1) {
      deltaY = 0;
    }

    x = this.current.x - deltaX;
    y = this.current.y - deltaY;

    this.panTo({ x, y, scale, friction });
  }

  /**
   * Animates to given positon and/or zoom level
   * @param {Object} [options] Additional options
   */
  panTo(options) {
    let {
      x = 0,
      y = 0,
      scale = this.current.scale,
      friction = this.option("friction"),
      ignoreBounds = false,
    } = options;

    if (!friction) {
      this.stopMoving();
    }

    if (ignoreBounds !== true) {
      const [boundX, boundY] = this.updateBounds(scale);

      if (boundX) {
        x = Math.max(Math.min(x, boundX.to), boundX.from);
      }

      if (boundY) {
        y = Math.max(Math.min(y, boundY.to), boundY.from);
      }
    }

    // Check if there is anything to animate
    if (
      friction > 0 &&
      (Math.abs(x - this.current.x) > 0.1 ||
        Math.abs(y - this.current.y) > 0.1 ||
        Math.abs(scale - this.current.scale) > 0.1)
    ) {
      this.state = "panning";

      this.friction = friction;

      this.pan = {
        x,
        y,
        scale,
      };

      this.velocity = {
        x: (1 / this.friction - 1) * (x - this.current.x),
        y: (1 / this.friction - 1) * (y - this.current.y),
        scale: (1 / this.friction - 1) * (scale - this.current.scale),
      };

      this.animate();

      return this;
    }

    if (this.pendingAnimateUpdate) {
      cancelAnimationFrame(this.pendingAnimateUpdate);
      this.pendingAnimateUpdate = null;
    }

    this.state = "ready";

    this.stopMoving();

    this.current = { x, y, scale };

    this.transform();

    this.handleCursor();

    this.trigger("afterAnimate", true);

    return this;
  }

  /**
   * Start animation or process animation frame
   */
  animate() {
    // Skip if already waiting for the next RAF
    if (this.pendingAnimateUpdate) {
      return;
    }

    // Update velocity depending on bounds and drag speed
    this.applyBoundForce();
    this.applyDragForce();

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    this.velocity.scale *= this.friction;

    this.current.x += this.velocity.x;
    this.current.y += this.velocity.y;

    this.current.scale += this.velocity.scale;

    if (
      this.state == "dragging" ||
      this.state == "pointerdown" ||
      Math.abs(this.velocity.x) > 0.05 ||
      Math.abs(this.velocity.y) > 0.05 ||
      Math.abs(this.velocity.scale) > 0.05
    ) {
      // Update CSS `transform` value for the content element
      this.transform();

      // Next RAF
      this.pendingAnimateUpdate = requestAnimationFrame(() => {
        this.pendingAnimateUpdate = null;
        this.animate();
      });

      // * Continue animation loop

      return;
    }

    // * Stop animation

    // Normalize values
    this.current.x = round(this.current.x + this.velocity.x / (1 / this.friction - 1));
    this.current.y = round(this.current.y + this.velocity.y / (1 / this.friction - 1));

    if (Math.abs(this.current.x) < 0.5) {
      this.current.x = 0;
    }

    if (Math.abs(this.current.y) < 0.5) {
      this.current.y = 0;
    }

    this.current.scale = round(this.current.scale + this.velocity.scale / (1 / this.friction - 1), 10000);

    if (Math.abs(this.current.scale - 1) < 0.01) {
      this.current.scale = 1;
    }

    this.state = "ready";

    this.stopMoving();

    this.transform();

    this.handleCursor();

    this.trigger("afterAnimate");
  }

  /**
   * Update the class name depending on whether the content is scaled
   */
  handleCursor() {
    const draggableClass = this.option("draggableClass");

    if (!draggableClass || !this.option("touch")) {
      return;
    }

    if (
      this.contentDim.width <= this.viewportDim.width &&
      this.option("panOnlyZoomed") == true &&
      this.current.scale <= this.option("baseScale")
    ) {
      this.$viewport.classList.remove(draggableClass);
    } else {
      this.$viewport.classList.add(draggableClass);
    }
  }

  /**
   * Check if content is dragged, zoomed or is animating to resting position
   */
  isMoved() {
    return (
      this.current.x !== 0 ||
      this.current.y !== 0 ||
      this.current.scale !== 1 ||
      this.velocity.x > 0 ||
      this.velocity.y > 0 ||
      this.velocity.scale > 0
    );
  }

  /**
   * Reset velocity values to stop animation
   */
  stopMoving() {
    this.velocity = {
      x: 0,
      y: 0,
      scale: 0,
    };
  }

  /**
   * Update CSS `transform` property of content with current values,
   * is executed at each step of the animation
   */
  transform() {
    this.trigger("beforeTransform");

    const x = round(this.current.x, 100);
    const y = round(this.current.y, 100);

    const scale = round(this.current.scale, 10000);

    if (Math.abs(x) <= 0.1 && Math.abs(y) <= 0.1 && Math.abs(scale - 1) <= 0.1) {
      this.$content.style.transform = "";
    } else {
      // Sadly, `translate3d` causes image blurriness on Safari
      this.$content.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }

    this.trigger("afterTransform");
  }

  /**
   * Apply bounce force if boundary is reached
   */
  applyBoundForce() {
    if (this.state !== "decel") {
      return;
    }

    const resultForce = { x: 0, y: 0 };
    const bounceForce = this.option("bounceForce");

    const boundX = this.boundX;
    const boundY = this.boundY;

    let pastLeft, pastRight, pastTop, pastBottom;

    if (boundX) {
      pastLeft = this.current.x < boundX.from;
      pastRight = this.current.x > boundX.to;
    }

    if (boundY) {
      pastTop = this.current.y < boundY.from;
      pastBottom = this.current.y > boundY.to;
    }

    // Past left of right viewport boundaries
    if (pastLeft || pastRight) {
      const bound = pastLeft ? boundX.from : boundX.to;
      const distance = bound - this.current.x;

      let force = distance * bounceForce;

      const restX = this.current.x + (this.velocity.x + force) / (1 / this.friction - 1);

      if (!((pastLeft && restX < boundX.from) || (pastRight && restX > boundX.to))) {
        force = distance * bounceForce - this.velocity.x;
      }

      resultForce.x = force;
    }

    // Past top of bottom viewport boundaries
    if (pastTop || pastBottom) {
      const bound = pastTop ? boundY.from : boundY.to;
      const distance = bound - this.current.y;

      let force = distance * bounceForce;

      const restY = this.current.y + (this.velocity.y + force) / (1 / this.friction - 1);

      if (!((pastTop && restY < boundY.from) || (pastBottom && restY > boundY.to))) {
        force = distance * bounceForce - this.velocity.y;
      }

      resultForce.y = force;
    }

    this.velocity.x += resultForce.x;
    this.velocity.y += resultForce.y;
  }

  /**
   * Apply drag force to move content to drag position
   */
  applyDragForce() {
    if (this.state !== "dragging") {
      return;
    }

    this.velocity = {
      x: (1 / this.friction - 1) * (this.drag.endPosition.x - this.current.x),
      y: (1 / this.friction - 1) * (this.drag.endPosition.y - this.current.y),
      scale: (1 / this.friction - 1) * (this.drag.endPosition.scale - this.current.scale),
    };
  }

  /**
   * Initialize `resizeObserver` and attach touch/mouse/click/wheel event listeners
   */
  attachEvents() {
    const $viewport = this.$viewport;

    // * Create and attach resize observer
    this.resizeObserver =
      this.resizeObserver ||
      new ResizeObserver((entries) => {
        this.pendingResizeUpdate =
          this.pendingResizeUpdate ||
          setTimeout(() => {
            let rect = entries && entries[0].contentRect;

            // Polyfill does not provide `contentRect`
            if (!rect && this.$viewport) rect = this.$viewport.getBoundingClientRect();

            // Check to see if there are any changes
            if (
              rect &&
              (Math.abs(rect.width - this.viewportDim.width) > 1 || Math.abs(rect.height - this.viewportDim.height) > 1)
            ) {
              this.updateMetrics();
            }

            this.pendingResizeUpdate = null;
          }, this.option("updateRate", 250));
      });

    this.resizeObserver.observe($viewport);

    $viewport.addEventListener("click", this.onClick, { passive: false });
    $viewport.addEventListener("wheel", this.onWheel, { passive: false });

    // * Add touch listeners

    if (!this.option("touch")) {
      return;
    }

    // Check if pointer events are supported
    if (window.PointerEvent) {
      // Add Pointer Event Listener
      $viewport.addEventListener("pointerdown", this.onPointerDown, { passive: false });
      $viewport.addEventListener("pointermove", this.onPointerMove, { passive: false });
      $viewport.addEventListener("pointerup", this.onPointerUp);
      $viewport.addEventListener("pointercancel", this.onPointerUp);
    } else {
      // Add Touch Listeners
      $viewport.addEventListener("touchstart", this.onPointerDown, { passive: false });
      $viewport.addEventListener("touchmove", this.onPointerMove, { passive: false });
      $viewport.addEventListener("touchend", this.onPointerUp);
      $viewport.addEventListener("touchcancel", this.onPointerUp);

      // Add Mouse Listeners
      $viewport.addEventListener("mousedown", this.onPointerDown);
    }
  }

  /**
   * Remove observation and detach event listeners
   */
  detachEvents() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = null;

    if (this.pendingResizeUpdate) {
      clearTimeout(this.pendingResizeUpdate);
      this.pendingResizeUpdate = null;
    }

    const $viewport = this.$viewport;

    if (window.PointerEvent) {
      //  Pointer Event Listener
      $viewport.removeEventListener("pointerdown", this.onPointerDown, { passive: false });
      $viewport.removeEventListener("pointermove", this.onPointerMove, { passive: false });
      $viewport.removeEventListener("pointerup", this.onPointerUp);
      $viewport.removeEventListener("pointercancel", this.onPointerUp);
    } else {
      //  Touch Listeners
      $viewport.removeEventListener("touchstart", this.onPointerDown, { passive: false });
      $viewport.removeEventListener("touchmove", this.onPointerMove, { passive: false });
      $viewport.removeEventListener("touchend", this.onPointerUp);
      $viewport.removeEventListener("touchcancel", this.onPointerUp);

      //  Mouse Listeners
      $viewport.removeEventListener("mousedown", this.onPointerDown);
    }

    $viewport.removeEventListener("click", this.onClick, { passive: false });
    $viewport.removeEventListener("wheel", this.onWheel, { passive: false });
  }

  /**
   * Make new pointer object from event data
   * @param {Object} event
   */
  copyPointer(event) {
    return {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    };
  }

  /**
   * Find index of corresponding pointer object from event
   * @param {Object} event
   */
  findPointerIndex(event) {
    let i = this.pointers.length;

    while (i--) {
      if (this.pointers[i].pointerId === event.pointerId) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Add or update pointer object for each finger
   * @param {Object} event
   */
  addPointer(event) {
    let i = 0;

    // Add touches if applicable
    if (event.touches && event.touches.length) {
      for (const touch of event.touches) {
        touch.pointerId = i++;
        this.addPointer(touch);
      }

      return;
    }

    i = this.findPointerIndex(event);

    // Update if already present
    if (i > -1) {
      this.pointers.splice(i, 1);
    }

    this.pointers.push(event);
  }

  /**
   * Remove corresponding pointer object
   * @param {Object} event
   */
  removePointer(event) {
    // Add touches if applicable
    if (event.touches) {
      // Remove all touches
      while (this.pointers.length) {
        this.pointers.pop();
      }
      return;
    }

    const i = this.findPointerIndex(event);

    if (i > -1) {
      this.pointers.splice(i, 1);
    }
  }

  /**
   * Get middle point from last two touch points,
   * if there is only one point, then it is returned
   */
  getMiddlePoint() {
    let pointers = [...this.pointers];

    pointers = pointers.sort((a, b) => {
      return b.pointerId - a.pointerId;
    });

    const pointer1 = pointers.shift();
    const pointer2 = pointers.shift();

    if (pointer2) {
      return {
        clientX: (pointer1.clientX - pointer2.clientX) * 0.5 + pointer2.clientX,
        clientY: (pointer1.clientY - pointer2.clientY) * 0.5 + pointer2.clientY,
      };
    }

    return {
      clientX: pointer1 ? pointer1.clientX : 0,
      clientY: pointer1 ? pointer1.clientY : 0,
    };
  }

  /**
   * Get distance between any touch points
   * @param {Object} pointers
   * @param {String} [axis]
   */
  getDistance(pointers, axis) {
    pointers = pointers || [...this.pointers];
    pointers = pointers.slice();

    if (!pointers || pointers.length < 2) {
      return 0;
    }

    pointers = pointers.sort((a, b) => {
      return b.pointerId - a.pointerId;
    });

    const event1 = pointers.shift();
    const event2 = pointers.shift();

    const xDistance = Math.abs(event2.clientX - event1.clientX);

    if (axis === "x") {
      return xDistance;
    }

    const yDistance = Math.abs(event2.clientY - event1.clientY);

    if (axis === "y") {
      return yDistance;
    }

    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
  }

  /**
   * Stop dragging animation and freeze current state
   */
  resetDragState() {
    const { left, top } = this.$content.getClientRects()[0];

    const middlePoint = this.getMiddlePoint();

    const currentPosition = {
      top,
      left,
      x: this.current.x,
      y: this.current.y,
      scale: this.current.scale,
    };

    extend(this.drag, {
      startPosition: extend({}, currentPosition),
      startPoint: extend({}, middlePoint),
      startDistance: this.getDistance(),

      endPosition: extend({}, currentPosition),
      endPoint: extend({}, middlePoint),

      distance: 0,
      distanceX: 0,
      distanceY: 0,
    });

    if (this.state === "pointerdown") {
      this.lockAxis = null;

      this.drag.startTime = new Date();
      this.drag.firstPosition = Object.assign({}, currentPosition);
    }

    this.stopMoving();

    this.friction = this.option("friction");
  }

  /**
   * Handle `pointerdown`, `touchstart` or `mousedown` event
   * @param {Event} event
   */
  onPointerDown(event) {
    if (!event || (event.button && event.button > 0)) {
      return;
    }

    // Improve UX - disable click events while zooming content that should be
    // interactive only when zoomed in (e.g., from within carousel)
    if (this.option("panOnlyZoomed") && this.velocity.scale) {
      event.preventDefault();
      return;
    }

    this.resetDragState();

    if (!this.pointers.length) {
      // Allow touch action and click events on textareas inputs, selects and videos
      let ignoreClickedElement =
        ["BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(event.target.nodeName) !== -1;

      if (ignoreClickedElement) {
        return;
      }

      // Allow text selection
      if (this.option("textSelection") && getTextNodeFromPoint(event.target, event.clientX, event.clientY)) {
        return;
      }

      // Allow scrolling
      if (isScrollable(event.target)) {
        return;
      }
    }

    clearTextSelection();

    if (this.pointers.length > 1 || (this.pointers.length && this.lockAxis)) {
      event.preventDefault();

      return;
    }

    if (this.trigger("touchStart", event) === false) {
      return;
    }

    event.preventDefault();

    this.state = "pointerdown";

    this.addPointer(this.copyPointer(event));

    this.resetDragState();

    // Add the move and end listeners
    if (window.PointerEvent) {
      try {
        event.target.setPointerCapture(event.pointerId);
      } catch (e) {}
    } else {
      // Add Mouse Listeners
      document.addEventListener("mousemove", this.onPointerMove, { passive: false });
      document.addEventListener("mouseup", this.onPointerUp, { passive: false });
    }
  }

  /**
   * Handle `pointermove`, `touchmove` or `mousemove` event
   * @param {Event} event
   */
  onPointerMove(event) {
    if (event.targetTouches && event.targetTouches.length > 1) {
      return;
    }

    if (this.state !== "pointerdown" && this.state !== "dragging") {
      return;
    }

    if (this.trigger("touchMove", event) == false) {
      event.preventDefault();
      return;
    }

    this.addPointer(this.copyPointer(event));

    if (this.pointers.length > 1 && this.option("pinchToZoom") === false) {
      return;
    }

    // Disable touch action if current zoom level is below base level
    if (
      this.option("panOnlyZoomed") == true &&
      this.current.scale === this.option("baseScale") &&
      this.pointers.length < 2
    ) {
      event.preventDefault();
      return;
    }

    const dragEndPoint = this.getMiddlePoint();
    const currentPoints = [dragEndPoint, this.drag.startPoint];

    this.drag.distance = this.getDistance(currentPoints);

    const hasClickEvent =
      (this.events.click && this.events.click.length) ||
      (this.events.doubleClick && this.events.doubleClick.length) ||
      this.option.click ||
      this.option.doubleClick;

    if (this.drag.distance < 6 && (hasClickEvent || (this.option("lockAxis") && !this.lockAxis))) {
      return;
    }

    if (this.state == "pointerdown") {
      this.state = "dragging";
    }

    if (this.state !== "dragging") {
      return;
    }

    const axisToLock = this.option("lockAxis");

    if (!this.lockAxis && axisToLock) {
      if (axisToLock === "xy") {
        const distanceX = this.getDistance(currentPoints, "x");
        const distanceY = this.getDistance(currentPoints, "y");

        const angle = Math.abs((Math.atan2(distanceY, distanceX) * 180) / Math.PI);

        this.lockAxis = angle > 45 && angle < 135 ? "y" : "x";
      } else {
        this.lockAxis = axisToLock;
      }
    }

    event.preventDefault();
    event.stopPropagation();

    this.$viewport.classList.add(this.option("draggingClass"));

    this.animate();

    let scale = this.current.scale;

    let dragOffsetX = 0;
    let dragOffsetY = 0;

    if (!(this.current.scale === this.option("baseScale") && this.lockAxis === "y")) {
      dragOffsetX = dragEndPoint.clientX - this.drag.startPoint.clientX;
    }

    if (!(this.current.scale === this.option("baseScale") && this.lockAxis === "x")) {
      dragOffsetY = dragEndPoint.clientY - this.drag.startPoint.clientY;
    }

    this.drag.endPosition.x = this.drag.startPosition.x + dragOffsetX;
    this.drag.endPosition.y = this.drag.startPosition.y + dragOffsetY;

    if (this.pointers.length > 1) {
      // Store middle point for correct positioning after touch release (when zoom level exceeds max level)
      this.drag.middlePoint = dragEndPoint;

      scale = (this.drag.startPosition.scale * this.getDistance()) / this.drag.startDistance;
      scale = Math.max(Math.min(scale, this.option("maxScale") * 2), this.option("minScale") * 0.5);

      const width = this.$content.width;
      const height = this.$content.height;

      const startWidth = width * this.drag.startPosition.scale;
      const startHeight = height * this.drag.startPosition.scale;

      const nextWidth = width * scale;
      const nextHeight = height * scale;

      const percentXInStartBox = (this.drag.startPoint.clientX - this.drag.startPosition.left) / startWidth;
      const percentYInStartBox = (this.drag.startPoint.clientY - this.drag.startPosition.top) / startHeight;

      const deltaX = (nextWidth - startWidth) * (percentXInStartBox - 0.5);
      const deltaY = (nextHeight - startHeight) * (percentYInStartBox - 0.5);

      this.drag.endPosition.x -= deltaX;
      this.drag.endPosition.y -= deltaY;

      this.drag.endPosition.scale = scale;

      this.updateBounds(scale);
    }

    this.applyDragResistance();
  }

  /**
   * Handle `pointerup`, `touchend`, etc events
   * @param {Event} event -
   */
  onPointerUp(event) {
    this.removePointer(event);

    // Remove Event Listeners
    if (window.PointerEvent) {
      try {
        event.target.releasePointerCapture(event.pointerId);
      } catch (e) {}
    } else {
      // Remove Mouse Listeners
      document.removeEventListener("mousemove", this.onPointerMove, { passive: false });
      document.removeEventListener("mouseup", this.onPointerUp, { passive: false });
    }

    // Skip when one finger is raised and the other is left
    if (this.pointers.length > 0) {
      event.preventDefault();

      this.resetDragState();

      return;
    }

    if (this.state !== "pointerdown" && this.state !== "dragging") {
      return;
    }

    this.$viewport.classList.remove(this.option("draggingClass"));

    const { top, left } = this.$content.getClientRects()[0];
    const drag = this.drag;

    extend(true, drag, {
      elapsedTime: new Date() - drag.startTime,

      distanceX: drag.endPosition.x - drag.firstPosition.x,
      distanceY: drag.endPosition.y - drag.firstPosition.y,

      endPosition: {
        top,
        left,
      },
    });

    drag.distance = Math.sqrt(Math.pow(drag.distanceX, 2) + Math.pow(drag.distanceY, 2));

    this.state = "decel";
    this.friction = this.option("decelFriction");

    this.pan = {
      x: this.current.x + this.velocity.x / (1 / this.friction - 1),
      y: this.current.y + this.velocity.y / (1 / this.friction - 1),
      scale: this.current.scale + this.velocity.scale / (1 / this.friction - 1),
    };

    if (this.trigger("touchEnd", event) === false) {
      return;
    }

    if (this.state !== "decel") {
      return;
    }

    // * Check if scaled content past limits
    // Below minimum
    const minScale = this.option("minScale");

    if (this.current.scale < minScale) {
      this.zoomTo(minScale, { friction: 0.64 });

      return;
    }

    // Exceed maximum
    const maxScale = this.option("maxScale");

    if (this.current.scale - maxScale > 0.01) {
      const props = { friction: 0.64 };

      if (drag.middlePoint) {
        props.x = drag.middlePoint.clientX - left;
        props.y = drag.middlePoint.clientY - top;
      }

      this.zoomTo(maxScale, props);
    }
  }

  /**
   * Drag resistance outside bounds
   */
  applyDragResistance() {
    const boundX = this.boundX;
    const boundY = this.boundY;

    let pastLeft, pastRight, pastTop, pastBottom;

    if (boundX) {
      pastLeft = this.drag.endPosition.x < boundX.from;
      pastRight = this.drag.endPosition.x > boundX.to;
    }

    if (boundY) {
      pastTop = this.drag.endPosition.y < boundY.from;
      pastBottom = this.drag.endPosition.y > boundY.to;
    }

    if (pastLeft || pastRight) {
      const bound = pastLeft ? boundX.from : boundX.to;
      const distance = this.drag.endPosition.x - bound;

      this.drag.endPosition.x = bound + distance * 0.3;
    }

    if (pastTop || pastBottom) {
      const bound = pastTop ? boundY.from : boundY.to;
      const distance = this.drag.endPosition.y - bound;

      this.drag.endPosition.y = bound + distance * 0.3;
    }
  }

  /**
   * Handle `wheel` event
   * @param {Event} event
   */
  onWheel(event) {
    if (this.trigger("wheel", event) === false) {
      return;
    }

    if (this.option("wheel", event) == "zoom") {
      this.zoomWithWheel(event);
    }
  }

  /**
   * Change zoom level depending on scroll direction
   * @param {Event} event `wheel` event
   */
  zoomWithWheel(event) {
    if (this.changedDelta === undefined) {
      this.changedDelta = 0;
    }

    let scale = this.current.scale;

    const delta = Math.max(-1, Math.min(1, -event.deltaY || -event.deltaX || event.wheelDelta || -event.detail));

    if ((delta < 0 && scale <= this.option("minScale")) || (delta > 0 && scale >= this.option("maxScale"))) {
      this.changedDelta += Math.abs(delta);

      if (this.changedDelta > this.option("wheelLimit")) {
        return;
      }
    } else {
      this.changedDelta = 0;
    }

    scale = (scale * (100 + delta * this.option("wheelFactor"))) / 100;

    event.preventDefault();

    const { top, left } = this.$content.getClientRects()[0];

    const x = event.clientX - left;
    const y = event.clientY - top;

    this.zoomTo(scale, { x, y });
  }

  /**
   * Handle `click` event, detect double-click
   * @param {Event} event
   */
  onClick(event) {
    if (event.defaultPrevented) {
      return;
    }

    // Skip if text is selected
    if (window.getSelection().toString().length) {
      event.stopPropagation();
      event.stopImmediatePropagation();
      return;
    }

    // Check if container has changed position (for example, when current instance is inside another one)
    if (
      this.drag.startPosition &&
      this.drag.endPosition &&
      (Math.abs(this.drag.endPosition.top - this.drag.startPosition.top) > 1 ||
        Math.abs(this.drag.endPosition.left - this.drag.startPosition.left) > 1)
    ) {
      event.stopPropagation();
      event.stopImmediatePropagation();
      return;
    }

    // Wait for minimum distance
    if (this.drag.distance > (this.lockAxis ? 6 : 1)) {
      event.preventDefault();

      event.stopPropagation();
      event.stopImmediatePropagation();
      return;
    }

    // Calculate click positon
    let x = null;
    let y = null;

    if (event.clientX !== undefined && event.clientY !== undefined) {
      x = event.clientX - this.$content.getClientRects()[0].left;
      y = event.clientY - this.$content.getClientRects()[0].top;
    }

    let hasDoubleClick = this.options.doubleClick;

    // Check if there is any `doubleClick` event listener
    if (!hasDoubleClick && this.events.doubleClick && this.events.doubleClick.length) {
      hasDoubleClick = true;
    }

    if (!hasDoubleClick) {
      if (this.trigger("click", event) === false) {
        return;
      }

      if (this.option("click") === "toggleZoom") {
        this.toggleZoom({ x, y });
      }

      return;
    }

    if (!this.clickTimer) {
      this.lastClickEvent = event;

      this.clickTimer = setTimeout(() => {
        this.clickTimer = null;

        if (this.trigger("click", event) === false) {
          return;
        }

        if (this.option("click") === "toggleZoom") {
          this.toggleZoom({ x, y });
        }
      }, this.option("clickDelay"));

      return;
    }

    if (this.getDistance([event, this.lastClickEvent]) >= 6) {
      return;
    }

    clearTimeout(this.clickTimer);
    this.clickTimer = null;

    if (this.trigger("doubleClick", event) === false) {
      return;
    }

    if (this.option("doubleClick") === "toggleZoom") {
      this.toggleZoom({ x, y });
    }
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.state === "destroy") {
      return;
    }

    this.state = "destroy";

    this.$viewport.classList.remove("not-selectable");

    if (this.$content instanceof HTMLImageElement && !this.$content.complete) {
      this.$content.onload = null;
      this.$content.onerror = null;
    }

    if (this.pendingAnimateUpdate) {
      cancelAnimationFrame(this.pendingAnimateUpdate);
      this.pendingAnimateUpdate = null;
    }

    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }

    this.detachEvents();

    this.pointers = [];

    this.resetValues();

    this.$viewport = null;
    this.$content = null;

    this.options = {};
    this.events = {};
  }
}

// Expose version
Panzoom.version = "__VERSION__";

// Static properties are a recent addition that dont work in all browsers yet
Panzoom.Plugins = Plugins;
