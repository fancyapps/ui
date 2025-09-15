import { GesturesEventObject } from "../libs/gestures";
import { type PanzoomOptions, type PanzoomInstance, type PanzoomRenderInfo, PanzoomAction } from "../panzoom/panzoom";
import { type CarouselInstance, type CarouselSlide } from "./carousel";
export type ZoomableInstance = ReturnType<typeof Zoomable>;
declare module "./carousel" {
    interface CarouselEventArgs {
        "panzoom:init": [CarouselSlide];
        "panzoom:initPlugins": [CarouselSlide];
        "panzoom:initLayout": [CarouselSlide];
        "panzoom:touchStart": [CarouselSlide, GesturesEventObject];
        "panzoom:touchEnd": [CarouselSlide, GesturesEventObject];
        "panzoom:click": [CarouselSlide, GesturesEventObject];
        "panzoom:dblClick": [CarouselSlide, GesturesEventObject];
        "panzoom:wheel": [CarouselSlide, WheelEvent, Number];
        "panzoom:action": [CarouselSlide, PanzoomAction];
        "panzoom:render": [CarouselSlide, PanzoomRenderInfo];
        "panzoom:animationStart": [CarouselSlide];
        "panzoom:animationEnd": [CarouselSlide];
    }
    interface CarouselOptions {
        Zoomable?: false | Partial<ZoomableOptions>;
    }
    interface CarouselPlugins {
        Zoomable: CarouselPlugin & ZoomableInstance;
    }
    interface CarouselSlide {
        alt?: string;
        srcset?: string;
        sizes?: string;
        lazySrc?: string;
        lazySrcset?: string;
        lazySizes?: string;
        panzoomRef?: PanzoomInstance;
        type?: "html" | "image" | string;
    }
}
export type ZoomableOptions = {
    /**
     * Optional custom Panzoom options
     */
    Panzoom?: Partial<PanzoomOptions>;
    /**
     *  HTML template for carousel slide content containing an image
     */
    tpl: string | ((slide: CarouselSlide) => string);
};
export declare const Zoomable: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
    /**
     * Execute a Panzoom action on the current slide
     */
    execute: (action: PanzoomAction, ...args: any[]) => void;
};
