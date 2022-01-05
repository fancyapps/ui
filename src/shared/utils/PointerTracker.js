import { clearTextSelection } from "./clearTextSelection.js";

class Pointer {
  constructor(nativePointer) {
    this.id = nativePointer.pointerId || nativePointer.identifier || -1;

    this.pageX = nativePointer.pageX;
    this.pageY = nativePointer.pageY;

    this.clientX = nativePointer.clientX;
    this.clientY = nativePointer.clientY;

    this.nativePointer = nativePointer;
  }
}

function getDistance(a, b) {
  if (!b) {
    return 0;
  }

  return Math.sqrt((b.clientX - a.clientX) ** 2 + (b.clientY - a.clientY) ** 2);
}

function getMidpoint(a, b) {
  if (!b) {
    return a;
  }

  return {
    clientX: (a.clientX + b.clientX) / 2,
    clientY: (a.clientY + b.clientY) / 2,
  };
}

class PointerTracker {
  constructor(element, { start = () => true, move = () => {}, end = () => {} } = {}) {
    this.element = element;

    this.startPointers = [];
    this.currentPointers = [];

    this.startCallback = start;
    this.moveCallback = move;
    this.endCallback = end;

    this.onStart = (event) => {
      if (event.button && event.button !== 0) {
        return;
      }

      const pointer = new Pointer(event);

      if (this.startCallback(pointer, event) === false) {
        return false;
      }

      event.preventDefault();

      clearTextSelection();

      this.currentPointers.push(pointer);
      this.startPointers.push(pointer);

      const capturingElement = event.target && "setPointerCapture" in event.target ? event.target : this.element;

      capturingElement.setPointerCapture(event.pointerId);

      this.element.addEventListener("pointermove", this.onMove);
      this.element.addEventListener("pointerup", this.onEnd);
      this.element.addEventListener("pointercancel", this.onEnd);
    };

    this.onMove = (event) => {
      const previousPointers = this.currentPointers.slice();
      const trackedChangedPointers = [];

      for (const pointer of [new Pointer(event)]) {
        const index = this.currentPointers.findIndex((p) => p.id === pointer.id);

        if (index < 0) {
          continue;
        }

        trackedChangedPointers.push(pointer);

        this.currentPointers[index] = pointer;
      }

      if (trackedChangedPointers.length) {
        this.moveCallback(previousPointers, this.currentPointers, event);
      }
    };

    this.onEnd = (event) => {
      const pointer = new Pointer(event);
      const index = this.currentPointers.findIndex((p) => p.id === pointer.id);

      if (index === -1) {
        return false;
      }

      this.currentPointers.splice(index, 1);
      this.startPointers.splice(index, 1);

      this.endCallback(pointer, event);

      if (!this.currentPointers.length) {
        this.element.removeEventListener("pointermove", this.onMove);
        this.element.removeEventListener("pointerup", this.onEnd);
        this.element.removeEventListener("pointercancel", this.onEnd);
      }
    };

    this.element.addEventListener("pointerdown", this.onStart);
  }

  stop() {
    this.element.removeEventListener("pointerdown", this.onStart);
    this.element.removeEventListener("pointermove", this.onMove);
    this.element.removeEventListener("pointerup", this.onEnd);
    this.element.removeEventListener("pointercancel", this.onEnd);
  }
}

export { PointerTracker, getDistance, getMidpoint };
