import { CarouselInstance } from "./carousel";
export type FullscreenOptions = {
    /**
     * If the carousel should be set to full screen automatically after initialization
     */
    autoStart: boolean;
    /**
     * Toolbar button template
     */
    btnTpl: string;
    /**
     * Optional custom element to present in fullscreen mode
     */
    el?: HTMLElement | ((ref: CarouselInstance) => HTMLElement | undefined | null);
};
export type FullscreenInstance = ReturnType<typeof Fullscreen>;
declare module "./carousel" {
    interface CarouselOptions {
        Fullscreen?: boolean | Partial<FullscreenOptions>;
    }
    interface CarouselPlugins {
        Fullscreen: CarouselPlugin & FullscreenInstance;
    }
}
export declare const Fullscreen: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
    /**
     * Request that an element in this document that is currently displayed in fullscreen mode be removed from fullscreen mode
     */
    exit: () => Promise<void> | undefined;
    /**
     * Check if fullscreen mode is set
     */
    inFullscreen: () => boolean;
    /**
     * Ask the user agent to place the specified element into fullscreen mode
     */
    request: (el?: Element) => Promise<void> | undefined;
    /**
     * Set fullscreen mode or exit if already set
     */
    toggle: () => void;
};
