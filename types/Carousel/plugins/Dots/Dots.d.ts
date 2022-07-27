import { Carousel } from '../../Carousel';

export class Dots {
  constructor(carousel: Carousel);

  carousel: Carousel;
  $list: HTMLOListElement;
  events: {
    change: () => void;
    refresh: () => void;
  };

  /**
   * Build wrapping DOM element containing all dots
   */
  buildList(): HTMLOListElement;

  /**
   * Remove wrapping DOM element
   */
  removeList(): void;

  /**
   * Remove existing dots and create fresh ones
   */
  rebuildDots(): void;

  /**
   * Mark active dot by toggling class name
   */
  setActiveDot(): void;

  /**
   * Process carousel `change` event
   */
  onChange(): void;

  /**
   * Process carousel `refresh` event
   */
  onRefresh(): void;

  attach(): void;

  detach(): void;
}
