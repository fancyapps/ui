/**
 * Checks whether an element has scrollable content
 */
export declare const isScrollable: (ele: HTMLElement | null) => boolean;
/**
 * Find the closest parent element with scrollable content
 */
export declare const getScrollableParent: (el: HTMLElement, limit?: HTMLElement | undefined) => null | HTMLElement;
