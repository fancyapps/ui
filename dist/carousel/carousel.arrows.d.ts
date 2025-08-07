import { CarouselInstance } from "./carousel";
export type ArrowsOptions = {
    /**
     * Optional custom class name for the left arrow
     */
    prevClass?: string;
    /**
     * HTML template for left arrow icon
     */
    prevTpl: string;
    /**
     * Optional custom class name for the right arrow
     */
    nextClass?: string;
    /**
     * HTML template for right arrow icon
     */
    nextTpl: string;
};
export type ArrowsInstance = ReturnType<typeof Arrows>;
declare module "./carousel" {
    interface CarouselOptions {
        Arrows?: boolean | Partial<ArrowsOptions>;
    }
    interface CarouselPlugins {
        Arrows: CarouselPlugin & ArrowsInstance;
    }
}
export declare const Arrows: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
};
