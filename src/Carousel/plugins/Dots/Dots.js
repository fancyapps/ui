const defaults = {
  // The minimum number of slides to display dots
  minSlideCount: 2,
};

export class Dots {
  constructor(carousel) {
    this.carousel = carousel;

    this.$list = null;

    this.events = {
      change: this.onChange.bind(this),
      refresh: this.onRefresh.bind(this),
    };
  }

  /**
   * Build wrapping DOM element containing all dots
   */
  buildList() {
    if (this.carousel.pages.length < this.carousel.option("Dots.minSlideCount")) {
      return;
    }

    const $list = document.createElement("ol");

    $list.classList.add("carousel__dots");

    $list.addEventListener("click", (e) => {
      if (!("page" in e.target.dataset)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const page = parseInt(e.target.dataset.page, 10);
      const carousel = this.carousel;

      if (page === carousel.page) {
        return;
      }

      if (carousel.pages.length < 3 && carousel.option("infinite")) {
        carousel[page == 0 ? "slidePrev" : "slideNext"]();
      } else {
        carousel.slideTo(page);
      }
    });

    this.$list = $list;

    this.carousel.$container.appendChild($list);
    this.carousel.$container.classList.add("has-dots");

    return $list;
  }

  /**
   * Remove wrapping DOM element
   */
  removeList() {
    if (this.$list) {
      this.$list.parentNode.removeChild(this.$list);
      this.$list = null;
    }

    this.carousel.$container.classList.remove("has-dots");
  }

  /**
   * Remove existing dots and create fresh ones
   */
  rebuildDots() {
    let $list = this.$list;

    const listExists = !!$list;
    const pagesCount = this.carousel.pages.length;

    if (pagesCount < 2) {
      if (listExists) {
        this.removeList();
      }

      return;
    }

    if (!listExists) {
      $list = this.buildList();
    }

    // Remove existing dots
    const dotCount = this.$list.children.length;

    if (dotCount > pagesCount) {
      for (let i = pagesCount; i < dotCount; i++) {
        this.$list.removeChild(this.$list.lastChild);
      }

      return;
    }

    // Create fresh DOM elements (dots) for each page
    for (let index = dotCount; index < pagesCount; index++) {
      const $dot = document.createElement("li");

      $dot.classList.add("carousel__dot");
      $dot.dataset.page = index;

      $dot.setAttribute("role", "button");
      $dot.setAttribute("tabindex", "0");
      $dot.setAttribute("title", this.carousel.localize("{{GOTO}}", [["%d", index + 1]]));

      $dot.addEventListener("keydown", (event) => {
        const code = event.code;

        let $el;

        if (code === "Enter" || code === "NumpadEnter") {
          $el = $dot;
        } else if (code === "ArrowRight") {
          $el = $dot.nextSibling;
        } else if (code === "ArrowLeft") {
          $el = $dot.previousSibling;
        }

        $el && $el.click();
      });

      this.$list.appendChild($dot);
    }

    this.setActiveDot();
  }

  /**
   * Mark active dot by toggling class name
   */
  setActiveDot() {
    if (!this.$list) {
      return;
    }

    this.$list.childNodes.forEach(($dot) => {
      $dot.classList.remove("is-selected");
    });

    const $activeDot = this.$list.childNodes[this.carousel.page];

    if ($activeDot) {
      $activeDot.classList.add("is-selected");
    }
  }

  /**
   * Process carousel `change` event
   */
  onChange() {
    this.setActiveDot();
  }

  /**
   * Process carousel `refresh` event
   */
  onRefresh() {
    this.rebuildDots();
  }

  attach() {
    this.carousel.on(this.events);
  }

  detach() {
    this.removeList();

    this.carousel.off(this.events);
    this.carousel = null;
  }
}
