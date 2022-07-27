import { Carousel } from '../../../Carousel/Carousel';
import { PanzoomOptions } from '../../../Panzoom/Panzoom';
import { Fancybox } from '../../Fancybox';

export class Image {
  constructor(fancybox: Fancybox);

  fancybox: Fancybox;
  events: {
    ready: () => void;
    closing: (fancybox: Fancybox) => void;
    done: (fancybox: Fancybox, slide: any) => void;
    'Carousel.change': (fancybox: Fancybox, carousel: Carousel) => void;
    'Carousel.createSlide': (fancybox: Fancybox, carousel: Carousel, slide: any) => void;
    'Carousel.removeSlide': (fancybox: Fancybox, carousel: Carousel, slide: any) => void;
  };

  /**
   * Handle `ready` event to start loading content
   */
  onReady(): void;

  /**
   * Handle `done` event to update cursor
   * @param {Object} fancybox
   * @param {Object} slide
   */
  onDone(fancybox: Fancybox, slide: any): void;

  /**
   * Handle `closing` event to clean up all slides and to start zoom-out animation
   * @param {Object} fancybox
   */
  onClosing(fancybox: Fancybox): void;

  clickTimer: any;

  /**
   * Process `Carousel.createSlide` event to create image content
   * @param {Object} fancybox
   * @param {Object} carousel
   * @param {Object} slide
   */
  onCreateSlide(fancybox: Fancybox, carousel: Carousel, slide: any): void;

  /**
   * Handle `Carousel.removeSlide` event to do clean up the slide
   * @param {Object} fancybox
   * @param {Object} carousel
   * @param {Object} slide
   */
  onRemoveSlide(fancybox: Fancybox, carousel: Carousel, slide: any): void;

  /**
   * Build DOM elements and add event listeners
   * @param {Object} slide
   */
  setContent(slide: any): void;

  /**
   * Handle image state change, display error or start revealing image
   * @param {Object} slide
   */
  onImageStatusChange(slide: any): void;

  /**
   * Make image zoomable and draggable using Panzoom
   * @param {Object} slide
   */
  initSlidePanzoom(slide: any): void;

  /**
   * Start zoom-in animation if possible, or simply reveal content
   * @param {Object} slide
   */
  revealContent(slide: any): void;

  /**
   * Get zoom info for selected slide
   * @param {Object} slide
   */
  getZoomInfo(slide: any): {
    top: number;
    left: number;
    scale: number;
    opacity: any;
  };

  /**
   * Determine if it is possible to do zoom-in animation
   */
  canZoom(slide: any): boolean;

  /**
   * Perform zoom-in animation
   */
  zoomIn(): void;

  /**
   * Perform zoom-out animation
   */
  zoomOut(): void;

  /**
   * Set the type of mouse cursor to indicate if content is zoomable
   * @param {Object} slide
   */
  handleCursor(slide: any): void;

  /**
   * Handle `wheel` event
   * @param {Object} slide
   * @param {Object} event
   */
  onWheel(slide: any, event: any): void;

  /**
   * Handle `click` and `dblclick` events
   * @param {Object} slide
   * @param {Object} event
   */
  onClick(slide: any, event: any): boolean;

  /**
   * Handle `Carousel.change` event to reset zoom level for any zoomed in/out content
   * and to revel content of the current page
   * @param {Object} fancybox
   * @param {Object} carousel
   */
  onPageChange(fancybox: Fancybox, carousel: Carousel): void;

  attach(): void;

  detach(): void;
}

export interface ImageOptions {
  // Class name for slide element indicating that content can be zoomed in
  canZoomInClass: string,

  // Class name for slide element indicating that content can be zoomed out
  canZoomOutClass: string,

  // Do zoom animation from thumbnail image when starting or closing fancybox
  zoom: boolean,

  // Animate opacity while zooming
  zoomOpacity: 'auto' | boolean,

  // Zoom animation friction
  zoomFriction: number,

  // Disable zoom animation if thumbnail is visible only partly
  ignoreCoveredThumbnail: boolean,

  // Enable guestures
  touch: boolean,

  // Action to be performed when user clicks on the image
  click: 'toggleZoom' | 'next' | 'close';

  // Action to be performed when double-click event is detected on the image
  doubleClick: 'toggleZoom';

  // Action to be performed when user rotates a wheel button on a pointing device
  wheel: 'zoom' | 'slide' | 'close';

  // How image should be resized to fit its container
  fit: 'contain' | 'contain-w' | 'cover';

  // Should create wrapping element around the image
  wrap: boolean;

  // Custom Panzoom options
  Panzoom: PanzoomOptions,
}
