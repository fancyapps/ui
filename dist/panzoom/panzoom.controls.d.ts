import { type PanzoomInstance } from "./panzoom.js";
import { type PanzoomButtonName } from "../shared/buttons.js";
export type ControlsItem = {
    tpl: string;
    click?: (instanceRef: PanzoomInstance, event: Event) => void;
};
export type ControlsItemKey = PanzoomButtonName | (string & {});
export type ControlsOptions = {
    /**
     * What buttons to display
     */
    display: ControlsItemKey[];
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
declare module "./panzoom.js" {
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
    /**
     * Register new item
     */
    add: (id: string, item: ControlsItem) => ControlsInstance;
};
