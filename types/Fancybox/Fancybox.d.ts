import { Base } from '../shared/Base/Base';

export class Fancybox extends Base {
  /**
   * Create new Fancybox instance with provided options
   * Example:
   *   Fancybox.show([{ src : 'https://lipsum.app/id/1/300x225' }]);
   * @param {Array} items - Gallery items
   * @param {Object} [options] - Optional custom options
   * @returns {Object} Fancybox instance
   */
  static show(items: any[], options?: any): any;

  /**
   * Starts Fancybox if event target matches any opener or target is `trigger element`
   * @param {Event} event - Click event
   * @param {Object} [options] - Optional custom options
   */
  static fromEvent(event: Event, options?: any): boolean;

  /**
   * Starts Fancybox using selector
   * @param {String} opener - Valid CSS selector string
   * @param {Object} [options] - Optional custom options
   */
  static fromOpener(opener: string, options?: any): false | Fancybox;

  /**
   * Attach a click handler function that starts Fancybox to the selected items, as well as to all future matching elements.
   * @param {String} selector - Selector that should match trigger elements
   * @param {Object} [options] - Custom options
   */
  static bind(selector: string, options?: any): void;

  /**
   * Remove the click handler that was attached with `bind()`
   * @param {String} selector - A selector which should match the one originally passed to .bind()
   */
  static unbind(selector: string): void;

  /**
   * Immediately destroy all instances (without closing animation) and clean up all bindings..
   */
  static destroy(): void;

  /**
   * Retrieve instance by identifier or the top most instance, if identifier is not provided
   * @param {String|Numeric} [id] - Optional instance identifier
   */
  static getInstance(id?: string | number): any;

  /**
   * Close all or topmost currently active instance.
   * @param {boolean} [all] - All or only topmost active instance
   * @param {any} [arguments] - Optional data
   */
  static close(all?: boolean, args?: any): void;

  /**
   * Slide topmost currently active instance to next page
   */
  static next(): void;

  /**
   * Slide topmost currently active instance to previous page
   */
  static prev(): void;

  /**
   * Fancybox constructor
   * @constructs Fancybox
   * @param {Object} [options] - Options for Fancybox
   */
  constructor(items: any, options?: any);

  state: string;

  $root: any;
  $container: any;
  $backdrop: any;
  $carousel: any;
  id: any;
  items: any[];
  lastFocus: EventTarget;
  $closeButton: any;

  Carousel: any;

  /**
   * Bind event handlers for referencability
   */
  bindHandlers(): void;

  /**
   * Set up a functions that will be called whenever the specified event is delivered
   */
  attachEvents(): void;

  /**
   * Removes previously registered event listeners
   */
  detachEvents(): void;

  /**
   * Initialize layout; create main container, backdrop nd layout for main carousel
   */
  initLayout(): Fancybox;


  /**
   * Prepares slides for the corousel
   * @returns {Array} Slides
   */
  setItems(items: any): any[];


  /**
   * Initialize main Carousel that will be used to display the content
   * @param {Array} slides
   */
  initCarousel(): Fancybox;


  /**
   * Process `createSlide` event to create caption element inside new slide
   */
  onCreateSlide(carousel: any, slide: any): void;

  /**
   * Handle Carousel `settle` event
   */
  onSettle(): void;

  /**
   * Handle focus event
   * @param {Event} event - Focus event
   */
  onFocus(event: Event): void;

  /**
   * Handle click event on the container
   * @param {Event} event - Click event
   */
  onClick(event: Event): void;

  /**
   * Handle panzoom `touchMove` event; Disable dragging if content of current slide is scaled
   */
  onTouchMove(): boolean;

  /**
   * Handle panzoom `touchEnd` event; close when quick flick up/down is detected
   * @param {Object} panzoom - Panzoom instance
   */
  onTouchEnd(panzoom: any): void;

  /**
   * Handle `afterTransform` event; change backdrop opacity based on current y position of panzoom
   * @param {Object} panzoom - Panzoom instance
   */
  onTransform(panzoom: any): void;

  /**
   * Handle `mousedown` event to mark that the mouse is in use
   */
  onMousedown(): void;

  /**
   * Handle `keydown` event; trap focus
   * @param {Event} event Keydown event
   */
  onKeydown(event: Event): void;

  /**
   * Get the active slide. This will be the first slide from the current page of the main carousel.
   */
  getSlide(): any;

  /**
   * Place focus on the first focusable element inside current slide
   * @param {Event} [event] - Focus event
   */
  focus(event?: Event): void;


  /**
   * Hide vertical page scrollbar and adjust right padding value of `body` element to prevent content from shifting
   * (otherwise the `body` element may become wider and the content may expand horizontally).
   */
  hideScrollbar(): void;

  /**
   * Stop hiding vertical page scrollbar
   */
  revealScrollbar(): void;

  /**
   * Remove content for given slide
   * @param {Object} slide - Carousel slide
   */
  clearContent(slide: any): void;

  /**
   * Set new content for given slide
   * @param {Object} slide - Carousel slide
   * @param {HTMLElement|String} html - HTML element or string containing HTML code
   * @param {Object} [opts] - Options
   */
  setContent(slide: any, html: HTMLElement | string, opts?: any): Element;

  /**
   * Create close button if needed
   * @param {Object} slide
   */
  manageCloseButton(slide: any): void;


  /**
   * Make content visible for given slide and optionally start CSS animation
   * @param {Object} slide - Carousel slide
   */
  revealContent(slide: any): void;

  /**
   * Add class name to given HTML element and wait for `animationend` event to execute callback
   * @param {HTMLElement} $el
   * @param {String} className
   * @param {Function} callback - A callback to run
   */
  animateCSS($element: any, className: string, callback: Function): void;

  /**
   * Mark given slide as `done`, e.g., content is loaded and displayed completely
   * @param {Object} slide - Carousel slide
   */
  done(slide: any): void;

  /**
   * Set error message as slide content
   * @param {Object} slide - Carousel slide
   * @param {String} message - Error message, can contain HTML code and template variables
   */
  setError(slide: any, message: string): void;

  /**
   * Create loading indicator inside given slide
   * @param {Object} slide - Carousel slide
   */
  showLoading(slide: any): void;

  /**
   * Remove loading indicator from given slide
   * @param {Object} slide - Carousel slide
   */
  hideLoading(slide: any): void;

  /**
   * Slide carousel to next page
   */
  next(): void;

  /**
   * Slide carousel to previous page
   */
  prev(): void;

  /**
   * Slide carousel to selected page with optional parameters
   * Examples:
   *    Fancybox.getInstance().jumpTo(2);
   *    Fancybox.getInstance().jumpTo(3, {friction: 0})
   * @param  {...any} args - Arguments for Carousel `slideTo` method
   */
  jumpTo(...args: any[]): void;

  /**
   * Start closing the current instance
   * @param {Event} [event] - Optional click event
   */
  close(event?: Event): void;

  /**
   * Clean up after closing fancybox
   */
  destroy(): void;
}

type KeyboardAction = 'next' | 'prev' | 'close';

export interface FancyboxLocale {
  CLOSE: string;
  NEXT: string;
  PREV: string;
  MODAL: string;
  ERROR: string;
  IMAGE_ERROR: string;
  ELEMENT_NOT_FOUND: string;
  AJAX_NOT_FOUND: string;
  AJAX_FORBIDDEN: string;
  IFRAME_ERROR: string;
  TOGGLE_ZOOM: string;
  TOGGLE_THUMBS: string;
  TOGGLE_SLIDESHOW: string;
  TOGGLE_FULLSCREEN: string;
  DOWNLOAD: string;
}

export interface FancyboxOptions {
  // Index of active slide on the start
  startIndex: number,

  // Number of slides to preload before and after active slide
  preload: number,

  // Should navigation be infinite
  infinite: boolean,

  // Class name to be applied to the content to reveal it
  showClass: 'fancybox-zoomInUp' | 'fancybox-fadeIn' | 'fancybox-zoomInUp' | false

  // Class name to be applied to the content to hide it
  hideClass: 'fancybox-fadeOut' | 'fancybox-fadeOut' | 'fancybox-zoomOutDown' | false

  // Should backdrop and UI elements fade in/out on start/close
  animated: boolean,

  // If browser scrollbar should be hidden
  hideScrollbar: boolean,

  // Element containing main structure
  parentEl: HTMLElement,

  // Custom class name or multiple space-separated class names for the container
  mainClass: string,

  // Set focus on first focusable element after displaying content
  autoFocus: boolean,

  // Trap focus inside Fancybox
  trapFocus: boolean,

  // Set focus back to trigger element after closing Fancybox
  placeFocusBack: boolean,

  // Action to take when the user clicks on the backdrop
  click: KeyboardAction

  // Position of the close button - over the content or at top right corner of viewport
  closeButton: 'inside' | 'outside'

  // Allow user to drag content up/down to close instance
  dragToClose: boolean,

  // Enable keyboard navigation
  keyboard: {
    Escape: KeyboardAction,
    Delete: KeyboardAction,
    Backspace: KeyboardAction,
    PageUp: KeyboardAction,
    PageDown: KeyboardAction,
    ArrowUp: KeyboardAction,
    ArrowDown: KeyboardAction,
    ArrowRight: KeyboardAction,
    ArrowLeft: KeyboardAction,
  },

  // HTML templates for various elements
  template: {
    // Close button icon
    closeButton: string;
    // Loading indicator icon
    spinner: string;

    // Main container element
    main: null,
  },

  l10n: FancyboxLocale,
}
