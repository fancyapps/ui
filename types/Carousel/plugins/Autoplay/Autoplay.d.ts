import { Carousel } from '../../Carousel';

export class Autoplay {
  constructor(carousel: Carousel);

  carousel: Carousel;
  state: string;
  events: {
    ready: () => void;
    settle: () => void;
  };

  onReady(): void;

  onSettle(): void;

  onMouseEnter(): void;

  onMouseLeave(): void;

  set(): void;

  timer: number;

  clear(): void;

  start(): void;

  stop(): void;
}

export interface AutoplayOptions {
  timeout: number;
  hoverPause: boolean;
}
