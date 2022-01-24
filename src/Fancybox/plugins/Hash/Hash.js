import { canUseDOM } from "../../../shared/utils/canUseDOM.js";

export class Hash {
  constructor(fancybox) {
    this.fancybox = fancybox;

    for (const methodName of ["onChange", "onClosing"]) {
      this[methodName] = this[methodName].bind(this);
    }

    this.events = {
      initCarousel: this.onChange,
      "Carousel.change": this.onChange,
      closing: this.onClosing,
    };

    this.hasCreatedHistory = false;
    this.origHash = "";
    this.timer = null;
  }

  /**
   * Process `Carousel.ready` and `Carousel.change` events to update URL hash
   * @param {Object} fancybox
   * @param {Object} carousel
   */
  onChange(fancybox) {
    const carousel = fancybox.Carousel;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    const firstRun = carousel.prevPage === null;
    const currentSlide = fancybox.getSlide();

    const currentHash = new URL(document.URL).hash;

    let newHash = false;

    if (currentSlide.slug) {
      newHash = "#" + currentSlide.slug;
    } else {
      const dataset = currentSlide.$trigger && currentSlide.$trigger.dataset;
      const slug = fancybox.option("slug") || (dataset && dataset.fancybox);

      if (slug && slug.length && slug !== "true") {
        newHash = "#" + slug + (carousel.slides.length > 1 ? "-" + (currentSlide.index + 1) : "");
      }
    }

    if (firstRun) {
      this.origHash = currentHash !== newHash ? currentHash : "";
    }

    if (newHash && currentHash !== newHash) {
      this.timer = setTimeout(() => {
        try {
          window.history[firstRun ? "pushState" : "replaceState"](
            {},
            document.title,
            window.location.pathname + window.location.search + newHash
          );

          if (firstRun) {
            this.hasCreatedHistory = true;
          }
        } catch (e) {}
      }, 300);
    }
  }

  /**
   * Process `closing` event to clean up
   */
  onClosing() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Skip if closing is triggered by pressing  browser back button or by changing hash manually
    if (this.hasSilentClose === true) {
      return;
    }

    // Restore original url
    try {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search + (this.origHash || "")
      );

      return;
    } catch (e) {}
  }

  attach(fancybox) {
    fancybox.on(this.events);
  }

  detach(fancybox) {
    fancybox.off(this.events);
  }

  /**
   * Start fancybox from current URL hash,
   * this will be called on page load OR/AND after changing URL hash
   * @param {Class} Fancybox
   */
  static startFromUrl() {
    const Fancybox = Hash.Fancybox;

    if (!Fancybox || Fancybox.getInstance() || Fancybox.defaults.Hash === false) {
      return;
    }

    const { hash, slug, index } = Hash.getParsedURL();

    if (!slug) {
      return;
    }

    // Support custom slug
    // ===
    let selectedElem = document.querySelector(`[data-slug="${hash}"]`);

    if (selectedElem) {
      selectedElem.dispatchEvent(new CustomEvent("click", { bubbles: true, cancelable: true }));
    }

    if (Fancybox.getInstance()) {
      return;
    }

    // If elements are not found by custom slug, use URL hash value as group name
    // ===
    const groupElems = document.querySelectorAll(`[data-fancybox="${slug}"]`);

    if (!groupElems.length) {
      return;
    }

    if (index === null && groupElems.length === 1) {
      selectedElem = groupElems[0];
    } else if (index) {
      selectedElem = groupElems[index - 1];
    }

    if (selectedElem) {
      selectedElem.dispatchEvent(new CustomEvent("click", { bubbles: true, cancelable: true }));
    }
  }

  /**
   * Handle `hash` change, change gallery item to current index or start/close current instance
   */
  static onHashChange() {
    const { slug, index } = Hash.getParsedURL();

    const Fancybox = Hash.Fancybox;
    const instance = Fancybox && Fancybox.getInstance();

    if (instance && instance.plugins.Hash) {
      // Check if hash matches currently active gallery
      if (slug) {
        const carousel = instance.Carousel;

        /**
         * Support manually opened gallery
         */
        if (slug === instance.option("slug")) {
          return carousel.slideTo(index - 1);
        }

        /**
         * Check if URL hash matches `data-slug` value of active element
         */
        for (let slide of carousel.slides) {
          if (slide.slug && slide.slug === slug) {
            return carousel.slideTo(slide.index);
          }
        }

        /**
         * Check if URL hash matches `data-fancybox` value of active element
         */
        const slide = instance.getSlide();
        const dataset = slide.$trigger && slide.$trigger.dataset;

        if (dataset && dataset.fancybox === slug) {
          return carousel.slideTo(index - 1);
        }
      }

      /**
       * Close if no matching element found
       */
      instance.plugins.Hash.hasSilentClose = true;

      instance.close();
    }

    /**
     * Attempt to start
     */
    Hash.startFromUrl();
  }

  /**
   * Add event bindings that will start new Fancybox instance based in the current URL
   */
  static create(Fancybox) {
    Hash.Fancybox = Fancybox;

    function proceed() {
      window.addEventListener("hashchange", Hash.onHashChange, false);

      Hash.startFromUrl();
    }

    if (canUseDOM) {
      window.requestAnimationFrame(() => {
        if (/complete|interactive|loaded/.test(document.readyState)) {
          proceed();
        } else {
          document.addEventListener("DOMContentLoaded", proceed);
        }
      });
    }
  }

  static destroy() {
    window.removeEventListener("hashchange", Hash.onHashChange, false);
  }

  /**
   * Helper method to split URL hash into useful pieces
   */
  static getParsedURL() {
    const hash = window.location.hash.substr(1),
      tmp = hash.split("-"),
      index = tmp.length > 1 && /^\+?\d+$/.test(tmp[tmp.length - 1]) ? parseInt(tmp.pop(-1), 10) || null : null,
      slug = tmp.join("-");

    return {
      hash,
      slug,
      index,
    };
  }
}
