class Pointer {
  constructor(nativePointer) {
    this.id = self.Touch && nativePointer instanceof Touch ? nativePointer.identifier : -1;

    this.pageX = nativePointer.pageX;
    this.pageY = nativePointer.pageY;

    this.clientX = nativePointer.clientX;
    this.clientY = nativePointer.clientY;
  }
}

const getDistance = (a, b) => {
  if (!b) {
    return 0;
  }

  return Math.sqrt((b.clientX - a.clientX) ** 2 + (b.clientY - a.clientY) ** 2);
};

const getMidpoint = (a, b) => {
  if (!b) {
    return a;
  }

  return {
    clientX: (a.clientX + b.clientX) / 2,
    clientY: (a.clientY + b.clientY) / 2,
  };
};

const isTouchEvent = (event) => "changedTouches" in event;

class PointerTracker {
  constructor(_element, { start = () => true, move = () => {}, end = () => {} } = {}) {
    this._element = _element;

    this.startPointers = [];
    this.currentPointers = [];

    this._pointerStart = (event) => {
      if (event.buttons > 0 && event.button !== 0) {
        return;
      }

      const pointer = new Pointer(event);

      if (this.currentPointers.some((p) => p.id === pointer.id)) {
        return;
      }

      if (!this._triggerPointerStart(pointer, event)) {
        return;
      }

      window.addEventListener("mousemove", this._move);
      window.addEventListener("mouseup", this._pointerEnd);
    };

    this._touchStart = (event) => {
      for (const touch of Array.from(event.changedTouches || [])) {
        this._triggerPointerStart(new Pointer(touch), event);
      }
    };

    this._move = (event) => {
      const previousPointers = this.currentPointers.slice();
      const changedPointers = isTouchEvent(event)
        ? Array.from(event.changedTouches).map((t) => new Pointer(t))
        : [new Pointer(event)];

      const trackedChangedPointers = [];

      for (const pointer of changedPointers) {
        const index = this.currentPointers.findIndex((p) => p.id === pointer.id);

        if (index < 0) {
          continue;
        }

        trackedChangedPointers.push(pointer);

        this.currentPointers[index] = pointer;
      }

      this._moveCallback(previousPointers, this.currentPointers.slice(), event);
    };

    this._triggerPointerEnd = (pointer, event) => {
      const index = this.currentPointers.findIndex((p) => p.id === pointer.id);

      if (index < 0) {
        return false;
      }

      this.currentPointers.splice(index, 1);
      this.startPointers.splice(index, 1);

      this._endCallback(pointer, event);

      return true;
    };

    this._pointerEnd = (event) => {
      if (event.buttons > 0 && event.button !== 0) {
        return;
      }

      if (!this._triggerPointerEnd(new Pointer(event), event)) {
        return;
      }

      window.removeEventListener("mousemove", this._move, { passive: false });
      window.removeEventListener("mouseup", this._pointerEnd, { passive: false });
    };

    this._touchEnd = (event) => {
      for (const touch of Array.from(event.changedTouches || [])) {
        this._triggerPointerEnd(new Pointer(touch), event);
      }
    };

    this._startCallback = start;
    this._moveCallback = move;
    this._endCallback = end;

    this._element.addEventListener("mousedown", this._pointerStart, { passive: false });
    this._element.addEventListener("touchstart", this._touchStart, { passive: false });
    this._element.addEventListener("touchmove", this._move, { passive: false });
    this._element.addEventListener("touchend", this._touchEnd);
    this._element.addEventListener("touchcancel", this._touchEnd);
  }

  stop() {
    this._element.removeEventListener("mousedown", this._pointerStart, { passive: false });
    this._element.removeEventListener("touchstart", this._touchStart, { passive: false });
    this._element.removeEventListener("touchmove", this._move, { passive: false });
    this._element.removeEventListener("touchend", this._touchEnd);
    this._element.removeEventListener("touchcancel", this._touchEnd);

    window.removeEventListener("mousemove", this._move);
    window.removeEventListener("mouseup", this._pointerEnd);
  }

  _triggerPointerStart(pointer, event) {
    if (!this._startCallback(pointer, event)) {
      return false;
    }

    this.currentPointers.push(pointer);
    this.startPointers.push(pointer);

    return true;
  }
}

export { PointerTracker, getDistance, getMidpoint };
