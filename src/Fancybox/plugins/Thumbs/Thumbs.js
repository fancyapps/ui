import { extend } from "../../../shared/utils/extend.js";
import { Carousel } from "../../../Carousel/Carousel.js";

const defaults = {
  // Automatically show thumbnails when opened
  autoStart: true,
  // The minimum number of images in the gallery to display thumbnails
  minSlideCount: 3,
  // Keyboard shortcut to toggle thumbnail container
  key: "t",
};

export class Thumbs {
  constructor(fancybox) {
    this.fancybox = fancybox;

    this.$wrap = null;
    this.state = "init";

    for (const methodName of ["onReady", "onClosing", "onKeydown"]) {
      this[methodName] = this[methodName].bind(this);
    }

    this.events = {
      ready: this.onReady,
      closing: this.onClosing,
      keydown: this.onKeydown,
    };
  }

  /**
   * Process `ready` event to build the layout
   */
  onReady() {
    if (this.fancybox.option("Thumbs.autoStart") === true) {
      this.initLayout();
    }
  }

  /**
   * Process `closing` event to disable all events
   */
  onClosing() {
    if (this.Carousel) {
      this.Carousel.Panzoom.detachEvents();
    }
  }

  /**
   * Process `keydown` event to enable thumbnail list toggling using keyboard key
   * @param {Object} fancybox
   * @param {String} key
   */
  onKeydown(fancybox, key) {
    if (key === fancybox.option("Thumbs.key")) {
      this.toggle();
    }
  }

  /**
   * Build layout and init thumbnail Carousel
   */
  initLayout() {
    if (this.state !== "init") {
      return;
    }

    // Get slides, skip if the total number is less than the minimum
    const slides = this.getSlides();

    if (slides.length < this.fancybox.option("Thumbs.minSlideCount")) {
      return false;
    }

    // Create wrapping element and append to layout
    const $wrap = document.createElement("div");

    $wrap.classList.add(`fancybox__thumbs`);

    this.fancybox.$container.appendChild($wrap);

    // Initialise thumbnail carousel with all slides
    this.Carousel = new Carousel(
      $wrap,
      extend(
        true,
        {
          Dots: false,
          Navigation: false,
          Sync: {
            friction: 0,
          },
          infinite: false,
          center: true,
          fill: true,
          dragFree: true,
          slidesPerPage: 1,
          preload: 1,
        },
        this.fancybox.option("Thumbs.Carousel"),
        {
          Sync: {
            with: this.fancybox.Carousel,
          },
          slides: slides,
        }
      )
    );

    // Slide carousel on wheel event
    this.Carousel.Panzoom.on("wheel", (panzoom, event) => {
      event.preventDefault();

      this.fancybox[event.deltaY < 0 ? "prev" : "next"]();
    });

    this.$wrap = $wrap;
    this.state = "ready";
  }

  /**
   * Process all fancybox slides to get all thumbnail images
   */
  getSlides() {
    const slides = [];

    this.fancybox.items.forEach((slide) => {
      const thumb = slide.thumb;

      if (thumb) {
        slides.push({
          html: `<div class="fancybox__thumb" style="background-image:url(${thumb})"></div>`,
          customClass: `has-thumb has-${slide.type || "image"}`,
        });
      }
    });

    return slides;
  }

  /**
   * Toggle visibility of thumbnail list
   * Tip: you can use `Fancybox.getInstance().plugins.Thumbs.toggle()` from anywhere in your code
   */
  toggle() {
    if (this.state === "ready") {
      this.Carousel.Panzoom.detachEvents();

      this.$wrap.style.display = "none";

      this.state = "hidden";

      return;
    }

    if (this.state === "hidden") {
      this.$wrap.style.display = "";

      this.Carousel.Panzoom.attachEvents();

      this.state = "ready";

      return;
    }

    this.initLayout();
  }

  /**
   * Reset the state
   */
  cleanup() {
    if (this.Carousel) {
      this.Carousel.destroy();
      this.Carousel = null;
    }

    if (this.$wrap) {
      this.$wrap.remove();
      this.$wrap = null;
    }

    this.state = "init";
  }

  attach() {
    this.fancybox.on(this.events);
  }

  detach() {
    this.fancybox.off(this.events);

    this.cleanup();
  }
}

// Expose defaults
Thumbs.defaults = defaults;
