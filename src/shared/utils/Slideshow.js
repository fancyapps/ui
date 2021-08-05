export class Slideshow {
  constructor(fancybox) {
    this.fancybox = fancybox;
    this.active = false;

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  isActive() {
    return this.active;
  }

  setTimer() {
    if (!this.active || this.timer) {
      return;
    }

    const delay = this.fancybox.option("slideshow.delay", 3000);

    this.timer = setTimeout(() => {
      this.timer = null;

      if (
        !this.fancybox.option("infinite") &&
        this.fancybox.getSlide().index === this.fancybox.Carousel.slides.length - 1
      ) {
        this.fancybox.jumpTo(0, { friction: 0 });
      } else {
        this.fancybox.next();
      }
    }, delay);

    let $progress = this.$progress;

    if (!$progress) {
      $progress = document.createElement("div");
      $progress.classList.add("fancybox__progress");

      this.fancybox.$carousel.parentNode.insertBefore($progress, this.fancybox.$carousel);

      this.$progress = $progress;

      $progress.offsetHeight; /* trigger reflow */
    }

    $progress.style.transitionDuration = `${delay}ms`;
    $progress.style.transform = "scaleX(1)";
  }

  clearTimer() {
    clearTimeout(this.timer);
    this.timer = null;

    if (this.$progress) {
      this.$progress.style.transitionDuration = "";
      this.$progress.style.transform = "";

      this.$progress.offsetHeight; /* trigger reflow */
    }
  }

  activate() {
    if (this.active) {
      return;
    }

    this.active = true;
    this.fancybox.$container.classList.add("has-slideshow");

    if (this.fancybox.getSlide().state === "done") {
      this.setTimer();
    }

    document.addEventListener("visibilitychange", this.handleVisibilityChange, false);
  }

  handleVisibilityChange() {
    this.deactivate();
  }

  deactivate() {
    this.active = false;

    this.clearTimer();

    this.fancybox.$container.classList.remove("has-slideshow");

    document.removeEventListener("visibilitychange", this.handleVisibilityChange, false);
  }

  toggle() {
    if (this.active) {
      this.deactivate();
    } else if (this.fancybox.Carousel.slides.length > 1) {
      this.activate();
    }
  }
}
