import { CarouselInstance } from "./carousel";
export type AutoscrollOptions = {
    /**
     * If Autoscroll should start automatically after Carousel initialization
     */
    autoStart: boolean;
    /**
     * Animation speed
     */
    speed: number;
    /**
     * Optional animation speed when user interacts with an element with a pointing device
     */
    speedOnHover?: number;
};
export type AutoscrollInstance = ReturnType<typeof Autoscroll>;
declare module "./carousel" {
    interface CarouselOptions {
        Autoscroll?: boolean | Partial<AutoscrollOptions>;
    }
    interface CarouselPlugins {
        Autoscroll: CarouselPlugin & AutoscrollInstance;
    }
    interface CarouselEventArgs {
        "autoscroll:start": [];
        "autoscroll:end": [];
    }
}
export declare const Autoscroll: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
    /**
     * Check if autoscroll is enabled
     */
    isEnabled(): boolean;
    /**
     * Pause autoscroll if active
     */
    pause: () => void;
    /**
     * Resume previously paused autoscroll
     */
    resume: () => void;
    /**
     * Start autoscroll
     */
    start: () => void;
    /**
     * Stop autoscroll
     */
    stop: () => void;
    /**
     * Stops the previously active autoscroll or starts a new one
     */
    toggle(): void;
};
