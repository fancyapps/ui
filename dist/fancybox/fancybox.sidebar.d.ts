import { type FancyboxInstance } from "./fancybox";
export type SidebarOptions = {
    /**
     * Default content to display in the sidebar if the active slide has no caption
     */
    defaultCaption: string | ((instance: FancyboxInstance) => string);
    /**
     * HTML template for Fancybox main structure
     */
    mainTpl: string;
    /**
     * If the sidebar should be visible after launching Fancybox
     */
    showOnStart: boolean;
};
export type SidebarInstance = ReturnType<typeof Sidebar>;
declare module "./fancybox" {
    interface FancyboxOptions {
        Sidebar?: false | Partial<SidebarOptions>;
    }
    interface FancyboxPlugins {
        Sidebar: FancyboxPlugin & SidebarInstance;
    }
}
export declare const Sidebar: () => {
    init: (fancybox: FancyboxInstance) => void;
    destroy: () => void;
    /**
     * Check if sidebar is enabled
     */
    isEnabled: () => boolean;
    /**
     * Toggle visibility
     */
    toggle: (force?: boolean) => void;
};
