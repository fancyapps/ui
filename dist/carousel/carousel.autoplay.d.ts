import { CarouselInstance } from "../carousel";
export type AutoplayOptions = {
    /**
     * If Autoplay should start automatically after Carousel initialization
     */
    autoStart: boolean;
    /**
     * If autoplay should pause when the user hovers over the container
     */
    pauseOnHover: boolean;
    /**
     * Optional custom element where progress bar is appended
     */
    progressbarParentEl?: HTMLElement | null | ((instance: CarouselInstance) => HTMLElement | null | undefined);
    /**
     * If element should be created to display the autoplay progress
     */
    showProgressbar: boolean;
    /**
     * Delay (in milliseconds) before the slide change
     */
    timeout: number;
};
export type AutoplayInstance = ReturnType<typeof Autoplay>;
declare module "./carousel" {
    interface CarouselOptions {
        Autoplay?: boolean | Partial<AutoplayOptions>;
    }
    interface CarouselPlugins {
        Autoplay: CarouselPlugin & AutoplayInstance;
    }
    interface CarouselEventArgs {
        "autoplay:start": [number];
        "autoplay:end": [];
    }
}
export declare const Autoplay: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
    /**
     * Check if autoplay is enabled
     */
    isEnabled(): boolean;
    /**
     * Pause autoplay if active
     */
    pause: () => void;
    /**
     * Resume previously paused autoplay
     */
    resume: () => void;
    /**
     * Start autoplay
     */
    start(): void;
    /**
     * Stop autoplay
     */
    stop(): void;
    /**
     * Stops the previously active autoplay or starts a new one
     */
    toggle(): void;
};
