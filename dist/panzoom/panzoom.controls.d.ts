import { PanzoomInstance } from "./panzoom";
import { PanzoomButtons } from "../shared/buttons";
export type ControlsItem = {
    tpl: string;
    click?: (instanceRef: PanzoomInstance, event: Event) => void;
};
export type ControlsOptions = {
    /**
     * What buttons to display
     */
    display: Array<keyof typeof PanzoomButtons>;
    /**
     * Object containing all buttons. Use this to add your own buttons.
     */
    items: Record<string, ControlsItem>;
    /**
     * Common attributes that will be applied to any SVG icon inside the buttons
     */
    svgAttr: Record<string, string>;
};
export type ControlsInstance = ReturnType<typeof Controls>;
declare module "./panzoom" {
    interface PanzoomOptions {
        Controls?: boolean | Partial<ControlsOptions>;
    }
    interface PanzoomPlugins {
        Controls: PanzoomPlugin & ControlsInstance;
    }
}
export declare const Controls: () => {
    init: (panzoom: PanzoomInstance) => void;
    destroy: () => void;
};
