import "../panzoom/panzoom";
export * from "../panzoom/panzoom";
import { Carousel, CarouselOptions, CarouselEventArgs, CarouselSlide, CarouselInstance } from "../carousel/carousel";
import "./fancybox.hash";
export * from "../carousel/carousel";
export * from "../carousel/carousel.zoomable";
export * from "../carousel/carousel.sync";
export * from "../carousel/carousel.lazyload";
export * from "../carousel/carousel.arrows";
export * from "../carousel/carousel.toolbar";
export * from "../carousel/carousel.autoplay";
export * from "../carousel/carousel.thumbs";
export * from "../carousel/carousel.html";
export * from "../carousel/carousel.video";
export * from "../carousel/carousel.fullscreen";
declare module "../carousel/carousel" {
    interface CarouselSlide {
        src?: string;
        type?: "inline" | "clone" | "ajax" | string;
        triggerEl?: HTMLElement | undefined;
        delegateEl?: HTMLElement | undefined;
        closeButtonEl?: HTMLElement | undefined;
        placeholderEl?: HTMLElement | undefined;
        thumb?: string | HTMLImageElement;
        thumbEl?: HTMLImageElement;
        xhr?: XMLHttpRequest;
        filter?: string;
    }
}
export declare enum FancyboxState {
    Init = 0,
    Ready = 1,
    Closing = 2,
    Destroyed = 3
}
type FancyboxKeyboardAction = "close" | "next" | "prev";
type FancyboxKeyboardType = {
    Escape: FancyboxKeyboardAction;
    Delete: FancyboxKeyboardAction;
    Backspace: FancyboxKeyboardAction;
    PageUp: FancyboxKeyboardAction;
    PageDown: FancyboxKeyboardAction;
    ArrowUp: FancyboxKeyboardAction;
    ArrowDown: FancyboxKeyboardAction;
    ArrowRight: FancyboxKeyboardAction;
    ArrowLeft: FancyboxKeyboardAction;
};
type PrefixedCarouselEventArgs = {
    [K in keyof CarouselEventArgs as `Carousel.${K}`]: [
        CarouselInstance,
        ...CarouselEventArgs[K]
    ];
};
export interface FancyboxEventArgs extends PrefixedCarouselEventArgs {
    /**
     * Any event
     */
    "*": [string, ...any];
    /**
     *  User clicks on the backdrop element
     */
    backdropClick: [MouseEvent | TouchEvent];
    /**
     * Initialization has started
     */
    init: [];
    /**
     * Plugins have been initialized
     */
    initPlugins: [];
    /**
     * Slides have been initialized
     */
    initSlides: [Partial<CarouselSlide>[]];
    /**
     * Layout has been initialized
     */
    initLayout: [];
    /**
     * Carousel has been initialized
     */
    initCarousel: [CarouselInstance];
    /**
     * Initialization has been completed
     */
    ready: [];
    /**
     * A keyboard button is pressed
     */
    keydown: [KeyboardEvent];
    /**
     * A wheel event is detected
     */
    wheel: [WheelEvent, number];
    /**
     * Closing has begun and can be prevented
     */
    shouldClose: [Event, Event?];
    /**
     * Closing is ongoing
     */
    close: [Event | undefined];
    /**
     * Instance is detroyed
     */
    destroy: [];
}
type FancyboxEvents = {
    [key in keyof FancyboxEventArgs]: (api: FancyboxInstance, ...args: FancyboxEventArgs[key]) => void;
};
export interface FancyboxOptions {
    ajax: Document | XMLHttpRequestBodyInit | null;
    /**
     * The action to perform when the user clicks on the backdrop
     */
    backdropClick: "close" | false;
    /**
     * Optional object to extend options for main Carousel
     */
    Carousel: Partial<CarouselOptions>;
    /**
     * If true, a close button will be created above the content
     */
    closeButton: "auto" | boolean;
    /**
     * If true, previously opened instance will be closed
     */
    closeExisting: boolean;
    /**
     * Element that acts as "delegate" element
     */
    delegateEl: HTMLElement | undefined;
    /**
     * Enable drag-to-close gesture - drag content up/down to close instance
     */
    dragToClose: boolean;
    /**
     * Enable fade animation for interface elements when opening/closing
     */
    fadeEffect: boolean;
    /**
     * If true, all matching elements will be grouped together in one group regardless of the value of `data-fancybox` attribute
     */
    groupAll: boolean;
    /**
     * The name of the attribute used for grouping
     */
    groupAttr: false | string;
    /**
     * Class name to be applied to the content to hide it.
     * Note: If you disable `zoomEffect`, this class name will be used to run the image hide animation.
     */
    hideClass: string | false | ((instance: FancyboxInstance, slide: CarouselSlide) => string | false);
    /**
     * If browser scrollbar should be hidden
     */
    hideScrollbar: boolean;
    /**
     * Custom `id` for the instance
     */
    id: number | string | undefined | (() => number | string | undefined);
    /**
     * Timeout in milliseconds after which to activate idle mode
     */
    idle: false | number;
    /**
     * Keyboard events
     */
    keyboard: FancyboxKeyboardType;
    /**
     * Localization of strings
     */
    l10n: Record<string, string>;
    /**
     * Custom class name for the main container
     */
    mainClass: string;
    /**
     * Custom style attributes for the main container
     */
    mainStyle: Record<string, string>;
    /**
     *  HTML template for Fancybox main structure
     */
    mainTpl: string | (() => string);
    /**
     * Event listeners
     */
    on: Partial<FancyboxEvents>;
    /**
     * Element where container is appended
     * Note. If no element is specified, container is appended to the `document.body`
     */
    parentEl: HTMLElement | undefined | (() => HTMLElement | undefined);
    /**
     * After closing Fancybox, set the focus back to the trigger element of the active slide
     */
    placeFocusBack: boolean;
    /**
     * Optional user plugins
     */
    plugins?: Record<string, FancyboxPlugin>;
    /**
     * Class name to be applied to the content to reveal it.
     * Note: If you disable `zoomEffect`, this class name will be used to run the image reveal animation.
     */
    showClass: string | false | ((instance: FancyboxInstance, slide: CarouselSlide) => string | false);
    /**
     * Index of active slide on the start
     */
    startIndex: number;
    /**
     * Reference to the carousel to sync with
     */
    sync: CarouselInstance | undefined;
    /**
     * Use dark, light color scheme or set based on user preference
     */
    theme: "dark" | "light" | "auto";
    /**
     * Element that acts as "trigger" element
     */
    triggerEl: HTMLElement | undefined;
    /**
     * Event that triggered the Fancybox (usually click the event on the trigger element)
     */
    triggerEvent: MouseEvent | undefined;
    /**
     * Optional action to take when a wheel event is detected
     */
    wheel?: "slide" | "close";
    /**
     * Enable zoom animation from the thumbnail to the final image when opening the Fancybox
     */
    zoomEffect: boolean;
}
export type FancyboxPlugin = () => {
    init: (api: FancyboxInstance) => void;
    destroy: () => void;
};
export interface FancyboxPlugins extends Record<string, ReturnType<FancyboxPlugin>> {
}
export type FancyboxInstance = ReturnType<typeof CreateInstance>;
declare const CreateInstance: () => {
    /**
     * Initiate closing
     */
    close: (ev?: Event, customHideClass?: string) => void;
    /**
     * Destroy the instance
     */
    destroy: () => void;
    /**
     * Retrieve reference to the carousel instance
     */
    getCarousel: () => CarouselInstance | undefined;
    /**
     * Retrieve reference to the instance's main element
     */
    getContainer: () => HTMLElement;
    /**
     * Retrieve instance ID
     */
    getId: () => string | number;
    /**
     * Retrieve reference to an instance options object
     */
    getOptions: () => FancyboxOptions;
    /**
     * Retrieve an object containing instance plugin references
     */
    getPlugins: () => Partial<FancyboxPlugins>;
    /**
     * Retrieve current carousel slide
     */
    getSlide: () => CarouselSlide | undefined;
    /**
     * Retrieve current instance state
     */
    getState: () => FancyboxState;
    /**
     * Run instance initialization
     */
    init: (slides?: Partial<CarouselSlide>[], options?: Partial<FancyboxOptions>) => FancyboxInstance;
    /**
     * Check if the given slide is the current slide in the carousel
     */
    isCurrentSlide: (slide: CarouselSlide) => boolean;
    /**
     * Check if there is another instance on top of this one
     */
    isTopMost: () => boolean;
    /**
     * Unsubscribe from specific event
     */
    off: <FancyboxEvent extends keyof FancyboxEventArgs>(event: FancyboxEvent, callback: (api: any, ...args: FancyboxEventArgs[FancyboxEvent]) => void) => FancyboxInstance;
    /**
     * Subscribe to specific event
     */
    on: <FancyboxEvent extends keyof FancyboxEventArgs>(event: FancyboxEvent, callback: (...args: [any, ...FancyboxEventArgs[FancyboxEvent]]) => void) => FancyboxInstance;
    /**
     * Toggle idle state
     */
    toggleIdle(force?: boolean): void;
};
/**
 * Add a click handler that launches Fancybox after clicking on items that match the provided selector
 */
declare function bind(selector?: string, userOptions?: Partial<FancyboxOptions>): void;
/**
 * Add a click handler to the given container that launches Fancybox after clicking items that match the provided selector
 */
declare function bind(container: HTMLElement | null, selector: string, userOptions?: Partial<FancyboxOptions>): void;
/**
 * Remove selector from the list of selectors that triggers Fancybox
 */
declare function unbind(selector: string): void;
/**
 * Remove all or one selector from the list of selectors that triggers Fancybox for the given container
 */
declare function unbind(container: HTMLElement | null, selector?: string): void;
/**
 * Start Fancybox using the previously assigned selector
 */
declare function fromSelector(selector: string, options?: Partial<FancyboxOptions>): FancyboxInstance | undefined;
/**
 * Start Fancybox using the previously assigned selector for the given container
 */
declare function fromSelector(container: HTMLElement | null, selector: string, options?: Partial<FancyboxOptions>): FancyboxInstance | undefined;
/**
 * Start Fancybox using click event
 */
declare function fromEvent(event: MouseEvent): FancyboxInstance | undefined;
/**
 * Start Fancybox using HTML elements
 */
declare function fromNodes(nodes: Array<HTMLElement>, options?: Partial<FancyboxOptions>): FancyboxInstance | undefined;
declare const Fancybox: {
    Plugins: {
        Hash: {
            (): {
                init: (fancybox: FancyboxInstance) => void;
                destroy: () => void;
            };
            startFromUrl: () => void;
            setup(_f: typeof Fancybox): void;
        };
    };
    version: string;
    /**
     * A collection of all elements that have a click event assigned and the corresponding options.
     */
    openers: Map<HTMLElement, Map<string, Partial<FancyboxOptions>>>;
    /**
     * Add a click handler that launches Fancybox after clicking on items that match the provided selector
     */
    bind: typeof bind;
    /**
     * Close all or topmost currently active instance
     */
    close: (all?: boolean, ...args: any) => void;
    /**
     * Immediately destroy all instances (without closing animation) and clean up
     */
    destroy: () => void;
    /**
     * Start Fancybox using click event
     */
    fromEvent: typeof fromEvent;
    /**
     * Start Fancybox using HTML elements
     */
    fromNodes: typeof fromNodes;
    /**
     * Start Fancybox using the previously assigned selector
     */
    fromSelector: typeof fromSelector;
    /**
     * Retrieve reference to the current carousel of the highest active Fancybox instance
     */
    getCarousel: () => CarouselInstance | undefined;
    /**
     * Retrieve reference to the object containing the Fancybox default options
     */
    getDefaults: () => FancyboxOptions;
    /**
     * Retrieve instance by identifier or the top most instance, if identifier is not provided
     */
    getInstance: (id?: number | string) => FancyboxInstance | undefined;
    /**
     * Retrieve reference to the current slide of the highest active Fancybox instance
     */
    getSlide: () => CarouselSlide | undefined;
    /**
     * Create new Fancybox instance with provided options
     */
    show: (slides?: Partial<CarouselSlide>[], options?: Partial<FancyboxOptions>) => FancyboxInstance;
    /**
     * Remove selector from the list of selectors that triggers Fancybox
     */
    unbind: typeof unbind;
};
export { Carousel, Fancybox };
