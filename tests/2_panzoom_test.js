import { extend } from "../src/shared/utils/extend.js";
import { Panzoom } from "../dist/panzoom.esm.js";

const expect = chai.expect;

const markupWithImage = `
   <div class="panzoom" style="width:225px;height:150px;">
    <img class="panzoom__content" src="./assets/300_200.png" />
  </div>
`;

const markupWithDiv = `
   <div class="panzoom" style="width:225px;height:150px;">
    <div class="panzoom__content" style="width:400px;height:100px;max-width:none;background:#eee;"></div>
  </div>
`;

function createSandbox(content) {
  const sandbox = document.createElement("div");
  sandbox.style.cssText =
    "position:fixed;top:calc(50vh - 75px);left:calc(50vw - 112px);overflow:visible;visibility:hidden;";
  // "position:fixed;top:calc(50vh - 75px);left:calc(50vw - 112px);overflow:visible; outline:1px solid red;";
  sandbox.innerHTML = content;
  document.body.appendChild(sandbox);

  return sandbox;
}

function triggerEvent(element, type, data = {}) {
  const event = document.createEvent("Event");
  event.initEvent(type, true, true);

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      Object.defineProperty(event, key, {
        value: data[key],
      });
    }
  }

  element.dispatchEvent(event);

  return event;
}

function delay(time = 500) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

describe("Panzoom", function () {
  function createInstanceWithDiv(opts = {}) {
    const viewport = createSandbox(markupWithDiv).querySelector(".panzoom");

    return new Panzoom(viewport, opts);
  }

  function createInstanceWithImage(opts = {}, zoomedIn = false) {
    const viewport = createSandbox(markupWithImage).querySelector(".panzoom");

    return new Promise((resolve) => {
      if (zoomedIn) {
        opts = extend(true, {}, opts, {
          on: {
            load: (instance) => {
              instance.once("afterAnimate", () => {
                resolve(instance);
              });

              instance.toggleZoom();
            },
          },
        });
      } else {
        opts = extend(true, {}, opts, {
          on: {
            load: (instance) => {
              resolve(instance);
            },
          },
        });
      }

      new Panzoom(viewport, opts);
    });
  }

  function destroyInstance(instance) {
    const sandbox = instance.$viewport.parentNode;
    instance.destroy();
    sandbox.parentNode.removeChild(sandbox);
  }

  it("sets content", function () {
    const instance = createInstanceWithDiv();

    expect(instance.$content).be.an.instanceof(Element);

    destroyInstance(instance);
  });

  it("fits image inside viewport while keeping its aspect ratio", async function () {
    const instance = await createInstanceWithImage();

    expect(instance.$content.clientWidth).to.equal(225);
    expect(instance.$content.clientHeight).to.equal(150);

    expect(instance.$content.offsetTop).to.equal(0);
    expect(instance.$content.offsetLeft).to.equal(0);

    destroyInstance(instance);
  });

  it("updates image dimensions and position after container resizes", async function () {
    const instance = await createInstanceWithImage();

    instance.$viewport.style.width = "180px";
    instance.$viewport.style.height = "180px";

    await delay(20);

    expect(instance.$content.clientWidth).to.equal(180);
    expect(instance.$content.clientHeight).to.equal(120);

    expect(instance.$content.offsetTop).to.equal(30);
    expect(instance.$content.offsetLeft).to.equal(0);

    destroyInstance(instance);
  });

  it("toggles content zoom level using `toggleZoom()`", async function () {
    const instance = await createInstanceWithImage();

    let result = "";

    // Scale to max zoom level
    result = await new Promise((resolve) => {
      instance.once("afterAnimate", (that) => {
        resolve(that.$content.style.transform);
      });

      instance.toggleZoom();
    });

    expect(result).to.equal("translate(0px, 0px) scale(2.6667)");
    expect(instance.current.scale).to.be.closeTo(2.6667, 0.1);

    // Scale to fit
    result = await new Promise((resolve) => {
      instance.once("afterAnimate", (that) => {
        resolve(that.$content.style.transform);
      });

      instance.toggleZoom();
    });

    expect(result).to.equal("");
    expect(instance.current.scale).to.be.equal(1);

    destroyInstance(instance);
  });

  it("updates bounds after changing zoom level", async function () {
    const instance = await createInstanceWithImage();

    expect(instance.boundX).to.deep.equal({ from: 0, to: 0 });
    expect(instance.boundY).to.deep.equal({ from: 0, to: 0 });

    await new Promise((resolve) => {
      instance.on("afterAnimate", () => {
        resolve();
      });

      instance.zoomTo(2);
    });

    // Horizontal bounds will be +/- (450 - 225) / 2 (where 450 is double wrap width)
    expect(instance.boundX).to.deep.equal({ from: -112.5, to: 112.5 });

    // Vertical bounds will be +/- (300 - 150) / 2 (where 300 is double wrap height)
    expect(instance.boundY).to.deep.equal({ from: -75, to: 75 });

    destroyInstance(instance);
  });

  it("zooms to clicked coordinates", async function () {
    const instance = await createInstanceWithImage();

    const clickAtXY = function (x, y) {
      return new Promise((resolve) => {
        instance.on("afterAnimate", (that) => {
          resolve(that.$content.style.transform);
        });

        triggerEvent(instance.$viewport, "click", {
          clientX: instance.$content.getClientRects()[0].left + x,
          clientY: instance.$content.getClientRects()[0].top + y,
        });
      });
    };

    // Click top left corner
    const result1 = await clickAtXY(0, 0);

    expect(result1).to.equal("translate(187.5px, 125px) scale(2.6667)");

    // Reset zoom level
    await clickAtXY(0, 0);

    // Click bottom right corner
    const result2 = await clickAtXY(225, 150);

    expect(result2).to.equal("translate(-187.5px, -125px) scale(2.6667)");

    destroyInstance(instance);
  });

  it("is draggable using pointer events", async function () {
    const instance = await createInstanceWithImage({}, true);

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$viewport, "pointerdown", {
      pointerId: 1,
      clientX: x + 20,
      clientY: y + 20,
    });

    triggerEvent(instance.$viewport, "pointermove", {
      pointerId: 1,
      clientX: x + 40,
      clientY: y + 60,
    });

    await delay();

    triggerEvent(instance.$viewport, "pointerup", {
      pointerId: 1,
    });

    // It should be moved 20px horizontally and 40px vertically
    expect(instance.$content.style.transform).to.equal("translate(20px, 40px) scale(2.6667)");

    destroyInstance(instance);
  });

  it("has drag resistance", async function () {
    const instance = await createInstanceWithImage({}, true);

    expect(instance.boundX).to.deep.equal({ from: -187.5, to: 187.5 });
    expect(instance.boundY).to.deep.equal({ from: -125, to: 125 });

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$viewport, "pointerdown", {
      pointerId: 1,
      clientX: x,
      clientY: y + 50,
    });

    triggerEvent(instance.$viewport, "pointermove", {
      pointerId: 1,
      clientX: x + 300,
      clientY: y + 50,
    });

    // // Wait for dragging animation to end
    await delay();

    // Test drag resistance outside boundaries
    // =======

    expect(instance.drag.endPosition.x).to.be.equal(instance.boundX.to + (300 - instance.boundX.to) * 0.3);

    // Test if content is pulled back inside boundaries
    // ======
    instance.once("afterAnimate", (that) => {
      expect(instance.current.x).to.be.closeTo(187.5, 0.5);
    });

    // This will Start pull-back animation
    triggerEvent(instance.$viewport, "pointerup", {
      pointerId: 1,
    });

    destroyInstance(instance);
  });

  it("can lock axis while dragging", async function () {
    const instance = createInstanceWithDiv({
      lockAxis: "x",
    });

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$viewport, "pointerdown", {
      pointerId: 1,
      clientX: x + 50,
      clientY: y + 50,
    });

    triggerEvent(instance.$viewport, "pointermove", {
      pointerId: 1,
      clientX: x + 30,
      clientY: y + 30,
    });

    // Wait for animation
    await delay();

    triggerEvent(instance.$viewport, "pointerup", {
      pointerId: 1,
    });

    expect(instance.current.x).to.be.closeTo(-20, 0.5);
    expect(instance.current.y).to.be.equal(0);

    destroyInstance(instance);
  });

  it('should lock on correct axis if `lockAxis:"xy"', async function () {
    const instance = createInstanceWithDiv({
      lockAxis: "xy",
    });

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$viewport, "pointerdown", {
      pointerId: 1,
      clientX: x + 50,
      clientY: y + 50,
    });

    triggerEvent(instance.$viewport, "pointermove", {
      pointerId: 1,
      clientX: x + 52,
      clientY: y + 60,
    });

    // Wait for animation
    await delay();

    triggerEvent(instance.$viewport, "pointerup", {
      pointerId: 1,
    });

    expect(instance.current.x).to.be.equal(0);
    expect(instance.current.y).to.be.closeTo(3, 0.5);

    destroyInstance(instance);
  });

  it("can zoom on wheel", async function () {
    const instance = await createInstanceWithImage();

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    expect(instance.contentDim).to.deep.equal({ width: 225, height: 150 });

    const event = triggerEvent(instance.$viewport, "wheel", {
      deltaY: -1,
      clientX: x + 100,
      clientY: y + 100,
    });

    // Wait for zoom animation
    await delay();

    // Check if content is zoomed
    expect(instance.$content.style.transform).to.equal("translate(3.75px, -7.5px) scale(1.3)");
    expect(instance.current.scale).to.equal(1.3);

    // Check if an event was prevented with e.preventDefault()
    expect(event.defaultPrevented).to.be.true;

    destroyInstance(instance);
  });

  it("allows to scroll the page after reaching wheel count limit", async function () {
    const instance = await createInstanceWithImage();

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    let event;

    // It should take 4 wheel events to reach max zoom level
    for (let i = 0; i <= 4; i++) {
      event = triggerEvent(instance.$viewport, "wheel", {
        deltaY: -1,
        clientX: x + 80,
        clientY: y + 80,
      });

      await delay(200);

      expect(event.defaultPrevented).to.be.true;
    }

    // Check if max level is reached
    expect(instance.current.scale).to.be.closeTo(instance.option("maxScale"), 0.1);

    // Simulate wheel events to reach wheel count limit
    for (let i = 0; i < 3; i++) {
      event = triggerEvent(instance.$viewport, "wheel", {
        deltaY: -1,
        clientX: x + 80,
        clientY: y + 80,
      });

      expect(event.defaultPrevented).to.be.true;
      expect(instance.velocity.scale).to.equal(0);
    }

    // Simulate one more event
    event = triggerEvent(instance.$viewport, "wheel", {
      deltaY: -1,
      clientX: x + 80,
      clientY: y + 80,
    });

    // It should now be past limit
    expect(event.defaultPrevented).to.be.false;

    destroyInstance(instance);
  });

  it("has click event", async function () {
    const instance = await createInstanceWithImage();

    const result = await new Promise((resolve) => {
      instance.on("click", () => {
        resolve(true);
      });

      triggerEvent(instance.$viewport, "click");
    });

    expect(result).to.be.true;

    destroyInstance(instance);
  });

  it("has double-click event", async function () {
    let result = "";

    const instance = await createInstanceWithImage({
      on: {
        click: () => {
          result = "single";
        },
        doubleClick: () => {
          result = "double";
        },
      },
    });

    let x = instance.$content.getClientRects()[0].left;
    let y = instance.$content.getClientRects()[0].top;

    // First click
    triggerEvent(instance.$viewport, "click", {
      clientX: x + 11,
      clientY: y + 11,
    });

    expect(result).to.equal("");

    // Second click within allowed distance and time
    await delay(10);

    triggerEvent(instance.$viewport, "click", {
      clientX: x + 15,
      clientY: y + 15,
    });

    expect(result).to.equal("double");

    destroyInstance(instance);
  });

  it("should prevent click event after dragging", async function () {
    let result = "idle";

    const instance = await createInstanceWithImage({
      on: {
        click: () => {
          result += "click#a";
        },
      },
    });

    instance.$viewport.addEventListener("click", () => {
      result += "click#b";
    });

    let x = instance.$content.getClientRects()[0].left;
    let y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$viewport, "pointerdown", {
      pointerId: 1,
      clientX: x + 10,
      clientY: y + 10,
    });

    triggerEvent(instance.$viewport, "pointermove", {
      pointerId: 1,
      clientX: x + 20,
      clientY: y + 20,
    });

    triggerEvent(instance.$viewport, "pointerup", {
      pointerId: 1,
    });

    // Trigger click event
    triggerEvent(instance.$viewport, "click");

    expect(result).to.equal("idle");

    destroyInstance(instance);
  });

  it("should not prevent click event after a tiny flick", async function () {
    let result = "idle";

    const instance = await createInstanceWithImage({
      on: {
        click: () => {
          result += "click#a";
        },
      },
    });

    instance.$viewport.addEventListener("click", () => {
      result += "click#b";
    });

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$viewport, "pointerdown", {
      pointerId: 1,
      clientX: x + 10,
      clientY: y + 10,
    });

    triggerEvent(instance.$viewport, "pointermove", {
      pointerId: 1,
      clientX: x + 12,
      clientY: y + 12,
    });

    triggerEvent(instance.$viewport, "pointerup", {
      pointerId: 1,
    });

    // Trigger click event
    triggerEvent(instance.$viewport, "click");

    expect(result).to.equal("idleclick#aclick#b");

    destroyInstance(instance);
  });

  it("allows to drag if content fits, pulls back afterwards", async function () {
    const instance = await createInstanceWithImage();

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$viewport, "pointerdown", {
      pointerId: 1,
      clientX: x + 20,
      clientY: y + 20,
    });

    triggerEvent(instance.$viewport, "pointermove", {
      pointerId: 1,
      clientX: x + 40,
      clientY: y + 20,
    });

    // Animation would start
    await delay(150);

    expect(instance.current.x).to.be.closeTo(6, 1);
    expect(instance.current.y).to.be.equal(0);

    triggerEvent(instance.$viewport, "pointerup", {
      pointerId: 1,
    });

    // Wait for pull-back animation
    await delay();

    // Test if content is pulled back
    expect(instance.current.x).to.equal(0);

    destroyInstance(instance);
  });

  it("prevents drag if content fits and has option `panOnlyZoomed:true`", async function () {
    const instance = await createInstanceWithImage({
      panOnlyZoomed: true,

      // Disable click event so it would not interfere with this test
      click: false,
      doubleClick: false,
    });

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$viewport, "pointerdown", {
      pointerId: 1,
      clientX: x + 10,
      clientY: y + 10,
    });

    triggerEvent(instance.$viewport, "pointermove", {
      pointerId: 1,
      clientX: x + 50,
      clientY: y + 50,
    });

    // Animation would start
    await delay(50);

    expect(instance.current.x).to.be.equal(0);
    expect(instance.current.y).to.be.equal(0);

    triggerEvent(instance.$viewport, "pointerup", {
      pointerId: 1,
    });

    destroyInstance(instance);
  });

  it("should prevent click event after dragging", async function () {
    let result = "idle";

    const instance = await createInstanceWithImage({
      on: {
        click: () => {
          result += "click#a";
        },
      },
    });

    instance.$viewport.addEventListener("click", () => {
      result += "click#b";
    });

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$viewport, "pointerdown", {
      pointerId: 1,
      clientX: x + 10,
      clientY: y + 10,
    });

    triggerEvent(instance.$viewport, "pointermove", {
      pointerId: 1,
      clientX: x + 20,
      clientY: y + 20,
    });

    triggerEvent(instance.$viewport, "pointerup", {
      pointerId: 1,
    });

    // Trigger click event
    triggerEvent(instance.$viewport, "click");

    expect(result).to.equal("idle");

    destroyInstance(instance);
  });

  it("prevents panning outside boundaries", async function () {
    const instance = await createInstanceWithImage();

    instance.panTo({ x: 10, y: 10 });

    await delay();

    expect(instance.current.x).to.be.equal(0);
    expect(instance.current.y).to.be.equal(0);

    triggerEvent(instance.$viewport, "pointerup", {
      pointerId: 1,
    });

    destroyInstance(instance);
  });

  it("allows to ignore bounds while panning", async function () {
    const instance = await createInstanceWithImage();

    instance.panTo({ x: 10, y: 10, ignoreBounds: true });

    await delay();

    expect(instance.current.x).to.be.equal(10);
    expect(instance.current.y).to.be.equal(10);

    triggerEvent(instance.$viewport, "pointerup", {
      pointerId: 1,
    });

    destroyInstance(instance);
  });
});
