import { CarouselInstance } from "../carousel";
export declare enum ToolbarColumn {
    Left = "left",
    middle = "middle",
    right = "right"
}
export type ToolbarItem = {
    tpl: string;
    click?: (instance: CarouselInstance, event: Event) => void;
};
declare const allToolbarItems: Record<string, ToolbarItem>;
export type SuggestedProperties = "counter" | "autoplay" | "fullscreen" | "thumbs" | "moveLeft" | "moveRight" | "moveUp" | "moveDown" | "zoomIn" | "zoomOut" | "toggle1to1" | "toggleFull" | "rotateCCW" | "rotateCW" | "flipX" | "flipY" | "reset";
export type ToolbarKey = SuggestedProperties | (string & {});
export type ToolbarOptions = {
    /**
     * If absolutely position container
     */
    absolute: boolean;
    /**
     * What toolbar items to display
     */
    display: Partial<Record<ToolbarColumn, Array<ToolbarKey | ToolbarItem>>>;
    /**
     * If enabled; "auto" - enable only if there is at least one panzoom instance in the carousel
     */
    enabled: "auto" | boolean;
    /**
     * Collection of toolbar items that add new or overwrite existing items
     */
    items: Partial<typeof allToolbarItems>;
    /**
     * Optional element to place the container
     */
    parentEl?: HTMLElement | null | ((instance: CarouselInstance) => HTMLElement | null);
};
export type ToolbarInstance = ReturnType<typeof Toolbar>;
declare module "./carousel" {
    interface CarouselOptions {
        Toolbar?: boolean | Partial<ToolbarOptions>;
    }
    interface CarouselPlugins {
        Toolbar: CarouselPlugin & ToolbarInstance;
    }
}
export declare const Toolbar: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
    /**
     * Register new toolbar item
     */
    add: (id: string, item: ToolbarItem) => void;
    /**
     * Check if toolbar is enabled
     */
    isEnabled: () => boolean;
};
export {};
