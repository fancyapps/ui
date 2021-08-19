import { isPlainObject } from "../../../shared/utils/isPlainObject.js";

const defaults = {
  l10n: {
    ZOOMIN: "Zoom in",
    ZOOMOUT: "Zoom out",
  },

  buttons: ["zoomIn", "zoomOut"],
  tpl: {
    zoomIn:
      '<svg tabindex="-1" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V20M20 12L4 12" /></svg>',
    zoomOut:
      '<svg tabindex="-1" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 12H4" /></svg>',
  },
};

export class Controls {
  constructor(panzoom) {
    this.panzoom = panzoom;

    this.$container = null;
  }

  /**
   * Create and append new button to the container
   * @param {String} name - Button name
   * @param {Boolean} withClickEvent - Should add default click handler, it will use `name` as method name
   */
  addButton(name, withClickHandler = false) {
    const $btn = document.createElement("button");

    // Add title from translations
    $btn.setAttribute("title", this.panzoom.localize(`{{CONTROLS.${name.toUpperCase()}}}`));

    $btn.classList.add("panzoom__button");
    $btn.classList.add(`panzoom__button--${name}`);

    $btn.innerHTML = this.panzoom.localize(this.panzoom.option(`Controls.tpl.${name}`, ""));

    if (withClickHandler) {
      $btn.addEventListener("click", (event) => {
        event.stopPropagation();

        this.panzoom[name]();
      });
    }

    this.$container.appendChild($btn);

    return $btn;
  }

  /**
   * Create container with default buttons
   */
  createContainer() {
    if (this.$container || !this.panzoom.option("zoom")) {
      return;
    }

    const $container = document.createElement("div");

    $container.classList.add("panzoom__controls");

    this.$container = this.panzoom.$container.appendChild($container);

    for (const button of this.panzoom.option("Controls.buttons", [])) {
      this.addButton(button, true);
    }
  }

  /**
   * Clean up container
   */
  removeContainer() {
    if (this.$container) {
      this.$container.remove();
      this.$container = null;
    }
  }

  attach() {
    this.createContainer();
  }

  detach() {
    this.removeContainer();
  }
}

// Expose defaults
Controls.defaults = defaults;

if (typeof Panzoom !== "undefined" && isPlainObject(Panzoom.Plugins)) {
  Panzoom.Plugins.Controls = Controls;
}
