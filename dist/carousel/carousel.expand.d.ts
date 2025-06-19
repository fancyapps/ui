import { CarouselInstance } from "./carousel";
export type ExpandOptions = {
    /**
     * Toolbar button template
     */
    btnTpl: string;
    /**
     * Optional element for which the CSS class will be managed
     */
    el?: HTMLElement | ((ref: CarouselInstance) => HTMLElement | undefined | null);
};
export type ExpandInstance = ReturnType<typeof Expand>;
declare module "./carousel" {
    interface CarouselOptions {
        Expand?: boolean | Partial<ExpandOptions>;
    }
    interface CarouselPlugins {
        Expand: CarouselPlugin & ExpandInstance;
    }
}
export declare const Expand: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
    /**
     * Set expanded state or exit if already expanded
     */
    toggle: () => void;
};
