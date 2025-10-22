export declare function isTouchEvent(ev: TouchEvent | MouseEvent): ev is TouchEvent;
export declare function getCurrentPosition(event: InputEvent): Point[];
export declare function getTargetPosition(event: InputEvent): Point[];
export declare function getChangedPosition(event: InputEvent): Point[];
export declare function getMidpoint(touches: Point[]): Point;
export declare function getDistance(data: Point[]): number;
type InputEvent = TouchEvent | MouseEvent;
type Point = {
    x: number;
    y: number;
    ts?: number;
};
export type GesturesOptions = {
    /** How many pixels the user must drag for a "pan" gesture to be recognized */
    panThreshold: number;
    /** Minimum drag speed for a "swipe" gesture to be recognized */
    swipeThreshold: number;
    /** List of CSS selectors for elements where touch events are ignored */
    ignore: string[];
};
export type GesturesEventObject = {
    /** Angle at which it was moved */
    angle: number;
    /** Direction moved */
    axis: "x" | "y" | undefined;
    /** Center position for multi-touch */
    center: Point | undefined;
    /** Position of the current touch */
    currentTouch: Point[];
    /** Movement of the X axis from previous touch */
    deltaX: number;
    /** Movement of the Y axis from previous touch */
    deltaY: number;
    /** Position of the first touch */
    firstTouch: Point[];
    /** Check if `offsetX` or `offsetY` is over the `panThreshold` */
    isPanRecognized: boolean;
    /** Check if `velocityX` or `velocityY` is over the `swipeThreshold` */
    isSwipeRecognized: boolean;
    /** Movement of the X axis from the first touch */
    offsetX: number;
    /** Movement of the Y axis from the first touch */
    offsetY: number;
    /** Positions of the lost touch */
    previousTouch: Point[];
    /** Scaling that has been done when multi-touch */
    scale: number;
    /** Source event object */
    srcEvent: InputEvent;
    /** Highest velocityX/Y value */
    velocity: number;
    /** Velocity on the X axis, in px/ms */
    velocityX: number;
    /** Velocity on the Y axis, in px/ms */
    velocityY: number;
};
export interface GesturesEventArgs {
    start: [GesturesEventObject];
    move: [GesturesEventObject];
    end: [GesturesEventObject];
    panstart: [GesturesEventObject];
    pan: [GesturesEventObject];
    panend: [GesturesEventObject];
    swipe: [GesturesEventObject];
    pinch: [GesturesEventObject];
    tap: [GesturesEventObject];
    singleTap: [GesturesEventObject];
    doubleTap: [GesturesEventObject];
}
export type GesturesInstance = ReturnType<typeof Gestures>;
export declare const Gestures: {
    (containerEl: HTMLElement | null, userOptions?: Partial<GesturesOptions>): {
        /** Initialize Gestures instance */
        init: () => GesturesInstance;
        /**
         * Add event listener
         */
        on: <Event extends keyof GesturesEventArgs>(ev: Event, clb: (...args: GesturesEventArgs[Event]) => void) => GesturesInstance;
        /**
         * Remove event listener
         */
        off: <Event extends keyof GesturesEventArgs>(event: Event, callback: (...args: GesturesEventArgs[Event]) => void) => GesturesInstance;
        /**
         * Check if a pointer device is currently pressed down or active
         */
        isPointerDown: () => boolean;
        /**
         * Destroy instance and clean up
         */
        destroy: () => void;
    };
    isClickAllowed(): boolean;
};
export {};
