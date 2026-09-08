import { CarouselInstance } from "../carousel/index.js";
export type DotsOptions = {
    /**
     * HTML template for dot element
     */
    dotTpl: string;
    /**
     * From what number of slides to show "dynamic" dots
     */
    dynamicFrom: number | false;
    /**
     * Number of extra full sized dots
     */
    dynamicPadd: number;
    /**
     * The maximum number of pages at which to create dots
     */
    maxCount: number;
    /**
     * The minimum number of pages at which to create dots
     */
    minCount: number;
};
export type DotsInstance = ReturnType<typeof Dots>;
declare module "./carousel.js" {
    interface CarouselOptions {
        Dots?: boolean | Partial<DotsOptions>;
    }
    interface CarouselPlugins {
        Dots: CarouselPlugin & DotsInstance;
    }
}
export declare const Dots: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
};
