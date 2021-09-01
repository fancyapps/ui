import { canUseDOM } from "../../../shared/utils/canUseDOM.js";

/**
 * Helper method to split URL hash into useful pieces
 */
const getParsedURL = function () {
  const hash = window.location.hash.substr(1),
    tmp = hash.split("-"),
    index = tmp.length > 1 && /^\+?\d+$/.test(tmp[tmp.length - 1]) ? parseInt(tmp.pop(-1), 10) || null : null,
    slug = tmp.join("-");

  return {
    hash,
    slug,
    index,
  };
};

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
  onChange() {
    const fancybox = this.fancybox;
    const carousel = fancybox.Carousel;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    const firstRun = carousel.prevPage === null;

    const slide = fancybox.getSlide();

    const dataset = slide.$trigger && slide.$trigger.dataset;

    const currentHash = window.location.hash.substr(1);

    let newHash = false;

    if (slide.slug) {
      newHash = slide.slug;
    } else {
      let dataAttribute = dataset && dataset.fancybox;

      if (dataAttribute && dataAttribute.length && dataAttribute !== "true") {
        newHash = dataAttribute + (carousel.slides.length > 1 ? "-" + (slide.index + 1) : "");
      }
    }

    if (firstRun) {
      this.origHash = currentHash !== newHash ? this.origHash : "";
    }

    if (newHash && currentHash !== newHash) {
      this.timer = setTimeout(() => {
        try {
          window.history[firstRun ? "pushState" : "replaceState"](
            {},
            document.title,
            window.location.pathname + window.location.search + "#" + newHash
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

    // Simply make browser to move back one page in the session history,
    // if new history entry is successfully created
    if (!this.hasCreatedHistory) {
      try {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search + (this.origHash ? "#" + this.origHash : "")
        );

        return;
      } catch (e) {}
    }

    window.history.back();
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
    if (!Hash.Fancybox || Hash.Fancybox.getInstance()) {
      return;
    }

    const { hash, slug, index } = getParsedURL();

    if (!slug) {
      return;
    }

    // Support custom slug
    // ===
    let selectedElem = document.querySelector(`[data-slug="${hash}"]`);

    if (selectedElem) {
      selectedElem.dispatchEvent(new CustomEvent("click", { bubbles: true, cancelable: true }));
    }

    if (Hash.Fancybox.getInstance()) {
      return;
    }

    // If elements are not found by custom slug, Use URL hash value as group name
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
    const { slug, index } = getParsedURL();

    const instance = Hash.Fancybox.getInstance();

    if (instance) {
      // Look if this is inside currently active gallery
      if (slug) {
        const carousel = instance.Carousel;
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
}
