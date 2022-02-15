import { Panzoom } from '../../../Panzoom/Panzoom';
import { Carousel } from '../../Carousel';

export class Sync {
  constructor(carousel: Carousel);

  carousel: Carousel;
  selectedIndex: number;
  friction: number;
  target: Carousel;
  nav: any;

  /**
   * Process main carousel `ready` event; bind events and set initial page
   */
  onNavReady(): void;

  /**
   * Process main carousel `click` event
   * @param {Object} panzoom
   * @param {Object} event
   */
  onNavClick(carousel: Carousel, panzoom: Panzoom, event: any): void;

  /**
   * Process main carousel `createSlide` event
   * @param {Object} carousel
   * @param {Object} slide
   */
  onNavCreateSlide(carousel: Carousel, slide: any): void;

  /**
   * Process target carousel `change` event
   * @param {Object} target
   */
  onTargetChange(): void;

  /**
   * Make this one as main carousel and selected carousel as navigation
   * @param {Object} nav Carousel
   */
  addAsTargetFor(nav: any): void;

  /**
   * Make this one as navigation carousel for selected carousel
   * @param {Object} target
   */
  addAsNavFor(target: any): void;

  /**
   * Attach event listeners on both carousels
   */
  attachEvents(): void;

  /**
   * Toggle classname for slides that marks currently selected slides
   * @param {Number} selectedIndex
   */
  markSelectedSlide(selectedIndex: number): void;

  attach(carousel: Carousel): void;

  detach(): void;
}

export interface SyncOptions {
  target: Carousel;
  friction: number;
}
