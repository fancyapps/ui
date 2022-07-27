import { Fancybox } from '../../../Fancybox/Fancybox';
import { Slideshow } from '../../../shared/utils/Slideshow';

export class Toolbar {
  constructor(fancybox: Fancybox);

  fancybox: Fancybox;
  $container: HTMLDivElement;
  state: string;
  events: {
    init: () => void;
    prepare: () => void;
    done: (fancybox: Fancybox, slide: any) => void;
    keydown: (fancybox: Fancybox, key: any, event: any) => void;
    closing: () => void;
    'Carousel.change': () => void;
    'Carousel.settle': () => void;
    'Carousel.Panzoom.touchStart': () => void;
    'Image.startAnimation': (fancybox: Fancybox, slide: any) => void;
    'Image.afterUpdate': (fancybox: Fancybox, slide: any) => void;
  };
  Slideshow: Slideshow;

  onInit(): void;

  onPrepare(): void;

  onFsChange(): void;

  onSettle(): void;

  onChange(): void;

  onDone(fancybox: Fancybox, slide: any): void;

  onRefresh(slide: any): void;

  onKeydown(fancybox: Fancybox, key: any, event: any): void;

  onClosing(): void;

  /**
   * Create link, button or `div` element for the toolbar
   * @param {Object} obj
   * @returns HTMLElement
   */
  createElement(obj: any): HTMLAnchorElement | HTMLButtonElement | HTMLDivElement;

  /**
   * Create all DOM elements
   */
  build(): void;

  /**
   * Update element state depending on index of current slide
   */
  update(): void;

  cleanup(): void;

  attach(): void;

  detach(): void;
}

type ToolbarActionType = 'counter' | 'prev' | 'next' | 'download' | 'zoom' | 'slideshow' | 'fullscreen' | 'thumbs' | 'close';

export interface ToolbarItem {
  position: string,
  type: 'div' | 'buttons' | 'links',
  class: string,
  html: string,
  attr: Record<string, any>,
  click: (e: PointerEvent) => void;
}

export interface ToolbarOptions {
  // What toolbar items to display
  display: ToolbarActionType[],

  // Only create a toolbar item if there is at least one image in the group
  autoEnable: boolean,

  // Toolbar items; can be links, buttons or `div` elements
  items: Record<ToolbarActionType, ToolbarItem>,
}
