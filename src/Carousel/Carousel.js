import { Base } from "../shared/Base/Base.js";
import { Panzoom } from "../Panzoom/Panzoom.js";

import { extend } from "../shared/utils/extend.js";
import { round } from "../shared/utils/round.js";
import { throttle } from "../shared/utils/throttle.js";

import { Plugins } from "./plugins/index.js";

// Default language
import en from "./l10n/en.js";

const defaults = {
  // Virtual slides. Each object should have at least `html` property that will be used to set content,
  // example: `slides: [{html: 'First slide'}, {html: 'Second slide'}]`
  slides: [],

  // Number of slides to preload before/after visible slides
  preload: 0,

  // Number of slides to group into the page,
  // if `auto` - group all slides that fit into the viewport
  slidesPerPage: "auto",

  // Index of initial page
  initialPage: null,

  // Index of initial slide
  initialSlide: null,

  // Panzoom friction while changing page
  friction: 0.92,

  // Should center active page
  center: true,

  // Should carousel scroll infinitely
  infinite: true,

  // Should the gap be filled before first and after last slide if `infinite: false`
  fill: true,

  // Should Carousel settle at any position after a swipe.
  dragFree: false,

  // Prefix for CSS classes, must be the same as the  SCSS `$carousel-prefix` variable
  prefix: "",

  // Class names for DOM elements (without prefix)
  classNames: {
    viewport: "carousel__viewport",
    track: "carousel__track",
    slide: "carousel__slide",

    // Classname toggled for slides inside current page
    slideSelected: "is-selected",
  },

  // Localization of strings
  l10n: en,
};

export class Carousel extends Base {
  /**
   * Carousel constructor
   * @constructs Carousel
   * @param {HTMLElement} $container - Carousel container
   * @param {Object} [options] - Options for Carousel
   */
  constructor($container, options = {}) {
    options = extend(true, {}, defaults, options);

    super(options);

    this.state = "init";

    this.$container = $container;

    if (!(this.$container instanceof HTMLElement)) {
      throw new Error("No root element provided");
    }

    this.slideNext = throttle(this.slideNext.bind(this), 250, true);
    this.slidePrev = throttle(this.slidePrev.bind(this), 250, true);

    this.init();

    $container.__Carousel = this;
  }

  /**
   * Perform initialization
   */
  init() {
    this.pages = [];
    this.page = this.pageIndex = null;
    this.prevPage = this.prevPageIndex = null;

    this.attachPlugins(Carousel.Plugins);

    this.trigger("init");

    this.initLayout();

    this.initSlides();

    this.updateMetrics();

    if (this.$track && this.pages.length) {
      this.$track.style.transform = `translate3d(${this.pages[this.page].left * -1}px, 0px, 0) scale(1)`;
    }

    this.manageSlideVisiblity();

    this.initPanzoom();

    this.state = "ready";

    this.trigger("ready");
  }

  /**
   * Initialize layout; create necessary elements
   */
  initLayout() {
    const prefix = this.option("prefix");
    const classNames = this.option("classNames");

    this.$viewport = this.option("viewport") || this.$container.querySelector(`.${prefix}${classNames.viewport}`);

    if (!this.$viewport) {
      this.$viewport = document.createElement("div");
      this.$viewport.classList.add(...(prefix + classNames.viewport).split(" "));

      this.$viewport.append(...this.$container.childNodes);

      this.$container.appendChild(this.$viewport);
    }

    this.$track = this.option("track") || this.$container.querySelector(`.${prefix}${classNames.track}`);

    if (!this.$track) {
      this.$track = document.createElement("div");
      this.$track.classList.add(...(prefix + classNames.track).split(" "));

      this.$track.append(...this.$viewport.childNodes);

      this.$viewport.appendChild(this.$track);
    }
  }

  /**
   * Fill `slides` array with objects from existing nodes and/or `slides` option
   */
  initSlides() {
    this.slides = [];

    // Get existing slides from the DOM
    const elems = this.$viewport.querySelectorAll(`.${this.option("prefix")}${this.option("classNames.slide")}`);

    elems.forEach((el) => {
      const slide = {
        $el: el,
        isDom: true,
      };

      this.slides.push(slide);

      this.trigger("createSlide", slide, this.slides.length);
    });

    // Add virtual slides, but do not create DOM elements yet,
    // because they will be created dynamically based on current carousel position
    if (Array.isArray(this.options.slides)) {
      this.slides = extend(true, [...this.slides], this.options.slides);
    }
  }

  /**
   * Do all calculations related to slide size and paging
   */
  updateMetrics() {
    // Calculate content width, viewport width
    // ===
    let contentWidth = 0;
    let indexes = [];
    let lastSlideWidth;

    this.slides.forEach((slide, index) => {
      const $el = slide.$el;
      const slideWidth = slide.isDom || !lastSlideWidth ? this.getSlideMetrics($el) : lastSlideWidth;

      slide.index = index;
      slide.width = slideWidth;
      slide.left = contentWidth;

      lastSlideWidth = slideWidth;
      contentWidth += slideWidth;

      indexes.push(index);
    });

    let viewportWidth = Math.max(this.$track.offsetWidth, round(this.$track.getBoundingClientRect().width));

    let viewportStyles = getComputedStyle(this.$track);
    viewportWidth = viewportWidth - (parseFloat(viewportStyles.paddingLeft) + parseFloat(viewportStyles.paddingRight));

    this.contentWidth = contentWidth;
    this.viewportWidth = viewportWidth;

    // Split slides into pages
    // ===
    const pages = [];
    const slidesPerPage = this.option("slidesPerPage");

    if (Number.isInteger(slidesPerPage) && contentWidth > viewportWidth) {
      // Fixed number of slides in the page
      for (let i = 0; i < this.slides.length; i += slidesPerPage) {
        pages.push({
          indexes: indexes.slice(i, i + slidesPerPage),
          slides: this.slides.slice(i, i + slidesPerPage),
        });
      }
    } else {
      // Slides that fit inside viewport
      let currentPage = 0;
      let currentWidth = 0;

      for (let i = 0; i < this.slides.length; i += 1) {
        let slide = this.slides[i];

        // Add next page
        if (!pages.length || currentWidth + slide.width > viewportWidth) {
          pages.push({
            indexes: [],
            slides: [],
          });

          currentPage = pages.length - 1;
          currentWidth = 0;
        }

        currentWidth += slide.width;

        pages[currentPage].indexes.push(i);
        pages[currentPage].slides.push(slide);
      }
    }

    const shouldCenter = this.option("center");
    const shouldFill = this.option("fill");

    // Calculate width and start position for each page
    // ===
    pages.forEach((page, index) => {
      page.index = index;
      page.width = page.slides.reduce((sum, slide) => sum + slide.width, 0);

      page.left = page.slides[0].left;

      if (shouldCenter) {
        page.left += (viewportWidth - page.width) * 0.5 * -1;
      }

      if (shouldFill && !this.option("infiniteX", this.option("infinite")) && contentWidth > viewportWidth) {
        page.left = Math.max(page.left, 0);
        page.left = Math.min(page.left, contentWidth - viewportWidth);
      }
    });

    // Merge pages
    // ===
    const rez = [];
    let prevPage;

    pages.forEach((page2) => {
      const page = { ...page2 };

      if (prevPage && page.left === prevPage.left) {
        prevPage.width += page.width;

        prevPage.slides = [...prevPage.slides, ...page.slides];
        prevPage.indexes = [...prevPage.indexes, ...page.indexes];
      } else {
        page.index = rez.length;

        prevPage = page;

        rez.push(page);
      }
    });

    this.pages = rez;

    let page = this.page;

    if (page === null) {
      const initialSlide = this.option("initialSlide");

      if (initialSlide !== null) {
        page = this.findPageForSlide(initialSlide);
      } else {
        page = parseInt(this.option("initialPage", 0), 10) || 0;
      }

      if (!rez[page]) {
        page = rez.length && page > rez.length ? rez[rez.length - 1].index : 0;
      }

      this.page = page;
      this.pageIndex = page;
    }

    this.updatePanzoom();

    this.trigger("refresh");
  }

  /**
   * Calculate slide element width (including left, right margins)
   * @param {Object} node
   * @returns {Number} Width in px
   */
  getSlideMetrics(node) {
    if (!node) {
      const firstSlide = this.slides[0];

      node = document.createElement("div");

      node.dataset.isTestEl = 1;
      node.style.visibility = "hidden";
      node.classList.add(...(this.option("prefix") + this.option("classNames.slide")).split(" "));

      // Assume all slides have the same custom class, if any
      if (firstSlide.customClass) {
        node.classList.add(...firstSlide.customClass.split(" "));
      }

      this.$track.prepend(node);
    }

    let width = Math.max(node.offsetWidth, round(node.getBoundingClientRect().width));

    // Add left/right margin
    const style = node.currentStyle || window.getComputedStyle(node);
    width = width + (parseFloat(style.marginLeft) || 0) + (parseFloat(style.marginRight) || 0);

    if (node.dataset.isTestEl) {
      node.remove();
    }

    return width;
  }

  /**
   *
   * @param {Integer} index Index of the slide
   * @returns {Integer|null} Index of the page if found, or null
   */
  findPageForSlide(index) {
    index = parseInt(index, 10) || 0;

    const page = this.pages.find((page) => {
      return page.indexes.indexOf(index) > -1;
    });

    return page ? page.index : null;
  }

  /**
   * Slide to next page, if possible
   */
  slideNext() {
    this.slideTo(this.pageIndex + 1);
  }

  /**
   * Slide to previous page, if possible
   */
  slidePrev() {
    this.slideTo(this.pageIndex - 1);
  }

  /**
   * Slides carousel to given page
   * @param {Number} page - New index of active page
   * @param {Object} [params] - Additional options
   */
  slideTo(page, params = {}) {
    const { x = this.setPage(page, true) * -1, y = 0, friction = this.option("friction") } = params;

    if (this.Panzoom.content.x === x && !this.Panzoom.velocity.x && friction) {
      return;
    }

    this.Panzoom.panTo({
      x,
      y,
      friction,
      ignoreBounds: true,
    });

    if (this.state === "ready" && this.Panzoom.state === "ready") {
      this.trigger("settle");
    }
  }

  /**
   * Initialise main Panzoom instance
   */
  initPanzoom() {
    if (this.Panzoom) {
      this.Panzoom.destroy();
    }

    // Create fresh object containing options for Pazoom instance
    const options = extend(
      true,
      {},
      {
        // Track element will be set as Panzoom $content
        content: this.$track,
        wrapInner: false,
        resizeParent: false,

        // Disable any user interaction
        zoom: false,
        click: false,

        // Right now, only horizontal navigation is supported
        lockAxis: "x",

        x: this.pages.length ? this.pages[this.page].left * -1 : 0,
        centerOnStart: false,

        // Make `textSelection` option more easy to customize
        textSelection: () => this.option("textSelection", false),

        // Disable dragging if content (e.g. all slides) fits inside viewport
        panOnlyZoomed: function () {
          return this.content.width <= this.viewport.width;
        },
      },
      this.option("Panzoom")
    );

    // Create new Panzoom instance
    this.Panzoom = new Panzoom(this.$container, options);

    this.Panzoom.on({
      // Bubble events
      "*": (name, ...details) => this.trigger(`Panzoom.${name}`, ...details),
      // The rest of events to be processed
      afterUpdate: () => {
        this.updatePage();
      },
      beforeTransform: this.onBeforeTransform.bind(this),
      touchEnd: this.onTouchEnd.bind(this),
      endAnimation: () => {
        this.trigger("settle");
      },
    });

    // The contents of the slides may cause the page scroll bar to appear, so the carousel width may change
    // and slides have to be repositioned
    this.updateMetrics();
    this.manageSlideVisiblity();
  }

  updatePanzoom() {
    if (!this.Panzoom) {
      return;
    }

    this.Panzoom.content = {
      ...this.Panzoom.content,
      fitWidth: this.contentWidth,
      origWidth: this.contentWidth,
      width: this.contentWidth,
    };

    if (this.pages.length > 1 && this.option("infiniteX", this.option("infinite"))) {
      this.Panzoom.boundX = null;
    } else if (this.pages.length) {
      this.Panzoom.boundX = {
        from: this.pages[this.pages.length - 1].left * -1,
        to: this.pages[0].left * -1,
      };
    }

    if (this.option("infiniteY", this.option("infinite"))) {
      this.Panzoom.boundY = null;
    } else {
      this.Panzoom.boundY = {
        from: 0,
        to: 0,
      };
    }

    this.Panzoom.handleCursor();
  }

  manageSlideVisiblity() {
    const contentWidth = this.contentWidth;
    const viewportWidth = this.viewportWidth;

    let currentX = this.Panzoom ? this.Panzoom.content.x * -1 : this.pages.length ? this.pages[this.page].left : 0;

    const preload = this.option("preload");
    const infinite = this.option("infiniteX", this.option("infinite"));

    const paddingLeft = parseFloat(getComputedStyle(this.$viewport, null).getPropertyValue("padding-left"));
    const paddingRight = parseFloat(getComputedStyle(this.$viewport, null).getPropertyValue("padding-right"));

    // Check visibility of each slide
    this.slides.forEach((slide) => {
      let leftBoundary, rightBoundary;

      let hasDiff = 0;

      // #1 - slides in current viewport; this does not include infinite items
      leftBoundary = currentX - paddingLeft;
      rightBoundary = currentX + viewportWidth + paddingRight;

      leftBoundary -= preload * (viewportWidth + paddingLeft + paddingRight);
      rightBoundary += preload * (viewportWidth + paddingLeft + paddingRight);

      const insideCurrentInterval = slide.left + slide.width > leftBoundary && slide.left < rightBoundary;

      // #2 - infinite items inside current viewport; from previous interval
      leftBoundary = currentX + contentWidth - paddingLeft;
      rightBoundary = currentX + contentWidth + viewportWidth + paddingRight;

      // Include slides that have to be preloaded
      leftBoundary -= preload * (viewportWidth + paddingLeft + paddingRight);

      const insidePrevInterval = infinite && slide.left + slide.width > leftBoundary && slide.left < rightBoundary;

      // #2 - infinite items inside current viewport; from next interval
      leftBoundary = currentX - contentWidth - paddingLeft;
      rightBoundary = currentX - contentWidth + viewportWidth + paddingRight;

      // Include slides that have to be preloaded
      leftBoundary -= preload * (viewportWidth + paddingLeft + paddingRight);

      const insideNextInterval = infinite && slide.left + slide.width > leftBoundary && slide.left < rightBoundary;

      // Create virtual slides that should be visible or preloaded, remove others
      if (insidePrevInterval || insideCurrentInterval || insideNextInterval) {
        this.createSlideEl(slide);

        if (insideCurrentInterval) {
          hasDiff = 0;
        }

        if (insidePrevInterval) {
          hasDiff = -1;
        }

        if (insideNextInterval) {
          hasDiff = 1;
        }

        // Bring preloaded slides back to viewport, if needed
        if (slide.left + slide.width > currentX && slide.left <= currentX + viewportWidth + paddingRight) {
          hasDiff = 0;
        }
      } else {
        this.removeSlideEl(slide);
      }

      slide.hasDiff = hasDiff;
    });

    // Reposition slides for continuity
    let nextIndex = 0;
    let nextPos = 0;

    this.slides.forEach((slide, index) => {
      let updatedX = 0;

      if (slide.$el) {
        if (index !== nextIndex || slide.hasDiff) {
          updatedX = nextPos + slide.hasDiff * contentWidth;
        } else {
          nextPos = 0;
        }

        slide.$el.style.left = Math.abs(updatedX) > 0.1 ? `${nextPos + slide.hasDiff * contentWidth}px` : "";

        nextIndex++;
      } else {
        nextPos += slide.width;
      }
    });

    this.markSelectedSlides();
  }

  /**
   * Creates main DOM element for virtual slides,
   * lazy loads images inside regular slides
   * @param {Object} slide
   */
  createSlideEl(slide) {
    if (!slide) {
      return;
    }

    if (slide.$el) {
      let curentIndex = slide.$el.dataset.index;

      if (!curentIndex || parseInt(curentIndex, 10) !== slide.index) {
        slide.$el.dataset.index = slide.index;

        // Lazy load images
        // ===
        slide.$el.querySelectorAll("[data-lazy-srcset]").forEach((node) => {
          node.srcset = node.dataset.lazySrcset;
        });

        slide.$el.querySelectorAll("[data-lazy-src]").forEach((node) => {
          let lazySrc = node.dataset.lazySrc;

          if (node instanceof HTMLImageElement) {
            node.src = lazySrc;
          } else {
            node.style.backgroundImage = `url('${lazySrc}')`;
          }
        });

        // Lazy load slide background image
        // ===
        let lazySrc;

        if ((lazySrc = slide.$el.dataset.lazySrc)) {
          slide.$el.style.backgroundImage = `url('${lazySrc}')`;
        }

        slide.state = "ready";
      }

      return;
    }

    const div = document.createElement("div");

    div.dataset.index = slide.index;
    div.classList.add(...(this.option("prefix") + this.option("classNames.slide")).split(" "));

    if (slide.customClass) {
      div.classList.add(...slide.customClass.split(" "));
    }

    if (slide.html) {
      div.innerHTML = slide.html;
    }

    const allElelements = [];

    this.slides.forEach((slide, index) => {
      if (slide.$el) {
        allElelements.push(index);
      }
    });

    // Find a place in DOM to insert an element
    const goal = slide.index;
    let refSlide = null;

    if (allElelements.length) {
      let refIndex = allElelements.reduce((prev, curr) =>
        Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
      );
      refSlide = this.slides[refIndex];
    }

    this.$track.insertBefore(
      div,
      refSlide && refSlide.$el ? (refSlide.index < slide.index ? refSlide.$el.nextSibling : refSlide.$el) : null
    );

    slide.$el = div;

    this.trigger("createSlide", slide, goal);

    return slide;
  }

  /**
   * Removes main DOM element of given slide
   * @param {Object} slide
   */
  removeSlideEl(slide) {
    if (slide.$el && !slide.isDom) {
      this.trigger("removeSlide", slide);

      slide.$el.remove();
      slide.$el = null;
    }
  }

  /**
   * Toggles selected class name and aria-hidden attribute for slides based on visibility
   */
  markSelectedSlides() {
    const selectedClass = this.option("classNames.slideSelected");
    const attr = "aria-hidden";

    this.slides.forEach((slide, index) => {
      const $el = slide.$el;

      if (!$el) {
        return;
      }

      const page = this.pages[this.page];

      if (page && page.indexes && page.indexes.indexOf(index) > -1) {
        if (selectedClass && !$el.classList.contains(selectedClass)) {
          $el.classList.add(selectedClass);
          this.trigger("selectSlide", slide);
        }

        $el.removeAttribute(attr);
      } else {
        if (selectedClass && $el.classList.contains(selectedClass)) {
          $el.classList.remove(selectedClass);
          this.trigger("unselectSlide", slide);
        }

        $el.setAttribute(attr, true);
      }
    });
  }

  /**
   * Perform all calculations and center current page
   */
  updatePage() {
    this.updateMetrics();

    this.slideTo(this.page, { friction: 0 });
  }

  /**
   * Process `Panzoom.beforeTransform` event to remove slides moved out of viewport and
   * to create necessary ones
   */
  onBeforeTransform() {
    if (this.option("infiniteX", this.option("infinite"))) {
      this.manageInfiniteTrack();
    }

    this.manageSlideVisiblity();
  }

  /**
   * Seamlessly flip position of infinite carousel, if needed; this way x position stays low
   */
  manageInfiniteTrack() {
    const contentWidth = this.contentWidth;
    const viewportWidth = this.viewportWidth;

    if (!this.option("infiniteX", this.option("infinite")) || this.pages.length < 2 || contentWidth < viewportWidth) {
      return;
    }

    const panzoom = this.Panzoom;

    let isFlipped = false;

    if (panzoom.content.x < (contentWidth - viewportWidth) * -1) {
      panzoom.content.x += contentWidth;

      this.pageIndex = this.pageIndex - this.pages.length;

      isFlipped = true;
    }

    if (panzoom.content.x > viewportWidth) {
      panzoom.content.x -= contentWidth;

      this.pageIndex = this.pageIndex + this.pages.length;

      isFlipped = true;
    }

    if (isFlipped && panzoom.state === "pointerdown") {
      panzoom.resetDragPosition();
    }

    return isFlipped;
  }

  /**
   * Process `Panzoom.touchEnd` event; slide to next/prev page if needed
   * @param {object} panzoom
   */
  onTouchEnd(panzoom, event) {
    const dragFree = this.option("dragFree");

    // If this is a quick horizontal flick, slide to next/prev slide
    if (
      !dragFree &&
      this.pages.length > 1 &&
      panzoom.dragOffset.time < 350 &&
      Math.abs(panzoom.dragOffset.y) < 1 &&
      Math.abs(panzoom.dragOffset.x) > 5
    ) {
      this[panzoom.dragOffset.x < 0 ? "slideNext" : "slidePrev"]();
      return;
    }

    // Set the slide at the end of the animation as the current one,
    // or slide to closest page
    if (dragFree) {
      const [, nextPageIndex] = this.getPageFromPosition(panzoom.transform.x * -1);
      this.setPage(nextPageIndex);
    } else {
      this.slideToClosest();
    }
  }

  /**
   * Slides to the closest page (useful, if carousel is changed manually)
   * @param {Object} [params] - Object containing additional options
   */
  slideToClosest(params = {}) {
    let [, nextPageIndex] = this.getPageFromPosition(this.Panzoom.content.x * -1);

    this.slideTo(nextPageIndex, params);
  }

  /**
   * Returns index of closest page to given x position
   * @param {Number} xPos
   */
  getPageFromPosition(xPos) {
    const pageCount = this.pages.length;
    const center = this.option("center");

    if (center) {
      xPos += this.viewportWidth * 0.5;
    }

    const interval = Math.floor(xPos / this.contentWidth);

    xPos -= interval * this.contentWidth;

    let slide = this.slides.find((slide) => slide.left <= xPos && slide.left + slide.width > xPos);

    if (slide) {
      let pageIndex = this.findPageForSlide(slide.index);

      return [pageIndex, pageIndex + interval * pageCount];
    }

    return [0, 0];
  }

  /**
   * Changes active page
   * @param {Number} page - New index of active page
   * @param {Boolean} toClosest - to closest page based on scroll distance (for infinite navigation)
   */
  setPage(page, toClosest) {
    let nextPosition = 0;
    let pageIndex = parseInt(page, 10) || 0;

    const prevPage = this.page,
      prevPageIndex = this.pageIndex,
      pageCount = this.pages.length;

    const contentWidth = this.contentWidth;
    const viewportWidth = this.viewportWidth;

    page = ((pageIndex % pageCount) + pageCount) % pageCount;

    if (this.option("infiniteX", this.option("infinite")) && contentWidth > viewportWidth) {
      const nextInterval = Math.floor(pageIndex / pageCount) || 0,
        elemDimWidth = contentWidth;

      nextPosition = this.pages[page].left + nextInterval * elemDimWidth;

      if (toClosest === true && pageCount > 2) {
        let currPosition = this.Panzoom.content.x * -1;

        // * Find closest interval
        const decreasedPosition = nextPosition - elemDimWidth,
          increasedPosition = nextPosition + elemDimWidth,
          diff1 = Math.abs(currPosition - nextPosition),
          diff2 = Math.abs(currPosition - decreasedPosition),
          diff3 = Math.abs(currPosition - increasedPosition);

        if (diff3 < diff1 && diff3 <= diff2) {
          nextPosition = increasedPosition;
          pageIndex += pageCount;
        } else if (diff2 < diff1 && diff2 < diff3) {
          nextPosition = decreasedPosition;
          pageIndex -= pageCount;
        }
      }
    } else {
      page = pageIndex = Math.max(0, Math.min(pageIndex, pageCount - 1));

      nextPosition = this.pages.length ? this.pages[page].left : 0;
    }

    this.page = page;
    this.pageIndex = pageIndex;

    if (prevPage !== null && page !== prevPage) {
      this.prevPage = prevPage;
      this.prevPageIndex = prevPageIndex;

      this.trigger("change", page, prevPage);
    }

    return nextPosition;
  }

  /**
   * Clean up
   */
  destroy() {
    this.state = "destroy";

    this.slides.forEach((slide) => {
      this.removeSlideEl(slide);
    });

    this.slides = [];

    this.Panzoom.destroy();

    this.detachPlugins();
  }
}

// Expose version
Carousel.version = "__VERSION__";

// Static properties are a recent addition that dont work in all browsers yet
Carousel.Plugins = Plugins;
