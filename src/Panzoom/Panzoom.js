import { extend } from "../shared/utils/extend.js";
import { round } from "../shared/utils/round.js";

import { ResizeObserver } from "../shared/utils/ResizeObserver.js";
import { PointerTracker, getMidpoint, getDistance } from "../shared/utils/PointerTracker.js";

import { getTextNodeFromPoint } from "../shared/utils/getTextNodeFromPoint.js";

import { getFullWidth, getFullHeight, calculateAspectRatioFit } from "../shared/utils/getDimensions.js";

import { Base } from "../shared/Base/Base.js";

import { Plugins } from "./plugins/index.js";

const defaults = {
  // Enable touch guestures
  touch: true,

  // Enable zooming
  zoom: true,

  // Enable pinch gesture to zoom in/out using two fingers
  pinchToZoom: true,

  // Disable dragging if scale level is equal to value of `baseScale` option
  panOnlyZoomed: false,

  // Lock axis while dragging,
  // possible values: false | "x" | "y" | "xy"
  lockAxis: false,

  // * All friction values are inside [0, 1) interval,
  // * where 0 would change instantly, but 0.99 would update extremely slowly

  // Friction while panning/dragging
  friction: 0.64,

  // Friction while decelerating after drag end
  decelFriction: 0.88,

  // Friction while scaling
  zoomFriction: 0.74,

  // Bounciness after hitting the edge
  bounceForce: 0.2,

  // Initial scale level
  baseScale: 1,

  // Minimum scale level
  minScale: 1,

  // Maximum scale level
  maxScale: 2,

  // Default scale step while zooming
  step: 0.5,

  // Allow to select text,
  // if enabled, dragging will be disabled when text selection is detected
  textSelection: false,

  // Add `click` event listener,
  // possible values: true | false | function | "toggleZoom"
  click: "toggleZoom",

  // Add `wheel` event listener,
  // possible values: true | false | function |  "zoom"
  wheel: "zoom",

  // Value for zoom on mouse wheel
  wheelFactor: 42,

  // Number of wheel events after which it should stop preventing default behaviour of mouse wheel
  wheelLimit: 5,

  // Class name added to `$viewport` element to indicate if content is draggable
  draggableClass: "is-draggable",

  // Class name added to `$viewport` element to indicate that user is currently dragging
  draggingClass: "is-dragging",

  // Content will be scaled by this number,
  // this can also be a function which should return a number, for example:
  // ratio: function() { return 1 / (window.devicePixelRatio || 1) }
  ratio: 1,
};

export class Panzoom extends Base {
  /**
   * Panzoom constructor
   * @constructs Panzoom
   * @param {HTMLElement} $viewport Panzoom container
   * @param {Object} [options] Options for Panzoom
   */
  constructor($container, options = {}) {
    super(extend(true, {}, defaults, options));

    this.state = "init";

    this.$container = $container;

    // Bind event handlers for referencability
    for (const methodName of ["onLoad", "onWheel", "onClick"]) {
      this[methodName] = this[methodName].bind(this);
    }

    this.initLayout();

    this.resetValues();

    this.attachPlugins(Panzoom.Plugins);

    this.trigger("init");

    this.updateMetrics();

    this.attachEvents();

    this.trigger("ready");

    if (this.option("centerOnStart") === false) {
      this.state = "ready";
    } else {
      this.panTo({
        friction: 0,
      });
    }
  }

  /**
   * Create references to container, viewport and content elements
   */
  initLayout() {
    const $container = this.$container;

    // Make sure content element exists
    if (!($container instanceof HTMLElement)) {
      throw new Error("Panzoom: Container not found");
    }

    const $content = this.option("content") || $container.querySelector(".panzoom__content");

    // Make sure content element exists
    if (!$content) {
      throw new Error("Panzoom: Content not found");
    }

    this.$content = $content;

    let $viewport = this.option("viewport") || $container.querySelector(".panzoom__viewport");

    if (!$viewport && this.option("wrapInner") !== false) {
      $viewport = document.createElement("div");
      $viewport.classList.add("panzoom__viewport");

      $viewport.append(...$container.childNodes);

      $container.appendChild($viewport);
    }

    this.$viewport = $viewport || $content.parentNode;
  }

  /**
   * Restore instance variables to default values
   */
  resetValues() {
    this.updateRate = this.option("updateRate", /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 250 : 24);

    this.container = {
      width: 0,
      height: 0,
    };

    this.viewport = {
      width: 0,
      height: 0,
    };

    this.content = {
      // Full content dimensions (naturalWidth/naturalHeight for images)
      origWidth: 0,
      origHeight: 0,

      // Current dimensions of the content
      width: 0,
      height: 0,

      // Current position; these values reflect CSS `transform` value
      x: this.option("x", 0),
      y: this.option("y", 0),

      // Current scale; does not reflect CSS `transform` value
      scale: this.option("baseScale"),
    };

    // End values of current pan / zoom animation
    this.transform = {
      x: 0,
      y: 0,
      scale: 1,
    };

    this.resetDragPosition();
  }

  /**
   * Handle `load` event
   * @param {Event} event
   */
  onLoad(event) {
    this.updateMetrics();

    this.panTo({ scale: this.option("baseScale"), friction: 0 });

    this.trigger("load", event);
  }

  /**
   * Handle `click` event
   * @param {Event} event
   */
  onClick(event) {
    if (event.defaultPrevented) {
      return;
    }

    // Skip if text is selected
    if (this.option("textSelection") && window.getSelection().toString().length) {
      event.stopPropagation();
      return;
    }

    const rect = this.$content.getClientRects()[0];

    // Check if container has changed position (for example, when current instance is inside another one)
    if (this.state !== "ready") {
      if (
        this.dragPosition.midPoint ||
        Math.abs(rect.top - this.dragStart.rect.top) > 1 ||
        Math.abs(rect.left - this.dragStart.rect.left) > 1
      ) {
        event.preventDefault();
        event.stopPropagation();

        return;
      }
    }

    if (this.trigger("click", event) === false) {
      return;
    }

    if (this.option("zoom") && this.option("click") === "toggleZoom") {
      event.preventDefault();
      event.stopPropagation();

      this.zoomWithClick(event);
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

    if (this.option("zoom") && this.option("wheel")) {
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

    const delta = Math.max(-1, Math.min(1, -event.deltaY || -event.deltaX || event.wheelDelta || -event.detail));
    const scale = this.content.scale;

    let newScale = (scale * (100 + delta * this.option("wheelFactor"))) / 100;

    if (
      (delta < 0 && Math.abs(scale - this.option("minScale")) < 0.01) ||
      (delta > 0 && Math.abs(scale - this.option("maxScale")) < 0.01)
    ) {
      this.changedDelta += Math.abs(delta);
      newScale = scale;
    } else {
      this.changedDelta = 0;
      newScale = Math.max(Math.min(newScale, this.option("maxScale")), this.option("minScale"));
    }

    if (this.changedDelta > this.option("wheelLimit")) {
      return;
    }

    event.preventDefault();

    if (newScale === scale) {
      return;
    }

    const rect = this.$content.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.zoomTo(newScale, { x, y });
  }

  /**
   * Change zoom level depending on click coordinates
   * @param {Event} event `click` event
   */
  zoomWithClick(event) {
    const rect = this.$content.getClientRects()[0];

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.toggleZoom({ x, y });
  }

  /**
   * Attach load, wheel and click event listeners, initialize `resizeObserver` and `PointerTracker`
   */
  attachEvents() {
    this.$content.addEventListener("load", this.onLoad);

    this.$container.addEventListener("wheel", this.onWheel, { passive: false });
    this.$container.addEventListener("click", this.onClick, { passive: false });

    this.initObserver();

    const pointerTracker = new PointerTracker(this.$container, {
      start: (pointer, event) => {
        if (!this.option("touch")) {
          return false;
        }

        if (this.velocity.scale < 0) {
          return;
        }

        if (!pointerTracker.currentPointers.length) {
          const ignoreClickedElement =
            ["BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(event.target.nodeName) !== -1;

          if (ignoreClickedElement) {
            return false;
          }

          // Allow text selection
          if (this.option("textSelection") && getTextNodeFromPoint(event.target, event.clientX, event.clientY)) {
            return false;
          }
        }

        if (this.trigger("touchStart", event) === false) {
          return false;
        }

        this.state = "pointerdown";

        this.resetDragPosition();

        this.dragPosition.midPoint = null;
        this.dragPosition.time = Date.now();

        return true;
      },
      move: (previousPointers, currentPointers, event) => {
        if (this.state !== "pointerdown") {
          return;
        }

        if (this.trigger("touchMove", event) == false) {
          event.preventDefault();
          return;
        }

        // Disable touch action if current zoom level is below base level
        if (
          currentPointers.length < 2 &&
          this.option("panOnlyZoomed") == true &&
          this.content.width <= this.viewport.width &&
          this.content.height <= this.viewport.height &&
          this.transform.scale <= this.option("baseScale")
        ) {
          return;
        }

        if (currentPointers.length > 1 && (!this.option("zoom") || this.option("pinchToZoom") === false)) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const prevMidpoint = getMidpoint(previousPointers[0], previousPointers[1]);
        const newMidpoint = getMidpoint(currentPointers[0], currentPointers[1]);

        const panX = newMidpoint.clientX - prevMidpoint.clientX;
        const panY = newMidpoint.clientY - prevMidpoint.clientY;

        const prevDistance = getDistance(previousPointers[0], previousPointers[1]);
        const newDistance = getDistance(currentPointers[0], currentPointers[1]);

        const scaleDiff = prevDistance ? newDistance / prevDistance : 1;

        this.dragOffset.x += panX;
        this.dragOffset.y += panY;

        this.dragOffset.scale *= scaleDiff;

        this.dragOffset.time = Date.now() - this.dragPosition.time;

        const axisToLock = this.dragStart.scale === 1 && this.option("lockAxis");

        if (axisToLock && !this.lockAxis) {
          if (Math.abs(this.dragOffset.x) < 6 && Math.abs(this.dragOffset.y) < 6) {
            return;
          }

          if (axisToLock === "xy") {
            const angle = Math.abs((Math.atan2(this.dragOffset.y, this.dragOffset.x) * 180) / Math.PI);

            this.lockAxis = angle > 45 && angle < 135 ? "y" : "x";
          } else {
            this.lockAxis = axisToLock;
          }
        }

        if (this.lockAxis) {
          this.dragOffset[this.lockAxis === "x" ? "y" : "x"] = 0;
        }

        this.$container.classList.add(this.option("draggingClass"));

        if (!(this.transform.scale === this.option("baseScale") && this.lockAxis === "y")) {
          this.dragPosition.x = this.dragStart.x + this.dragOffset.x;
        }

        if (!(this.transform.scale === this.option("baseScale") && this.lockAxis === "x")) {
          this.dragPosition.y = this.dragStart.y + this.dragOffset.y;
        }

        this.dragPosition.scale = this.dragStart.scale * this.dragOffset.scale;

        if (currentPointers.length > 1) {
          const startPoint = getMidpoint(pointerTracker.startPointers[0], pointerTracker.startPointers[1]);

          const xPos = startPoint.clientX - this.dragStart.rect.x;
          const yPos = startPoint.clientY - this.dragStart.rect.y;

          const { deltaX, deltaY } = this.getZoomDelta(this.content.scale * this.dragOffset.scale, xPos, yPos);

          this.dragPosition.x -= deltaX;
          this.dragPosition.y -= deltaY;

          this.dragPosition.midPoint = newMidpoint;
        } else {
          this.setDragResistance();
        }

        // Update final position
        this.transform = {
          x: this.dragPosition.x,
          y: this.dragPosition.y,
          scale: this.dragPosition.scale,
        };

        this.startAnimation();
      },
      end: (pointer, event) => {
        if (this.state !== "pointerdown") {
          return;
        }

        this._dragOffset = { ...this.dragOffset };

        if (pointerTracker.currentPointers.length) {
          this.resetDragPosition();

          return;
        }

        this.state = "decel";
        this.friction = this.option("decelFriction");

        this.recalculateTransform();

        this.$container.classList.remove(this.option("draggingClass"));

        if (this.trigger("touchEnd", event) === false) {
          return;
        }

        if (this.state !== "decel") {
          return;
        }

        // * Check if scaled content past limits

        // Below minimum
        const minScale = this.option("minScale");

        if (this.transform.scale < minScale) {
          this.zoomTo(minScale, { friction: 0.64 });

          return;
        }

        // Exceed maximum
        const maxScale = this.option("maxScale");

        if (this.transform.scale - maxScale > 0.01) {
          const last = this.dragPosition.midPoint || pointer;
          const rect = this.$content.getClientRects()[0];

          this.zoomTo(maxScale, {
            friction: 0.64,
            x: last.clientX - rect.left,
            y: last.clientY - rect.top,
          });

          return;
        }
      },
    });

    this.pointerTracker = pointerTracker;
  }

  initObserver() {
    if (this.resizeObserver) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      if (this.updateTimer) {
        return;
      }

      this.updateTimer = setTimeout(() => {
        const rect = this.$container.getBoundingClientRect();

        if (!(rect.width && rect.height)) {
          this.updateTimer = null;
          return;
        }

        // Check to see if there are any changes
        if (Math.abs(rect.width - this.container.width) > 1 || Math.abs(rect.height - this.container.height) > 1) {
          if (this.isAnimating()) {
            this.endAnimation(true);
          }

          this.updateMetrics();

          this.panTo({
            x: this.content.x,
            y: this.content.y,
            scale: this.option("baseScale"),
            friction: 0,
          });
        }

        this.updateTimer = null;
      }, this.updateRate);
    });

    this.resizeObserver.observe(this.$container);
  }

  /**
   * Restore drag related variables to default values
   */
  resetDragPosition() {
    this.lockAxis = null;
    this.friction = this.option("friction");

    this.velocity = {
      x: 0,
      y: 0,
      scale: 0,
    };

    const { x, y, scale } = this.content;

    this.dragStart = {
      rect: this.$content.getBoundingClientRect(),
      x,
      y,
      scale,
    };

    this.dragPosition = {
      ...this.dragPosition,
      x,
      y,
      scale,
    };

    this.dragOffset = {
      x: 0,
      y: 0,
      scale: 1,
      time: 0,
    };
  }

  /**
   * Trigger update events before/after resizing content and viewport
   */
  updateMetrics(silently) {
    if (silently !== true) {
      this.trigger("beforeUpdate");
    }

    const $container = this.$container;
    const $content = this.$content;
    const $viewport = this.$viewport;

    const contentIsImage = $content instanceof HTMLImageElement;
    const contentIsZoomable = this.option("zoom");
    const shouldResizeParent = this.option("resizeParent", contentIsZoomable);

    let width = this.option("width");
    let height = this.option("height");

    let origWidth = width || getFullWidth($content);
    let origHeight = height || getFullHeight($content);

    Object.assign($content.style, {
      width: width ? `${width}px` : "",
      height: height ? `${height}px` : "",
      maxWidth: "",
      maxHeight: "",
    });

    if (shouldResizeParent) {
      Object.assign($viewport.style, { width: "", height: "" });
    }

    const ratio = this.option("ratio");

    origWidth = round(origWidth * ratio);
    origHeight = round(origHeight * ratio);

    width = origWidth;
    height = origHeight;

    const contentRect = $content.getBoundingClientRect();
    const viewportRect = $viewport.getBoundingClientRect();

    const containerRect = $viewport == $container ? viewportRect : $container.getBoundingClientRect();

    let viewportWidth = Math.max($viewport.offsetWidth, round(viewportRect.width));
    let viewportHeight = Math.max($viewport.offsetHeight, round(viewportRect.height));

    let viewportStyles = window.getComputedStyle($viewport);
    viewportWidth -= parseFloat(viewportStyles.paddingLeft) + parseFloat(viewportStyles.paddingRight);
    viewportHeight -= parseFloat(viewportStyles.paddingTop) + parseFloat(viewportStyles.paddingBottom);

    this.viewport.width = viewportWidth;
    this.viewport.height = viewportHeight;

    if (contentIsZoomable) {
      if (Math.abs(origWidth - contentRect.width) > 0.1 || Math.abs(origHeight - contentRect.height) > 0.1) {
        const rez = calculateAspectRatioFit(
          origWidth,
          origHeight,
          Math.min(origWidth, contentRect.width),
          Math.min(origHeight, contentRect.height)
        );

        width = round(rez.width);
        height = round(rez.height);
      }

      Object.assign($content.style, {
        width: `${width}px`,
        height: `${height}px`,
        transform: "",
      });
    }

    if (shouldResizeParent) {
      Object.assign($viewport.style, { width: `${width}px`, height: `${height}px` });

      this.viewport = { ...this.viewport, width, height };
    }

    if (contentIsImage && contentIsZoomable && typeof this.options.maxScale !== "function") {
      const maxScale = this.option("maxScale");

      this.options.maxScale = function () {
        return this.content.origWidth > 0 && this.content.fitWidth > 0
          ? this.content.origWidth / this.content.fitWidth
          : maxScale;
      };
    }

    this.content = {
      ...this.content,
      origWidth,
      origHeight,
      fitWidth: width,
      fitHeight: height,
      width,
      height,
      scale: 1,
      isZoomable: contentIsZoomable,
    };

    this.container = { width: containerRect.width, height: containerRect.height };

    if (silently !== true) {
      this.trigger("afterUpdate");
    }
  }

  /**
   * Increase zoom level
   * @param {Number} [step] Zoom ratio; `0.5` would increase scale from 1 to 1.5
   */
  zoomIn(step) {
    this.zoomTo(this.content.scale + (step || this.option("step")));
  }

  /**
   * Decrease zoom level
   * @param {Number} [step] Zoom ratio; `0.5` would decrease scale from 1.5 to 1
   */
  zoomOut(step) {
    this.zoomTo(this.content.scale - (step || this.option("step")));
  }

  /**
   * Toggles zoom level between max and base levels
   * @param {Object} [options] Additional options
   */
  toggleZoom(props = {}) {
    const maxScale = this.option("maxScale");
    const baseScale = this.option("baseScale");

    const scale = this.content.scale > baseScale + (maxScale - baseScale) * 0.5 ? baseScale : maxScale;

    this.zoomTo(scale, props);
  }

  /**
   * Animate to given zoom level
   * @param {Number} scale New zoom level
   * @param {Object} [options] Additional options
   */
  zoomTo(scale = this.option("baseScale"), { x = null, y = null } = {}) {
    scale = Math.max(Math.min(scale, this.option("maxScale")), this.option("minScale"));

    // Adjust zoom position
    const currentScale = round(this.content.scale / (this.content.width / this.content.fitWidth), 10000000);

    if (x === null) {
      x = this.content.width * currentScale * 0.5;
    }

    if (y === null) {
      y = this.content.height * currentScale * 0.5;
    }

    const { deltaX, deltaY } = this.getZoomDelta(scale, x, y);

    x = this.content.x - deltaX;
    y = this.content.y - deltaY;

    this.panTo({ x, y, scale, friction: this.option("zoomFriction") });
  }

  /**
   * Calculate difference for top/left values if content would scale at given coordinates
   * @param {Number} scale
   * @param {Number} x
   * @param {Number} y
   * @returns {Object}
   */
  getZoomDelta(scale, x = 0, y = 0) {
    const currentWidth = this.content.fitWidth * this.content.scale;
    const currentHeight = this.content.fitHeight * this.content.scale;

    const percentXInCurrentBox = x > 0 && currentWidth ? x / currentWidth : 0;
    const percentYInCurrentBox = y > 0 && currentHeight ? y / currentHeight : 0;

    const nextWidth = this.content.fitWidth * scale;
    const nextHeight = this.content.fitHeight * scale;

    const deltaX = (nextWidth - currentWidth) * percentXInCurrentBox;
    const deltaY = (nextHeight - currentHeight) * percentYInCurrentBox;

    return { deltaX, deltaY };
  }

  /**
   * Animate to given positon and/or zoom level
   * @param {Object} [options] Additional options
   */
  panTo({
    x = this.content.x,
    y = this.content.y,
    scale,
    friction = this.option("friction"),
    ignoreBounds = false,
  } = {}) {
    scale = scale || this.content.scale || 1;

    if (!ignoreBounds) {
      const { boundX, boundY } = this.getBounds(scale);

      if (boundX) {
        x = Math.max(Math.min(x, boundX.to), boundX.from);
      }

      if (boundY) {
        y = Math.max(Math.min(y, boundY.to), boundY.from);
      }
    }

    this.friction = friction;

    this.transform = {
      ...this.transform,
      x,
      y,
      scale,
    };

    if (friction) {
      this.state = "panning";

      this.velocity = {
        x: (1 / this.friction - 1) * (x - this.content.x),
        y: (1 / this.friction - 1) * (y - this.content.y),
        scale: (1 / this.friction - 1) * (scale - this.content.scale),
      };

      this.startAnimation();
    } else {
      this.endAnimation();
    }
  }

  /**
   * Start animation loop
   */
  startAnimation() {
    if (!this.rAF) {
      this.trigger("startAnimation");
    } else {
      cancelAnimationFrame(this.rAF);
    }

    this.rAF = requestAnimationFrame(() => this.animate());
  }

  /**
   * Process animation frame
   */
  animate() {
    this.setEdgeForce();
    this.setDragForce();

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    this.velocity.scale *= this.friction;

    this.content.x += this.velocity.x;
    this.content.y += this.velocity.y;

    this.content.scale += this.velocity.scale;

    if (this.isAnimating()) {
      this.setTransform();
    } else if (this.state !== "pointerdown") {
      this.endAnimation();

      return;
    }

    this.rAF = requestAnimationFrame(() => this.animate());
  }

  /**
   * Calculate boundaries
   */
  getBounds(scale) {
    let boundX = this.boundX;
    let boundY = this.boundY;

    if (boundX !== undefined && boundY !== undefined) {
      return { boundX, boundY };
    }

    boundX = { from: 0, to: 0 };
    boundY = { from: 0, to: 0 };

    scale = scale || this.transform.scale;

    const width = this.content.fitWidth * scale;
    const height = this.content.fitHeight * scale;

    const viewportWidth = this.viewport.width;
    const viewportHeight = this.viewport.height;

    if (width < viewportWidth) {
      const deltaX = round((viewportWidth - width) * 0.5);

      boundX.from = deltaX;
      boundX.to = deltaX;
    } else {
      boundX.from = round(viewportWidth - width);
    }

    if (height < viewportHeight) {
      const deltaY = (viewportHeight - height) * 0.5;

      boundY.from = deltaY;
      boundY.to = deltaY;
    } else {
      boundY.from = round(viewportHeight - height);
    }

    return { boundX, boundY };
  }

  /**
   * Change animation velocity if boundary is reached
   */
  setEdgeForce() {
    if (this.state !== "decel") {
      return;
    }

    const bounceForce = this.option("bounceForce");

    const { boundX, boundY } = this.getBounds(Math.max(this.transform.scale, this.content.scale));

    let pastLeft, pastRight, pastTop, pastBottom;

    if (boundX) {
      pastLeft = this.content.x < boundX.from;
      pastRight = this.content.x > boundX.to;
    }

    if (boundY) {
      pastTop = this.content.y < boundY.from;
      pastBottom = this.content.y > boundY.to;
    }

    if (pastLeft || pastRight) {
      const bound = pastLeft ? boundX.from : boundX.to;
      const distance = bound - this.content.x;

      let force = distance * bounceForce;

      const restX = this.content.x + (this.velocity.x + force) / this.friction;

      if (restX >= boundX.from && restX <= boundX.to) {
        force += this.velocity.x;
      }

      this.velocity.x = force;

      this.recalculateTransform();
    }

    if (pastTop || pastBottom) {
      const bound = pastTop ? boundY.from : boundY.to;
      const distance = bound - this.content.y;

      let force = distance * bounceForce;

      const restY = this.content.y + (force + this.velocity.y) / this.friction;

      if (restY >= boundY.from && restY <= boundY.to) {
        force += this.velocity.y;
      }

      this.velocity.y = force;

      this.recalculateTransform();
    }
  }

  /**
   * Change dragging position if boundary is reached
   */
  setDragResistance() {
    if (this.state !== "pointerdown") {
      return;
    }

    const { boundX, boundY } = this.getBounds(this.dragPosition.scale);

    let pastLeft, pastRight, pastTop, pastBottom;

    if (boundX) {
      pastLeft = this.dragPosition.x < boundX.from;
      pastRight = this.dragPosition.x > boundX.to;
    }

    if (boundY) {
      pastTop = this.dragPosition.y < boundY.from;
      pastBottom = this.dragPosition.y > boundY.to;
    }

    if ((pastLeft || pastRight) && !(pastLeft && pastRight)) {
      const bound = pastLeft ? boundX.from : boundX.to;
      const distance = bound - this.dragPosition.x;

      this.dragPosition.x = bound - distance * 0.3;
    }

    if ((pastTop || pastBottom) && !(pastTop && pastBottom)) {
      const bound = pastTop ? boundY.from : boundY.to;
      const distance = bound - this.dragPosition.y;

      this.dragPosition.y = bound - distance * 0.3;
    }
  }

  /**
   * Set velocity to move content to drag position
   */
  setDragForce() {
    if (this.state === "pointerdown") {
      this.velocity.x = this.dragPosition.x - this.content.x;
      this.velocity.y = this.dragPosition.y - this.content.y;
      this.velocity.scale = this.dragPosition.scale - this.content.scale;
    }
  }

  /**
   * Update end values based on current velocity and friction;
   */
  recalculateTransform() {
    this.transform.x = this.content.x + this.velocity.x / (1 / this.friction - 1);
    this.transform.y = this.content.y + this.velocity.y / (1 / this.friction - 1);
    this.transform.scale = this.content.scale + this.velocity.scale / (1 / this.friction - 1);
  }

  /**
   * Check if content is currently animating
   * @returns {Boolean}
   */
  isAnimating() {
    return !!(
      this.friction &&
      (Math.abs(this.velocity.x) > 0.05 || Math.abs(this.velocity.y) > 0.05 || Math.abs(this.velocity.scale) > 0.05)
    );
  }

  /**
   * Set content `style.transform` value based on current animation frame
   */
  setTransform(final) {
    let x, y, scale;

    if (final) {
      x = round(this.transform.x);
      y = round(this.transform.y);

      scale = this.transform.scale;

      this.content = { ...this.content, x, y, scale };
    } else {
      x = round(this.content.x);
      y = round(this.content.y);

      scale = this.content.scale / (this.content.width / this.content.fitWidth);

      this.content = { ...this.content, x, y };
    }

    this.trigger("beforeTransform");

    x = round(this.content.x);
    y = round(this.content.y);

    if (final && this.option("zoom")) {
      let width;
      let height;

      width = round(this.content.fitWidth * scale);
      height = round(this.content.fitHeight * scale);

      this.content.width = width;
      this.content.height = height;

      this.transform = { ...this.transform, width, height, scale };

      Object.assign(this.$content.style, {
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: "none",
        maxHeight: "none",
        transform: `translate3d(${x}px, ${y}px, 0) scale(1)`,
      });
    } else {
      this.$content.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }

    this.trigger("afterTransform");
  }

  /**
   * Stop animation loop
   */
  endAnimation(silently) {
    cancelAnimationFrame(this.rAF);
    this.rAF = null;

    this.velocity = {
      x: 0,
      y: 0,
      scale: 0,
    };

    this.setTransform(true);

    this.state = "ready";

    this.handleCursor();

    if (silently !== true) {
      this.trigger("endAnimation");
    }
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
      this.option("panOnlyZoomed") == true &&
      this.content.width <= this.viewport.width &&
      this.content.height <= this.viewport.height &&
      this.transform.scale <= this.option("baseScale")
    ) {
      this.$container.classList.remove(draggableClass);
    } else {
      this.$container.classList.add(draggableClass);
    }
  }

  /**
   * Remove observation and detach event listeners
   */
  detachEvents() {
    this.$content.removeEventListener("load", this.onLoad);

    this.$container.removeEventListener("wheel", this.onWheel, { passive: false });
    this.$container.removeEventListener("click", this.onClick, { passive: false });

    if (this.pointerTracker) {
      this.pointerTracker.stop();
      this.pointerTracker = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
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

    clearTimeout(this.updateTimer);
    this.updateTimer = null;

    cancelAnimationFrame(this.rAF);
    this.rAF = null;

    this.detachEvents();

    this.detachPlugins();

    this.resetDragPosition();
  }
}

// Expose version
Panzoom.version = "__VERSION__";

// Static properties are a recent addition that dont work in all browsers yet
Panzoom.Plugins = Plugins;
