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
    panThreshold: number;
    swipeThreshold: number;
    ignore: string[];
};
export type GesturesEventObject = {
    angle: number;
    axis: "x" | "y" | undefined;
    center: Point | undefined;
    currentTouch: Point[];
    deltaX: number;
    deltaY: number;
    firstTouch: Point[];
    isPanRecognized: boolean;
    isSwipeRecognized: boolean;
    offsetX: number;
    offsetY: number;
    previousTouch: Point[];
    scale: number;
    srcEvent: InputEvent;
    velocity: number;
    velocityX: number;
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
    rotate: [GesturesEventObject];
    tap: [GesturesEventObject];
    singleTap: [GesturesEventObject];
    doubleTap: [GesturesEventObject];
}
export type GesturesInstance = ReturnType<typeof Gestures>;
export declare const Gestures: {
    (containerEl: HTMLElement | null, userOptions?: Partial<GesturesOptions>): {
        init: () => /*elided*/ any;
        on: <Event extends keyof GesturesEventArgs>(ev: Event, clb: (...args: GesturesEventArgs[Event]) => void) => GesturesInstance;
        off: <Event extends keyof GesturesEventArgs>(event: Event, callback: (...args: GesturesEventArgs[Event]) => void) => GesturesInstance;
        isPointerDown: () => boolean;
        destroy: () => void;
    };
    isClickAllowed(): boolean;
};
export {};
