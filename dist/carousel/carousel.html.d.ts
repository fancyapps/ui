import { type CarouselInstance } from "./carousel";
export type HtmlOptions = {
    /**
     * Attributes of an iframe element
     */
    iframeAttr: Record<string, string>;
};
export type HtmlInstance = ReturnType<typeof Html>;
declare module "./Carousel" {
    interface CarouselOptions {
        Html?: boolean | Partial<HtmlOptions>;
    }
    interface CarouselPlugins {
        Html: CarouselPlugin & HtmlInstance;
    }
    interface CarouselSlide {
        aspectRatio?: string;
        contentEl?: HTMLElement;
        height?: string | number;
        src?: "iframe" | "pdf" | "map" | string;
        type?: string;
        width?: string | number;
    }
}
export declare const Html: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
};
