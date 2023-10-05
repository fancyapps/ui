import { Plugin } from "../../../shared/Base/Plugin";
import type { Carousel } from "../../Carousel";
import { OptionsType as CarouselOptionsType } from "../../options";
export type ThumbsOptionsType = {
    /**
     * Customize carousel options
     */
    Carousel?: Partial<CarouselOptionsType>;
    /**
     * Class names for DOM elements
     */
    classes: {
        container?: string;
        viewport?: string;
        track?: string;
        slide?: string;
        isResting?: string;
        isSelected?: string;
        isLoading?: string;
        hasThumbs?: string;
    };
    /**
     * Minimum number of slides with thumbnails in the carousel to create Thumbs
     */
    minCount: number;
    /**
     * Optional event listeners
     */
    on?: Record<"ready", (...any: any) => void>;
    /**
     * Change where thumbnail container is appended
     */
    parentEl?: HTMLElement | null | (() => HTMLElement | null);
    /**
     * Template for the thumbnail element
     */
    thumbTpl: string;
    /**
     * Choose a type - "classic" (syncs two instances of the carousel) or "modern" (Apple Photos style)
     */
    type: "classic" | "modern";
};
export declare const defaultOptions: ThumbsOptionsType;
declare module "../../../Carousel/options" {
    interface PluginsOptionsType {
        Thumbs: Boolean | Partial<ThumbsOptionsType>;
    }
}
declare module "../../../Carousel/types" {
    interface slideType {
        thumbSrc?: string;
        thumbClipWidth?: number;
        thumbWidth?: number;
        thumbHeight?: number;
        thumbSlideEl?: HTMLElement;
    }
}
export declare enum States {
    Init = 0,
    Ready = 1,
    Hidden = 2
}
export declare class Thumbs extends Plugin<Carousel, ThumbsOptionsType, "ready" | "createSlide"> {
    static defaults: ThumbsOptionsType;
    type: "modern" | "classic";
    container: HTMLElement | null;
    track: HTMLElement | null;
    private carousel;
    private panzoom;
    private thumbWidth;
    private thumbClipWidth;
    private thumbHeight;
    private thumbGap;
    private thumbExtraGap;
    private shouldCenter;
    state: States;
    private formatThumb;
    private getSlides;
    private onInitSlide;
    private onInitSlides;
    private onRefreshM;
    private onChangeM;
    private onClickModern;
    private onTransformM;
    private buildClassic;
    private buildModern;
    private updateModern;
    private refreshModern;
    private centerModern;
    private lazyLoadModern;
    private resizeModernSlide;
    private getModernThumbPos;
    isDisabled(): Boolean;
    build(): void;
    cleanup(): void;
    attach(): void;
    detach(): void;
}
