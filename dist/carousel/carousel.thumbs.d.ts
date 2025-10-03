import { CarouselOptions, type CarouselInstance, type Carousel } from "./carousel";
export type ThumbsOptions = {
    /**
     * Optional custom Carousel options
     */
    Carousel?: Partial<CarouselOptions>;
    /**
     * Minimum number of slides with thumbnails in the carousel to create Thumbs
     */
    minCount: number;
    /**
     * Optional element to place the container
     */
    parentEl?: HTMLElement | null | ((instance: CarouselInstance) => HTMLElement | null);
    /**
     * If the thumbnail bar should automatically appear after the carousel is initialized
     */
    showOnStart: boolean;
    /**
     * Template for the thumbnail element
     */
    thumbTpl: string;
    /**
     * Choose a type - "classic" (syncs two instances of the carousel) or "modern" (Apple Photos style)
     */
    type: "classic" | "modern";
};
export type ThumbsInstance = ReturnType<typeof Thumbs>;
declare module "./carousel" {
    interface CarouselOptions {
        Thumbs?: Boolean | Partial<ThumbsOptions>;
    }
    interface CarouselPlugins {
        Thumbs: CarouselPlugin & ThumbsInstance;
    }
    interface CarouselSlide {
        thumbSrc?: string | HTMLImageElement;
        thumbAlt?: string;
        thumbClass?: string;
    }
    interface CarouselEventArgs {
        "thumbs:ready": [];
        "thumbs:destroy": [];
    }
}
export declare const Thumbs: () => {
    init: (carousel: CarouselInstance, carouselConstructor: typeof Carousel) => void;
    destroy: () => void;
    /**
     * Get reference to the container DOM element
     */
    getCarousel: () => CarouselInstance | undefined;
    /**
     * Get reference to the container DOM element
     */
    getContainer: () => HTMLElement;
    /**
     * Check if thumbnails are enabled
     */
    isEnabled: () => boolean;
};
