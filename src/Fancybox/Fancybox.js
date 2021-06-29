// var global = global || window;
import { extend } from "../shared/utils/extend.js";
import { canUseDOM } from "../shared/utils/canUseDOM.js";

import { Base } from "../shared/Base/Base.js";

import { Carousel } from "../Carousel/Carousel.js";

import { Plugins } from "./plugins/index.js";

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
  click: "close", // "close" | "next"

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
  l10n: {
    CLOSE: "Close",
    NEXT: "Next",
    PREV: "Previous",
    MODAL: "You can close this modal content with the ESC key",
    ERROR: "Something Went Wrong, Please Try Again Later",
    IMAGE_ERROR: "Image Not Found",
    ELEMENT_NOT_FOUND: "HTML Element Not Found",
    AJAX_NOT_FOUND: "Error Loading AJAX : Not Found",
    AJAX_FORBIDDEN: "Error Loading AJAX : Forbidden",
    IFRAME_ERROR: "Error Loading Page",
  },
};

let called = 0;
let preventScrollSupported = null;

class Fancybox extends Base {
  /**
   * Fancybox constructor
   * @constructs Fancybox
   * @param {Object} [options] - Options for Fancybox
   */
  constructor(items, options = {}) {
    const handleOptions = function (items, options) {
      const firstOpts = extend(true, {}, items[options.startIndex] || {});

      items.forEach((item) => {
        const $trigger = item.$trigger;

        if ($trigger) {
          const dataset = $trigger.dataset || {};

          item.src = dataset.src || $trigger.getAttribute("href") || item.src;
          item.type = dataset.type || item.type;
        }
      });

      return extend(true, {}, Fancybox.defaults, options, firstOpts);
    };

    // Detect if .focus() method  supports `preventScroll` option,
    // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/focus
    preventScrollSupported = (function () {
      let rez = false;

      document.createElement("div").focus({
        get preventScroll() {
          rez = true;
          return false;
        },
      });

      return rez;
    })();

    super(handleOptions(items, options));

    this.state = "init";
    this.items = items;

    this.bindHandlers();

    this.attachPlugins(Fancybox.Plugins);

    this.trigger("init");

    if (this.option("hideScrollbar") === true) {
      this.hideScrollbar();
    }

    this.initLayout();

    this.initCarousel(this.getSlides());

    this.attachEvents();

    this.state = "ready";

    this.trigger("ready");

    // Reveal container
    this.$container.setAttribute("aria-hidden", "false");
  }

  /**
   * Bind event handlers for referencability
   */
  bindHandlers() {
    for (const methodName of [
      "onMousedown",
      "onKeydown",
      "onClick",

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
    document.addEventListener("keydown", this.onKeydown);

    this.$container.addEventListener("click", this.onClick);
  }

  /**
   * Removes previously registered event listeners
   */
  detachEvents() {
    document.removeEventListener("mousedown", this.onMousedown);
    document.removeEventListener("keydown", this.onKeydown);

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
    const mainClass = this.options.mainClass;

    if (mainClass) {
      this.$container.classList.add(...mainClass.split(" "));
    }

    // Add class name for <html> element
    document.documentElement.classList.add("with-fancybox");

    this.trigger(`initLayout`);

    return this;
  }

  /**
   * Gets and prepares slides (gets thumbnails) for the corousel
   * @returns {Array} Slides
   */
  getSlides() {
    const slides = [...this.items];

    slides.forEach((slide) => {
      // Support items without `src`, e.g., when `data-fancybox` attribute added directly to `<img>` element
      if (!slide.src && slide.$trigger && slide.$trigger instanceof HTMLImageElement) {
        slide.src = slide.$trigger.currentSrc || slide.$trigger.src;
      }

      // Check for thumbnail element
      let $thumb = slide.$thumb;

      const origTarget = slide.$trigger && slide.$trigger.origTarget;

      if (origTarget) {
        if (origTarget instanceof HTMLImageElement) {
          $thumb = origTarget;
        } else {
          $thumb = origTarget.querySelector("img");
        }
      }

      if (!$thumb && slide.$trigger) {
        $thumb = slide.$trigger instanceof HTMLImageElement ? slide.$trigger : slide.$trigger.querySelector("img");
      }

      slide.$thumb = $thumb || null;

      // Get thumbnail image source
      let thumb = slide.thumb;

      if (!thumb && slide.$thumb) {
        thumb = $thumb.currentSrc || $thumb.src;
      }

      // Assume we have image, then use it as thumbnail
      if (!thumb && (!slide.type || slide.type === "image")) {
        thumb = slide.src;
      }

      slide.thumb = thumb || null;
    });

    return slides;
  }

  /**
   * Initialize main Carousel that will be used to display the content
   * @param {Array} slides
   */
  initCarousel(slides) {
    new Carousel(
      this.$carousel,
      extend(
        true,
        {},
        {
          classNames: {
            viewport: "fancybox__viewport",
            track: "fancybox__track",
            slide: "fancybox__slide",
          },

          textSelection: true,
          preload: this.option("preload"),
          friction: 0.88,

          slides: slides,
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
            panOnlyZoomed: () => {
              return this.Carousel.pages.length < 2 && !this.options.dragToClose;
            },
            lockAxis: () => {
              let rez = this.Carousel.pages.length > 1 ? "x" : "";

              if (this.options.dragToClose) {
                rez += "y";
              }

              return rez;
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

    if (this.options.dragToClose) {
      this.Carousel.Panzoom.on({
        // Stop further touch event handling if content is scaled
        touchMove: this.onTouchMove,

        // Update backdrop opacity depending on vertical distance
        afterTransform: this.onTransform,

        // Close instance if drag distance exceeds limit
        touchEnd: this.onTouchEnd,
      });
    }

    this.trigger(`initCarousel`);

    return this;
  }

  /**
   * Process `createSlide` event to create caption element inside new slide
   */
  onCreateSlide(carousel, slide) {
    const caption = slide.caption;

    if (caption) {
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
   * Process `settle event to handle focus after animation has ended
   */
  onSettle() {
    this.focus();
  }

  /**
   * Handle click event on the container
   * @param {Event} event - Click event
   */
  onClick(event) {
    if (event.defaultPrevented) {
      return;
    }

    // Skip if clicked inside content area
    if (event.target.closest(".fancybox__content")) {
      return;
    }

    // Skip if text is selected
    if (window.getSelection().toString().length) {
      return;
    }

    const click = this.option("click");

    if (typeof click === "function") {
      return click.call(this);
    }

    switch (click) {
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

    return panzoom && panzoom.current.scale !== 1 ? false : true;
  }

  /**
   * Handle panzoom `touchEnd` event; close when quick flick up/down is detected
   * @param {Object} panzoom - Panzoom instance
   */
  onTouchEnd(panzoom) {
    const distanceY = panzoom.drag.distanceY;

    if (Math.abs(distanceY) >= 150 || (Math.abs(distanceY) >= 35 && panzoom.drag.elapsedTime < 350)) {
      if (this.option("hideClass")) {
        this.getSlide().hideClass = `fancybox-throwOut${panzoom.current.y < 0 ? "Up" : "Down"}`;
      }

      this.close();
    }
  }

  /**
   * Handle `afterTransform` event; change backdrop opacity based on current y position of panzoom
   * @param {Object} panzoom - Panzoom instance
   */
  onTransform(panzoom) {
    const $backdrop = this.$backdrop;

    if ($backdrop) {
      const yPos = Math.abs(panzoom.current.y);
      const opacity = yPos < 1 ? "" : Math.max(0, Math.min(1, 1 - (yPos / panzoom.$content.clientHeight) * 1.5));

      this.$container.style.setProperty("--fancybox-ts", opacity ? "0s" : "");
      this.$container.style.setProperty("--fancybox-opacity", opacity);
    }
  }

  /**
   * Handle `mousedown` event to mark that the mouse is in use
   */
  onMousedown() {
    document.body.classList.add("is-using-mouse");
  }

  /**
   * Handle `keydown` event; trap focus
   * @param {Event} event Keydown event
   */
  onKeydown(event) {
    if (Fancybox.getInstance().id !== this.id) {
      return;
    }

    document.body.classList.remove("is-using-mouse");

    const key = event.key;

    // Trap keyboard focus inside of the modal
    if (key === "Tab" && this.option("trapFocus")) {
      this.focus(event);

      return;
    }

    const keyboard = this.option("keyboard");

    if (!keyboard || event.ctrlKey || event.altKey || event.shiftKey) {
      return;
    }

    const classList = document.activeElement && document.activeElement.classList;
    const isUIElement = classList && classList.contains("carousel__button");

    // Allow to close using Escape button
    if (key !== "Escape" && !isUIElement) {
      let ignoreElements =
        event.target.isContentEditable ||
        ["BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(event.target.nodeName) !== -1;

      if (ignoreElements) {
        return;
      }
    }

    if (this.trigger("keydown", key) === false) {
      return;
    }

    if (key !== "Enter") {
      event.preventDefault();
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
    const setFocusOn = (node) => {
      if (node.setActive) {
        // IE/Edge
        node.setActive();
      } else if (preventScrollSupported) {
        // Modern browsers
        node.focus({ preventScroll: true });
      } else {
        // Safari
        node.focus();
      }
    };

    if (event) {
      event.preventDefault();
    }

    const FOCUSABLE_ELEMENTS = [
      "a[href]",
      "area[href]",
      'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
      "select:not([disabled]):not([aria-hidden])",
      "textarea:not([disabled]):not([aria-hidden])",
      "button:not([disabled]):not([aria-hidden])",
      "iframe",
      "object",
      "embed",
      "video",
      "audio",
      "[contenteditable]",
      '[tabindex]:not([tabindex^="-"]):not([disabled]):not([aria-hidden])',
    ];

    const $currentSlide = this.getSlide().$el;

    // Setting `tabIndex` here helps to avoid Safari issues with random focusing and scrolling
    $currentSlide.tabIndex = 0;

    const allFocusableElems = [].slice.call(this.$container.querySelectorAll(FOCUSABLE_ELEMENTS));
    const enabledElems = [];

    for (let node of allFocusableElems) {
      // Slide element will be the last one, the highest priority has elements having `autofocus` attribute
      if (node.classList && node.classList.contains("fancybox__slide")) {
        continue;
      }

      const $closestSlide = node.closest(".fancybox__slide");

      if ($closestSlide) {
        if ($closestSlide === $currentSlide) {
          enabledElems[node.hasAttribute("autofocus") ? "unshift" : "push"](node);
        }
      } else {
        enabledElems.push(node);
      }
    }

    if (!enabledElems.length) {
      return;
    }

    if (this.Carousel.pages.length > 1) {
      enabledElems.push($currentSlide);
    }

    const focusedElementIndex = enabledElems.indexOf(document.activeElement);

    const moveForward = event && !event.shiftKey;
    const moveBackward = event && event.shiftKey;

    if (moveForward) {
      if (focusedElementIndex === enabledElems.length - 1) {
        return setFocusOn(enabledElems[0]);
      }

      return setFocusOn(enabledElems[focusedElementIndex + 1]);
    }

    if (moveBackward) {
      if (focusedElementIndex === 0) {
        return setFocusOn(enabledElems[enabledElems.length - 1]);
      }

      return setFocusOn(enabledElems[focusedElementIndex - 1]);
    }

    if (focusedElementIndex < 0) {
      return setFocusOn(enabledElems[0]);
    }
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

    if (scrollbarWidth) {
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
    this.Carousel.trigger("deleteSlide", slide);

    if (slide.$content) {
      slide.$content.remove();
      slide.$content = null;
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
      $content = document.createElement("div");
      $content.innerHTML = html;
    }

    if (!($content instanceof Element)) {
      throw new Error("Element expected");
    }

    // * Add class name indicating content type, for example `has-image`
    slide._className = `has-${opts.suffix || slide.type || "unknown"}`;

    $el.classList.add(slide._className);

    // * Set content
    $content.classList.add("fancybox__content");

    // Make sure that content is not hidden and will be visible
    if ($content.style.display === "none" || window.getComputedStyle($content).getPropertyValue("display") === "none") {
      $content.style.display = "flex";
    }

    if (slide.id) {
      $content.setAttribute("id", slide.id);
    }

    slide.$content = $content;

    $el.insertBefore($content, $el.querySelector(".fancybox__caption"));

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

    if (!position || (this.$closeButton && position !== "inside")) {
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
        slide.state === "error" ||
        slide.state === "ready" ||
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
        $element.classList.remove(className);

        $element.removeEventListener("animationend", handleAnimationEnd);

        if (callback) {
          callback();
        }
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
    if (!(this.state === "init" || this.state === "ready")) {
      return;
    }

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
    slide.state = "error";

    this.hideLoading(slide);
    this.clearContent(slide);

    // Create new content
    const div = document.createElement(`div`);
    div.classList.add(`fancybox-error`);
    div.innerHTML = this.localize(message || "<p>{{ERROR}}</p>");

    this.setContent(slide, div, { suffix: "error" });
  }

  /**
   * Create loading indicator inside given slide
   * @param {Object} slide - Carousel slide
   */
  showLoading(slide) {
    slide.state = "loading";

    this.trigger("load", slide);

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

    slide.$el.insertBefore($spinner, slide.$el.firstChild);
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
   * Start closing the current instance
   * @param {Event} [event] - Optional click event
   */
  close(event) {
    if (event) event.preventDefault();

    // First, stop further execution if this instance is already closing
    // (this can happen if, for example, user clicks close button multiple times really fast)
    if (["closing", "customClosing", "destroy"].indexOf(this.state) > -1) {
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

    this.$container.setAttribute("aria-hidden", "true");

    this.$container.classList.add("is-closing");

    // Clear inactive slides
    const currentSlide = this.getSlide();

    this.Carousel.slides.forEach((slide) => {
      if (slide.$content && slide.index !== currentSlide.index) {
        slide.$content.remove();
      }
    });

    // Start default closing animation
    if (this.state === "closing") {
      const hideClass = currentSlide.hideClass === undefined ? this.option("hideClass") : currentSlide.hideClass;

      this.animateCSS(currentSlide.$content, hideClass, () => {
        this.destroy();
      });
    }
  }

  /**
   * Clean up after closing fancybox
   */
  destroy() {
    this.state = "destroy";

    this.trigger("destroy");

    const $trigger = this.option("placeFocusBack") ? this.getSlide().$trigger : null;

    // Destroy Carousel and then detach plugins;
    // * Note: this order allows plugins to receive `deleteSlide` event
    this.Carousel.destroy();

    this.detachPlugins();

    this.Carousel = null;

    this.options = {};
    this.events = {};

    this.$container.remove();

    this.$container = this.$backdrop = this.$carousel = null;

    if ($trigger) {
      // `preventScroll` option is not yet supported by Safari
      // https://bugs.webkit.org/show_bug.cgi?id=178583

      if (preventScrollSupported) {
        $trigger.focus({ preventScroll: true });
      } else {
        const scrollTop = document.body.scrollTop; // Save position
        $trigger.focus();
        document.body.scrollTop = scrollTop;
      }
    }

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
    if (event.defaultPrevented) return;

    // Don't run if right-click
    if (event.button && event.button !== 0) return;

    // Ignore command/control + click
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    let rez = false;
    let target;
    let found;

    let eventTarget = event.target;

    let triggerGroupName;

    if (
      eventTarget.matches("[data-fancybox-trigger]") ||
      (eventTarget = eventTarget.closest("[data-fancybox-trigger]"))
    ) {
      triggerGroupName = eventTarget && eventTarget.dataset && eventTarget.dataset.fancyboxTrigger;
    }

    if (triggerGroupName) {
      const triggerItems = document.querySelectorAll(`[data-fancybox="${triggerGroupName}"]`);
      const triggerIndex = parseInt(eventTarget.dataset.fancyboxIndex, 10) || 0;

      eventTarget = triggerItems.length ? triggerItems[triggerIndex] : eventTarget;
    }

    if (!eventTarget) {
      eventTarget = event.target;
    }

    // * Try to find matching openener
    Array.from(Fancybox.openers.keys())
      .reverse()
      .some((opener) => {
        target = eventTarget;

        // Chain closest() to event.target to find and return the parent element,
        // regardless if clicking on the child elements (icon, label, etc)
        if (!(target.matches(opener) || (target = target.closest(opener)))) {
          return;
        }

        event.preventDefault();

        found = opener;

        return true;
      });

    if (found) {
      options.target = target;
      target.origTarget = event.target;

      rez = Fancybox.fromOpener(found, options);
    }

    // Check if the mouse is being used
    // Waiting for better browser support for `:focus-visible` -
    // https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo
    const nextInstance = Fancybox.getInstance();

    if (nextInstance && nextInstance.state === "ready" && event.detail) {
      document.body.classList.add("is-using-mouse");
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
      const falseValues = ["false", "0", "no", "null"];
      const trueValues = ["true", "1", "yes"];

      const options = Object.assign({}, el.dataset);

      for (let [key, value] of Object.entries(options)) {
        if (typeof value === "string" || value instanceof String) {
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
        }
      }

      delete options.fancybox;
      delete options.type;

      if (el instanceof Element) {
        options.$trigger = el;
      }

      return options;
    };

    let items = [],
      index = options.startIndex || 0;

    // Get options
    options = extend({}, options, Fancybox.openers.get(opener));

    // Check what data attribute is used to indicate group items
    let groupAttr = options.groupAttr;

    if (groupAttr === undefined) {
      groupAttr = "data-fancybox";
    }

    let target = options.target;

    if (groupAttr) {
      if (target && opener && opener === `[${groupAttr}]`) {
        const groupValue = target.getAttribute(`${groupAttr}`);

        if (groupValue && groupValue.length && groupValue !== "true") {
          opener = `[${groupAttr}='${groupValue}']`;
        } else {
          // If this is empty value, then do not group items
          opener = false;
        }
      }
    } else {
      opener = false;
    }

    // Get matching nodes
    if (opener) {
      items = [].slice.call(document.querySelectorAll(opener));
    }

    if (!items.length && target) {
      items = [target];
    }

    if (!items.length) {
      return false;
    }

    // Exit if current instance is triggered from the same element
    const currentInstance = Fancybox.getInstance();

    if (currentInstance && items.indexOf(currentInstance.options.$trigger) > -1) {
      return false;
    }

    // Index of current item in the gallery
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
    if (!canUseDOM) {
      return;
    }

    if (!Fancybox.openers.size) {
      document.body.addEventListener("click", Fancybox.fromEvent, false);

      // Pass self to plugins to avoid circular dependencies
      for (const [key, Plugin] of Object.entries(Fancybox.Plugins || {})) {
        Plugin.Fancybox = this;

        if (typeof Plugin.create === "function") {
          Plugin.create();
        }
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
    let nodes = [];

    if (id) {
      nodes = [document.getElementById(`fancybox-${id}`)];
    } else {
      nodes = Array.from(document.querySelectorAll(".fancybox__container")).reverse();
    }

    for (const $container of nodes) {
      const instance = $container && $container.Fancybox;

      if (instance && instance.state !== "closing" && instance.state !== "customClosing") {
        return instance;
      }
    }

    return null;
  }

  /**
   * Close all or topmost currently active instance.
   * @param {boolean} [all] - All or only topmost active instance
   */
  static close(all = true) {
    let instance = null;

    while ((instance = Fancybox.getInstance())) {
      instance.close();

      if (!all) return;
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

// Detect mobile device
Fancybox.isMobile = () =>
  navigator ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false;

// Auto init with default options
Fancybox.bind("[data-fancybox]");

export { Fancybox };
