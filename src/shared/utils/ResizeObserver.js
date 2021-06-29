/**
 * ResizeObserver Polyfill
 */
export const ResizeObserver =
  (typeof window !== "undefined" && window.ResizeObserver) ||
  class {
    constructor(callback) {
      this.observables = [];
      // Array of observed elements that looks like this:
      // [{
      //   el: domNode,
      //   size: {height: x, width: y}
      // }]
      this.boundCheck = this.check.bind(this);
      this.boundCheck();
      this.callback = callback;
    }

    observe(el) {
      if (this.observables.some((observable) => observable.el === el)) {
        return;
      }

      const newObservable = {
        el: el,
        size: {
          height: el.clientHeight,
          width: el.clientWidth,
        },
      };

      this.observables.push(newObservable);
    }

    unobserve(el) {
      this.observables = this.observables.filter((obj) => obj.el !== el);
    }

    disconnect() {
      this.observables = [];
    }

    check() {
      const changedEntries = this.observables
        .filter((obj) => {
          const currentHeight = obj.el.clientHeight;
          const currentWidth = obj.el.clientWidth;
          if (obj.size.height !== currentHeight || obj.size.width !== currentWidth) {
            obj.size.height = currentHeight;
            obj.size.width = currentWidth;
            return true;
          }
        })
        .map((obj) => obj.el);

      if (changedEntries.length > 0) {
        this.callback(changedEntries);
      }

      window.requestAnimationFrame(this.boundCheck);
    }
  };
