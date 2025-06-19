import { CarouselInstance } from "./carousel";
export type SyncOptions = {
    /**
     * Synchronize when the instance's active page changes
     */
    syncOnChange: boolean;
    /**
     * Synchronize when user clicks on instance slide
     */
    syncOnClick: boolean;
    /**
     * Synchronize when the user hovers over the instance slide
     */
    syncOnHover: boolean;
    /**
     * An instance of a carousel acting as target
     */
    target?: CarouselInstance;
};
export type SyncInstance = ReturnType<typeof Sync>;
declare module "./carousel" {
    interface CarouselOptions {
        Sync?: boolean | Partial<SyncOptions>;
    }
    interface CarouselPlugins {
        Sync: CarouselPlugin & SyncInstance;
    }
}
export declare const Sync: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
    /**
     * Retrieve target instance
     */
    getTarget: () => CarouselInstance | undefined;
};
