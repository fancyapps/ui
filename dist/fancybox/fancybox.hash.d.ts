import { type FancyboxInstance, type Fancybox } from "./fancybox";
declare module "../carousel/carousel" {
    interface CarouselSlide {
        fancybox?: string;
        slug?: string;
    }
}
declare module "./fancybox" {
    interface FancyboxOptions {
        Hash?: false | {
            slug?: string;
        };
    }
}
export declare const Hash: {
    (): {
        init: (fancybox: FancyboxInstance) => void;
        destroy: () => void;
    };
    getInfoFromURL: () => {
        urlHash: string;
        urlSlug: string;
        urlIndex: number;
    };
    startFromUrl: () => void;
    setup(_f: typeof Fancybox): void;
};
