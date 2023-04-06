/**
 * Get actual width of the element, regardless of how much of content is currently visible
 */
export declare const getFullWidth: (elem: HTMLImageElement | SVGSVGElement | HTMLElement) => number;
/**
 * Get actual height of the element, regardless of how much of content is currently visible
 */
export declare const getFullHeight: (elem: HTMLImageElement | SVGSVGElement | HTMLElement) => number;
/**
 * Calculate bounding size to fit dimensions while preserving aspect ratio
 */
export declare const calculateAspectRatioFit: (srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) => {
    width: number;
    height: number;
};
