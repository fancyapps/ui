import { CarouselInstance } from "./carousel";
export type ArrowsOptions = {
    /**
     * HTML template for left arrow
     */
    prevTpl: string;
    /**
     * HTML template for right arrow
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
