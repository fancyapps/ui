import { TweenInstance } from "../libs/tween";
import { GesturesOptions, GesturesEventObject, GesturesInstance } from "../libs/gestures";
export type PanzoomInstance = ReturnType<typeof Panzoom>;
export type PanzoomRenderInfo = {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
    flipX: number;
    flipY: number;
    angle: number;
    fitWidth: number;
    fitHeight: number;
    fullWidth: number;
    fullHeight: number;
};
export declare enum PanzoomAction {
    Reset = "reset",
    Zoom = "zoom",
    ZoomIn = "zoomIn",
    ZoomOut = "zoomOut",
    ZoomTo = "zoomTo",
    ToggleCover = "toggleCover",
    ToggleFull = "toggleFull",
    ToggleMax = "toggleMax",
    IterateZoom = "iterateZoom",
    Pan = "pan",
    Swipe = "swipe",
    Move = "move",
    MoveLeft = "moveLeft",
    MoveRight = "moveRight",
    MoveUp = "moveUp",
    MoveDown = "moveDown",
    RotateCCW = "rotateCCW",
    RotateCW = "rotateCW",
    FlipX = "flipX",
    FlipY = "flipY",
    ToggleFS = "toggleFS"
}
export declare enum PanzoomZoomLevel {
    Cover = "cover",
    Full = "full",
    Max = "max"
}
export declare const PANZOOM_DEFAULT_POS: PanzoomTransformState;
export declare const enum PanzoomState {
    Init = 0,
    Loading = 1,
    Error = 2,
    Ready = 3,
    Destroyed = 4
}
export interface PanzoomTransformState {
    x: number;
    y: number;
    scale: number;
    angle: number;
    flipX: number;
    flipY: number;
}
export type PanzoomEventObject = {
    canZoomIn: boolean;
    canZoomOut: boolean;
    isFullsize: boolean;
    isExpanded: boolean;
    canDrag: boolean;
    isDragging: boolean;
};
export interface PanzoomEventArgs {
    /**
     * Any event
     */
    "*": [string, ...any];
    /**
     * Action is being executed (for example, "zoomIn")
     */
    action: [PanzoomAction];
    /**
     * Animation has ended
     */
    animationEnd: [];
    /**
     * Animation has started
     */
    animationStart: [];
    /**
     * Single click event detected
     */
    click: [GesturesEventObject];
    /**
     * Double click event detected
     */
    dblClick: [GesturesEventObject];
    /**
     * Instance is destroyed
     */
    destroy: [];
    /**
     * Content did not load successfully
     */
    error: [];
    /**
     * Enter full-screen mode
     */
    enterFS: [];
    /**
     * Exit full-screen mode
     */
    exitFS: [];
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
     * Content successfully loaded
     */
    loaded: [];
    /**
     * Content is loading
     */
    loading: [];
    /**
     * Pinch-zoom gesture detected
     */
    pinch: [GesturesEventObject];
    /**
     * Panzoom has successfully launched
     */
    ready: [];
    /**
     * Container and content dimensions are updated
     */
    refresh: [];
    /**
     * Viewport CSS properties are updated
     */
    render: [];
    /**
     * Double click event detected
     */
    singleClick: [GesturesEventObject];
    /**
     * Pointer up/cancel event detected
     */
    touchEnd: [];
    /**
     * Pointer down event detected
     */
    touchStart: [];
    /**
     * Wheel event detected
     */
    wheel: [WheelEvent, Number];
}
export type PanzoomEventListener = (api: any, ...args: PanzoomEventArgs[keyof PanzoomEventArgs]) => void;
type PanzoomEvents = {
    [key in keyof PanzoomEventArgs]: (api: PanzoomInstance, eventObject: PanzoomEventObject, ...args: PanzoomEventArgs[key]) => void;
};
export interface PanzoomClasses {
    container: string;
    wrapper: string;
    content: string;
    viewport: string;
}
export interface PanzoomOptions {
    /**
     * If true, content position will be constrained inside the container
     */
    bounds: boolean;
    /**
     * Class names for DOM elements
     */
    classes: Partial<PanzoomClasses>;
    /**
     * Default action to take on a click event
     */
    clickAction: PanzoomAction | false | ((ref: PanzoomInstance) => PanzoomAction | false);
    /**
     * Default action to take on a double click event
     */
    dblClickAction: PanzoomAction | false | ((ref: PanzoomInstance) => PanzoomAction | false);
    /**
     * Optional event to use to calculate the initial mouse position
     */
    event?: MouseEvent | undefined | ((ref: PanzoomInstance) => MouseEvent | undefined);
    /**
     * Options for Gestures instance
     */
    gestures: Partial<GesturesOptions> | {} | ((ref: PanzoomInstance) => Partial<GesturesOptions> | {});
    /**
     * Content height
     */
    height: "auto" | number | ((ref: PanzoomInstance) => "auto" | number);
    /**
     * Localization of strings
     */
    l10n: Record<string, string>;
    /**
     * The maximum zoom level the user can zoom. If, for example, it is `2`, then the user can zoom content to 2x the original size.
     */
    maxScale: number | PanzoomZoomLevel | ((ref: PanzoomInstance) => number | PanzoomZoomLevel);
    /**
     * Minimum scale level
     */
    minScale: number | PanzoomZoomLevel | ((ref: PanzoomInstance) => number | PanzoomZoomLevel);
    /**
     * The proportion by which the content pans relative to the cursor position.
     * Higher value means the user has to move the mouse less for the content to reach the edge of the container.
     */
    mouseMoveFactor: number;
    /**
     * Optional event listeners
     */
    on?: Partial<PanzoomEvents>;
    /**
     * Use touch events to pan content or follow the cursor.
     * Automatically switches to `drag` if user’s primary input mechanism can not hover over elements.
     * Tip: experiment with `mouseMoveFactor` option for better UX.
     */
    panMode: "drag" | "mousemove" | ((ref: PanzoomInstance) => "drag" | "mousemove");
    /**
     * Optional collection of plugins to initialize for this instance
     */
    plugins?: Record<string, PanzoomPlugin>;
    /**
     * If the image download needs to be prevented
     */
    protected: Boolean;
    /**
     * Default action to take on a single click event
     */
    singleClickAction: PanzoomAction | false | ((ref: PanzoomInstance) => PanzoomAction | false);
    /**
     *  HTML template for spinner element
     */
    spinnerTpl: string | ((ref: PanzoomInstance) => string);
    /**
     * Optional content initial position
     */
    startPos?: {
        x: number;
        y: number;
        scale: number | PanzoomZoomLevel;
    } | ((ref: PanzoomInstance) => {
        x: number;
        y: number;
        scale: number | PanzoomZoomLevel;
    } | undefined);
    /**
     * Default action to take on a wheel event
     */
    wheelAction: PanzoomAction | false | ((ref: PanzoomInstance) => PanzoomAction | false);
    /**
     * Content width
     */
    width: "auto" | number | ((ref: PanzoomInstance) => "auto" | number);
}
export type PanzoomPlugin = () => {
    init: (api: PanzoomInstance) => void;
    destroy: (api: PanzoomInstance) => void;
};
export type PanzoomPluginInstance = ReturnType<PanzoomPlugin>;
export interface PanzoomPlugins extends Record<string, PanzoomPluginInstance> {
}
export declare const Panzoom: {
    (containerEl: HTMLElement | null, userOptions?: Partial<PanzoomOptions>, userPlugins?: Record<string, PanzoomPlugin>): {
        /**
         * Check if content is scaled up and touch gestures are enabled
         */
        canDrag: () => boolean;
        /**
         * Check if the content scale is less than the maximum size
         */
        canZoomIn: () => boolean;
        /**
         * Check if the content scale is larger than the minimum size
         */
        canZoomOut: () => boolean;
        /**
         * Check if the content scale is less than the full size
         */
        canZoomToFull: () => boolean;
        /**
         * Destroy instance and clean up
         */
        destroy: () => PanzoomInstance;
        /**
         * Emit event to listeners
         */
        emit: <PanzoomEvent extends keyof PanzoomEventArgs>(event: PanzoomEvent, ...args: PanzoomEventArgs[PanzoomEvent]) => void;
        /**
         * Execute action
         */
        execute: (action: PanzoomAction, params?: Partial<GesturesEventObject>) => void;
        /**
         * Get the bounds of the content in the container, optionally for custom scale size
         */
        getBoundaries: (scale?: number) => {
            x: [number, number];
            y: [number, number];
        };
        /**
         * Get reference to the container DOM element
         */
        getContainer: () => HTMLElement;
        /**
         * Get reference to the content DOM element
         */
        getContent: () => HTMLElement;
        /**
         * Get original width and height of the content, which can be adjusted using the `width` and `height` options
         */
        getFullDim: () => {
            width: number;
            height: number;
        };
        /**
         * Get reference to the Gestures instance
         */
        getGestures: () => GesturesInstance | undefined;
        /**
         * Get the position of the content given the current mouse position, optionally for custom scale size
         */
        getMousemovePos: (scale: number) => {
            x: number;
            y: number;
        };
        /**
         * Get current options
         */
        getOptions: () => PanzoomOptions;
        /**
         * Get all initialized plugins
         */
        getPlugins: () => Partial<PanzoomPlugins>;
        /**
         * Get content transformation scale for the specified scale level
         */
        getScale: (level?: "min" | "base" | "cover" | "full" | "max") => number;
        /**
         * Get calculated values ​​for the initial position
         */
        getStartPosition: () => {
            scale: number;
            x: number;
            y: number;
            angle: number;
            flipX: number;
            flipY: number;
        };
        /**
         * Get current state of the Panzoom instance
         */
        getState: () => PanzoomState;
        /**
         * Get the current state of the content's transformation or the state at the end of the ongoing animation, if it is currently animated
         */
        getTransform: (afterAnimation?: boolean) => {
            x: number;
            y: number;
            scale: number;
            angle: number;
            flipX: number;
            flipY: number;
        };
        /**
         * Get reference to the Tween instance
         */
        getTween: () => TweenInstance | undefined;
        /**
         * Get reference to the viewport DOM element
         */
        getViewport: () => HTMLElement;
        /**
         * Get reference to the wrapper DOM element
         */
        getWrapper: () => HTMLElement;
        /**
         * Initialize the Panzoom instance
         */
        init: () => PanzoomInstance;
        /**
         * Check if the content is being dragged
         */
        isDragging: () => boolean;
        /**
         * Check if the content is scaled up
         */
        isExpanded: () => boolean;
        /**
         * Check if the content is being viewed in its original size
         */
        isFullsize: () => boolean;
        /**
         * Check if "mousemove" mode is enabled
         */
        isMousemoveMode: () => boolean;
        /**
         * Translate text with current language strings
         */
        localize: (str: string, params?: Array<[string, any]>) => string;
        /**
         * Remove event listener
         */
        off: <PanzoomEvent extends keyof PanzoomEventArgs>(what: PanzoomEvent | PanzoomEvent[], callback: (api: any, ...args: PanzoomEventArgs[PanzoomEvent]) => void) => PanzoomInstance;
        /**
         * Add event listener
         */
        on: <PanzoomEvent extends keyof PanzoomEventArgs>(what: PanzoomEvent | PanzoomEvent[], callback: (api: any, ...args: PanzoomEventArgs[PanzoomEvent]) => void) => PanzoomInstance;
        /**
         * Toggle full screen mode
         */
        toggleFS: () => void;
        /**
         * Update the state of controls
         */
        updateControls: (parentEl?: HTMLElement) => void;
        /**
         * Version of the Panzoom
         */
        version: string;
        /**
         * Check if the content scales up upon click
         */
        willZoomIn: () => boolean;
        /**
         * Check if the content scales down upon click
         */
        willZoomOut: () => boolean;
    };
    l10n: {
        en_EN: {
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
    getDefaults(): PanzoomOptions;
};
export {};
