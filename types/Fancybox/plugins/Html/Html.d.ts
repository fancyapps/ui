import { Carousel } from '../../../Carousel/Carousel';
import { Fancybox } from '../../Fancybox';

export class Html {
  constructor(fancybox: Fancybox);

  fancybox: Fancybox;
  events: {
    init: () => void;
    ready: () => void;
    'Carousel.createSlide': (fancybox: Fancybox, carousel: Carousel, slide: any) => void;
    'Carousel.removeSlide': (fancybox: Fancybox, carousel: Carousel, slide: any) => void;
    'Carousel.selectSlide': (fancybox: Fancybox, carousel: Carousel, slide: any) => void;
    'Carousel.unselectSlide': (fancybox: Fancybox, carousel: Carousel, slide: any) => void;
    'Carousel.refresh': (fancybox: Fancybox, carousel: Carousel) => void;
  };

  /**
   * Check if each gallery item has type when fancybox starts
   */
  onInit(): void;

  /**
   * Set content type for the slide
   * @param {Object} slide
   */
  processType(slide: any): void;

  /**
   * Start loading content when Fancybox is ready
   */
  onReady(): void;

  /**
   * Process `Carousel.createSlide` event to create image content
   * @param {Object} fancybox
   * @param {Object} carousel
   * @param {Object} slide
   */
  onCreateSlide(fancybox: Fancybox, carousel: Carousel, slide: any): void;

  /**
   * Retrieve and set slide content
   * @param {Object} slide
   */
  loadInlineContent(slide: any): void;

  /**
   * Makes AJAX request and sets response as slide content
   * @param {Object} slide
   */
  loadAjaxContent(slide: any): void;

  /**
   * Creates iframe as slide content, preloads if needed before displaying
   * @param {Object} slide
   */
  loadIframeContent(slide: any): void;

  /**
   * Set CSS max/min width/height properties of the content to have the correct aspect ratio
   * @param {Object} slide
   */
  setAspectRatio(slide: any): void;

  /**
   * Adjust the width and height of the iframe according to the content dimensions, or defined sizes
   * @param {Object} slide
   */
  resizeIframe(slide: any): void;

  /**
   * Process `Carousel.onRefresh` event,
   * trigger iframe autosizing and set content aspect ratio for each slide
   * @param {Object} fancybox
   * @param {Object} carousel
   */
  onRefresh(fancybox: Fancybox, carousel: Carousel): void;

  /**
   * Process `Carousel.onCreateSlide` event to set content
   * @param {Object} fancybox
   * @param {Object} carousel
   * @param {Object} slide
   */
  setContent(slide: any): void;

  /**
   * Process `Carousel.onSelectSlide` event to start video
   * @param {Object} fancybox
   * @param {Object} carousel
   * @param {Object} slide
   */
  onSelectSlide(fancybox: Fancybox, carousel: Carousel, slide: any): void;

  /**
   * Attempts to begin playback of the media
   * @param {Object} slide
   */
  playVideo(slide: any): void;

  /**
   * Process `Carousel.onUnselectSlide` event to pause video
   * @param {Object} fancybox
   * @param {Object} carousel
   * @param {Object} slide
   */
  onUnselectSlide(fancybox: Fancybox, carousel: Carousel, slide: any): void;

  /**
   * Process `Carousel.onRemoveSlide` event to do clean up
   * @param {Object} fancybox
   * @param {Object} carousel
   * @param {Object} slide
   */
  onRemoveSlide(fancybox: Fancybox, carousel: Carousel, slide: any): void;

  /**
   * Process `window.message` event to mark video iframe element as `ready`
   * @param {Object} e - Event
   */
  onMessage(e: any): void;

  attach(): void;

  detach(): void;
}

export interface HtmlOptions {
  // General options for any video content (Youtube, Vimeo, HTML5 video)
  video: {
    autoplay: boolean;
    ratio: number;
  };
  // Youtube embed parameters
  youtube: {
    autohide: boolean;
    fs: boolean;
    rel: boolean;
    hd: boolean;
    wmode: 'transparent';
    enablejsapi: boolean;
    html5: boolean;
  };
  // Vimeo embed parameters
  vimeo: {
    hd: boolean;
    show_title: boolean;
    show_byline: boolean;
    show_portrait: boolean;
    fullscreen: boolean;
  };
  // HTML5 video parameters
  html5video: {
    tpl: string;
    format: '';
  };
}
