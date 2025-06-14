import { type FancyboxInstance, type Fancybox } from "./fancybox";
declare module "../Carousel/Carousel" {
    interface CarouselSlide {
        fancybox?: string;
        slug?: string;
    }
}
declare module "./Fancybox" {
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
