/**
 * Access nested JavaScript objects by string path.
 * Example: `resolve("a.b.c", {a:{b:{c:"d"}})` would return `d`
 * @param {String} path
 * @param {Object} obj
 * @returns {*}
 */
export const resolve = function (path, obj) {
  return path.split(".").reduce(function (prev, curr) {
    return prev && prev[curr];
  }, obj);
};
