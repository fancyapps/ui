import { Carousel, CarouselOptions } from '../../../Carousel/Carousel';
import { Fancybox } from '../../Fancybox';

export class Thumbs {
  constructor(fancybox: Fancybox);

  fancybox: Fancybox;
  $container: HTMLDivElement;
  state: string;
  events: {
    prepare: () => void;
    closing: () => void;
    keydown: (fancybox: Fancybox, key: string) => void;
  };

  Carousel: Carousel;

  /**
   * Process `prepare` event to build the layout
   */
  onPrepare(): void;

  /**
   * Process `closing` event to disable all events
   */
  onClosing(): void;

  /**
   * Process `keydown` event to enable thumbnail list toggling using keyboard key
   * @param {Object} fancybox
   * @param {String} key
   */
  onKeydown(fancybox: Fancybox, key: string): void;

  /**
   * Build layout and init thumbnail Carousel
   */
  build(): void;

  /**
   * Process all fancybox slides to get all thumbnail images
   */
  getSlides(): {
    html: string;
    customClass: string;
  }[];

  /**
   * Toggle visibility of thumbnail list
   * Tip: you can use `Fancybox.getInstance().plugins.Thumbs.toggle()` from anywhere in your code
   */
  toggle(): void;

  /**
   * Show thumbnail list
   */
  show(): void;

  /**
   * Hide thumbnail list
   */
  hide(): void;

  /**
   * Reset the state
   */
  cleanup(): void;

  attach(): void;

  detach(): void;
}


export interface ThumbsOptions {
  // The minimum number of images in the gallery to display thumbnails
  minSlideCount: number,

  // Minimum screen height to display thumbnails
  minScreenHeight: number,

  // Automatically show thumbnails when opened
  autoStart: boolean,

  // Keyboard shortcut to toggle thumbnail container
  key: string,

  // Customize Carousel instance
  Carousel: CarouselOptions,
}
