import { Carousel } from '../../Carousel';

export class Navigation {
  constructor(carousel: Carousel);

  $container: HTMLDivElement;
  $prev: HTMLButtonElement;
  $next: HTMLButtonElement;
  carousel: Carousel;

  /**
   *  Process carousel `refresh` and `change` events to enable/disable buttons if needed
   */
  onRefresh(): void;

  /**
   * Shortcut to get option for this plugin
   * @param {String} name option name
   * @returns option value
   */
  option(name: string): any;

  /**
   * Creates and returns new button element with default class names and click event
   * @param {String} type
   */
  createButton(type: string): HTMLButtonElement;

  /**
   * Build necessary DOM elements
   */
  build(): void;

  cleanup(): void;

  attach(): void;

  detach(): void;
}

export interface NavigationOptions {
  prevTpl: string;
  nextTpl: string;
  classNames: Partial<{
    main: string;
    button: string;
    next: string;
    prev: string;
  }>
}
