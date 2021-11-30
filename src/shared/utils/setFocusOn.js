import { canUseDOM } from "./canUseDOM.js";

let preventScrollSupported = null;

export const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "area[href]",
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  "select:not([disabled]):not([aria-hidden])",
  "textarea:not([disabled]):not([aria-hidden])",
  "button:not([disabled]):not([aria-hidden])",
  "iframe",
  "object",
  "embed",
  "video",
  "audio",
  "[contenteditable]",
  '[tabindex]:not([tabindex^="-"]):not([disabled]):not([aria-hidden])',
];

export const setFocusOn = (node) => {
  if (!node || !canUseDOM) {
    return;
  }

  if (preventScrollSupported === null) {
    document.createElement("div").focus({
      get preventScroll() {
        preventScrollSupported = true;

        return false;
      },
    });
  }

  try {
    if (node.setActive) {
      // IE/Edge
      node.setActive();
    } else if (preventScrollSupported) {
      // Modern browsers
      node.focus({ preventScroll: true });
    } else {
      // Safari does not support `preventScroll` option
      // https://bugs.webkit.org/show_bug.cgi?id=178583

      // Save position
      const scrollTop = window.pageXOffset || document.body.scrollTop;
      const scrollLeft = window.pageYOffset || document.body.scrollLeft;

      node.focus();

      document.body.scrollTo({
        top: scrollTop,
        left: scrollLeft,
        behavior: "auto",
      });
    }
  } catch (e) {}
};
