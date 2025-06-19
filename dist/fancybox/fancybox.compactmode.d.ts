import { type FancyboxInstance } from "./fancybox";
export type CompactmodeOptions = {
    /**
     * A string specifying the media query to watch
     */
    mediaQuery: string;
};
export type CompactmodeInstance = ReturnType<typeof Compactmode>;
declare module "./fancybox" {
    interface FancyboxOptions {
        Compactmode?: boolean | Partial<CompactmodeOptions>;
    }
    interface FancyboxPlugins {
        Compactmode: FancyboxPlugin & CompactmodeInstance;
    }
}
export declare const Compactmode: () => {
    init: (fancybox: FancyboxInstance) => void;
    destroy: () => void;
    /**
     * Check if compact mode is enabled
     */
    isEnabled: () => boolean;
};
