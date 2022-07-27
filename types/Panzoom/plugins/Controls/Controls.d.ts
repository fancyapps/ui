import { Panzoom } from "../../Panzoom";

export class Controls {
    constructor(panzoom: Panzoom);
    panzoom: any;
    $container: any;
    /**
     * Create and append new button to the container
     * @param {String} name - Button name
     * @param {Boolean} withClickEvent - Should add default click handler, it will use `name` as method name
     */
    addButton(name: string, withClickHandler?: boolean): HTMLButtonElement;
    /**
     * Create container with default buttons
     */
    createContainer(): void;
    /**
     * Clean up container
     */
    removeContainer(): void;
    attach(): void;
    detach(): void;
}


export interface ControlsOptions {
    l10n: {
        ZOOMIN: string;
        ZOOMOUT: string;
    }
    buttons: string[];
    tpl: {
        zoomIn: string;
        zoomOut: string;
    }
}
