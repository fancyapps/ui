/**
 * Get element child node at the given coordinates
 * @param {Element} HTML element
 * @param {Float|Integer} x
 * @param {Float|Integer} y
 * @returns {Node|Boolean}}
 */
export const getTextNodeFromPoint = (element, x, y) => {
  const nodes = element.childNodes;
  const range = document.createRange();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.nodeType !== Node.TEXT_NODE) {
      continue;
    }

    range.selectNodeContents(node);

    const rect = range.getBoundingClientRect();

    if (x >= rect.left && y >= rect.top && x <= rect.right && y <= rect.bottom) {
      return node;
    }
  }

  return false;
};
