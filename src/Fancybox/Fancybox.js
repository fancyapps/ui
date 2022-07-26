import { extend } from "../shared/utils/extend.js";
import { canUseDOM } from "../shared/utils/canUseDOM.js";
import { FOCUSABLE_ELEMENTS, setFocusOn } from "../shared/utils/setFocusOn.js";

import { Base } from "../shared/Base/Base.js";

import { Carousel } from "../Carousel/Carousel.js";

import { Plugins } from "./plugins/index.js";

// Default language
import en from "./l10n/en.js";

// Default settings
const defaults = {
  // Index of active slide on the start
  startIndex: 0,

  // Number of slides to preload before and after active slide
  preload: 1,

  // Should navigation be infinite
  infinite: true,

  // Class name to be applied to the content to reveal it
  showClass: "fancybox-zoomInUp", // "fancybox-fadeIn" | "fancybox-zoomInUp" | false

  // Class name to be applied to the content to hide it
  hideClass: "fancybox-fadeOut", // "fancybox-fadeOut" | "fancybox-zoomOutDown" | false

  // Should backdrop and UI elements fade in/out on start/close
  animated: true,

  // If browser scrollbar should be hidden
  hideScrollbar: true,

  // Element containing main structure
  parentEl: null,

  // Custom class name or multiple space-separated class names for the container
  mainClass: null,

  // Set focus on first focusable element after displaying content
  autoFocus: true,

  // Trap focus inside Fancybox
  trapFocus: true,

  // Set focus back to trigger element after closing Fancybox
  placeFocusBack: true,

  // Action to take when the user clicks on the backdrop
  click: "close", // "close" | "next" | null

  // Position of the close button - over the content or at top right corner of viewport
  closeButton: "inside", // "inside" | "outside"

  // Allow user to drag content up/down to close instance
  dragToClose: true,

  // Enable keyboard navigation
  keyboard: {
    Escape: "close",
    Delete: "close",
    Backspace: "close",
    PageUp: "next",
    PageDown: "prev",
    ArrowUp: "next",
    ArrowDown: "prev",
    ArrowRight: "next",
    ArrowLeft: "prev",
  },

  // HTML templates for various elements
  template: {
    // Close button icon
    closeButton:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"/></svg>',
    // Loading indicator icon
    spinner:
      '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="25 25 50 50" tabindex="-1"><circle cx="50" cy="50" r="20"/></svg>',

    // Main container element
    main: null,
  },

  /* Note: If the `template.main` option is not provided, the structure is generated as follows by default:
  <div class="fancybox__container" role="dialog" aria-modal="true" aria-hidden="true" aria-label="{{MODAL}}" tabindex="-1">
    <div class="fancybox__backdrop"></div>
    <div class="fancybox__carousel"></div>
  </div>
  */

  // Localization of strings
  l10n: en,
};

// Object that contains all active instances of Fancybox
const instances = new Map();

// Number of Fancybox instances created, it is used to generate new instance "id"
let called = 0;

class Fancybox extends Base {
  /**
   * Fancybox constructor
   * @constructs Fancybox
   * @param {Object} [options] - Options for Fancybox
   */
  constructor(items, options = {}) {
    // Quick hack to fix variable naming collision
    items = items.map((item) => {
      if (item.width) item._width = item.width;
      if (item.height) item._height = item.height;

      return item;
    });

    super(extend(true, {}, defaults, options));

    this.bindHandlers();

    this.state = "init";

    this.setItems(items);

    this.attachPlugins(Fancybox.Plugins);

    // "init" event marks the start of initialization and is available to plugins
    this.trigger("init");

    if (this.option("hideScrollbar") === true) {
      this.hideScrollbar();
    }

    this.initLayout();

    this.initCarousel();

    this.attachEvents();

    instances.set(this.id, this);

    // "prepare" event will trigger the creation of additional layout elements, such as thumbnails and toolbar
    this.trigger("prepare");

    this.state = "ready";

    // "ready" event will trigger the content to load
    this.trigger("ready");

    // Reveal container
    this.$container.setAttribute("aria-hidden", "false");

    // Set focus on the first focusable element inside this instance
    if (this.option("trapFocus")) {
      this.focus();
    }
  }

  /**
   * Override `option` method to get value from the current slide
   * @param {String} name option name
   * @param  {...any} rest optional extra parameters
   * @returns {any}
   */
  option(name, ...rest) {
    const slide = this.getSlide();

    let value = slide ? slide[name] : undefined;

    if (value !== undefined) {
      if (typeof value === "function") {
        value = value.call(this, this, ...rest);
      }

      return value;
    }

    return super.option(name, ...rest);
  }

  /**
   * Bind event handlers for referencability
   */
  bindHandlers() {
    for (const methodName of [
      "onMousedown",
      "onKeydown",
      "onClick",

      "onFocus",

      "onCreateSlide",
      "onSettle",

      "onTouchMove",
      "onTouchEnd",

      "onTransform",
    ]) {
      this[methodName] = this[methodName].bind(this);
    }
  }

  /**
   * Set up a functions that will be called whenever the specified event is delivered
   */
  attachEvents() {
    document.addEventListener("mousedown", this.onMousedown);
    document.addEventListener("keydown", this.onKeydown, true);

    // Trap keyboard focus inside of the modal
    if (this.option("trapFocus")) {
      document.addEventListener("focus", this.onFocus, true);
    }

    this.$container.addEventListener("click", this.onClick);
  }

  /**
   * Removes previously registered event listeners
   */
  detachEvents() {
    document.removeEventListener("mousedown", this.onMousedown);
    document.removeEventListener("keydown", this.onKeydown, true);

    document.removeEventListener("focus", this.onFocus, true);

    this.$container.removeEventListener("click", this.onClick);
  }

  /**
   * Initialize layout; create main container, backdrop nd layout for main carousel
   */
  initLayout() {
    this.$root = this.option("parentEl") || document.body;

    // Container
    let mainTemplate = this.option("template.main");

    if (mainTemplate) {
      this.$root.insertAdjacentHTML("beforeend", this.localize(mainTemplate));

      this.$container = this.$root.querySelector(".fancybox__container");
    }

    if (!this.$container) {
      this.$container = document.createElement("div");
      this.$root.appendChild(this.$container);
    }

    // Normally we would not need this, but Safari does not support `preventScroll:false` option for `focus` method
    // and that causes layout issues
    this.$container.onscroll = () => {
      this.$container.scrollLeft = 0;
      return false;
    };

    Object.entries({
      class: "fancybox__container",
      role: "dialog",
      tabIndex: "-1",
      "aria-modal": "true",
      "aria-hidden": "true",
      "aria-label": this.localize("{{MODAL}}"),
    }).forEach((args) => this.$container.setAttribute(...args));

    if (this.option("animated")) {
      this.$container.classList.add("is-animated");
    }

    // Backdrop
    this.$backdrop = this.$container.querySelector(".fancybox__backdrop");

    if (!this.$backdrop) {
      this.$backdrop = document.createElement("div");
      this.$backdrop.classList.add("fancybox__backdrop");

      this.$container.appendChild(this.$backdrop);
    }

    // Carousel
    this.$carousel = this.$container.querySelector(".fancybox__carousel");

    if (!this.$carousel) {
      this.$carousel = document.createElement("div");
      this.$carousel.classList.add("fancybox__carousel");

      this.$container.appendChild(this.$carousel);
    }

    // Make instance reference accessible
    this.$container.Fancybox = this;

    // Make sure the container has an ID
    this.id = this.$container.getAttribute("id");

    if (!this.id) {
      this.id = this.options.id || ++called;
      this.$container.setAttribute("id", "fancybox-" + this.id);
    }

    // Add custom class name to main element
    const mainClass = this.option("mainClass");

    if (mainClass) {
      this.$container.classList.add(...mainClass.split(" "));
    }

    // Add class name for <html> element
    document.documentElement.classList.add("with-fancybox");

    this.trigger("initLayout");

    return this;
  }

  /**
   * Prepares slides for the corousel
   * @returns {Array} Slides
   */
  setItems(items) {
    const slides = [];

    for (const slide of items) {
      const $trigger = slide.$trigger;

      if ($trigger) {
        const dataset = $trigger.dataset || {};

        slide.src = dataset.src || $trigger.getAttribute("href") || slide.src;
        slide.type = dataset.type || slide.type;

        // Support items without `src`, e.g., when `data-fancybox` attribute added directly to `<img>` element
        if (!slide.src && $trigger instanceof HTMLImageElement) {
          slide.src = $trigger.currentSrc || slide.$trigger.src;
        }
      }

      // Check for thumbnail element
      let $thumb = slide.$thumb;

      if (!$thumb) {
        let origTarget = slide.$trigger && slide.$trigger.origTarget;

        if (origTarget) {
          if (origTarget instanceof HTMLImageElement) {
            $thumb = origTarget;
          } else {
            $thumb = origTarget.querySelector("img:not([aria-hidden])");
          }
        }

        if (!$thumb && slide.$trigger) {
          $thumb =
            slide.$trigger instanceof HTMLImageElement
              ? slide.$trigger
              : slide.$trigger.querySelector("img:not([aria-hidden])");
        }
      }

      slide.$thumb = $thumb || null;

      // Get thumbnail image source
      let thumb = slide.thumb;

      if (!thumb && $thumb) {
        thumb = $thumb.currentSrc || $thumb.src;

        if (!thumb && $thumb.dataset) {
          thumb = $thumb.dataset.lazySrc || $thumb.dataset.src;
        }
      }

      // Assume we have image, then use it as thumbnail
      if (!thumb && slide.type === "image") {
        thumb = slide.src;
      }

      slide.thumb = thumb || null;

      // Add empty caption to make things simpler
      slide.caption = slide.caption || "";

      slides.push(slide);
    }

    this.items = slides;
  }

  /**
   * Initialize main Carousel that will be used to display the content
   * @param {Array} slides
   */
  initCarousel() {
    this.Carousel = new Carousel(
      this.$carousel,
      extend(
        true,
        {},
        {
          prefix: "",

          classNames: {
            viewport: "fancybox__viewport",
            track: "fancybox__track",
            slide: "fancybox__slide",
          },

          textSelection: true,
          preload: this.option("preload"),

          friction: 0.88,

          slides: this.items,
          initialPage: this.options.startIndex,
          slidesPerPage: 1,

          infiniteX: this.option("infinite"),
          infiniteY: true,

          l10n: this.option("l10n"),

          Dots: false,
          Navigation: {
            classNames: {
              main: "fancybox__nav",
              button: "carousel__button",

              next: "is-next",
              prev: "is-prev",
            },
          },

          Panzoom: {
            textSelection: true,

            panOnlyZoomed: () => {
              return (
                this.Carousel && this.Carousel.pages && this.Carousel.pages.length < 2 && !this.option("dragToClose")
              );
            },

            lockAxis: () => {
              if (this.Carousel) {
                let rez = "x";

                if (this.option("dragToClose")) {
                  rez += "y";
                }

                return rez;
              }
            },
          },

          on: {
            "*": (name, ...details) => this.trigger(`Carousel.${name}`, ...details),
            init: (carousel) => (this.Carousel = carousel),
            createSlide: this.onCreateSlide,
            settle: this.onSettle,
          },
        },

        this.option("Carousel")
      )
    );

    if (this.option("dragToClose")) {
      this.Carousel.Panzoom.on({
        // Stop further touch event handling if content is scaled
        touchMove: this.onTouchMove,

        // Update backdrop opacity depending on vertical distance
        afterTransform: this.onTransform,

        // Close instance if drag distance exceeds limit
        touchEnd: this.onTouchEnd,
      });
    }

    this.trigger("initCarousel");

    return this;
  }

  /**
   * Process `createSlide` event to create caption element inside new slide
   */
  onCreateSlide(carousel, slide) {
    let caption = slide.caption || "";

    if (typeof this.options.caption === "function") {
      caption = this.options.caption.call(this, this, this.Carousel, slide);
    }

    if (typeof caption === "string" && caption.length) {
      const $caption = document.createElement("div");
      const id = `fancybox__caption_${this.id}_${slide.index}`;

      $caption.className = "fancybox__caption";
      $caption.innerHTML = caption;
      $caption.setAttribute("id", id);

      slide.$caption = slide.$el.appendChild($caption);

      slide.$el.classList.add("has-caption");
      slide.$el.setAttribute("aria-labelledby", id);
    }
  }

  /**
   * Handle Carousel `settle` event
   */
  onSettle() {
    if (this.option("autoFocus")) {
      this.focus();
    }
  }

  /**
   * Handle focus event
   * @param {Event} event - Focus event
   */
  onFocus(event) {
    if (!this.isTopmost()) {
      return;
    }

    this.focus(event);
  }

  /**
   * Handle click event on the container
   * @param {Event} event - Click event
   */
  onClick(event) {
    if (event.defaultPrevented) {
      return;
    }

    let eventTarget = event.composedPath()[0];

    if (eventTarget.matches("[data-fancybox-close]")) {
      event.preventDefault();
      Fancybox.close(false, event);

      return;
    }

    if (eventTarget.matches("[data-fancybox-next]")) {
      event.preventDefault();
      Fancybox.next();

      return;
    }

    if (eventTarget.matches("[data-fancybox-prev]")) {
      event.preventDefault();
      Fancybox.prev();

      return;
    }

    const activeElement = document.activeElement;

    if (activeElement) {
      if (activeElement.closest("[contenteditable]")) {
        return;
      }

      if (!eventTarget.matches(FOCUSABLE_ELEMENTS)) {
        activeElement.blur();
      }
    }

    // Skip if clicked inside content area
    if (eventTarget.closest(".fancybox__content")) {
      return;
    }

    // Skip if text is selected
    if (getSelection().toString().length) {
      return;
    }

    if (this.trigger("click", event) === false) {
      return;
    }

    const action = this.option("click");

    switch (action) {
      case "close":
        this.close();
        break;
      case "next":
        this.next();
        break;
    }
  }

  /**
   * Handle panzoom `touchMove` event; Disable dragging if content of current slide is scaled
   */
  onTouchMove() {
    const panzoom = this.getSlide().Panzoom;

    return panzoom && panzoom.content.scale !== 1 ? false : true;
  }

  /**
   * Handle panzoom `touchEnd` event; close when quick flick up/down is detected
   * @param {Object} panzoom - Panzoom instance
   */
  onTouchEnd(panzoom) {
    const distanceY = panzoom.dragOffset.y;

    if (Math.abs(distanceY) >= 150 || (Math.abs(distanceY) >= 35 && panzoom.dragOffset.time < 350)) {
      if (this.option("hideClass")) {
        this.getSlide().hideClass = `fancybox-throwOut${panzoom.content.y < 0 ? "Up" : "Down"}`;
      }

      this.close();
    } else if (panzoom.lockAxis === "y") {
      panzoom.panTo({ y: 0 });
    }
  }

  /**
   * Handle `afterTransform` event; change backdrop opacity based on current y position of panzoom
   * @param {Object} panzoom - Panzoom instance
   */
  onTransform(panzoom) {
    const $backdrop = this.$backdrop;

    if ($backdrop) {
      const yPos = Math.abs(panzoom.content.y);
      const opacity = yPos < 1 ? "" : Math.max(0.33, Math.min(1, 1 - (yPos / panzoom.content.fitHeight) * 1.5));

      this.$container.style.setProperty("--fancybox-ts", opacity ? "0s" : "");
      this.$container.style.setProperty("--fancybox-opacity", opacity);
    }
  }

  /**
   * Handle `mousedown` event to mark that the mouse is in use
   */
  onMousedown() {
    if (this.state === "ready") {
      document.body.classList.add("is-using-mouse");
    }
  }

  /**
   * Handle `keydown` event; trap focus
   * @param {Event} event Keydown event
   */
  onKeydown(event) {
    if (!this.isTopmost()) {
      return;
    }

    document.body.classList.remove("is-using-mouse");

    const key = event.key;
    const keyboard = this.option("keyboard");

    if (!keyboard || event.ctrlKey || event.altKey || event.shiftKey) {
      return;
    }

    const target = event.composedPath()[0];

    const classList = document.activeElement && document.activeElement.classList;
    const isUIElement = classList && classList.contains("carousel__button");

    // Allow to close using Escape button
    if (key !== "Escape" && !isUIElement) {
      let ignoreElements =
        event.target.isContentEditable ||
        ["BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(target.nodeName) !== -1;

      if (ignoreElements) {
        return;
      }
    }

    if (this.trigger("keydown", key, event) === false) {
      return;
    }

    const action = keyboard[key];

    if (typeof this[action] === "function") {
      this[action]();
    }
  }

  /**
   * Get the active slide. This will be the first slide from the current page of the main carousel.
   */
  getSlide() {
    const carousel = this.Carousel;

    if (!carousel) return null;

    const page = carousel.page === null ? carousel.option("initialPage") : carousel.page;
    const pages = carousel.pages || [];

    if (pages.length && pages[page]) {
      return pages[page].slides[0];
    }

    return null;
  }

  /**
   * Place focus on the first focusable element inside current slide
   * @param {Event} [event] - Focus event
   */
  focus(event) {
    if (Fancybox.ignoreFocusChange) {
      return;
    }

    if (["init", "closing", "customClosing", "destroy"].indexOf(this.state) > -1) {
      return;
    }

    const $container = this.$container;
    const currentSlide = this.getSlide();
    const $currentSlide = currentSlide.state === "done" ? currentSlide.$el : null;

    // Skip if the DOM element that is currently in focus is already inside the current slide
    if ($currentSlide && $currentSlide.contains(document.activeElement)) {
      return;
    }

    if (event) {
      event.preventDefault();
    }

    Fancybox.ignoreFocusChange = true;

    const allFocusableElems = Array.from($container.querySelectorAll(FOCUSABLE_ELEMENTS));

    let enabledElems = [];
    let $firstEl;

    for (let node of allFocusableElems) {
      // Enable element if it's visible and
      // is inside the current slide or is outside main carousel (for example, inside the toolbar)
      const isNodeVisible = node.offsetParent;
      const isNodeInsideCurrentSlide = $currentSlide && $currentSlide.contains(node);
      const isNodeOutsideCarousel = !this.Carousel.$viewport.contains(node);

      if (isNodeVisible && (isNodeInsideCurrentSlide || isNodeOutsideCarousel)) {
        enabledElems.push(node);

        if (node.dataset.origTabindex !== undefined) {
          node.tabIndex = node.dataset.origTabindex;
          node.removeAttribute("data-orig-tabindex");
        }

        if (
          node.hasAttribute("autoFocus") ||
          (!$firstEl && isNodeInsideCurrentSlide && !node.classList.contains("carousel__button"))
        ) {
          $firstEl = node;
        }
      } else {
        // Element is either hidden or is inside preloaded slide (e.g., not inside current slide, but next/prev)
        node.dataset.origTabindex =
          node.dataset.origTabindex === undefined ? node.getAttribute("tabindex") : node.dataset.origTabindex;

        node.tabIndex = -1;
      }
    }

    if (!event) {
      if (this.option("autoFocus") && $firstEl) {
        setFocusOn($firstEl);
      } else if (enabledElems.indexOf(document.activeElement) < 0) {
        setFocusOn($container);
      }
    } else {
      if (enabledElems.indexOf(event.target) > -1) {
        this.lastFocus = event.target;
      } else {
        if (this.lastFocus === $container) {
          setFocusOn(enabledElems[enabledElems.length - 1]);
        } else {
          setFocusOn($container);
        }
      }
    }

    this.lastFocus = document.activeElement;

    Fancybox.ignoreFocusChange = false;
  }

  /**
   * Hide vertical page scrollbar and adjust right padding value of `body` element to prevent content from shifting
   * (otherwise the `body` element may become wider and the content may expand horizontally).
   */
  hideScrollbar() {
    if (!canUseDOM) {
      return;
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.getBoundingClientRect().width;
    const id = "fancybox-style-noscroll";

    let $style = document.getElementById(id);

    if ($style) {
      return;
    }

    if (scrollbarWidth > 0) {
      $style = document.createElement("style");

      $style.id = id;
      $style.type = "text/css";
      $style.innerHTML = `.compensate-for-scrollbar {padding-right: ${scrollbarWidth}px;}`;

      document.getElementsByTagName("head")[0].appendChild($style);

      document.body.classList.add("compensate-for-scrollbar");
    }
  }

  /**
   * Stop hiding vertical page scrollbar
   */
  revealScrollbar() {
    document.body.classList.remove("compensate-for-scrollbar");

    const el = document.getElementById("fancybox-style-noscroll");

    if (el) {
      el.remove();
    }
  }

  /**
   * Remove content for given slide
   * @param {Object} slide - Carousel slide
   */
  clearContent(slide) {
    // * Clear previously added content and class name
    this.Carousel.trigger("removeSlide", slide);

    if (slide.$content) {
      slide.$content.remove();
      slide.$content = null;
    }

    if (slide.$closeButton) {
      slide.$closeButton.remove();
      slide.$closeButton = null;
    }

    if (slide._className) {
      slide.$el.classList.remove(slide._className);
    }
  }

  /**
   * Set new content for given slide
   * @param {Object} slide - Carousel slide
   * @param {HTMLElement|String} html - HTML element or string containing HTML code
   * @param {Object} [opts] - Options
   */
  setContent(slide, html, opts = {}) {
    let $content;

    const $el = slide.$el;

    if (html instanceof HTMLElement) {
      if (["img", "iframe", "video", "audio"].indexOf(html.nodeName.toLowerCase()) > -1) {
        $content = document.createElement("div");
        $content.appendChild(html);
      } else {
        $content = html;
      }
    } else {
      const $fragment = document.createRange().createContextualFragment(html);

      $content = document.createElement("div");
      $content.appendChild($fragment);
    }

    if (slide.filter && !slide.error) {
      $content = $content.querySelector(slide.filter);
    }

    if (!($content instanceof Element)) {
      this.setError(slide, "{{ELEMENT_NOT_FOUND}}");

      return;
    }

    // * Add class name indicating content type, for example `has-image`
    slide._className = `has-${opts.suffix || slide.type || "unknown"}`;

    $el.classList.add(slide._className);

    // * Set content
    $content.classList.add("fancybox__content");

    // Make sure that content is not hidden and will be visible
    if ($content.style.display === "none" || getComputedStyle($content).getPropertyValue("display") === "none") {
      $content.style.display = slide.display || this.option("defaultDisplay") || "flex";
    }

    if (slide.id) {
      $content.setAttribute("id", slide.id);
    }

    slide.$content = $content;

    $el.prepend($content);

    this.manageCloseButton(slide);

    if (slide.state !== "loading") {
      this.revealContent(slide);
    }

    return $content;
  }

  /**
   * Create close button if needed
   * @param {Object} slide
   */
  manageCloseButton(slide) {
    const position = slide.closeButton === undefined ? this.option("closeButton") : slide.closeButton;

    if (!position || (position === "top" && this.$closeButton)) {
      return;
    }

    const $btn = document.createElement("button");

    $btn.classList.add("carousel__button", "is-close");
    $btn.setAttribute("title", this.options.l10n.CLOSE);
    $btn.innerHTML = this.option("template.closeButton");

    $btn.addEventListener("click", (e) => this.close(e));

    if (position === "inside") {
      // Remove existing one to avoid scope issues
      if (slide.$closeButton) {
        slide.$closeButton.remove();
      }

      slide.$closeButton = slide.$content.appendChild($btn);
    } else {
      this.$closeButton = this.$container.insertBefore($btn, this.$container.firstChild);
    }
  }

  /**
   * Make content visible for given slide and optionally start CSS animation
   * @param {Object} slide - Carousel slide
   */
  revealContent(slide) {
    this.trigger("reveal", slide);

    slide.$content.style.visibility = "";

    // Add CSS class name that reveals content (default animation is "fadeIn")
    let showClass = false;

    if (
      !(
        slide.error ||
        slide.state === "loading" ||
        this.Carousel.prevPage !== null ||
        slide.index !== this.options.startIndex
      )
    ) {
      showClass = slide.showClass === undefined ? this.option("showClass") : slide.showClass;
    }

    if (!showClass) {
      this.done(slide);

      return;
    }

    slide.state = "animating";

    this.animateCSS(slide.$content, showClass, () => {
      this.done(slide);
    });
  }

  /**
   * Add class name to given HTML element and wait for `animationend` event to execute callback
   * @param {HTMLElement} $el
   * @param {String} className
   * @param {Function} callback - A callback to run
   */
  animateCSS($element, className, callback) {
    if ($element) {
      $element.dispatchEvent(new CustomEvent("animationend", { bubbles: true, cancelable: true }));
    }

    if (!$element || !className) {
      if (typeof callback === "function") {
        callback();
      }

      return;
    }

    const handleAnimationEnd = function (event) {
      if (event.currentTarget === this) {
        $element.removeEventListener("animationend", handleAnimationEnd);

        if (callback) {
          callback();
        }

        $element.classList.remove(className);
      }
    };

    $element.addEventListener("animationend", handleAnimationEnd);
    $element.classList.add(className);
  }

  /**
   * Mark given slide as `done`, e.g., content is loaded and displayed completely
   * @param {Object} slide - Carousel slide
   */
  done(slide) {
    slide.state = "done";

    this.trigger("done", slide);

    // Trigger focus for current slide (and ignore preloaded slides)
    const currentSlide = this.getSlide();

    if (currentSlide && slide.index === currentSlide.index && this.option("autoFocus")) {
      this.focus();
    }
  }

  /**
   * Set error message as slide content
   * @param {Object} slide - Carousel slide
   * @param {String} message - Error message, can contain HTML code and template variables
   */
  setError(slide, message) {
    slide.error = message;

    this.hideLoading(slide);
    this.clearContent(slide);

    // Create new content
    const div = document.createElement("div");
    div.classList.add("fancybox-error");
    div.innerHTML = this.localize(message || "<p>{{ERROR}}</p>");

    this.setContent(slide, div, { suffix: "error" });
  }

  /**
   * Create loading indicator inside given slide
   * @param {Object} slide - Carousel slide
   */
  showLoading(slide) {
    slide.state = "loading";

    slide.$el.classList.add("is-loading");

    let $spinner = slide.$el.querySelector(".fancybox__spinner");

    if ($spinner) {
      return;
    }

    $spinner = document.createElement("div");

    $spinner.classList.add("fancybox__spinner");
    $spinner.innerHTML = this.option("template.spinner");

    $spinner.addEventListener("click", () => {
      if (!this.Carousel.Panzoom.velocity) this.close();
    });

    slide.$el.prepend($spinner);
  }

  /**
   * Remove loading indicator from given slide
   * @param {Object} slide - Carousel slide
   */
  hideLoading(slide) {
    const $spinner = slide.$el && slide.$el.querySelector(".fancybox__spinner");

    if ($spinner) {
      $spinner.remove();

      slide.$el.classList.remove("is-loading");
    }

    if (slide.state === "loading") {
      this.trigger("load", slide);

      slide.state = "ready";
    }
  }

  /**
   * Slide carousel to next page
   */
  next() {
    const carousel = this.Carousel;

    if (carousel && carousel.pages.length > 1) {
      carousel.slideNext();
    }
  }

  /**
   * Slide carousel to previous page
   */
  prev() {
    const carousel = this.Carousel;

    if (carousel && carousel.pages.length > 1) {
      carousel.slidePrev();
    }
  }

  /**
   * Slide carousel to selected page with optional parameters
   * Examples:
   *    Fancybox.getInstance().jumpTo(2);
   *    Fancybox.getInstance().jumpTo(3, {friction: 0})
   * @param  {...any} args - Arguments for Carousel `slideTo` method
   */
  jumpTo(...args) {
    if (this.Carousel) this.Carousel.slideTo(...args);
  }

  /**
   * Check if current instance is trying to close or is already closed
   * @returns {Boolean}
   */
  isClosing() {
    return ["closing", "customClosing", "destroy"].includes(this.state);
  }

  /**
   * Check if the current instance is not blocked by another instance
   * @returns {Boolean}
   */
  isTopmost() {
    return Fancybox.getInstance().id == this.id;
  }

  /**
   * Start closing the current instance
   * @param {Event} [event] - Optional click event
   */
  close(event) {
    if (event) event.preventDefault();

    // First, stop further execution if this instance is already closing
    // (this can happen if, for example, user clicks close button multiple times really fast)
    if (this.isClosing()) {
      return;
    }

    // Allow callbacks and/or plugins to prevent closing
    if (this.trigger("shouldClose", event) === false) {
      return;
    }

    this.state = "closing";

    this.Carousel.Panzoom.destroy();

    this.detachEvents();

    this.trigger("closing", event);

    if (this.state === "destroy") {
      return;
    }

    // Trigger default CSS closing animation for backdrop and interface elements
    this.$container.setAttribute("aria-hidden", "true");

    this.$container.classList.add("is-closing");

    // Clear inactive slides
    const currentSlide = this.getSlide();

    this.Carousel.slides.forEach((slide) => {
      if (slide.$content && slide.index !== currentSlide.index) {
        this.Carousel.trigger("removeSlide", slide);
      }
    });

    // Start default closing animation
    if (this.state === "closing") {
      const hideClass = currentSlide.hideClass === undefined ? this.option("hideClass") : currentSlide.hideClass;

      this.animateCSS(
        currentSlide.$content,
        hideClass,
        () => {
          this.destroy();
        },
        true
      );
    }
  }

  /**
   * Clean up after closing fancybox
   */
  destroy() {
    if (this.state === "destroy") {
      return;
    }

    this.state = "destroy";

    this.trigger("destroy");

    const $trigger = this.option("placeFocusBack") ? this.option("triggerTarget", this.getSlide().$trigger) : null;

    // Destroy Carousel and then detach plugins;
    // * Note: this order allows plugins to receive `removeSlide` event
    this.Carousel.destroy();

    this.detachPlugins();

    this.Carousel = null;

    this.options = {};
    this.events = {};

    this.$container.remove();

    this.$container = this.$backdrop = this.$carousel = null;

    if ($trigger) {
      setFocusOn($trigger);
    }

    instances.delete(this.id);

    const nextInstance = Fancybox.getInstance();

    if (nextInstance) {
      nextInstance.focus();
      return;
    }

    document.documentElement.classList.remove("with-fancybox");
    document.body.classList.remove("is-using-mouse");

    this.revealScrollbar();
  }

  /**
   * Create new Fancybox instance with provided options
   * Example:
   *   Fancybox.show([{ src : 'https://lipsum.app/id/1/300x225' }]);
   * @param {Array} items - Gallery items
   * @param {Object} [options] - Optional custom options
   * @returns {Object} Fancybox instance
   */
  static show(items, options = {}) {
    return new Fancybox(items, options);
  }

  /**
   * Starts Fancybox if event target matches any opener or target is `trigger element`
   * @param {Event} event - Click event
   * @param {Object} [options] - Optional custom options
   */
  static fromEvent(event, options = {}) {
    //  Allow other scripts to prevent starting fancybox on click
    if (event.defaultPrevented) {
      return;
    }

    // Don't run if right-click
    if (event.button && event.button !== 0) {
      return;
    }

    // Ignore command/control + click
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const origTarget = event.composedPath()[0];
    let eventTarget = origTarget;

    // Support `trigger` element, e.g., start fancybox from different DOM element, for example,
    // to have one preview image for hidden image gallery
    let triggerGroupName;

    if (
      eventTarget.matches("[data-fancybox-trigger]") ||
      (eventTarget = eventTarget.closest("[data-fancybox-trigger]"))
    ) {
      options.triggerTarget = eventTarget;
      triggerGroupName = eventTarget && eventTarget.dataset && eventTarget.dataset.fancyboxTrigger;
    }

    if (triggerGroupName) {
      const triggerItems = document.querySelectorAll(`[data-fancybox="${triggerGroupName}"]`);
      const triggerIndex = parseInt(eventTarget.dataset.fancyboxIndex, 10) || 0;

      eventTarget = triggerItems.length ? triggerItems[triggerIndex] : eventTarget;
    }

    // * Try to find matching openener
    let matchingOpener;
    let target;

    Array.from(Fancybox.openers.keys())
      .reverse()
      .some((opener) => {
        target = eventTarget || origTarget;

        let found = false;

        try {
          if (target instanceof Element && (typeof opener === "string" || opener instanceof String)) {
            // Chain closest() to event.target to find and return the parent element,
            // regardless if clicking on the child elements (icon, label, etc)
            found = target.matches(opener) || (target = target.closest(opener));
          }
        } catch (error) {}

        if (found) {
          event.preventDefault();
          matchingOpener = opener;
          return true;
        }

        return false;
      });

    let rez = false;

    if (matchingOpener) {
      options.event = event;
      options.target = target;

      target.origTarget = origTarget;

      rez = Fancybox.fromOpener(matchingOpener, options);

      // Check if the mouse is being used
      // Waiting for better browser support for `:focus-visible` -
      // https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo
      const nextInstance = Fancybox.getInstance();

      if (nextInstance && nextInstance.state === "ready" && event.detail) {
        document.body.classList.add("is-using-mouse");
      }
    }

    return rez;
  }

  /**
   * Starts Fancybox using selector
   * @param {String} opener - Valid CSS selector string
   * @param {Object} [options] - Optional custom options
   */
  static fromOpener(opener, options = {}) {
    // Callback function called once for each group element that
    // 1) converts data attributes to boolean or JSON
    // 2) removes values that could cause issues
    const mapCallback = function (el) {
      const falseValues = ["false", "0", "no", "null", "undefined"];
      const trueValues = ["true", "1", "yes"];

      const dataset = Object.assign({}, el.dataset);
      const options = {};

      for (let [key, value] of Object.entries(dataset)) {
        if (key === "fancybox") {
          continue;
        }

        if (key === "width" || key === "height") {
          options[`_${key}`] = value;
        } else if (typeof value === "string" || value instanceof String) {
          if (falseValues.indexOf(value) > -1) {
            options[key] = false;
          } else if (trueValues.indexOf(options[key]) > -1) {
            options[key] = true;
          } else {
            try {
              options[key] = JSON.parse(value);
            } catch (e) {
              options[key] = value;
            }
          }
        } else {
          options[key] = value;
        }
      }

      if (el instanceof Element) {
        options.$trigger = el;
      }

      return options;
    };

    let items = [],
      index = options.startIndex || 0,
      target = options.target || null;

    // Get options
    // ===
    options = extend({}, options, Fancybox.openers.get(opener));

    // Get matching nodes
    // ===
    const groupAll = options.groupAll === undefined ? false : options.groupAll;

    const groupAttr = options.groupAttr === undefined ? "data-fancybox" : options.groupAttr;
    const groupValue = groupAttr && target ? target.getAttribute(`${groupAttr}`) : "";

    if (!target || groupValue || groupAll) {
      const $root = options.root || (target ? target.getRootNode() : document.body);

      items = [].slice.call($root.querySelectorAll(opener));
    }

    if (target && !groupAll) {
      if (groupValue) {
        items = items.filter((el) => el.getAttribute(`${groupAttr}`) === groupValue);
      } else {
        items = [target];
      }
    }

    if (!items.length) {
      return false;
    }

    // Exit if current instance is triggered from the same element
    // ===
    const currentInstance = Fancybox.getInstance();

    if (currentInstance && items.indexOf(currentInstance.options.$trigger) > -1) {
      return false;
    }

    // Start Fancybox
    // ===

    // Get index of current item in the gallery
    index = target ? items.indexOf(target) : index;

    // Convert items in a format supported by fancybox
    items = items.map(mapCallback);

    // * Create new fancybox instance
    return new Fancybox(
      items,
      extend({}, options, {
        startIndex: index,
        $trigger: target,
      })
    );
  }

  /**
   * Attach a click handler function that starts Fancybox to the selected items, as well as to all future matching elements.
   * @param {String} selector - Selector that should match trigger elements
   * @param {Object} [options] - Custom options
   */
  static bind(selector, options = {}) {
    function attachClickEvent() {
      document.body.addEventListener("click", Fancybox.fromEvent, false);
    }

    if (!canUseDOM) {
      return;
    }

    if (!Fancybox.openers.size) {
      if (/complete|interactive|loaded/.test(document.readyState)) {
        attachClickEvent();
      } else {
        document.addEventListener("DOMContentLoaded", attachClickEvent);
      }
    }

    Fancybox.openers.set(selector, options);
  }

  /**
   * Remove the click handler that was attached with `bind()`
   * @param {String} selector - A selector which should match the one originally passed to .bind()
   */
  static unbind(selector) {
    Fancybox.openers.delete(selector);

    if (!Fancybox.openers.size) {
      Fancybox.destroy();
    }
  }

  /**
   * Immediately destroy all instances (without closing animation) and clean up all bindings..
   */
  static destroy() {
    let fb;

    while ((fb = Fancybox.getInstance())) {
      fb.destroy();
    }

    Fancybox.openers = new Map();

    document.body.removeEventListener("click", Fancybox.fromEvent, false);
  }

  /**
   * Retrieve instance by identifier or the top most instance, if identifier is not provided
   * @param {String|Numeric} [id] - Optional instance identifier
   */
  static getInstance(id) {
    if (id) {
      return instances.get(id);
    }

    const instance = Array.from(instances.values())
      .reverse()
      .find((instance) => {
        if (!instance.isClosing()) {
          return instance;
        }

        return false;
      });

    return instance || null;
  }

  /**
   * Close all or topmost currently active instance.
   * @param {boolean} [all] - All or only topmost active instance
   * @param {any} [arguments] - Optional data
   */
  static close(all = true, args) {
    if (all) {
      for (const instance of instances.values()) {
        instance.close(args);
      }
    } else {
      const instance = Fancybox.getInstance();

      if (instance) {
        instance.close(args);
      }
    }
  }

  /**
   * Slide topmost currently active instance to next page
   */
  static next() {
    const instance = Fancybox.getInstance();

    if (instance) {
      instance.next();
    }
  }

  /**
   * Slide topmost currently active instance to previous page
   */
  static prev() {
    const instance = Fancybox.getInstance();

    if (instance) {
      instance.prev();
    }
  }
}

// Expose version
Fancybox.version = "__VERSION__";

// Expose defaults
Fancybox.defaults = defaults;

// Expose openers
Fancybox.openers = new Map();

// Add default plugins
Fancybox.Plugins = Plugins;

// Auto init with default options
Fancybox.bind("[data-fancybox]");

// Prepare plugins
for (const [key, Plugin] of Object.entries(Fancybox.Plugins || {})) {
  if (typeof Plugin.create === "function") {
    Plugin.create(Fancybox);
  }
}

export { Fancybox };
