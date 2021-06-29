import { isPlainObject } from "../../../shared/utils/isPlainObject.js";

const defaults = {
  friction: 0.92,
};

export class Sync {
  constructor(carousel) {
    this.nav = carousel;

    this.selectedIndex = null;

    this.onNavReady = this.onNavReady.bind(this);
    this.onNavClick = this.onNavClick.bind(this);
    this.onNavCreateSlide = this.onNavCreateSlide.bind(this);

    this.onTargetChange = this.onTargetChange.bind(this);
  }

  /**
   * Process main carousel `ready` event; bind events and set initial page
   */
  onNavReady() {
    this.onTargetChange(true);

    this.nav.on("createSlide", this.onNavCreateSlide);
    this.nav.on("Panzoom.updateMetrics", this.onTargetChange);

    this.nav.Panzoom.on("click", this.onNavClick);

    this.sync.on("change", this.onTargetChange);
  }

  /**
   * Process main carousel `createSlide` event
   * @param {Object} carousel
   * @param {Object} slide
   */
  onNavCreateSlide(carousel, slide) {
    if (slide.index === this.selectedIndex) {
      this.markSelectedSlide(slide.index);
    }
  }

  /**
   * Process main carousel `click` event
   * @param {Object} panzoom
   * @param {Object} event
   */
  onNavClick(panzoom, event) {
    const clickedNavSlide = event.target.closest(".carousel__slide");

    if (!clickedNavSlide) {
      return;
    }

    event.preventDefault();

    const selectedNavIndex = parseInt(clickedNavSlide.dataset.index, 10);
    const selectedSyncPage = this.sync.getPageforSlide(selectedNavIndex);

    if (this.sync.page !== selectedSyncPage) {
      this.sync.slideTo(selectedSyncPage, { friction: this.nav.option("Sync.friction") });
    }

    this.markSelectedSlide(selectedNavIndex);
  }

  /**
   * Toggle classname for slides that marks currently selected slides
   * @param {Number} selectedIndex
   */
  markSelectedSlide(selectedIndex) {
    this.selectedIndex = selectedIndex;

    [...this.nav.slides].filter((slide) => slide.$el && slide.$el.classList.remove("is-nav-selected"));

    const slide = this.nav.slides[selectedIndex];

    if (slide && slide.$el) slide.$el.classList.add("is-nav-selected");
  }

  /**
   * Process target carousel `change` event
   * @param {Object} target
   */
  onTargetChange(fast) {
    const targetIndex = this.sync.pages[this.sync.page].indexes[0];
    const selectedNavPage = this.nav.getPageforSlide(targetIndex);

    if (selectedNavPage === null) return;

    this.nav.slideTo(selectedNavPage, fast === true ? { friction: 0 } : {});

    this.markSelectedSlide(targetIndex);
  }

  attach() {
    const sync = this.nav.options.Sync;

    if (!sync) {
      return;
    }

    if (isPlainObject(sync) && typeof sync.with === "object") {
      this.sync = sync.with;
    }

    if (this.sync) {
      this.nav.on("ready", this.onNavReady);
    }
  }

  detach() {
    if (this.sync) {
      this.nav.off("ready", this.onNavReady);
      this.nav.off("createSlide", this.onNavCreate);
      this.nav.on("Panzoom.updateMetrics", this.onTargetChange);

      this.sync.off("change", this.onTargetChange);
    }

    this.nav.Panzoom.off("click", this.onNavClick);

    this.sync = null;
    this.selectedIndex = null;
  }
}

// Expose defaults
Sync.defaults = defaults;
