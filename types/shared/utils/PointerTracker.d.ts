export class PointerTracker {
    constructor(_element: any, { start, move, end }?: {
        start?: () => true;
        move?: () => void;
        end?: () => void;
    });
    _element: any;
    startPointers: any[];
    currentPointers: any[];
    _pointerStart: (event: any) => void;
    _touchStart: (event: any) => void;
    _move: (event: any) => void;
    _triggerPointerEnd: (pointer: any, event: any) => boolean;
    _pointerEnd: (event: any) => void;
    _touchEnd: (event: any) => void;
    _startCallback: () => true;
    _moveCallback: () => void;
    _endCallback: () => void;
    stop(): void;
    _triggerPointerStart(pointer: any, event: any): boolean;
}
