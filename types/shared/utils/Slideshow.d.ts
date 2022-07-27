import { Fancybox } from "../../Fancybox/Fancybox";

export class Slideshow {
    constructor(fancybox: Fancybox);
    fancybox: Fancybox;
    active: boolean;
    handleVisibilityChange(): void;
    isActive(): boolean;
    setTimer(): void;
    timer: any;
    $progress: any;
    clearTimer(): void;
    activate(): void;
    deactivate(): void;
    toggle(): void;
}
