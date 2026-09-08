import { type FancyboxInstance, type Fancybox } from "./fancybox.js";
declare module "../carousel/carousel.js" {
    interface CarouselSlide {
        fancybox?: string;
        slug?: string;
    }
}
declare module "./fancybox.js" {
    interface FancyboxOptions {
        Hash?: false | {
            slug?: string;
        };
    }
}
declare const getInfoFromURL: () => {
    urlHash: string;
    urlSlug: string;
    urlIndex: number;
};
declare const startFromUrl: () => void;
export declare function Hash(): {
    init: (fancybox: FancyboxInstance) => void;
    destroy: () => void;
};
export declare namespace Hash {
    export { getInfoFromURL };
    export { startFromUrl };
    export var setup: (_f: typeof Fancybox) => void;
}
export {};
