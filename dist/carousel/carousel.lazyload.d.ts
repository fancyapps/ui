import { CarouselInstance } from "./carousel";
export type LazyloadOptions = {
    /**
     * Show loading animation during loading
     */
    showLoading: boolean;
    /**
     * Number of next/prev pages to preload
     */
    preload: number;
};
export type LazyloadInstance = ReturnType<typeof Lazyload>;
type AnyImageSource = HTMLImageElement | HTMLSourceElement;
declare module "./carousel" {
    interface CarouselOptions {
        Lazyload?: boolean | Partial<LazyloadOptions>;
    }
    interface CarouselPlugins {
        Lazyload: CarouselPlugin & LazyloadInstance;
    }
    interface CarouselEventArgs {
        "lazyLoad:load": [CarouselSlide, AnyImageSource, string];
        "lazyLoad:loaded": [CarouselSlide, AnyImageSource, string];
        "lazyLoad:error": [CarouselSlide, AnyImageSource, string];
    }
}
export declare const Lazyload: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
};
export {};
