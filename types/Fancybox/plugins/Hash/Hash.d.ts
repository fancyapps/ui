import { Fancybox } from '../../Fancybox';

export class Hash {
  /**
   * Start fancybox from current URL hash,
   * this will be called on page load OR/AND after changing URL hash
   * @param {Class} Fancybox
   */
  static startFromUrl(): void;

  /**
   * Handle `hash` change, change gallery item to current index or start/close current instance
   */
  static onHashChange(): any;

  /**
   * Add event bindings that will start new Fancybox instance based in the current URL
   */
  static create(fancybox: Fancybox): void;

  static destroy(): void;

  /**
   * Helper method to split URL hash into useful pieces
   */
  static getParsedURL(): {
    hash: string;
    slug: string;
    index: number;
  };


  fancybox: Fancybox;
  events: {
    initCarousel: (fancybox: Fancybox) => void;
    'Carousel.change': (fancybox: Fancybox) => void;
    closing: () => void;
  };
  hasCreatedHistory: boolean;
  origHash: string;
  timer: number;

  constructor(fancybox: Fancybox);


  /**
   * Process `Carousel.ready` and `Carousel.change` events to update URL hash
   * @param {Object} fancybox
   * @param {Object} carousel
   */
  onChange(fancybox: Fancybox): void;

  /**
   * Process `closing` event to clean up
   */
  onClosing(): void;

  attach(fancybox: Fancybox): void;

  detach(fancybox: Fancybox): void;
}
