type Ease = (val: number) => number;
type Values = Record<string, number>;
type SpringOption = {
    velocity: number | Values;
    mass: number;
    tension: number;
    friction: number;
    restDelta: number;
    restSpeed: number;
    maxSpeed: number;
    clamp: boolean;
};
export interface TweenEventArgs {
    start: [Values, Values];
    pause: [Values];
    end: [Values];
    step: [Values, Values, Values, number?];
}
export declare enum TweenState {
    Initializing = 0,
    Running = 1,
    Paused = 2,
    Completed = 3,
    Destroyed = 4
}
export declare enum TweenRepeatType {
    Loop = 0,
    Reverse = 1
}
export type TweenInstance = ReturnType<typeof Tween>;
export declare function Tween(): {
    getState: () => TweenState;
    easing: (easing: Ease) => TweenInstance;
    duration: (ms: number) => TweenInstance;
    spring: (opts?: Partial<SpringOption>) => TweenInstance;
    isRunning: () => boolean;
    isSpring: () => boolean;
    from: (values: Values) => TweenInstance;
    to: (values: Values) => TweenInstance;
    repeat: (times: number, delay?: number, type?: TweenRepeatType, easing?: Ease) => TweenInstance;
    on: <TweenEvent extends keyof TweenEventArgs>(event: TweenEvent, callback: (...args: TweenEventArgs[TweenEvent]) => void) => TweenInstance;
    off: <TweenEvent extends keyof TweenEventArgs>(event: TweenEvent, callback: (...args: TweenEventArgs[TweenEvent]) => void) => TweenInstance;
    start: (delay?: number) => TweenInstance;
    pause: () => TweenInstance;
    end: () => TweenInstance;
    tick: (ms: number) => TweenInstance;
    getStartValues: () => Values;
    getCurrentValues: () => Values;
    getCurrentVelocities: () => Values;
    getEndValues: () => Values;
    destroy: () => void;
};
export declare namespace Tween {
    var destroy: () => void;
    var Easings: {
        Linear: (k: number) => number;
        EaseIn: (k: number) => number;
        EaseOut: (k: number) => number;
        EaseInOut: (k: number) => number;
    };
}
export {};
