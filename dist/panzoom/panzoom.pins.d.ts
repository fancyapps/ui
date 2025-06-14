import { PanzoomInstance } from "./panzoom";
export type PinsOptions = {};
export type Pin = {
    x: string | number;
    y: string | number;
    el: HTMLElement;
};
export type PinsInstance = ReturnType<typeof Pins>;
declare module "../carousel/Carousel" {
    interface CarouselSlide {
        pins?: Pin[];
    }
}
declare module "./Panzoom" {
    interface PanzoomOptions {
        Pins?: boolean | Partial<PinsOptions>;
    }
    interface PanzoomPlugins {
        Pins: PanzoomPlugin & PinsInstance;
    }
}
export declare const Pins: () => {
    init: (carousel: PanzoomInstance) => void;
    destroy: () => void;
};
