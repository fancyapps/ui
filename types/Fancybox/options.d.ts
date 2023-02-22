import { Events } from "./types";
import { Fancybox } from "./Fancybox";
import { slideType } from "../Carousel/types";
import { OptionsType as CarouselOptionsType } from "../Carousel/options";
import { ClickAction as PanzoomClickAction } from "../Panzoom/types";
export interface PluginsOptionsType {
}
export type ClickAction = PanzoomClickAction | "close" | "next" | "prev";
export type keyboardAction = "close" | "next" | "prev";
export type keyboardType = {
    Escape: keyboardAction;
    Delete: keyboardAction;
    Backspace: keyboardAction;
    PageUp: keyboardAction;
    PageDown: keyboardAction;
    ArrowUp: keyboardAction;
    ArrowDown: keyboardAction;
    ArrowRight: keyboardAction;
    ArrowLeft: keyboardAction;
};
export interface ComponentOptionsType {
    /**
     * Should backdrop and UI elements fade in/out on start/close
     */
    animated: boolean;
    /**
     * Set focus on first focusable element after displaying content
     */
    autoFocus: boolean;
    /**
     * Optional object to extend options for main Carousel
     */
    Carousel: Partial<CarouselOptionsType>;
    /**
     * If true, a close button will be created above the content
     */
    closeButton: "auto" | boolean;
    /**
     * If true, only one caption element will be used for all slides
     */
    commonCaption: boolean;
    /**
     * If compact mode needs to be activated
     */
    compact: boolean | ((instance: Fancybox) => boolean);
    /**
     * Default content type
     */
    defaultType: "image" | "iframe" | "video" | "inline" | "html";
    /**
     * The default value of the CSS `display` property for hidden inline elements
     */
    defaultDisplay: "block" | "flex" | string;
    /**
     * Enable drag-to-close gesture - drag content up/down to close instance
     */
    dragToClose: boolean;
    /**
     * If Fancybox should start in full-scren mode
     */
    Fullscreen: {
        autoStart: boolean;
    };
    /**
     * If true, all matching elements will be grouped together in one group
     */
    groupAll: boolean;
    /**
     * The name of the attribute used for grouping
     */
    groupAttr: string;
    /**
     * Custom `id` for the instance
     */
    id?: number | string;
    /**
     * Timeout in milliseconds after which to activate idle mode
     */
    idle: number | false;
    /**
     * Element where container is appended
     * Note. If no element is specified, container is appended to the `document.body`
     */
    parentEl?: HTMLElement | null;
    /**
     * Index of active slide on the start
     */
    startIndex: number;
    /**
     * If browser scrollbar should be hidden
     */
    hideScrollbar: boolean;
    /**
     * Class name to be applied to the content to reveal it.
     * Note: If you disable image zoom, this class name will be used to run the image reveal animation.
     */
    showClass: string | false;
    /**
     * Class name to be applied to the content to hide it.
     * Note: If you disable image zoom, this class name will be used to run the image hide animation.
     */
    hideClass: string | false;
    src?: string | HTMLElement | ((instance: Fancybox, slide: slideType) => string | HTMLElement);
    caption?: string | ((instance: Fancybox, slide: slideType, caption?: string) => string);
    width?: "auto" | number | ((instance: Fancybox, slide: slideType) => "auto" | number);
    height?: "auto" | number | ((instance: Fancybox, slide: slideType) => "auto" | number);
    contentClick: ClickAction | ((any?: any) => ClickAction | void);
    contentDblClick: ClickAction | ((any?: any) => ClickAction | void);
    backdropClick: ClickAction | ((any?: any) => ClickAction | void);
    on?: Partial<Events>;
    l10n?: Record<string, string>;
    tpl: {
        closeButton: string;
        main: string;
    };
    /**
     *  Trap focus inside Fancybox
     */
    trapFocus: boolean;
    /**
     * Set focus back to trigger element after closing Fancybox
     */
    placeFocusBack: boolean;
    /**
     * Keyboard events
     */
    keyboard: keyboardType;
    /**
     * Mouse wheel event listener
     */
    wheel: "zoom" | "pan" | "close" | "slide" | false | ((instance: Fancybox, event: MouseEvent) => "zoom" | "pan" | "close" | "slide" | false);
    event?: MouseEvent | undefined;
    trigger?: HTMLElement | null;
    delegate?: HTMLElement | null;
}
export declare const defaultOptions: ComponentOptionsType;
export type OptionsType = PluginsOptionsType & ComponentOptionsType;
