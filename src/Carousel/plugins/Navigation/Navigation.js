const defaults = {
  prevTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>',
  nextTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>',

  classNames: {
    main: "carousel__nav",
    button: "carousel__button",

    next: "is-next",
    prev: "is-prev",
  },
};

export class Navigation {
  constructor(carousel) {
    this.$container = null;

    this.$prev = null;
    this.$next = null;

    this.carousel = carousel;

    this.onRefresh = this.onRefresh.bind(this);
  }

  /**
   * Shortcut to get option for this plugin
   * @param {String} name option name
   * @returns option value
   */
  option(name) {
    return this.carousel.option(`Navigation.${name}`);
  }

  /**
   * Creates and returns new button element with default class names and click event
   * @param {String} type
   */
  createButton(type) {
    const $btn = document.createElement("button");

    $btn.setAttribute("title", this.carousel.localize(`{{${type.toUpperCase()}}}`));

    const classNames = this.option("classNames.button") + " " + this.option(`classNames.${type}`);

    $btn.classList.add(...classNames.split(" "));
    $btn.setAttribute("tabindex", "0");
    $btn.innerHTML = this.carousel.localize(this.option(`${type}Tpl`));

    $btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      this.carousel[`slide${type === "next" ? "Next" : "Prev"}`]();
    });

    return $btn;
  }

  /**
   * Build necessary DOM elements
   */
  build() {
    if (!this.$container) {
      this.$container = document.createElement("div");
      this.$container.classList.add(this.option("classNames.main"));

      this.carousel.$container.appendChild(this.$container);
    }

    if (!this.$next) {
      this.$next = this.createButton("next");

      this.$container.appendChild(this.$next);
    }

    if (!this.$prev) {
      this.$prev = this.createButton("prev");

      this.$container.appendChild(this.$prev);
    }
  }

  /**
   *  Process carousel `refresh` and `change` events to enable/disable buttons if needed
   */
  onRefresh() {
    const pageCount = this.carousel.pages.length;

    if (
      pageCount <= 1 ||
      (pageCount > 1 &&
        this.carousel.elemDimWidth < this.carousel.wrapDimWidth &&
        !Number.isInteger(this.carousel.option("slidesPerPage")))
    ) {
      this.cleanup();

      return;
    }

    this.build();

    this.$prev.removeAttribute("disabled");
    this.$next.removeAttribute("disabled");

    if (this.carousel.option("infiniteX", this.carousel.option("infinite"))) {
      return;
    }

    if (this.carousel.page <= 0) {
      this.$prev.setAttribute("disabled", "");
    }

    if (this.carousel.page >= pageCount - 1) {
      this.$next.setAttribute("disabled", "");
    }
  }

  cleanup() {
    if (this.$prev) {
      this.$prev.remove();
    }

    this.$prev = null;

    if (this.$next) {
      this.$next.remove();
    }

    this.$next = null;

    if (this.$container) {
      this.$container.remove();
    }

    this.$container = null;
  }

  attach() {
    this.carousel.on("refresh change", this.onRefresh);
  }

  detach() {
    this.carousel.off("refresh change", this.onRefresh);

    this.cleanup();
  }
}

// Expose defaults
Navigation.defaults = defaults;
