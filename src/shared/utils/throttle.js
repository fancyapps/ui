/**
 * Throttling enforces a maximum number of times a function can be called over time
 * @param {Function} func Callback function
 * @param {Integer} limit Milliseconds
 * @returns {Function}
 */
export const throttle = (func, limit) => {
  let lastCall = 0;

  return function (...args) {
    const now = new Date().getTime();

    if (now - lastCall < limit) {
      return;
    }

    lastCall = now;

    return func(...args);
  };
};
