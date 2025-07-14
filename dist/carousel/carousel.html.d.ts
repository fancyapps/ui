import { type CarouselInstance } from "./carousel";
export type HtmlOptions = {
    /**
     * Attributes of an iframe element
     */
    iframeAttr: Record<string, string>;
};
export type HtmlInstance = ReturnType<typeof Html>;
declare module "./carousel" {
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
        src?: string;
        type?: "iframe" | "pdf" | "map" | string;
        width?: string | number;
    }
}
export declare const Html: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
};
