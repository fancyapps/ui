import { extend } from "../src/shared/utils/extend.js";
import { resolve } from "../src/shared/utils/resolve.js";
import { round } from "../src/shared/utils/round.js";
import { throttle } from "../src/shared/utils/throttle.js";
import { isPlainObject } from "../src/shared/utils/isPlainObject.js";

import { getFullWidth, getFullHeight } from "../src/shared/utils/getDimensions.js";

import { isScrollable } from "../src/shared/utils/isScrollable.js";
import { getTextNodeFromPoint } from "../src/shared/utils/getTextNodeFromPoint.js";

import { ResizeObserver } from "../src/shared/utils/ResizeObserver.js";

const expect = chai.expect;

function delay(time = 500) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

describe("Utils", function () {
  describe("extend", function () {
    it("extends object with other object", function () {
      let obj = { a: 3, b: 5 };

      extend(obj, { a: 4, c: 8 });

      expect(obj).to.deep.equal({ a: 4, b: 5, c: 8 });
    });

    it("does not pollute original object", function () {
      let obj = { a: 3, b: 5 };

      extend({}, obj, { a: 4, c: 8 });

      expect(obj).to.deep.equal({ a: 3, b: 5 });
    });

    it("copies property values", function () {
      let arr = [1, 2, 3];
      let obj = { a: 3, b: 5 };

      extend(obj, { c: arr });

      arr.push(4);

      expect(obj).to.deep.equal({ a: 3, b: 5, c: [1, 2, 3, 4] });
    });

    it("supports deep cloning, copies the reference values", function () {
      let arr = [1, 2, 3];
      let obj = { a: 3, b: 5 };

      extend(true, obj, { c: arr });

      arr.push(4);

      expect(obj).to.deep.equal({ a: 3, b: 5, c: [1, 2, 3] });
    });
  });

  describe("getDimensions", function () {
    const template = `
    <div id="root">
        <div id="container" style="width: 100px;height:100px;overflow:auto;">
          <div id="target" style="width:200px;height:200px;"></div>
        </div>
    </div>`;

    let elements;

    beforeEach(() => {
      document.body.insertAdjacentHTML("beforeend", template);

      elements = {
        root: document.getElementById("root"),
        container: document.getElementById("container"),
        target: document.getElementById("target"),
      };
    });

    afterEach(() => {
      if (document.body.contains(elements.root)) {
        document.body.removeChild(elements.root);
      }
      elements = {};
    });

    it("returns full width of element", function () {
      expect(getFullWidth(elements.container)).to.equal(200);
    });

    it("returns full height of element", function () {
      expect(getFullHeight(elements.container)).to.equal(200);
    });
  });

  describe("isScrollable", function () {
    const template = `
    <div id="root">
        <div id="container" style="width: 100px;height:100px;overflow:auto;">
          <div id="target" style="width:200px;height:200px;"></div>
        </div>
    </div>`;

    let elements;

    beforeEach(() => {
      document.body.insertAdjacentHTML("beforeend", template);

      elements = {
        root: document.getElementById("root"),
        container: document.getElementById("container"),
        target: document.getElementById("target"),
      };
    });

    afterEach(() => {
      if (document.body.contains(elements.root)) {
        document.body.removeChild(elements.root);
      }
      elements = {};
    });

    it("returns scrollable element", function () {
      expect(isScrollable(elements.container)).to.equal(elements.container);
    });

    it("detects scrollable parent", function () {
      expect(isScrollable(elements.target)).to.equal(elements.container);
    });

    it("returns false when element is not scrollable and no scrollable parent found", function () {
      expect(isScrollable(elements.root)).to.be.false;
    });
  });

  describe("getTextNodeFromPoint", function () {
    const template = `
    <div id="root">
        <div id="container" style="position:fixed; top: 0; left: 0;padding: 50px;">
          <p id="target" style="margin: 0;padding: 0;">WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW<br />WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW</p>
        </div>
    </div>`;

    let elements;

    beforeEach(() => {
      document.body.insertAdjacentHTML("beforeend", template);

      elements = {
        root: document.getElementById("root"),
        container: document.getElementById("container"),
        target: document.getElementById("target"),
      };
    });

    afterEach(() => {
      if (document.body.contains(elements.root)) {
        document.body.removeChild(elements.root);
      }
      elements = {};
    });

    it("detects text node", function () {
      expect(getTextNodeFromPoint(elements.target, 100, 55)).to.not.be.false;
      expect(getTextNodeFromPoint(elements.target, 100, 15)).to.be.false;
    });
  });

  describe("isPlainObject", function () {
    it("detects plain objects", function () {
      expect(isPlainObject({})).to.be.true;
      expect(isPlainObject({ a: 1 })).to.be.true;
    });

    it("returns `false` for non-Object objects", function () {
      function Foo() {
        this.a = 1;
      }

      const element = document.createElement("div");
      const arr = ["a", "b"];

      expect(isPlainObject(new Foo())).to.be.false;
      expect(isPlainObject(element)).to.be.false;
      expect(isPlainObject(arr)).to.be.false;
      expect(isPlainObject(Error)).to.be.false;
      expect(isPlainObject(Math)).to.be.false;
      expect(isPlainObject("a")).to.be.false;
    });
  });

  describe("ResizeObserver", function () {
    const template = `
    <div id="root" style="position:fixed;top:0;left:0;width:600px;height:600px;overflow:visible;background:rgba(0,0,0,0.4);">
        <div id="container" style="display:flex;max-width:600px">
            <div id="target1" style="width: 200px;height: 100px;"></div>
            <div id="target2" style="width: 200px;height: 100px;"></div>
        </div>
    </div>`;

    let elements;
    let observer;

    beforeEach(() => {
      document.body.insertAdjacentHTML("beforeend", template);

      elements = {
        root: document.getElementById("root"),
        container: document.getElementById("container"),
        target1: document.getElementById("target1"),
        target2: document.getElementById("target2"),
      };
    });

    afterEach(() => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      if (document.body.contains(elements.root)) {
        document.body.removeChild(elements.root);
      }

      elements = {};
    });

    it("can be instantiated", function () {
      observer = new ResizeObserver(() => {});

      expect(observer).to.be.an.instanceof(ResizeObserver);
    });

    it("triggers after resizing element", async function () {
      let width = 0;
      let height = 0;

      observer = new ResizeObserver(function (entries) {
        // Polyfill does not provide  `contentRect`
        const entry = entries[0];

        width = entry.contentRect ? entry.contentRect.width : entry.getBoundingClientRect().width;
        height = entry.contentRect ? entry.contentRect.height : entry.getBoundingClientRect().height;
      });

      observer.observe(elements.target1);

      await delay(50);

      elements.target1.setAttribute("style", "width:100px;height:250px");

      await delay(50);

      expect(width).to.equal(100);
      expect(height).to.equal(250);

      elements.target1.setAttribute("style", "width:222px;height:333px");

      await delay(50);

      expect(width).to.equal(222);
      expect(height).to.equal(333);
    });
  });

  describe("resolve", function () {
    it("should access nested JavaScript objects by string path", function () {
      const obj = {
        a: {
          b: {
            c: "d",
          },
        },
      };

      expect(resolve("a.b.c", obj)).to.be.equal("d");
    });

    it("should access nested arays by string path", function () {
      const obj = [
        ["a", "b"],
        ["c", "d"],
      ];

      expect(resolve("1.1", obj)).to.be.equal("d");
    });
  });

  describe("round", function () {
    it("rounds with default precision 10000", async function () {
      expect(round(12.3456789)).to.be.equal(12.3457);
    });

    it("rounds with custom precision", async function () {
      expect(round(12.3456789, 10)).to.be.equal(12.3);
    });

    it("converts to number", async function () {
      expect(round("12.3456789", 100)).to.be.equal(12.35);
    });

    it("always returns number", async function () {
      expect(round(null)).to.be.equal(0);
    });
  });

  describe("throttle", function () {
    it("limits function calls", async function () {
      let callCount = 0,
        throttled = throttle(function () {
          callCount++;
        }, 32);

      throttled();
      throttled();
      throttled();

      expect(callCount).to.be.equal(1);

      await delay(128);

      expect(callCount).to.be.equal(1);
    });

    it("triggers a second throttled call as soon as possible", async function () {
      let callCount = 0,
        throttled = throttle(function () {
          callCount++;
        }, 32);

      throttled();
      throttled();

      expect(callCount).to.be.equal(1);

      await delay(64);

      throttled();
      throttled();

      expect(callCount).to.be.equal(2);

      await delay(64);

      throttled();
      throttled();

      expect(callCount).to.be.equal(3);
    });
  });
});
