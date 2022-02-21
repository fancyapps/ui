import { extend } from "../src/shared/utils/extend.js";
import { Panzoom } from "../dist/panzoom.esm.js";

const expect = chai.expect;

const markupWithImage = `
   <div class="panzoom" style="width:225px;height:150px;">
    <img class="panzoom__content" src="./assets/300_200.png" draggable="false" />
  </div>
`;

const markupWithDiv = `
   <div class="panzoom" style="width:225px;height:150px;">
    <div class="panzoom__content">
      <div style="width:400px;height:100px;max-width:none;background:#eee;"></div>
    </div>
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

    opts = extend(true, { zoom: false }, opts);

    return new Panzoom(viewport, opts);
  }

  async function createInstanceWithImage(opts = {}, zoomedIn = false) {
    const viewport = createSandbox(markupWithImage).querySelector(".panzoom");

    return new Promise((resolve) => {
      if (zoomedIn) {
        opts = extend(true, {}, opts, {
          zoomFriction: 0.1,
          on: {
            load: (instance) => {
              instance.once("endAnimation", () => {
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
    const sandbox = instance.$container.parentNode;
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

    await delay(50);

    instance.$container.style.width = "180px";
    instance.$container.style.height = "180px";

    await delay(300);

    const contentRect = instance.$content.getBoundingClientRect();
    const containerRect = instance.$container.getBoundingClientRect();

    expect(contentRect.width).to.equal(180);
    expect(contentRect.height).to.equal(120);

    expect(contentRect.top - containerRect.top).to.equal(30);
    expect(contentRect.left - containerRect.left).to.equal(0);

    destroyInstance(instance);
  });

  it("toggles content zoom level using `toggleZoom()`", async function () {
    const instance = await createInstanceWithImage();

    let result = "";

    // Scale to max zoom level
    result = await new Promise((resolve) => {
      instance.once("endAnimation", (that) => {
        resolve(that);
      });

      instance.toggleZoom();
    });

    expect(result.transform.scale).to.be.closeTo(1.3333, 0.1);

    // Scale to fit
    result = await new Promise((resolve) => {
      instance.once("endAnimation", (that) => {
        resolve(that);
      });

      instance.toggleZoom();
    });

    expect(result.transform.scale).to.equal(1);

    destroyInstance(instance);
  });

  it("updates bounds after changing zoom level", async function () {
    const instance = await createInstanceWithImage();

    let bounds = instance.getBounds();

    expect(bounds.boundX).to.deep.equal({ from: 0, to: 0 });
    expect(bounds.boundY).to.deep.equal({ from: 0, to: 0 });

    await new Promise((resolve) => {
      instance.on("endAnimation", () => {
        resolve();
      });

      instance.zoomTo(2);
    });

    bounds = { ...bounds, ...instance.getBounds() };

    // Left bound will be `300 - 225`
    expect(bounds.boundX).to.deep.equal({ from: -75, to: 0 });

    // Top bound will be `300 - 150`
    expect(bounds.boundY).to.deep.equal({ from: -50, to: 0 });

    destroyInstance(instance);
  });

  it("zooms to clicked coordinates", async function () {
    const instance = await createInstanceWithImage();

    const clickAtXY = function (x, y) {
      return new Promise((resolve) => {
        instance.on("endAnimation", (that) => {
          resolve(that);
        });

        triggerEvent(instance.$content, "click", {
          clientX: instance.$content.getBoundingClientRect().left + x,
          clientY: instance.$content.getBoundingClientRect().top + y,
        });
      });
    };

    // Click top left corner
    const result1 = await clickAtXY(0, 0);

    expect(result1.$content.style.transform).to.equal("translate3d(0px, 0px, 0px) scale(1)");
    expect(result1.$content.style.width).to.equal("300px");
    expect(result1.$content.style.height).to.equal("200px");

    // Reset zoom level
    await clickAtXY(0, 0);

    // Click bottom right corner
    const result2 = await clickAtXY(225, 150);

    expect(result2.$content.style.transform).to.equal("translate3d(-75px, -50px, 0px) scale(1)");

    destroyInstance(instance);
  });

  it("is draggable using pointing device", async function () {
    const instance = await createInstanceWithImage({}, true);

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$container, "mousedown", {
      button: 0,
      buttons: 1,
      clientX: x + 60,
      clientY: y + 60,
    });

    expect(instance.$content.style.transform).to.equal("translate3d(-37.5px, -25px, 0px) scale(1)");

    triggerEvent(instance.$container, "mousemove", {
      clientX: x + 40,
      clientY: y + 60,
    });

    await delay(250);

    // It should be moved
    expect(instance.dragOffset.x).to.equal(-20);
    expect(instance.dragOffset.y).to.equal(0);

    expect(instance.content.x).to.be.closeTo(-57.5, 0.5);
    expect(instance.content.y).to.equal(-25);

    triggerEvent(instance.$container, "mouseup", {});

    destroyInstance(instance);
  });

  it("is draggable using touch device", async function () {
    const instance = await createInstanceWithImage({}, true);

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$container, "touchstart", {
      changedTouches: [
        {
          clientX: x + 60,
          clientY: y + 60,
        },
      ],
    });

    expect(instance.$content.style.transform).to.equal("translate3d(-37.5px, -25px, 0px) scale(1)");

    triggerEvent(instance.$container, "touchmove", {
      changedTouches: [
        {
          clientX: x + 40,
          clientY: y + 60,
        },
      ],
    });

    await delay(250);

    // It should be moved
    expect(instance.dragOffset.x).to.equal(-20);
    expect(instance.dragOffset.y).to.equal(0);

    expect(instance.content.x).to.be.closeTo(-57.5, 0.5);
    expect(instance.content.y).to.equal(-25);

    triggerEvent(instance.$container, "touchend", {});

    destroyInstance(instance);
  });

  it("has drag resistance", async function () {
    const instance = await createInstanceWithImage({}, true);

    const bounds = instance.getBounds();

    expect(bounds.boundX).to.deep.equal({ from: -75, to: 0 });
    expect(bounds.boundY).to.deep.equal({ from: -50, to: 0 });

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$container, "mousedown", {
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: y + 50,
    });

    await delay();

    triggerEvent(instance.$container, "mousemove", {
      clientX: x + 300,
      clientY: y + 50,
    });

    // Wait for dragging animation to end
    await delay();

    // Test drag resistance outside boundaries
    // =======

    expect(instance.dragPosition.x).to.be.equal((instance.dragStart.x + 300) * 0.3);

    // Test if content is pulled back inside boundaries
    // ======

    const result = await new Promise((resolve) => {
      instance.on("endAnimation", (that) => {
        resolve(that);
      });

      // This will Start pull-back animation
      triggerEvent(instance.$container, "mouseup", {});
    });

    expect(result.content.x).to.be.closeTo(0, 0.5);

    destroyInstance(instance);
  });

  it("can lock axis while dragging", async function () {
    const instance = createInstanceWithDiv({
      lockAxis: "x",
    });

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$container, "mousedown", {
      button: 0,
      buttons: 1,
      clientX: x + 50,
      clientY: y + 50,
    });

    await delay();

    triggerEvent(instance.$container, "mousemove", {
      clientX: x + 30,
      clientY: y + 30,
    });

    // Wait for animation
    await delay();

    expect(instance.content.x).to.be.closeTo(-20, 0.5);
    expect(instance.content.y).to.be.equal(25);

    triggerEvent(instance.$container, "mouseup", {});

    destroyInstance(instance);
  });

  it('should lock on correct axis if `lockAxis:"xy"', async function () {
    const instance = await createInstanceWithDiv({ lockAxis: "xy" }, true);

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$container, "mousedown", {
      button: 0,
      buttons: 1,
      clientX: x + 50,
      clientY: y + 50,
    });

    triggerEvent(instance.$container, "mousemove", {
      clientX: x + 45,
      clientY: y + 40,
    });

    // Wait for animation
    await delay();

    expect(instance.content.y).to.be.closeTo(22, 0.5);
    expect(instance.content.x).to.equal(0);

    triggerEvent(instance.$container, "mouseup", {});

    destroyInstance(instance);
  });

  it("can zoom on wheel", async function () {
    const instance = await createInstanceWithImage();

    expect(instance.content.width).to.equal(225);
    expect(instance.content.height).to.equal(150);

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    const event = triggerEvent(instance.$content, "wheel", {
      deltaY: -1,
      clientX: x + 100,
      clientY: y + 100,
    });

    // Wait for zoom animation
    await delay();

    // Check if content is zoomed
    expect(instance.$content.style.transform).to.equal("translate3d(-33.3333px, -33.3333px, 0px) scale(1)");
    expect(instance.content.scale).to.be.closeTo(1.333, 0.01);

    // Check if an event was prevented with e.preventDefault()
    expect(event.defaultPrevented).to.be.true;

    destroyInstance(instance);
  });

  it("allows to scroll the page after reaching wheel count limit", async function () {
    const instance = await createInstanceWithImage();

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    let event;

    // It should take 5 wheel events to reach max zoom level
    for (let i = 0; i <= 5; i++) {
      event = triggerEvent(instance.$content, "wheel", {
        deltaY: -1,
        clientX: x + 80,
        clientY: y + 80,
      });

      if (i === 0) {
        await delay(500);
      }

      expect(event.defaultPrevented).to.be.true;
    }

    // Check if max level is reached
    expect(instance.content.scale).to.be.closeTo(instance.option("maxScale"), 0.01);

    // Simulate one event
    event = triggerEvent(instance.$content, "wheel", {
      deltaY: 1,
      clientX: x + 80,
      clientY: y + 80,
    });

    await delay(500);

    // It should now be past limit
    expect(event.defaultPrevented).to.be.true;

    // Simulate wheel events to reach wheel count limit
    for (let i = 0; i < 5; i++) {
      event = triggerEvent(instance.$content, "wheel", {
        deltaY: 1,
        clientX: x + 80,
        clientY: y + 80,
      });

      expect(event.defaultPrevented).to.be.true;
    }

    // Simulate one more event
    event = triggerEvent(instance.$container, "wheel", {
      deltaY: 1,
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

      let x = instance.$content.getClientRects()[0].left;
      let y = instance.$content.getClientRects()[0].top;

      triggerEvent(instance.$content, "click", {
        clientX: x + 1,
        clientY: y + 1,
      });
    });

    expect(result).to.be.true;

    destroyInstance(instance);
  });

  it("allows to drag if content fits, pulls back afterwards", async function () {
    const instance = await createInstanceWithImage();

    const x = instance.$content.getClientRects()[0].left;
    const y = instance.$content.getClientRects()[0].top;

    triggerEvent(instance.$content, "mousedown", {
      button: 0,
      buttons: 1,
      clientX: x + 40,
      clientY: y + 40,
    });

    triggerEvent(instance.$content, "mousemove", {
      clientX: x + 20,
      clientY: y + 20,
    });

    // Animation would start
    await delay(300);

    expect(instance.content.x).to.be.closeTo(-6, 1);
    expect(instance.content.y).to.be.closeTo(-6, 1);

    triggerEvent(instance.$container, "mouseup", {});

    // Wait for pull-back animation
    await delay(300);

    // Test if content is pulled back
    expect(instance.content.x).to.be.closeTo(0, 1);
    expect(instance.content.y).to.be.closeTo(0, 1);

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

    triggerEvent(instance.$content, "pointerdown", {
      clientX: x + 50,
      clientY: y + 50,
    });

    triggerEvent(instance.$content, "pointermove", {
      clientX: x + 10,
      clientY: y + 10,
    });

    // Animation would start
    await delay(50);

    expect(instance.content.x).to.be.equal(0);
    expect(instance.content.y).to.be.equal(0);

    triggerEvent(instance.$content, "pointerup", {});

    destroyInstance(instance);
  });

  it("prevents panning outside boundaries", async function () {
    const instance = await createInstanceWithImage();

    instance.panTo({ x: 10, y: 10 });

    await delay();

    expect(instance.content.x).to.be.equal(0);
    expect(instance.content.y).to.be.equal(0);

    triggerEvent(instance.$content, "pointerup", {});

    destroyInstance(instance);
  });

  it("allows to ignore bounds while panning", async function () {
    const instance = await createInstanceWithImage();

    instance.panTo({ x: 10, y: 10, ignoreBounds: true });

    await delay();

    expect(instance.content.x).to.be.equal(10);
    expect(instance.content.y).to.be.equal(10);

    triggerEvent(instance.$content, "pointerup", {});

    destroyInstance(instance);
  });
});
