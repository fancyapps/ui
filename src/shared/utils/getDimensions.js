/**
 * Get actual width of the element, regardless of how much of content is currently visible
 * @param {Element} elem
 * @returns {Integer}
 */
export const getFullWidth = (elem) => {
  let rez = 0;

  if (elem) {
    if (elem instanceof SVGElement) {
      rez = Math.min(elem.getClientRects()[0].width, elem.width.baseVal.value);
    } else {
      rez = Math.max(elem.offsetWidth, elem.scrollWidth);
    }
  }

  return rez;
};

/**
 * Get actual height of the element, regardless of how much of content is currently visible
 * @param {Element} elem
 * @returns {Integer}
 */
export const getFullHeight = (elem) => {
  let rez = 0;

  if (elem) {
    if (elem instanceof SVGElement) {
      rez = Math.min(elem.getClientRects()[0].height, elem.height.baseVal.value);
    } else {
      rez = Math.max(elem.offsetHeight, elem.scrollHeight);
    }
  }

  return rez;
};
