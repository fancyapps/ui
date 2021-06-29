import { extend } from "../../../shared/utils/extend.js";

import { Panzoom } from "../../../Panzoom/Panzoom.js";

const defaults = {
  // Options for Panzoom instance
  Panzoom: {
    maxScale: 1,
  },

  // Class name for slide element indicating that content can be zoomed in
  canZoomInClass: "can-zoom_in",

  // Class name for slide element indicating that content can be zoomed out
  canZoomOutClass: "can-zoom_out",

  // Do zoom animation from thumbnail image when starting or closing fancybox
  zoom: true,

  // Animate opacity while zooming
  zoomOpacity: "auto", // "auto" | true | false,

  // Zoom animation friction
  zoomFriction: 0.8,

  // Disable zoom animation if thumbnail is visible only partly
  ignoreCoveredThumbnail: false,

  // Action to be performed when user clicks on the image
  click: "toggleZoom", // "toggleZoom" | "next" | "close" | null

  // Action to be performed when double-click event is detected on the image
  doubleClick: null, // "toggleZoom" | null

  // Action to be performed when user rotates a wheel button on a pointing device
  wheel: "zoom", // "zoom" | "slide" | "close" | null

  // How image should be resized to fit its container
  fit: "contain", // "contain" | "contain-w" | "cover"
};

/**
 * Helper method to get actual image dimensions respecting original aspect ratio,
 * this helps to normalise differences across browsers
 * @param {Object} img
 */
const getImgSizeInfo = function (img) {
  const width = img.naturalWidth,
    height = img.naturalHeight,
    cWidth = img.width,
    cHeight = img.height,
    oRatio = width / height,
    cRatio = cWidth / cHeight,
    rez = {
      width: cWidth,
      height: cHeight,
    };

  if (oRatio > cRatio) {
    rez.height = cWidth / oRatio;
  } else {
    rez.width = cHeight * oRatio;
  }

  rez.left = (cWidth - rez.width) * 0.5;
  rez.right = width + rez.left;

  return rez;
};

export class Image {
  constructor(fancybox) {
    this.fancybox = fancybox;

    for (const methodName of [
      // Fancybox
      "onReady",
      "onClosing",

      // Fancybox.Carousel
      "onPageChange",
      "onCreateSlide",
      "onRemoveSlide",
      "onRefresh",

      // Image load/error
      "onImageStatusChange",
    ]) {
      this[methodName] = this[methodName].bind(this);
    }

    this.events = {
      ready: this.onReady,
      closing: this.onClosing,

      "Carousel.change": this.onPageChange,
      "Carousel.createSlide": this.onCreateSlide,
      "Carousel.deleteSlide": this.onRemoveSlide,
      "Carousel.Panzoom.updateMetrics": this.onRefresh,
    };
  }

  /**
   * Process `ready` event to start zoom-in animation if needed
   */
  onReady() {
    const slide = this.fancybox.getSlide();

    if (slide.state === "ready") {
      this.revealContent(slide);
    }
  }

  /**
   * Process `Carousel.createSlide` event to create image content
   * @param {Object} fancybox
   * @param {Object} carousel
   * @param {Object} slide
   */
  onCreateSlide(fancybox, carousel, slide) {
    // Check if this slide should contain an image
    if (slide.isDom || slide.html || (slide.type && slide.type !== "image")) {
      return;
    }

    slide.type = "image";
    slide.state = "loading";

    // * Build layout
    // Container
    const $content = document.createElement("div");
    $content.style.visibility = "hidden";

    // Image element
    const $image = document.createElement("img");

    $image.onload = () => this.onImageStatusChange(slide);
    $image.onerror = () => this.onImageStatusChange(slide);

    $image.src = slide.src;
    $image.alt = "";
    $image.draggable = false;

    $image.classList.add("fancybox__image");

    if (slide.srcset) {
      $image.setAttribute("srcset", slide.srcset);
    }

    if (slide.sizes) {
      $image.setAttribute("sizes", slide.sizes);
    }

    slide.$image = $image;

    $content.appendChild($image);

    // Set data attribute if other that default
    // for example, set `[data-image-fit="contain-w"]`
    slide.$el.dataset.imageFit = this.fancybox.option("Image.fit");

    slide.$el.style.display = "none";
    slide.$el.offsetHeight; // no need to store this anywhere, the reference is enough
    slide.$el.style.display = "";

    // Append content
    this.fancybox.setContent(slide, $content);

    // Display loading icon
    if ($image.complete || $image.error) {
      $image.onload = $image.onerror = null;

      this.onImageStatusChange(slide);
    } else if (!$image.complete) {
      this.fancybox.showLoading(slide);
    }
  }

  /**
   * Make image zoomable and draggable using Panzoom
   * @param {Object} slide
   */
  initSlidePanzoom(slide) {
    if (slide.Panzoom) {
      return;
    }

    //* Initialize Panzoom
    slide.Panzoom = new Panzoom(
      slide.$el,
      extend(true, this.fancybox.option("Image.Panzoom"), {
        content: slide.$image,

        // This will prevent click conflict with fancybox main carousel
        panOnlyZoomed: true,

        // Disable default click/wheel events; custom callbacks will replace them
        click: null,
        doubleClick: null,
        wheel: null,

        on: {
          afterAnimate: (panzoom) => {
            if (slide.state === "zoomIn") {
              panzoom.attachEvents();

              this.fancybox.done(slide);
            }

            this.handleCursor(slide);
          },
          updateMetrics: () => {
            this.handleCursor(slide);
          },
          touchMove: () => {
            // Prevent any dragging if fancybox main carousel is dragged up/down
            // (e.g. if close guesture is detected)
            if (this.fancybox.Carousel.Panzoom.lockAxis) {
              return false;
            }
          },
        },
      })
    );

    // Add `wheel` event handler
    if (this.fancybox.option("Image.wheel")) {
      slide.Panzoom.on("wheel", (panzoom, event) => this.onWheel(panzoom, event));
    }

    // Add `click` event handler
    if (this.fancybox.option("Image.click")) {
      slide.Panzoom.on("click", (panzoom, event) => this.onClick(panzoom, event));
    }

    // Handle double click event to zoom in/out
    if (this.fancybox.option("Image.doubleClick") === "toggleZoom") {
      slide.Panzoom.on("doubleClick", (panzoom, event) => {
        if (!event.target.closest(".fancybox__content")) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const x = event.clientX - panzoom.$content.getClientRects()[0].left;
        const y = event.clientY - panzoom.$content.getClientRects()[0].top;

        panzoom.toggleZoom({ x, y });
      });
    }
  }

  /**
   * Handle image state change
   * @param {Object} slide
   */
  onImageStatusChange(slide) {
    this.fancybox.hideLoading(slide);

    const $image = slide.$image;

    if (!($image.complete && $image.width && $image.height)) {
      this.fancybox.setError(slide, "{{IMAGE_ERROR}}");

      return;
    }

    slide.state = "ready";

    this.updateDimensions(slide);

    this.initSlidePanzoom(slide);

    this.revealContent(slide);
  }

  /**
   * Update image wrapper width to match image width,
   * this will allow to display elements like close button over the image
   * if image is resized smaller
   * @param {Object} slide
   */
  updateDimensions(slide) {
    if (slide.$el.dataset.imageFit !== "cover") {
      const $image = slide.$image;
      const $content = slide.$content;

      $content.style.maxWidth = "";

      const borderWidth = $image.offsetWidth - $image.clientWidth;

      $content.style.maxWidth = `${getImgSizeInfo($image).width + borderWidth}px`;
    }

    this.handleCursor(slide);
  }

  /**
   * Start zoom-in animation if possible, or simply reveal content
   * @param {Object} slide
   */
  revealContent(slide) {
    this.updateDimensions(slide);

    // Animate only on first run
    if (
      this.fancybox.Carousel.prevPage === null &&
      slide.index === this.fancybox.options.startIndex &&
      this.canZoom(slide)
    ) {
      this.zoomIn();
    } else {
      this.fancybox.revealContent(slide);
    }
  }

  /**
   * Determine if it is possible to do zoom-in animation
   */
  canZoom(slide) {
    const fancybox = this.fancybox,
      $container = fancybox.$container;

    let rez = false;

    if (!fancybox.option("Image.zoom")) {
      return rez;
    }

    const $thumb = slide.$thumb;

    if (!$thumb || slide.state === "loading") {
      return rez;
    }

    // * Check if thumbnail image is really visible
    $container.style.pointerEvents = "none";

    const rect = $thumb.getBoundingClientRect();

    // Check if thumbnail image is actually visible on the screen
    if (this.fancybox.option("Image.ignoreCoveredThumbnail")) {
      const visibleTopLeft = document.elementFromPoint(rect.left + 1, rect.top + 1) === $thumb;
      const visibleBottomRight = document.elementFromPoint(rect.right - 1, rect.bottom - 1) === $thumb;

      rez = visibleTopLeft && visibleBottomRight;
    } else {
      rez = document.elementFromPoint(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5) === $thumb;
    }

    $container.style.pointerEvents = "";

    return rez;
  }

  /**
   * Get zoom info for selected slide
   * @param {Object} slide
   */
  getZoomInfo(slide) {
    const $thumb = slide.$thumb,
      thumbRect = $thumb.getBoundingClientRect(),
      thumbWidth = thumbRect.width,
      thumbHeight = thumbRect.height,
      contentRect = slide.$content.getBoundingClientRect(),
      contentDim = getImgSizeInfo(slide.$image),
      contentWidth = contentDim.width,
      contentHeight = contentDim.height,
      shiftedTop = contentRect.top + contentHeight * 0.5 - (thumbRect.top + thumbHeight * 0.5),
      shiftedLeft = contentRect.left + contentWidth * 0.5 - (thumbRect.left + thumbWidth * 0.5);

    // Check if need to update opacity
    let opacity = this.fancybox.option("Image.zoomOpacity");

    if (opacity === "auto") {
      opacity = Math.abs(thumbWidth / thumbHeight - contentWidth / contentHeight) > 0.1;
    }

    return {
      top: shiftedTop,
      left: shiftedLeft,
      scale: thumbRect.width / contentWidth,
      opacity: opacity,
    };
  }
  /**
   * Perform zoom-in animation
   */
  zoomIn() {
    const fancybox = this.fancybox;

    // Skip if initialization of main carousel is not yet complete
    // as it will give incorrect element position calculations
    // (and animation will later start in `onReady` event handler)
    if (fancybox.Carousel.state === "init") {
      return;
    }

    const slide = fancybox.getSlide(),
      Panzoom = slide.Panzoom;

    const { top, left, scale, opacity } = this.getZoomInfo(slide);

    slide.state = "zoomIn";

    // Disable event listeners while animation runs
    Panzoom.detachEvents();

    fancybox.trigger("reveal", slide);

    // Scale and move to start position
    Panzoom.panTo({
      x: left * -1,
      y: top * -1,
      scale: scale,
      friction: 0,
      ignoreBounds: true,
    });

    slide.$content.style.visibility = "";

    if (opacity === true) {
      Panzoom.on("afterTransform", (panzoom) => {
        if (slide.state === "zoomIn" || slide.state === "zoomOut") {
          panzoom.$content.style.opacity = Math.min(1, panzoom.current.scale);
        }
      });
    }

    // Animate back to original position
    Panzoom.panTo({
      x: 0,
      y: 0,
      scale: 1,
      friction: this.fancybox.option("Image.zoomFriction"),
    });
  }

  /**
   * Perform zoom-out animation
   */
  zoomOut() {
    const fancybox = this.fancybox,
      slide = fancybox.getSlide(),
      Panzoom = slide.Panzoom;

    if (!Panzoom) {
      return;
    }

    slide.state = "zoomOut";
    fancybox.state = "customClosing";

    if (slide.$caption) {
      slide.$caption.style.visibility = "hidden";
    }

    let friction = this.fancybox.option("Image.zoomFriction") * 0.75;

    const animatePosition = () => {
      const { top, left, scale } = this.getZoomInfo(slide);

      Panzoom.panTo({
        x: left * -1,
        y: top * -1,
        scale: scale,
        ignoreBounds: true,
        friction: friction,
      });

      // Gradually increase speed
      friction *= 0.98;
    };

    // Page scrolling will cause thumbnail to change position on the display,
    // therefore animation end position has to be recalculated after each page scroll
    window.addEventListener("scroll", animatePosition);

    Panzoom.on("afterAnimate", () => {
      window.removeEventListener("scroll", animatePosition);
      fancybox.destroy();
    });

    animatePosition();
  }

  /**
   * Set the type of mouse cursor to indicate if content is zoomable
   * @param {Object} slide
   */
  handleCursor(slide) {
    const panzoom = slide.Panzoom;
    const clickAction = this.fancybox.option("Image.click");
    const classList = slide.$el.classList;

    if (panzoom && clickAction === "toggleZoom") {
      const canZoom =
        panzoom && panzoom.current.scale === 1 && panzoom.option("maxScale") - panzoom.current.scale > 0.01;

      classList[canZoom ? "add" : "remove"](this.fancybox.option("Image.canZoomInClass"));
    } else if (clickAction === "close") {
      classList.add(this.fancybox.option("Image.canZoomOutClass"));
    }
  }

  /**
   * Handle `Panzoom.wheel` event
   * @param {Object} panzoom
   * @param {Object} event
   */
  onWheel(panzoom, event) {
    switch (this.fancybox.option("Image.wheel")) {
      case "zoom":
        panzoom.zoomWithWheel(event);

        break;

      case "close":
        this.fancybox.close();

        break;

      case "slide":
        this.fancybox[event.deltaY < 0 ? "prev" : "next"]();

        break;
    }

    event.preventDefault();
  }

  /**
   * Handle `Panzoom.click` event
   * @param {Object} panzoom
   * @param {Object} event
   */
  onClick(panzoom, event) {
    if (
      this.fancybox.Carousel.Panzoom.drag.distance >= 6 ||
      this.fancybox.Carousel.Panzoom.lockAxis ||
      !(event.target.tagName == "IMG" || event.target.classList.contains("fancybox__content"))
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    switch (this.fancybox.option("Image.click")) {
      case "toggleZoom":
        const x = event.clientX - panzoom.$content.getClientRects()[0].left;
        const y = event.clientY - panzoom.$content.getClientRects()[0].top;

        panzoom.toggleZoom({ x, y });

        break;
      case "close":
        this.fancybox.close();
        break;

      case "next":
        this.fancybox.next();
        break;

      case "prev":
        this.fancybox.prev();
        break;
    }
  }

  /**
   * Handle `Carousel.refresh` event to call content resizer
   * @param {Object} fancybox
   * @param {Object} carousel
   */
  onRefresh(fancybox, carousel) {
    carousel.slides.forEach((slide) => {
      if (slide.Panzoom) {
        this.updateDimensions(slide);
      }
    });
  }

  /**
   * Handle `Carousel.deleteSlide` event to do clean up the slide
   * @param {Object} fancybox
   * @param {Object} carousel
   * @param {Object} slide
   */
  onRemoveSlide(fancybox, carousel, slide) {
    if (slide.$image) {
      slide.$el.classList.remove(fancybox.option("Image.canZoomInClass"));

      slide.$image.onload = slide.$image.onerror = null;

      slide.$image.remove();
      slide.$image = null;
    }

    if (slide.Panzoom) {
      slide.Panzoom.destroy();
      slide.Panzoom = null;
    }

    delete slide.$el.dataset.imageFit;
  }

  /**
   * Handle `closing` event event to clean up all slides and to start zoom-out animation
   * @param {Object} fancybox
   */
  onClosing(fancybox) {
    // Remove events
    fancybox.Carousel.slides.forEach((slide) => {
      if (slide.$image) {
        slide.$image.onload = slide.$image.onerror = null;
      }

      if (slide.Panzoom) {
        slide.Panzoom.detachEvents();
      }
    });

    // If possible, start the zoom animation, it will interrupt the default closing process
    if (this.fancybox.state === "closing" && this.canZoom(fancybox.getSlide())) {
      this.zoomOut();
    }
  }

  /**
   * Handle `Carousel.change` event to reset zoom level for any zoomed in/out content
   * and to revel content of the current page
   * @param {Object} fancybox
   * @param {Object} carousel
   */
  onPageChange(fancybox, carousel) {
    const currSlide = fancybox.getSlide();

    carousel.slides.forEach((slide) => {
      if (!slide.Panzoom || slide.state !== "done") {
        return;
      }

      if (slide.index === currSlide.index) {
        if (carousel.Panzoom.velocity.x === 0) {
          this.revealContent(slide);
        }

        return;
      }

      slide.Panzoom.panTo({
        x: 0,
        y: 0,
        scale: 1,
        friction: 0.8,
      });
    });
  }

  attach() {
    this.fancybox.on(this.events);
  }

  detach() {
    this.fancybox.off(this.events);
  }
}

// Expose defaults
Image.defaults = defaults;
