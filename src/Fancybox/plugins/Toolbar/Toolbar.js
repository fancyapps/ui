import { isPlainObject } from "../../../shared/utils/isPlainObject.js";
import { extend } from "../../../shared/utils/extend.js";

import { Fullscreen } from "../../../shared/utils/Fullscreen.js";
import { Slideshow } from "../../../shared/utils/Slideshow.js";

const defaults = {
  // What toolbar items to display
  display: [
    "counter",
    //"prev",
    //"next",
    //"download",
    "zoom",
    "slideshow",
    "fullscreen",
    "thumbs",
    "close",
  ],

  // Only create a toolbar item if there is at least one image in the group
  autoEnable: true,

  // Toolbar items; can be links, buttons or `div` elements
  items: {
    counter: {
      position: "left",
      type: "div",
      class: "fancybox__counter",
      html: '<span data-fancybox-index=""></span>&nbsp;/&nbsp;<span data-fancybox-count=""></span>',
      attr: { tabindex: -1 },
    },
    prev: {
      type: "button",
      class: "fancybox__button--prev",
      label: "PREV",
      html: '<svg viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8"/></svg>',
      attr: { "data-fancybox-prev": "" },
    },
    next: {
      type: "button",
      class: "fancybox__button--next",
      label: "NEXT",
      html: '<svg viewBox="0 0 24 24"><path d="M8 4l8 8-8 8"/></svg>',
      attr: { "data-fancybox-next": "" },
    },
    fullscreen: {
      type: "button",
      class: "fancybox__button--fullscreen",
      label: "TOGGLE_FULLSCREEN",
      html: `<svg viewBox="0 0 24 24">
                <g><path d="M3 8 V3h5"></path><path d="M21 8V3h-5"></path><path d="M8 21H3v-5"></path><path d="M16 21h5v-5"></path></g>
                <g><path d="M7 2v5H2M17 2v5h5M2 17h5v5M22 17h-5v5"/></g>
            </svg>`,
      click: function (event) {
        event.preventDefault();

        if (Fullscreen.element()) {
          Fullscreen.deactivate();
        } else {
          Fullscreen.activate(this.fancybox.$container);
        }
      },
    },
    slideshow: {
      type: "button",
      class: "fancybox__button--slideshow",
      label: "TOGGLE_SLIDESHOW",
      html: `<svg viewBox="0 0 24 24">
                <g><path d="M6 4v16"/><path d="M20 12L6 20"/><path d="M20 12L6 4"/></g>
                <g><path d="M7 4v15M17 4v15"/></g>
            </svg>`,
      click: function (event) {
        event.preventDefault();

        this.Slideshow.toggle();
      },
    },
    zoom: {
      type: "button",
      class: "fancybox__button--zoom",
      label: "TOGGLE_ZOOM",
      html: '<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"></circle><path d="M16 16 L21 21"></svg>',
      click: function (event) {
        event.preventDefault();

        const panzoom = this.fancybox.getSlide().Panzoom;

        if (panzoom) {
          panzoom.toggleZoom();
        }
      },
    },
    download: {
      type: "link",
      label: "DOWNLOAD",
      class: "fancybox__button--download",
      html: '<svg viewBox="0 0 24 24"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.62 2.48A2 2 0 004.56 21h14.88a2 2 0 001.94-1.51L22 17"/></svg>',
      click: function (event) {
        event.stopPropagation();
      },
    },
    thumbs: {
      type: "button",
      label: "TOGGLE_THUMBS",
      class: "fancybox__button--thumbs",
      html: '<svg viewBox="0 0 24 24"><circle cx="4" cy="4" r="1" /><circle cx="12" cy="4" r="1" transform="rotate(90 12 4)"/><circle cx="20" cy="4" r="1" transform="rotate(90 20 4)"/><circle cx="4" cy="12" r="1" transform="rotate(90 4 12)"/><circle cx="12" cy="12" r="1" transform="rotate(90 12 12)"/><circle cx="20" cy="12" r="1" transform="rotate(90 20 12)"/><circle cx="4" cy="20" r="1" transform="rotate(90 4 20)"/><circle cx="12" cy="20" r="1" transform="rotate(90 12 20)"/><circle cx="20" cy="20" r="1" transform="rotate(90 20 20)"/></svg>',
      click: function (event) {
        event.stopPropagation();

        const thumbs = this.fancybox.plugins.Thumbs;

        if (thumbs) {
          thumbs.toggle();
        }
      },
    },
    close: {
      type: "button",
      label: "CLOSE",
      class: "fancybox__button--close",
      html: '<svg viewBox="0 0 24 24"><path d="M20 20L4 4m16 0L4 20"></path></svg>',
      attr: { "data-fancybox-close": "", tabindex: 0 },
    },
  },
};

export class Toolbar {
  constructor(fancybox) {
    this.fancybox = fancybox;

    this.$container = null;
    this.state = "init";

    for (const methodName of [
      "onInit",
      "onPrepare",
      "onDone",
      "onKeydown",
      "onClosing",
      "onChange",
      "onSettle",
      "onRefresh",
    ]) {
      this[methodName] = this[methodName].bind(this);
    }

    this.events = {
      init: this.onInit,
      prepare: this.onPrepare,
      done: this.onDone,
      keydown: this.onKeydown,
      closing: this.onClosing,

      // Clear Slideshow when user strts to change current slide
      "Carousel.change": this.onChange,

      // Set timer after carousel changes current slide; deactive if last slide is reached
      "Carousel.settle": this.onSettle,

      // Deactivate Slideshow on user interaction
      "Carousel.Panzoom.touchStart": () => this.onRefresh(),

      "Image.startAnimation": (fancybox, slide) => this.onRefresh(slide),
      "Image.afterUpdate": (fancybox, slide) => this.onRefresh(slide),
    };
  }

  onInit() {
    // Disable self if current group does not contain at least one image
    if (this.fancybox.option("Toolbar.autoEnable")) {
      let hasImage = false;

      for (const item of this.fancybox.items) {
        if (item.type === "image") {
          hasImage = true;
          break;
        }
      }

      if (!hasImage) {
        this.state = "disabled";
        return;
      }
    }

    // Disable the creation of a close button, if one exists in the toolbar
    for (const key of this.fancybox.option("Toolbar.display")) {
      const id = isPlainObject(key) ? key.id : key;

      if (id === "close") {
        this.fancybox.options.closeButton = false;

        break;
      }
    }
  }

  onPrepare() {
    const fancybox = this.fancybox;
    // Skip if disabled
    if (this.state !== "init") {
      return;
    }

    this.build();

    this.update();

    this.Slideshow = new Slideshow(fancybox);

    if (!fancybox.Carousel.prevPage) {
      if (fancybox.option("slideshow.autoStart")) {
        this.Slideshow.activate();
      }

      if (fancybox.option("fullscreen.autoStart") && !Fullscreen.element()) {
        try {
          Fullscreen.activate(fancybox.$container);
        } catch (error) {}
      }
    }
  }

  onFsChange() {
    window.scrollTo(Fullscreen.pageXOffset, Fullscreen.pageYOffset);
  }

  onSettle() {
    const fancybox = this.fancybox;
    const slideshow = this.Slideshow;

    if (slideshow && slideshow.isActive()) {
      if (fancybox.getSlide().index === fancybox.Carousel.slides.length - 1 && !fancybox.option("infinite")) {
        slideshow.deactivate();
      } else if (fancybox.getSlide().state === "done") {
        slideshow.setTimer();
      }
    }
  }

  onChange() {
    this.update();

    if (this.Slideshow && this.Slideshow.isActive()) {
      this.Slideshow.clearTimer();
    }
  }

  onDone(fancybox, slide) {
    const slideshow = this.Slideshow;

    if (slide.index === fancybox.getSlide().index) {
      this.update();

      if (slideshow && slideshow.isActive()) {
        if (!fancybox.option("infinite") && slide.index === fancybox.Carousel.slides.length - 1) {
          slideshow.deactivate();
        } else {
          slideshow.setTimer();
        }
      }
    }
  }

  onRefresh(slide) {
    if (!slide || slide.index === this.fancybox.getSlide().index) {
      this.update();

      if (this.Slideshow && this.Slideshow.isActive() && (!slide || slide.state === "done")) {
        this.Slideshow.deactivate();
      }
    }
  }

  onKeydown(fancybox, key, event) {
    if (key === " " && this.Slideshow) {
      this.Slideshow.toggle();

      event.preventDefault();
    }
  }

  onClosing() {
    if (this.Slideshow) {
      this.Slideshow.deactivate();
    }

    document.removeEventListener("fullscreenchange", this.onFsChange);
  }

  /**
   * Create link, button or `div` element for the toolbar
   * @param {Object} obj
   * @returns HTMLElement
   */
  createElement(obj) {
    let $el;

    if (obj.type === "div") {
      $el = document.createElement("div");
    } else {
      $el = document.createElement(obj.type === "link" ? "a" : "button");
      $el.classList.add("carousel__button");
    }

    $el.innerHTML = obj.html;

    $el.setAttribute("tabindex", obj.tabindex || 0);

    if (obj.class) {
      $el.classList.add(...obj.class.split(" "));
    }

    for (const prop in obj.attr) {
      $el.setAttribute(prop, obj.attr[prop]);
    }

    if (obj.label) {
      $el.setAttribute("title", this.fancybox.localize(`{{${obj.label}}}`));
    }

    if (obj.click) {
      $el.addEventListener("click", obj.click.bind(this));
    }

    if (obj.id === "prev") {
      $el.setAttribute("data-fancybox-prev", "");
    }

    if (obj.id === "next") {
      $el.setAttribute("data-fancybox-next", "");
    }

    const $svg = $el.querySelector("svg");

    if ($svg) {
      $svg.setAttribute("role", "img");
      $svg.setAttribute("tabindex", "-1");
      $svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    return $el;
  }

  /**
   * Create all DOM elements
   */
  build() {
    this.cleanup();

    const all_items = this.fancybox.option("Toolbar.items");
    const all_groups = [
      {
        position: "left",
        items: [],
      },
      {
        position: "center",
        items: [],
      },
      {
        position: "right",
        items: [],
      },
    ];

    const thumbs = this.fancybox.plugins.Thumbs;

    // 1st step - group toolbar elements by position
    for (const key of this.fancybox.option("Toolbar.display")) {
      let id, item;

      if (isPlainObject(key)) {
        id = key.id;
        item = extend({}, all_items[id], key);
      } else {
        id = key;
        item = all_items[id];
      }

      if (["counter", "next", "prev", "slideshow"].includes(id) && this.fancybox.items.length < 2) {
        continue;
      }

      if (id === "fullscreen") {
        if (!document.fullscreenEnabled || window.fullScreen) {
          continue;
        }

        document.addEventListener("fullscreenchange", this.onFsChange);
      }

      if (id === "thumbs" && (!thumbs || thumbs.state === "disabled")) {
        continue;
      }

      if (!item) {
        continue;
      }

      let position = item.position || "right";

      let group = all_groups.find((obj) => obj.position === position);

      if (group) {
        group.items.push(item);
      }
    }

    // 2st step - create DOM elements
    const $container = document.createElement("div");
    $container.classList.add("fancybox__toolbar");

    for (const group of all_groups) {
      if (group.items.length) {
        const $wrap = document.createElement("div");
        $wrap.classList.add("fancybox__toolbar__items");
        $wrap.classList.add(`fancybox__toolbar__items--${group.position}`);

        for (const obj of group.items) {
          $wrap.appendChild(this.createElement(obj));
        }

        $container.appendChild($wrap);
      }
    }

    // Add toolbar container to DOM
    this.fancybox.$carousel.parentNode.insertBefore($container, this.fancybox.$carousel);

    this.$container = $container;
  }

  /**
   * Update element state depending on index of current slide
   */
  update() {
    const slide = this.fancybox.getSlide();
    const idx = slide.index;
    const cnt = this.fancybox.items.length;

    // Download links
    // ====
    const src = slide.downloadSrc || (slide.type === "image" && !slide.error ? slide.src : null);

    for (const $el of this.fancybox.$container.querySelectorAll("a.fancybox__button--download")) {
      if (src) {
        $el.removeAttribute("disabled");
        $el.removeAttribute("tabindex");

        $el.setAttribute("href", src);
        $el.setAttribute("download", src);
        $el.setAttribute("target", "_blank");
      } else {
        $el.setAttribute("disabled", "");
        $el.setAttribute("tabindex", -1);

        $el.removeAttribute("href");
        $el.removeAttribute("download");
      }
    }

    // Zoom button
    // ===
    const panzoom = slide.Panzoom;
    const canZoom = panzoom && panzoom.option("maxScale") > panzoom.option("baseScale");

    for (const $el of this.fancybox.$container.querySelectorAll(".fancybox__button--zoom")) {
      if (canZoom) {
        $el.removeAttribute("disabled");
      } else {
        $el.setAttribute("disabled", "");
      }
    }

    // Counter
    // ====
    for (const $el of this.fancybox.$container.querySelectorAll("[data-fancybox-index]")) {
      $el.innerHTML = slide.index + 1;
    }

    for (const $el of this.fancybox.$container.querySelectorAll("[data-fancybox-count]")) {
      $el.innerHTML = cnt;
    }

    // Disable previous/next links if gallery is not infinite and has reached start/end
    // ===
    if (!this.fancybox.option("infinite")) {
      for (const $el of this.fancybox.$container.querySelectorAll("[data-fancybox-prev]")) {
        if (idx === 0) {
          $el.setAttribute("disabled", "");
        } else {
          $el.removeAttribute("disabled");
        }
      }

      for (const $el of this.fancybox.$container.querySelectorAll("[data-fancybox-next]")) {
        if (idx === cnt - 1) {
          $el.setAttribute("disabled", "");
        } else {
          $el.removeAttribute("disabled");
        }
      }
    }
  }

  cleanup() {
    if (this.Slideshow && this.Slideshow.isActive()) {
      this.Slideshow.clearTimer();
    }

    if (this.$container) {
      this.$container.remove();
    }

    this.$container = null;
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
Toolbar.defaults = defaults;
