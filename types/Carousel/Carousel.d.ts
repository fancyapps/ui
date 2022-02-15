import { Panzoom } from '../Panzoom/Panzoom';
import { Base } from '../shared/Base/Base';
import { AutoplayOptions } from './plugins/Autoplay/Autoplay';
import { NavigationOptions } from './plugins/Navigation/Navigation';
import { SyncOptions } from './plugins/Sync/Sync';

export class Carousel extends Base {

  Panzoom: Panzoom;

  $container: HTMLElement;
  $track: any;
  $viewport: any;

  contentWidth: number;
  page: any;
  pageIndex: any;
  pages: any[];
  prevPage: any;
  prevPageIndex: any;
  slides: any;
  state: string;
  viewportWidth: number;

  /**
   * Carousel constructor
   * @constructs Carousel
   * @param {HTMLElement} $container - Carousel container
   * @param {Object} [options] - Options for Carousel
   */
  constructor($container: HTMLElement, options?: Partial<CarouselOptions>);


  /**
   * Slide to next page, if possible
   */
  slideNext(): void;

  /**
   * Slide to previous page, if possible
   */
  slidePrev(): void;

  /**
   * Perform initialization
   */
  init(): void;


  /**
   * Initialize layout; create necessary elements
   */
  initLayout(): void;

  /**
   * Fill `slides` array with objects from existing nodes and/or `slides` option
   */
  initSlides(): void;


  /**
   * Do all calculations related to slide size and paging
   */
  updateMetrics(): void;


  /**
   * Calculate slide element width (including left, right margins)
   * @param {Object} node
   * @returns {Number} Width in px
   */
  getSlideMetrics(node: any): number;

  /**
   *
   * @param {number} index Index of the slide
   * @returns {number|null} Index of the page if found, or null
   */
  findPageForSlide(index: number): number | null;

  /**
   * Slides carousel to given page
   * @param {Number} page - New index of active page
   * @param {Object} [params] - Additional options
   */
  slideTo(page: number, params?: any): void;

  /**
   * Initialise main Panzoom instance
   */
  initPanzoom(): void;


  updatePanzoom(): void;

  manageSlideVisiblity(): void;

  /**
   * Creates main DOM element for virtual slides,
   * lazy loads images inside regular slides
   * @param {Object} slide
   */
  createSlideEl(slide: any): any;

  /**
   * Removes main DOM element of given slide
   * @param {Object} slide
   */
  removeSlideEl(slide: any): void;

  /**
   * Toggles selected class name and aria-hidden attribute for slides based on visibility
   */
  markSelectedSlides(): void;

  /**
   * Perform all calculations and center current page
   */
  updatePage(): void;

  /**
   * Process `Panzoom.beforeTransform` event to remove slides moved out of viewport and
   * to create necessary ones
   */
  onBeforeTransform(): void;

  /**
   * Seamlessly flip position of infinite carousel, if needed; this way x position stays low
   */
  manageInfiniteTrack(): boolean;

  /**
   * Process `Panzoom.touchEnd` event; slide to next/prev page if needed
   * @param {object} panzoom
   */
  onTouchEnd(panzoom: object, event: any): void;

  /**
   * Slides to the closest page (useful, if carousel is changed manually)
   * @param {Object} [params] - Object containing additional options
   */
  slideToClosest(params?: any): void;

  /**
   * Returns index of closest page to given x position
   * @param {Number} xPos
   */
  getPageFromPosition(xPos: number): any[];

  /**
   * Changes active page
   * @param {Number} page - New index of active page
   * @param {Boolean} toClosest - to closest page based on scroll distance (for infinite navigation)
   */
  setPage(page: number, toClosest: boolean): number;

  /**
   * Clean up
   */
  destroy(): void;
}

export interface CarouselSlide {
  html: string;

  [key: string]: any;
}

export interface CarouselOptions {
  // Virtual slides. Each object should have at least `html` property that will be used to set content,
  // example: `slides: [{html: 'First slide'}, {html: 'Second slide'}]`
  slides: CarouselSlide[];

  // Number of slides to preload before/after visible slides
  preload: number;

  // Number of slides to group into the page,
  // if `auto` - group all slides that fit into the viewport
  slidesPerPage: 'auto' | number;

  // Index of initial page
  initialPage: number;

  // Index of initial slide
  initialSlide: number;

  // Panzoom friction while changing page
  friction: number;

  // Should center active page
  center: boolean;

  // Should carousel scroll infinitely
  infinite: boolean;

  // Should the gap be filled before first and after last slide if `infinite: false`
  fill: boolean;

  // Should Carousel settle at any position after a swipe.
  dragFree: boolean;

  // Prefix for CSS classes, must be the same as the  SCSS `$carousel-prefix` variable
  prefix: string;

  // Class names for DOM elements (without prefix)
  classNames: Partial<{
    viewport: string;
    track: string;
    slide: string;

    // Classname toggled for slides inside current page
    slideSelected: string;
  }>;

  // Localization of strings
  l10n: {
    NEXT: string;
    PREV: string;
    GOTO: string;
  };

  Autoplay?: false | Partial<AutoplayOptions>;
  Dots?: boolean;
  Navigation?: false | Partial<NavigationOptions>;
  Sync?: false | Partial<SyncOptions>;
}
