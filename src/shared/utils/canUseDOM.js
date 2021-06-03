/**
 * Detect if rendering from the client or the server
 */
export const canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);
