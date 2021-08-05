/**
 * Get actual width of the element, regardless of how much of content is currently visible
 * @param {Element} elem
 * @returns {Integer}
 */
export const getFullWidth = (elem) => {
  return Math.max(
    parseFloat(elem.naturalWidth || 0),
    parseFloat((elem.width && elem.width.baseVal && elem.width.baseVal.value) || 0),
    parseFloat(elem.offsetWidth || 0),
    parseFloat(elem.scrollWidth || 0)
  );
};

/**
 * Get actual height of the element, regardless of how much of content is currently visible
 * @param {Element} elem
 * @returns {Integer}
 */
export const getFullHeight = (elem) => {
  return Math.max(
    parseFloat(elem.naturalHeight || 0),
    parseFloat((elem.height && elem.height.baseVal && elem.height.baseVal.value) || 0),
    parseFloat(elem.offsetHeight || 0),
    parseFloat(elem.scrollHeight || 0)
  );
};

/**
 * Calculate bounding size to fit dimensions while preserving aspect ratio
 * @param {Number} srcWidth
 * @param {Number} srcHeight
 * @param {Number} maxWidth
 * @param {Number} maxHeight
 * @returns {Object}
 */
export const calculateAspectRatioFit = (srcWidth, srcHeight, maxWidth, maxHeight) => {
  const ratio = Math.min(maxWidth / srcWidth || 0, maxHeight / srcHeight);

  return { width: srcWidth * ratio || 0, height: srcHeight * ratio || 0 };
};
