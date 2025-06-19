import { type FancyboxInstance, type Fancybox } from "./fancybox";
declare module "../carousel/carousel" {
    interface CarouselSlide {
        fancybox?: string;
        slug?: string;
    }
}
declare module "./fancybox" {
    interface FancyboxOptions {
        Hash?: false;
    }
}
export declare const Hash: {
    (): {
        init: (fancybox: FancyboxInstance) => void;
        destroy: () => void;
    };
    startFromUrl: () => void;
    setup(_f: typeof Fancybox): void;
};
