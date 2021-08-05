import { extend } from "../../../shared/utils/extend.js";
import { Carousel } from "../../../Carousel/Carousel.js";

const defaults = {
  // The minimum number of images in the gallery to display thumbnails
  minSlideCount: 2,

  // Minimum screen height to display thumbnails
  minScreenHeight: 500,

  // Automatically show thumbnails when opened
  autoStart: true,

  // Keyboard shortcut to toggle thumbnail container
  key: "t",
};

export class Thumbs {
  constructor(fancybox) {
    this.fancybox = fancybox;

    this.$container = null;
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
    // Get slides, skip if the total number is less than the minimum
    const slides = this.getSlides();

    if (slides.length < this.fancybox.option("Thumbs.minSlideCount")) {
      this.state = "disabled";
      return;
    }

    if (
      this.fancybox.option("Thumbs.autoStart") === true &&
      this.fancybox.Carousel.Panzoom.content.height >= this.fancybox.option("Thumbs.minScreenHeight")
    ) {
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
    if (this.$container) {
      return;
    }

    // Create wrapping element and append to layout
    const $container = document.createElement("div");

    $container.classList.add("fancybox__thumbs");

    this.fancybox.$container.appendChild($container);

    // Initialise thumbnail carousel with all slides
    this.Carousel = new Carousel(
      $container,
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
            target: this.fancybox.Carousel,
          },
          slides: this.getSlides(),
        }
      )
    );

    // Slide carousel on wheel event
    this.Carousel.Panzoom.on("wheel", (panzoom, event) => {
      event.preventDefault();

      this.fancybox[event.deltaY < 0 ? "prev" : "next"]();
    });

    this.$container = $container;

    this.state = "visible";
  }

  /**
   * Process all fancybox slides to get all thumbnail images
   */
  getSlides() {
    const slides = [];

    for (const slide of this.fancybox.items) {
      const thumb = slide.thumb;

      if (thumb) {
        slides.push({
          html: `<div class="fancybox__thumb" style="background-image:url(${thumb})"></div>`,
          customClass: `has-thumb has-${slide.type || "image"}`,
        });
      }
    }

    return slides;
  }

  /**
   * Toggle visibility of thumbnail list
   * Tip: you can use `Fancybox.getInstance().plugins.Thumbs.toggle()` from anywhere in your code
   */
  toggle() {
    if (this.state === "visible") {
      this.Carousel.Panzoom.detachEvents();

      this.$container.style.display = "none";

      this.state = "hidden";

      return;
    }

    if (this.state === "hidden") {
      this.$container.style.display = "";

      this.Carousel.Panzoom.attachEvents();

      this.state = "visible";

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

    if (this.$container) {
      this.$container.remove();
      this.$container = null;
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
