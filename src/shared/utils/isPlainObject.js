/**
 * Check to see if an object is a plain object (created using "{}" or "new Object").
 * @param {*} obj Variable of any type
 * @returns {Boolean}
 */
export const isPlainObject = (obj) => {
  return (
    // separate from primitives
    typeof obj === "object" &&
    // is obvious
    obj !== null &&
    // separate instances (Array, DOM, ...)
    obj.constructor === Object &&
    // separate build-in like Math
    Object.prototype.toString.call(obj) === "[object Object]"
  );
};
