/**
 * Check if  element has scrollable content
 * @param {Node} node
 * @returns {Boolean}
 */
export const hasScrollbars = function (node) {
  const overflowY = window.getComputedStyle(node)["overflow-y"],
    overflowX = window.getComputedStyle(node)["overflow-x"],
    vertical = (overflowY === "scroll" || overflowY === "auto") && Math.abs(node.scrollHeight - node.clientHeight) > 1,
    horizontal = (overflowX === "scroll" || overflowX === "auto") && Math.abs(node.scrollWidth - node.clientWidth) > 1;

  return vertical || horizontal;
};

/**
 * Check if element or one of the parents is scrollable
 * @param {Node} node  DOM Node element
 * @returns {Boolean}
 */
export const isScrollable = function (node) {
  if (!node || node.classList.contains("carousel__track") || node === document.body) {
    return false;
  }

  if (hasScrollbars(node)) {
    return node;
  }

  return isScrollable(node.parentNode);
};
