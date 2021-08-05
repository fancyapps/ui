/**
 * Round half up; to be more specific and to ensure things like 1.005 round correctly
 * @param {Float} value
 * @param {Integer} precision
 * @returns {Float}
 */
export const round = (value, precision = 10000) => {
  value = parseFloat(value) || 0;

  return Math.round((value + Number.EPSILON) * precision) / precision;
};
