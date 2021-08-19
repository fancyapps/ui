import { isPlainObject } from "../../../shared/utils/isPlainObject.js";

const defaults = {
  timeout: 3000,
  hoverPause: true,
};

export class Autoplay {
  constructor(carousel) {
    this.carousel = carousel;
    this.state = "ready";

    for (const methodName of ["onReady", "onSettle", "onMouseEnter", "onMouseLeave"]) {
      this[methodName] = this[methodName].bind(this);
    }

    this.events = {
      ready: this.onReady,
      settle: this.onSettle,
    };
  }

  onReady() {
    this.start();
  }

  onSettle() {
    if (this.state === "play") {
      this.set();
    }
  }

  onMouseEnter() {
    if (this.state === "play") {
      this.state = "pause";
      this.clear();
    }
  }

  onMouseLeave() {
    if (this.state === "pause") {
      this.state = "play";
      this.set();
    }
  }

  set() {
    this.clear();

    this.timer = setTimeout(() => {
      if (this.state === "play") {
        this.carousel.slideTo(this.carousel.pageIndex + 1);
      }
    }, this.carousel.option("Autoplay.timeout"));
  }

  clear() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  start() {
    this.set();
    this.state = "play";

    if (this.carousel.option("Autoplay.hoverPause")) {
      this.carousel.$container.addEventListener("mouseenter", this.onMouseEnter, false);
      this.carousel.$container.addEventListener("mouseleave", this.onMouseLeave, false);
    }
  }

  stop() {
    this.clear();
    this.state = "ready";

    this.carousel.$container.removeEventListener("mouseenter", this.onMouseEnter, false);
    this.carousel.$container.removeEventListener("mouseleave", this.onMouseLeave, false);
  }

  attach() {
    this.carousel.on(this.events);
  }

  detach() {
    this.stop();

    this.carousel.off(this.events);
    this.carousel = null;
  }
}

// Expose defaults
Autoplay.defaults = defaults;

if (typeof Carousel !== "undefined" && isPlainObject(Carousel.Plugins)) {
  Carousel.Plugins.Autoplay = Autoplay;
}
