import { Base } from "../shared/Base/Base.js";
import { Panzoom } from "../Panzoom/Panzoom.js";

import { extend } from "../shared/utils/extend.js";
import { round } from "../shared/utils/round.js";
import { throttle } from "../shared/utils/throttle.js";

import { Plugins } from "./plugins/index.js";

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
  initialPage: 0,

  // Panzoom friction while changing page
  friction: 0.92,

  // Should center active page
  center: true,

  // Should carousel scroll infinitely
  infinite: true,

  // Should the gap be filled before first and after last slide if `infinite: false`
  fill: true,

  // Should carousel settle at specific page after drag event
  dragFree: false,

  classNames: {
    viewport: "carousel__viewport",
    track: "carousel__track",
    slide: "carousel__slide",
    // Classname toggled for slides inside current page
    slideSelected: "is-selected",
  },

  // Translations
  l10n: {
    NEXT: "Next slide",
    PREV: "Previous slide",
    GOTO: "Go to slide %d",
  },
};

export class Carousel extends Base {
  /**
   * Carousel constructor
   * @constructs Carousel
   * @param {HTMLElement} $element - Carousel container
   * @param {Object} [options] - Options for Carousel
   */
  constructor($element, options = {}) {
    options = extend(true, {}, defaults, options);

    super(options);

    this.state = "init";

    this.$element = $element;

    $element.Carousel = this;

    this.page = this.pageIndex = null;
    this.prevPage = this.prevPageIndex = null;

    this.slideNext = throttle(this.slideNext.bind(this), 250, true);
    this.slidePrev = throttle(this.slidePrev.bind(this), 250, true);

    this.attachPlugins(Carousel.Plugins);

    this.trigger("init");

    this.initLayout();

    this.initSlides();

    this.initPanzoom();

    this.state = "ready";

    this.trigger("ready");
  }

  /**
   * Initialize layout; create necessary elements
   */
  initLayout() {
    if (!(this.$element instanceof HTMLElement)) {
      throw new Error("No root element provided");
    }

    const classNames = this.option("classNames");

    this.$viewport = this.option("viewport") || this.$element.querySelector("." + classNames.viewport);

    if (!this.$viewport) {
      this.$viewport = document.createElement("div");
      this.$viewport.classList.add(classNames.viewport);

      this.$viewport.append(...this.$element.childNodes);

      this.$element.appendChild(this.$viewport);
    }

    this.$track = this.option("track") || this.$element.querySelector("." + classNames.track);

    if (!this.$track) {
      this.$track = document.createElement("div");
      this.$track.classList.add(classNames.track);

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
    const elems = this.$viewport.querySelectorAll("." + this.option("classNames.slide"));

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
   * Recalculate and center current page
   */
  updatePage() {
    let page = this.page;

    if (page === null) {
      page = this.page = this.option("initialPage");
    }

    this.updateMetrics();

    const pages = this.pages;

    if (!pages[page]) {
      page = pages.length ? pages[pages.length - 1].index : 0;
    }

    this.slideTo(page, { friction: 0 });
  }

  /**
   * Tweak panzoom boundaries
   */
  updateBounds() {
    let panzoom = this.Panzoom;

    // Enable `infinite` options
    const infinite = this.option("infinite");

    const infiniteX = this.option("infiniteX", infinite);
    const infiniteY = this.option("infiniteY", infinite);

    if (infiniteX) {
      panzoom.boundX = null;
    }

    if (infiniteY) {
      panzoom.boundY = null;
    }

    if (infiniteX || infiniteY) {
      return;
    }

    // if (this.option("center") && !this.option("fill")) {
    panzoom.boundX = {
      from: this.pages[this.pages.length - 1].left * -1,
      to: this.pages[0].left * -1,
    };
    // }
  }

  initPanzoom() {
    // Create fresh object containing options for Pazoom instance
    const options = extend(
      true,
      {},
      {
        // Track element will be set as Panzoom $content
        content: this.$track,

        // Disable any user interaction
        click: false,
        doubleClick: false,
        wheel: false,
        pinchToZoom: false,

        // Right now, only horizontal navigation is supported
        lockAxis: "x",

        // Make `textSelection` option more easy to customize
        textSelection: () => this.option("textSelection", false),

        // Disable dragging if content (e.g. all slides) fits inside viewport
        panOnlyZoomed: () => this.option("panOnlyZoomed", this.elemDimWidth < this.wrapDimWidth),

        on: {
          // Bubble events
          "*": (name, ...details) => this.trigger(`Panzoom.${name}`, ...details),

          // Expose panzoom instance as soon as possible
          init: (panzoom) => (this.Panzoom = panzoom),

          // The rest of events to be processed
          updateMetrics: () => {
            this.updatePage();
          },
          updateBounds: () => {
            this.updateBounds();
          },
          beforeTransform: this.onBeforeTransform.bind(this),
          afterAnimate: this.onAfterAnimate.bind(this),
          touchEnd: this.onTouchEnd.bind(this),
        },
      },
      this.option("Panzoom")
    );

    // Create new Panzoom instance
    new Panzoom(this.$viewport, options);
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
   * Process `Panzoom.afterAnimate` event
   * @param {Object} panzoom
   * @param {Boolean} [isInstant=false]
   */
  onAfterAnimate(panzoom, isInstant) {
    // If `isInstant === true` then it means the position is set without any animation
    if (!isInstant) {
      this.trigger("settle");
    }
  }

  /**
   * Process `Panzoom.touchEnd` event; slide to next/prev page if needed
   * @param {object} panzoom
   */
  onTouchEnd(panzoom) {
    const dragFree = this.option("dragFree");

    // If this is a quick horizontal flick, slide to next/prev slide
    if (
      !dragFree &&
      this.pages.length > 1 &&
      panzoom.drag.elapsedTime < 350 &&
      Math.abs(panzoom.drag.distanceY) < 1 &&
      Math.abs(panzoom.drag.distanceX) > 5
    ) {
      this[panzoom.drag.distanceX < 0 ? "slideNext" : "slidePrev"]();
      return;
    }

    // Set the slide at the end of the animation as the current one,
    // or slide to closest page
    if (dragFree) {
      const [, nextPageIndex] = this.getPageFromPosition(this.Panzoom.pan.x * -1);
      this.setPage(nextPageIndex);
    } else {
      this.slideToClosest();
    }
  }

  /**
   * Seamlessly flips position of infinite carousel, if needed; this way x position stays low
   */
  manageInfiniteTrack() {
    if (
      !this.option("infiniteX", this.option("infinite")) ||
      this.pages.length < 2 ||
      this.elemDimWidth < this.wrapDimWidth
    ) {
      return;
    }

    const panzoom = this.Panzoom;

    let isFlipped = false;

    if (panzoom.current.x < (panzoom.contentDim.width - panzoom.viewportDim.width) * -1) {
      panzoom.current.x += panzoom.contentDim.width;

      if (panzoom.drag.firstPosition) {
        panzoom.drag.firstPosition.x += panzoom.contentDim.width;
      }

      this.pageIndex = this.pageIndex - this.pages.length;

      isFlipped = true;
    }

    if (panzoom.current.x > panzoom.viewportDim.width) {
      panzoom.current.x -= panzoom.contentDim.width;

      if (panzoom.drag.firstPosition) {
        panzoom.drag.firstPosition.x -= panzoom.contentDim.width;
      }

      this.pageIndex = this.pageIndex + this.pages.length;

      isFlipped = true;
    }

    if (isFlipped && panzoom.state === "dragging") {
      panzoom.resetDragState();
    }

    return isFlipped;
  }

  /**
   * Creates or moves existing slides that are visible or should be preloaded,
   * removes unnecessary virtual slides
   */
  manageSlideVisiblity() {
    const contentWidth = this.elemDimWidth;
    const viewportWidth = this.wrapDimWidth;

    let currentX = this.Panzoom.current.x * -1;

    if (Math.abs(currentX) < 0.1) {
      currentX = 0;
    }

    const preload = this.option("preload");
    const infinite = this.option("infiniteX", this.option("infinite"));

    const paddingLeft = parseFloat(window.getComputedStyle(this.$viewport, null).getPropertyValue("padding-left"));
    const paddingRight = parseFloat(window.getComputedStyle(this.$viewport, null).getPropertyValue("padding-right"));

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
          //} || slide.hasDiff !== undefined) {
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

    // Update content height to avoid double firing of resize event callback
    this.Panzoom.viewportDim.height = this.Panzoom.$content.clientHeight;

    this.markSelectedSlides();
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
   * Creates main DOM element for virtual slides,
   * lazy loads images inside regular slides
   * @param {Object} slide
   */
  createSlideEl(slide) {
    if (!slide) {
      return;
    }

    if (slide.$el) {
      let curentIndex = parseInt(slide.$el.dataset.index, 10);

      if (curentIndex !== slide.index) {
        slide.$el.dataset.index = slide.index;

        // Lazy load images
        const $lazyNodes = slide.$el.querySelectorAll("[data-lazy-src]");

        $lazyNodes.forEach((node) => {
          let lazySrc = node.dataset.lazySrc;

          if (node instanceof HTMLImageElement) {
            node.src = lazySrc;
          } else {
            node.style.backgroundImage = `url('${lazySrc}')`;
          }
        });

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
    div.classList.add(this.option("classNames.slide"));

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
      node.classList.add(this.option("classNames.slide"));

      // Assume all slides have the same custom class, if any
      if (firstSlide.customClass) {
        node.classList.add(...firstSlide.customClass.split(" "));
      }

      this.$track.prepend(node);
    }

    let width = round(node.getBoundingClientRect().width);

    // Add left/right margin
    const style = node.currentStyle || window.getComputedStyle(node);
    width = width + (parseFloat(style.marginLeft) || 0) + (parseFloat(style.marginRight) || 0);
    // width = node.clientWidth;
    // Proportionally scale if viewport is scaled (mobile devices)
    if (window.visualViewport) {
      width *= window.visualViewport.scale;
    }

    if (node.dataset.isTestEl) {
      node.remove();
    }

    return width;
  }

  /**
   * Calculate dimensions of all slides and fill pages
   */
  updateMetrics() {
    let totalWidth = 0;
    let indexes = [];
    let lastSlideWidth;

    this.slides.forEach((slide, index) => {
      const $el = slide.$el;

      const slideWidth = slide.isDom || !lastSlideWidth ? this.getSlideMetrics($el) : lastSlideWidth;

      slide.index = index;
      slide.width = slideWidth;
      slide.left = totalWidth;

      lastSlideWidth = slideWidth;
      totalWidth += slideWidth;

      indexes.push(index);
    });

    this.elemDimWidth = round(totalWidth);
    this.Panzoom.contentDim.width = this.elemDimWidth;

    this.wrapDimWidth = round(this.$viewport.getBoundingClientRect().width);

    var styles = window.getComputedStyle(this.$viewport);
    var padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);

    this.wrapDimWidth = this.wrapDimWidth - padding;

    if (window.visualViewport) {
      this.wrapDimWidth *= window.visualViewport.scale;
    }

    this.Panzoom.viewportDim.width = this.wrapDimWidth;

    const pages = [];
    const slidesPerPage = this.option("slidesPerPage");

    // Split slides into pages
    if (Number.isInteger(slidesPerPage) && this.elemDimWidth > this.wrapDimWidth) {
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
        if (!pages.length || currentWidth + slide.width > this.wrapDimWidth) {
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
    pages.forEach((page, index) => {
      page.index = index;
      page.width = page.slides.reduce((sum, slide) => sum + slide.width, 0);

      page.left = page.slides[0].left;

      if (shouldCenter) {
        page.left += (this.wrapDimWidth - page.width) * 0.5 * -1;
      }

      if (shouldFill && !this.option("infiniteX", this.option("infinite")) && this.elemDimWidth > this.wrapDimWidth) {
        page.left = Math.max(page.left, 0);
        page.left = Math.min(page.left, this.elemDimWidth - this.wrapDimWidth);
      }
    });

    const rez = [];
    let prevPage;

    pages.forEach((page) => {
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

    this.manageSlideVisiblity();

    this.trigger("refresh");
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

    page = ((pageIndex % pageCount) + pageCount) % pageCount;

    if (this.option("infiniteX", this.option("infinite")) && this.elemDimWidth > this.wrapDimWidth) {
      const nextInterval = Math.floor(pageIndex / pageCount) || 0,
        elemDimWidth = this.elemDimWidth;

      nextPosition = this.pages[page].left + nextInterval * elemDimWidth;

      if (toClosest === true && pageCount > 2) {
        let currPosition = this.Panzoom.current.x * -1;

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

      nextPosition = this.pages[page].left;
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
   * Slides carousel to given page
   * @param {Number} page - New index of active page
   * @param {Object} [params] - Additional options
   */
  slideTo(page, params = {}) {
    const { friction = this.option("friction") } = params;

    this.Panzoom.panTo({ x: this.setPage(page, true) * -1, y: 0, friction });
  }

  /**
   * Slides to the closest page (useful, if carousel is changed manually)
   * @param {Object} [params] - Object containing additional options
   */
  slideToClosest(params = {}) {
    let [, nextPageIndex] = this.getPageFromPosition(this.Panzoom.pan.x * -1);

    this.slideTo(nextPageIndex, params);
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
   *
   * @param {Integer} index Index of the slide
   * @returns {Integer|null} Index of the page if found, or null
   */
  getPageforSlide(index) {
    const page = this.pages.find((page) => {
      return page.indexes.indexOf(index) > -1;
    });

    return page ? page.index : null;
  }

  /**
   * Returns index of closest page to given x position
   * @param {Number} xPos
   */
  getPageFromPosition(xPos) {
    const pageCount = this.pages.length;
    const center = this.option("center");

    if (center) {
      xPos += this.wrapDimWidth * 0.5;
    }

    const interval = Math.floor(xPos / this.elemDimWidth);

    xPos -= interval * this.elemDimWidth;

    let slide = this.slides.find((slide) => slide.left < xPos && slide.left + slide.width > xPos);

    if (slide) {
      let pageIndex = this.getPageforSlide(slide.index);

      return [pageIndex, pageIndex + interval * pageCount];
    }

    return [0, 0];
  }

  /**
   * Removes main DOM element of given slide
   * @param {Object} slide
   */
  removeSlideEl(slide) {
    if (slide.$el && !slide.isDom) {
      this.trigger("deleteSlide", slide);

      slide.$el.remove();
      slide.$el = null;
    }
  }

  destroy() {
    this.state = "destroy";

    this.slides.forEach((slide) => {
      this.removeSlideEl(slide);
    });

    this.Panzoom.destroy();

    this.options = {};
    this.events = {};
  }
}

// Expose version
Carousel.version = "__VERSION__";

// Static properties are a recent addition that dont work in all browsers yet
Carousel.Plugins = Plugins;
