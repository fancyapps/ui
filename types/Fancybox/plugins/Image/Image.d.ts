import { Plugin } from "../../../shared/Base/Plugin";
import { Panzoom } from "../../../Panzoom/Panzoom";
import { OptionsType as PanzoomOptionsType } from "../../../Panzoom/options";
import { Carousel } from "../../../Carousel/Carousel";
import { slideType } from "../../../Carousel/types";
import { Fancybox } from "../../Fancybox";
export type OptionsType = {
    /**
     * Initial image zoom level, see Panzoom documentation for more information.
     */
    initialSize: "fit" | "cover" | "full" | "max";
    /**
     * Custom options for Panzoom instance, see Panzoom documentation for more information.
     */
    Panzoom: Partial<PanzoomOptionsType>;
    /**
     * If the image download needs to be prevented
     */
    protected: boolean;
    zoomOnStart: boolean;
    zoomOpacity: "auto" | boolean;
};
export declare const defaultOptions: OptionsType;
declare module "../../../Carousel/types" {
    interface slideType {
        Panzoom?: Panzoom;
        imageEl?: HTMLImageElement | null;
    }
}
declare module "../../../Fancybox/options" {
    interface PluginsOptionsType {
        Image: Boolean | Partial<ImageOptionsType>;
    }
}
export type ImageOptionsType = Partial<OptionsType>;
export declare class Image extends Plugin<Fancybox, ImageOptionsType, ""> {
    static defaults: OptionsType;
    onCreateSlide(fancybox: Fancybox, _carousel: Carousel, slide: slideType): void;
    getZoomInfo(slide: slideType): false | {
        x: number;
        y: number;
        scale: number;
        opacity: boolean;
    };
    zoomIn(slide: slideType): boolean;
    onChange(fancybox: Fancybox, carousel: Carousel): void;
    onClose(): void;
    onRemoveSlide(_fancybox: Fancybox, _carousel: Carousel, slide: slideType): void;
    attach(): void;
    detach(): void;
}
