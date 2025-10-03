import { TweenInstance } from "../libs/tween";
import { GesturesInstance, GesturesOptions } from "../libs/gestures";
export type CarouselInstance = ReturnType<typeof Carousel>;
export declare const enum CarouselState {
    Init = 0,
    Ready = 1,
    Destroyed = 2
}
export declare const enum CarouselSlideContentState {
    Loading = 0,
    Loaded = 1,
    Error = 2
}
export interface CarouselSlide {
    /**
     * DOM element of the slide
     */
    el?: HTMLElement | undefined;
    /**
     * HTML content for the virtual slide
     */
    html?: HTMLElement | string;
    /**
     * Custom class name for the slide DOM element
     */
    class?: string;
    /**
     * Slide sequence number in the carousel
     */
    index: number;
    /**
     * If this is virtual slide
     */
    isVirtual: boolean;
    /**
     * Width or height (for vertical carousel) of the slide
     */
    dim: number;
    /**
     * Position relative to the start of the first slide
     */
    offset: number;
    /**
     * Position relative to the carousel position
     */
    pos: number;
    /**
     * Content loading status
     */
    state?: CarouselSlideContentState;
    /**
     * HTML content for the caption
     */
    caption?: HTMLElement | string;
    /**
     * DOM element of the caption
     */
    captionEl?: HTMLElement;
    /**
     * DOM element of the HTML content of the virtual slide
     */
    htmlEl?: HTMLElement;
    /**
     * DOM element of the error message
     */
    errorEl?: HTMLElement;
    /**
     * Optional slide source file name for download
     */
    downloadFilename?: string;
    /**
     * Optional slide source
     */
    downloadSrc?: string;
    /**
     * Slide content source
     */
    src?: string;
    /**
     * Slide content type
     */
    type?: string;
    /**
     * Optional source for the image 'alt' attribute
     */
    alt?: string;
}
type CarouselTransitionType = "tween" | "fade" | "slide" | "crossfade" | Omit<string, "tween" | "fade" | "slide" | "crossfade"> | false;
type CarouselPage = {
    index: number;
    slides: CarouselSlide[];
    dim: number;
    offset: number;
    pos: number;
};
type CarouselTweenOptions = {
    friction: number;
    tension: number;
    velocity: number;
    clamp: boolean;
    mass: number;
    restDelta: number;
    restSpeed: number;
};
type CarouselGoToArgs = {
    tween?: boolean | Partial<CarouselTweenOptions>;
    transition?: CarouselTransitionType;
};
export interface CarouselEventArgs {
    /**
     * Initialization has started
     */
    "*": [string, ...any];
    /**
     * slide object is processed and added to the collection
     */
    addSlide: [CarouselSlide];
    /**
     * The element corresponding to the slide is added to the DOM
     */
    attachSlideEl: [CarouselSlide];
    /**
     * Active page of the carousel is changed
     */
    change: [number, number | undefined];
    /**
     * Click event has been detected
     */
    click: [MouseEvent | TouchEvent];
    /**
     * Content is loaded on one of the slides
     */
    contentReady: [CarouselSlide];
    /**
     * New slide object is created
     */
    createSlide: [CarouselSlide];
    /**
     * Instance is detroyed
     */
    destroy: [];
    /**
     * The element corresponding to the slide is removed from the DOM
     */
    detachSlideEl: [CarouselSlide];
    /**
     * Slides have been filtered
     */
    filter: [string];
    /**
     * Initialization has started
     */
    init: [];
    /**
     * Layout is initialized
     */
    initLayout: [];
    /**
     * Plugins are initialized
     */
    initPlugins: [];
    /**
     * All slides are initialized
     */
    initSlides: [];
    /**
     * Carousel has successfully launched
     */
    ready: [];
    /**
     * Carousel metrics have been updated
     */
    refresh: [];
    /**
     * Slide object is removed
     */
    removeSlide: [CarouselSlide];
    /**
     *  Slide DOM elements are placed in viewport
     */
    render: [CarouselSlide[]];
    /**
     * The slide change animation has finished
     */
    settle: [];
}
type CarouselEvents = {
    [key in keyof CarouselEventArgs]: (api: CarouselInstance, ...args: CarouselEventArgs[key]) => void;
};
interface CarouselClasses {
    container: string;
    isEnabled: string;
    isLTR: string;
    isRTL: string;
    isHorizontal: string;
    isVertical: string;
    hasAdaptiveHeight: string;
    viewport: string;
    slide: string;
    isSelected: string;
}
export interface CarouselOptions {
    /**
     * If true, Carousel will adjust its height to the height of the first child in the currently active slide(s)
     */
    adaptiveHeight: boolean | ((ref: CarouselInstance) => boolean);
    /**
     * Optional options that will be applied for the given breakpoint, overriding the base options
     */
    breakpoints?: Record<string, Omit<Partial<CarouselOptions>, "breakpoints">>;
    /**
     * Optional element where the caption content is placed
     */
    captionEl?: HTMLElement | null | ((api: CarouselInstance) => HTMLElement | null);
    /**
     * If true, Carousel will center the active page
     */
    center: boolean | ((ref: CarouselInstance) => boolean);
    /**
     * Class names for DOM elements
     */
    classes: Partial<CarouselClasses>;
    /**
     * If true, the Carousel will settle at any position after a swipe
     */
    dragFree: boolean | ((ref: CarouselInstance) => boolean);
    /**
     * Carousel is enabled or not; useful when combining with breakpoints
     */
    enabled: boolean;
    /**
     *  HTML template for error message
     */
    errorTpl: string | ((ref: CarouselInstance, slide: Partial<CarouselSlide>) => string);
    /**
     * If true, the Carousel will fill the free space if `infinite: false`
     */
    fill: boolean | ((ref: CarouselInstance) => boolean);
    /**
     * Optional function to customize captions per slide
     */
    formatCaption?: (ref: CarouselInstance, slide: CarouselSlide) => HTMLElement | string;
    /**
     * Optional options for Gestures instance
     */
    gestures?: Partial<GesturesOptions> | false | ((ref: CarouselInstance) => Partial<GesturesOptions> | true | false);
    /**
     * If true, the Carousel will scroll infinitely
     */
    infinite: boolean | ((ref: CarouselInstance) => boolean);
    /**
     * Index of initial page
     */
    initialPage: number;
    /**
     * Optional index of initial slide
     */
    initialSlide?: number;
    /**
     * Optional localization of strings
     */
    l10n?: Record<string, string>;
    /**
     * Optional event listeners
     */
    on?: Partial<CarouselEvents>;
    /**
     * Optional user plugins
     */
    plugins?: Record<string, CarouselPlugin>;
    /**
     * If true, content direction will be set to RTL
     */
    rtl: boolean | ((ref: CarouselInstance) => boolean);
    /**
     * Optional function to customize how each slide position is set in the rendering
     */
    setTransform?: (ref: CarouselInstance, slide: CarouselSlide, state: {
        x: number;
        y: number;
        xPercent: number;
        yPercent: number;
    }) => void;
    /**
     * Virtual slides
     */
    slides: Partial<CarouselSlide>[];
    /**
     * The number of slides to group per page
     */
    slidesPerPage: "auto" | number | ((ref: CarouselInstance) => "auto" | number);
    /**
     *  HTML template for spinner element
     */
    spinnerTpl: string;
    /**
     * Optional custom style attributes for the container
     */
    style?: Record<string, string>;
    /**
     * The name of the transition animation when changing Carousel pages
     */
    transition: CarouselTransitionType;
    /**
     * Custom Tween options that are taken into account if the `transition` is set to `tween`
     */
    tween: Partial<CarouselTweenOptions>;
    /**
     * If true, carousel will navigate vertically
     */
    vertical: boolean | ((ref: CarouselInstance) => boolean);
}
export type CarouselPlugin = () => {
    init: (carouselRef: CarouselInstance, carousel: typeof Carousel) => void;
    destroy: () => void;
};
export type CarouselPluginInstance = ReturnType<CarouselPlugin>;
export interface CarouselPlugins extends Record<string, CarouselPluginInstance> {
}
export declare const Carousel: {
    (userContainerEl: HTMLElement | null, userOptions?: Partial<CarouselOptions>, userPlugins?: Record<string, CarouselPlugin>): {
        /**
         * Add one or multiple virtual slides
         */
        add: (oneOrMoreSlides: Partial<CarouselSlide> | Partial<CarouselSlide>[], position?: number) => CarouselInstance;
        /**
         * Check if carousel can slide to the previous page
         */
        canGoPrev: () => boolean;
        /**
         * Check if carousel can slide to the next page
         */
        canGoNext: () => boolean;
        /**
         * Destroy instance and clean up
         */
        destroy: () => CarouselInstance;
        /**
         * Emit event to listeners
         */
        emit: <CarouselEvent extends keyof CarouselEventArgs>(event: CarouselEvent, ...args: CarouselEventArgs[CarouselEvent]) => void;
        /**
         * Filter slides using the selector
         */
        filter: (selector?: string) => CarouselInstance;
        /**
         * Get reference to the container DOM element
         */
        getContainer: () => HTMLElement;
        /**
         * Get value for the spacing between slides
         */
        getGapDim: () => number;
        /**
         * Get reference to the Gestures instance
         */
        getGestures: () => GesturesInstance | undefined;
        /**
         * Get the last `mousemove` event above the carousel
         */
        getLastMouseMove: () => MouseEvent;
        /**
         * Get current option
         */
        getOption: <T extends keyof CarouselOptions>(name: T) => Exclude<CarouselOptions[T], Function>;
        /**
         * Get current options
         */
        getOptions: () => CarouselOptions;
        /**
         * Get current page object
         */
        getPage: () => CarouselPage;
        /**
         * Get current page index
         */
        getPageIndex: (slideIndex?: number) => number;
        /**
         * Get page progress
         */
        getPageProgress: (pageIndex?: number, ignoreInfinite?: boolean) => number;
        /**
         *  Check what percentage of the page is visible
         */
        getPageVisibility: (pageIndex?: number) => number;
        /**
         * Get all page objects
         */
        getPages: () => CarouselPage[];
        /**
         * Get all initialized plugins
         */
        getPlugins: () => Partial<CarouselPlugins>;
        /**
         * Get current position of the carousel track
         */
        getPosition: (ignoreInfinite?: boolean) => number;
        /**
         *  Get all slides
         */
        getSlides: () => CarouselSlide[];
        /**
         * Get current state of the instance
         */
        getState: () => CarouselState;
        /**
         * Get total width of all slides (or height for a vertical carousel)
         */
        getTotalSlideDim: (addExtraGapForInfinite?: boolean) => number;
        /**
         * Get reference to the Tween instance
         */
        getTween: () => TweenInstance | undefined;
        /**
         * Get reference to the viewport DOM element
         */
        getViewport: () => HTMLElement;
        /**
         * Get width of the vieewport element (or height for a vertical carousel)
         */
        getViewportDim: () => number;
        /**
         * Get slides with elements visible in the viewport
         */
        getVisibleSlides: (pos?: number) => CarouselSlide[];
        /**
         * Slide to the selected page
         */
        goTo: (newPageIndex: number, args?: CarouselGoToArgs) => void;
        /**
         * Check if carousel has moved to another page at least once
         */
        hasNavigated: () => boolean;
        /**
         * Remove DOM element containing the error message from the slide
         */
        hideError: (slide: CarouselSlide) => void;
        /**
         * Remove DOM element containing loading indicator from the slide
         */
        hideLoading: (slide: CarouselSlide) => void;
        /**
         * Initialize Carousel instance
         */
        init: () => CarouselInstance;
        /**
         * Check if infinite navigation is enabled
         */
        isInfinite: () => boolean;
        /**
         * Check if slide change CSS transition is currently running
         */
        isInTransition: () => boolean;
        /**
         * Check if carousel direction is from right to left
         */
        isRTL: () => boolean;
        /**
         * Check if current page is in place
         */
        isSettled: () => boolean;
        /**
         * Check if carousel is vertical
         */
        isVertical: () => boolean;
        /**
         * Translate text with current language strings
         */
        localize: (str: string, params?: Array<[string, any]>) => string;
        /**
         * Move to the next page
         */
        next: (args?: CarouselGoToArgs) => CarouselInstance;
        /**
         * Remove event listener
         */
        off: <CarouselEvent extends keyof CarouselEventArgs>(what: CarouselEvent | CarouselEvent[], callback: (api: any, ...args: CarouselEventArgs[CarouselEvent]) => void) => CarouselInstance;
        /**
         * Add event listener
         */
        on: <CarouselEvent extends keyof CarouselEventArgs>(what: CarouselEvent | CarouselEvent[], callback: (api: any, ...args: CarouselEventArgs[CarouselEvent]) => void) => CarouselInstance;
        /**
         * Move to the previous page
         */
        prev: (args?: CarouselGoToArgs) => CarouselInstance;
        /**
         * Remove slide at the selected position
         */
        remove: (position?: number) => CarouselInstance;
        /**
         * Set new position of the track
         */
        setPosition: (newPosition: number) => void;
        /**
         * Show error message on selected slide
         */
        showError: (slide: CarouselSlide, message?: string) => CarouselInstance;
        /**
         * Show loading indicator on selected slide
         */
        showLoading: (slide: CarouselSlide) => CarouselInstance;
        /**
         * Version of the Carousel
         */
        version: string;
    };
    l10n: {
        en_EN: {
            ERROR: string;
            NEXT: string;
            PREV: string;
            GOTO: string;
            DOWNLOAD: string;
            TOGGLE_FULLSCREEN: string;
            TOGGLE_EXPAND: string;
            TOGGLE_THUMBS: string;
            TOGGLE_AUTOPLAY: string;
            IMAGE_ERROR: string;
            MOVE_UP: string;
            MOVE_DOWN: string;
            MOVE_LEFT: string;
            MOVE_RIGHT: string;
            ZOOM_IN: string;
            ZOOM_OUT: string;
            TOGGLE_FULL: string;
            TOGGLE_1TO1: string;
            ITERATE_ZOOM: string;
            ROTATE_CCW: string;
            ROTATE_CW: string;
            FLIP_X: string;
            FLIP_Y: string;
            RESET: string;
            TOGGLE_FS: string;
        };
    };
    getDefaults(): CarouselOptions;
};
export {};
