import { type CarouselInstance } from "./carousel";
export type HtmlOptions = {
    /**
     * If resize the iframe element to match the dimensions of the iframe page content
     */
    autosize: boolean;
    /**
     * Attributes of an iframe element
     */
    iframeAttr: Record<string, string>;
    /**
     * If wait for iframe content to load before displaying
     */
    preload: boolean;
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
        autosize?: boolean;
        aspectRatio?: string;
        contentEl?: HTMLElement;
        height?: string | number;
        preload?: boolean | string;
        src?: string;
        type?: "iframe" | "pdf" | "map" | string;
        width?: string | number;
    }
}
export declare const Html: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
};
