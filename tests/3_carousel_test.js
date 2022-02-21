import { Carousel } from "../dist/carousel.esm.js";

const expect = chai.expect;

const defaultMarkup = `
  <div class="carousel">
    <div class="carousel__track">
      <div class="carousel__slide">0</div>
      <div class="carousel__slide">1</div>
      <div class="carousel__slide">2</div>
      <div class="carousel__slide">3</div>
      <div class="carousel__slide">4</div>
      <div class="carousel__slide">5</div>
      <div class="carousel__slide">6</div>
    </div>
  </div>
`;

function createSandbox(content) {
  const sandbox = document.createElement("div");
  sandbox.style.cssText = "position:fixed;top:0;left:0;width:200px;overflow:visible;visibility:hidden;";

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

describe("Carousel", function () {
  function createInstance(opts = {}) {
    const { markup = defaultMarkup } = opts;

    const element = createSandbox(markup).querySelector(".carousel");

    return new Carousel(element, opts);
  }

  function destroyInstance(instance) {
    const sandbox = instance.$container.parentNode;
    instance.destroy();
    sandbox.parentNode.removeChild(sandbox);
  }

  it("should initialise", function () {
    const instance = createInstance();

    expect(instance).to.be.an.instanceof(Carousel);

    expect(instance.$container).to.be.an.instanceof(HTMLElement);

    destroyInstance(instance);
  });

  it("should calculate viewport and track dimensions", function () {
    const instance = createInstance();

    expect(instance.Panzoom.viewport.width).to.be.equal(200);
    expect(instance.Panzoom.content.width).to.be.equal(840);

    destroyInstance(instance);
  });

  it("should calculate position and size of each page", function () {
    const instance = createInstance();

    expect(instance.pages).to.be.an("array");
    expect(instance.pages.length).to.be.equal(7);

    let left = -40;

    for (let i = 0; i < 7; i++) {
      expect(instance.pages[i].width).to.be.equal(120);
      expect(instance.pages[i].left).to.be.equal(left);

      left += 120;
    }

    destroyInstance(instance);
  });

  it("should calculate position and size of each slide", function () {
    const instance = createInstance();

    expect(instance.slides).to.be.an("array");
    expect(instance.slides.length).to.be.equal(7);

    let left = 0;

    for (let i = 0; i < 7; i++) {
      expect(instance.slides[i].width).to.be.equal(120);
      expect(instance.slides[i].left).to.be.equal(left);

      left += 120;
    }

    destroyInstance(instance);
  });

  it("should handle custom sized slides", function () {
    const instance = createInstance();

    instance.slides[0].$el.style["flex-basis"] = "80%";

    // These two slides will now fit into one page by default,
    // so the total number of pages will be 6
    instance.slides[1].$el.style["flex-basis"] = "40%";
    instance.slides[2].$el.style["flex-basis"] = "40%";

    instance.updateMetrics();

    expect(instance.pages.length).to.be.equal(6);

    expect(instance.pages[0].width).to.be.equal(160);
    expect(instance.pages[0].left).to.be.equal(-20);

    expect(instance.pages[1].width).to.be.equal(160);
    expect(instance.pages[1].left).to.be.equal(140);

    expect(instance.slides.length).to.be.equal(7);

    expect(instance.slides[0].width).to.be.equal(160);
    expect(instance.slides[0].left).to.be.equal(0);

    expect(instance.slides[1].width).to.be.equal(80);
    expect(instance.slides[1].left).to.be.equal(160);

    expect(instance.slides[2].width).to.be.equal(80);
    expect(instance.slides[2].left).to.be.equal(240);

    destroyInstance(instance);
  });

  it("can have custom initial page", function () {
    const instance = createInstance({
      initialPage: 5,
    });

    // Check page no.
    expect(instance.page).to.equal(5);

    // Check if carousel has correct position
    const left = instance.pages[5].left;

    expect(left).to.equal(560);
    expect(instance.Panzoom.content.x).to.equal(left * -1);

    destroyInstance(instance);
  });

  it("can slide to next page (throttled)", async function () {
    const instance = createInstance();

    expect(instance.page).to.equal(0);

    instance.slideNext();

    expect(instance.page).to.equal(1);

    instance.slideNext();

    expect(instance.page).to.equal(1);

    await delay(300);

    instance.slideNext();

    expect(instance.page).to.equal(2);

    await delay(1500);

    expect(instance.Panzoom.content.x).to.equal(-200);

    destroyInstance(instance);
  });

  it("can slide to previous page", async function () {
    const instance = createInstance({
      initialPage: 2,
    });

    expect(instance.page).to.equal(2);

    instance.slidePrev();

    expect(instance.page).to.equal(1);

    await delay(1500);

    expect(instance.Panzoom.content.x).to.equal(-80);

    destroyInstance(instance);
  });

  it("flips slides when sliding infinite carousel forward to the end", async function () {
    const instance = createInstance({
      initialPage: 5,
    });

    instance.slideNext();

    expect(instance.page).to.equal(6);

    await delay(1500);

    expect(instance.Panzoom.content.x).to.equal(160);

    expect(instance.slides[5].$el.style.left).to.equal("-840px");
    expect(instance.slides[6].$el.style.left).to.equal("-840px");

    destroyInstance(instance);
  });

  it("flips slides when sliding infinite carousel backward from the end", async function () {
    const instance = createInstance();

    instance.slideTo(6, { friction: 0 });

    expect(instance.Panzoom.content.x).to.equal(160);

    expect(instance.slides[5].$el.style.left).to.equal("-840px");
    expect(instance.slides[6].$el.style.left).to.equal("-840px");

    instance.slidePrev();

    expect(instance.page).to.equal(5);

    await delay(1500);

    expect(instance.Panzoom.content.x).to.equal(-560);

    expect(instance.slides[5].$el.style.left).to.equal("");
    expect(instance.slides[6].$el.style.left).to.equal("");

    destroyInstance(instance);
  });

  it("can slide to custom page", async function () {
    const instance = createInstance();

    expect(instance.page).to.equal(0);

    instance.slideTo(5);

    expect(instance.page).to.equal(5);

    await delay(1500);

    expect(instance.Panzoom.content.x).to.be.closeTo(-560, 0.5);

    destroyInstance(instance);
  });

  it("can slide to custom page with custom friction", async function () {
    const instance = createInstance();

    expect(instance.page).to.equal(0);

    instance.slideTo(5, {
      friction: 0.3,
    });

    expect(instance.page).to.equal(5);

    await delay(200);

    expect(instance.Panzoom.content.x).to.equal(-560);

    destroyInstance(instance);
  });

  it("can slide to closest page", async function () {
    const instance = createInstance();

    expect(instance.page).to.equal(0);

    instance.Panzoom.panTo({ x: -360, friction: 0.2 });

    await delay(250);

    instance.slideToClosest({
      friction: 0.3,
    });

    expect(instance.page).to.equal(3);

    await delay(200);

    expect(instance.Panzoom.content.x).to.equal(-320);

    destroyInstance(instance);
  });

  it("will automatically update metrics after resizing wrapping element", async function () {
    const instance = createInstance();

    await delay(50);

    expect(instance.Panzoom.content.width).to.equal(840);
    expect(instance.slides[6].width).to.equal(120);
    expect(instance.slides[6].left).to.equal(720);

    instance.$container.parentNode.style.width = "600px";

    await delay(350);

    expect(instance.Panzoom.content.width).to.equal(2520);
    expect(instance.slides[6].width).to.equal(360);
    expect(instance.slides[6].left).to.equal(2160);

    destroyInstance(instance);
  });

  it("will toggle navigation after resizing wrapping element", async function () {
    const sandbox = createSandbox('<style>.carousel__slide {width: 200px;}</style><div class="carousel"></div></div>');
    const mainElement = sandbox.querySelector(".carousel");

    mainElement.parentNode.style.width = "600px";

    const instance = new Carousel(mainElement, {
      slides: [{ html: "main #0" }, { html: "main #2" }, { html: "main #3" }],
    });

    expect(sandbox.querySelector(".carousel__nav")).to.be.null;

    await delay(50);

    mainElement.parentNode.style.width = "400px";

    await delay(350);

    expect(sandbox.querySelector(".carousel__nav")).to.be.instanceOf(HTMLElement);

    destroyInstance(instance);
  });

  it("will toggle dots after resizing wrapping element", async function () {
    const sandbox = createSandbox('<style>.carousel__slide {width: 200px;}</style><div class="carousel"></div></div>');
    const mainElement = sandbox.querySelector(".carousel");

    mainElement.parentNode.style.width = "600px";

    const instance = new Carousel(mainElement, {
      slides: [{ html: "main #0" }, { html: "main #2" }, { html: "main #3" }],
    });

    expect(sandbox.querySelector(".carousel__dots")).to.be.null;

    await delay(50);

    mainElement.parentNode.style.width = "400px";

    await delay(300);

    expect(sandbox.querySelector(".carousel__dots")).to.be.instanceOf(HTMLElement);
    expect(sandbox.querySelector(".carousel__dots").children.length).to.equal(2);

    destroyInstance(instance);
  });

  it("can find page from x position", async function () {
    const instance = createInstance();

    expect(instance.getPageFromPosition(0)).to.deep.equal([0, 0]);
    expect(instance.getPageFromPosition(250)).to.deep.equal([2, 2]);
    expect(instance.getPageFromPosition(550)).to.deep.equal([5, 5]);
    expect(instance.getPageFromPosition(650)).to.deep.equal([6, 6]);
    expect(instance.getPageFromPosition(750)).to.deep.equal([0, 7]);
    expect(instance.getPageFromPosition(-100)).to.deep.equal([0, 0]);

    destroyInstance(instance);
  });

  it("can be customized: (center : true, infinite: true)", async function () {
    const instance = createInstance({
      center: true,
      infinite: true,
    });

    expect(instance.Panzoom.content.x).to.equal(40);

    instance.slidePrev();

    await delay(1500);

    expect(instance.page).to.equal(6);

    expect(instance.Panzoom.content.x).to.equal(160);

    destroyInstance(instance);
  });

  it("can be customized: (center : true, infinite: false, fill: true)", async function () {
    const instance = createInstance({
      center: true,
      infinite: false,
      fill: true,
    });

    expect(instance.Panzoom.content.x).to.equal(0);

    instance.slidePrev();

    await delay(1500);

    expect(instance.page).to.equal(0);

    expect(instance.Panzoom.content.x).to.equal(0);

    destroyInstance(instance);
  });

  it("can be customized: (center : true, infinite: false, fill: false)", async function () {
    const instance = createInstance({
      center: true,
      infinite: false,
      fill: false,
    });

    expect(instance.Panzoom.content.x).to.equal(40);

    instance.slidePrev();

    await delay(1500);

    expect(instance.page).to.equal(0);

    expect(instance.Panzoom.content.x).to.equal(40);

    destroyInstance(instance);
  });

  it("can be customized: (center : false, infinite: true)", async function () {
    const instance = createInstance({
      center: false,
      infinite: true,
    });

    expect(instance.Panzoom.content.x).to.equal(0);

    instance.slidePrev();

    await delay(1500);

    expect(instance.page).to.equal(6);

    expect(instance.Panzoom.content.x).to.equal(120);

    destroyInstance(instance);
  });

  it("can be customized: (center : false, infinite: false)", async function () {
    const instance = createInstance({
      center: false,
      infinite: false,
    });

    expect(instance.Panzoom.content.x).to.equal(0);

    instance.slidePrev();

    await delay(1500);

    expect(instance.page).to.equal(0);

    expect(instance.Panzoom.content.x).to.equal(0);

    destroyInstance(instance);
  });

  it("supports virtual slides", async function () {
    const instance = createInstance({
      markup: '<div class="carousel"></div>',
      slides: [{ html: "#0" }, { html: "#2" }, { html: "#3" }],
    });

    expect(instance.pages.length).to.equal(3);
    expect(instance.Panzoom.content.width).to.equal(360);

    expect(instance.slides[0].width).to.equal(120);
    expect(instance.slides[0].left).to.equal(0);

    expect(instance.slides[2].width).to.equal(120);
    expect(instance.slides[2].left).to.equal(240);

    destroyInstance(instance);
  });

  it("can sync two instances", async function () {
    const sandbox = createSandbox('<div class="carousel"></div><div class="nav"></div>');

    const mainElement = sandbox.querySelector(".carousel");
    const navElement = sandbox.querySelector(".nav");

    const main = new Carousel(mainElement, {
      slides: [{ html: "main #0" }, { html: "main #2" }, { html: "main #3" }],
      initialPage: 1,
    });

    const nav = new Carousel(navElement, {
      slides: [{ html: "nav #0" }, { html: "nav #2" }, { html: "nav #3" }],
      Sync: {
        target: main,
      },
    });

    expect(main.page).to.equal(1);
    expect(nav.page).to.equal(1);

    main.slideNext();

    expect(main.page).to.equal(2);
    expect(nav.page).to.equal(2);

    nav.destroy();
    destroyInstance(main);
  });

  it("can sync two instances - click to select", async function () {
    const sandbox = createSandbox('<div class="carousel"></div><div class="nav"></div>');

    const mainElement = sandbox.querySelector(".carousel");
    const navElement = sandbox.querySelector(".nav");

    const main = new Carousel(mainElement, {
      slides: [{ html: "main #0" }, { html: "main #1" }, { html: "main #2" }],
    });

    const nav = new Carousel(navElement, {
      slides: [{ html: "nav #0" }, { html: "nav #1" }, { html: "nav #2" }],
      Sync: {
        target: main,
      },
    });

    expect(main.page).to.equal(0);
    expect(nav.page).to.equal(0);

    nav.Panzoom.panTo({ x: -128, friction: 0.1 });

    await delay(150);

    triggerEvent(nav.slides[1].$el, "click", {});

    expect(main.page).to.equal(1);
    expect(nav.page).to.equal(1);

    nav.destroy();
    destroyInstance(main);
  });

  it("selects closest page after free drag", async function () {
    const instance = createInstance({
      dragFree: true,
      Navigation: false,
    });

    const x = instance.Panzoom.$content.getClientRects()[0].left;
    const y = instance.Panzoom.$content.getClientRects()[0].top;

    triggerEvent(instance.Panzoom.$container, "mousedown", {
      button: 0,
      buttons: 1,
      clientX: x + 150,
      clientY: y + 50,
    });

    triggerEvent(instance.Panzoom.$container, "mousemove", {
      clientX: x + 50,
      clientY: y + 50,
    });

    await delay(300);

    triggerEvent(instance.Panzoom.$container, "mouseup", {});

    expect(instance.page).to.equal(1);

    destroyInstance(instance);
  });

  it("determines the end of the animation", async function () {
    let called = 0;

    const instance = createInstance({
      dragFree: true,
      Navigation: false,
    });

    instance.on("Panzoom.endAnimation", () => {
      called++;
    });

    const x = instance.Panzoom.$content.getClientRects()[0].left;
    const y = instance.Panzoom.$content.getClientRects()[0].top;

    triggerEvent(instance.Panzoom.$container, "mousedown", {
      button: 0,
      buttons: 1,
      clientX: x + 150,
      clientY: y + 50,
    });

    triggerEvent(instance.Panzoom.$container, "mousemove", {
      clientX: x + 50,
      clientY: y + 50,
    });

    await delay(300);

    triggerEvent(instance.Panzoom.$container, "mouseup", {});

    expect(instance.page).to.equal(1);

    await delay(1000);

    expect(called).to.equal(1);

    destroyInstance(instance);
  });

  it("supports lazy loading", async function () {
    const instance = createInstance({
      markup: `<div class="carousel">
        <div class="carousel__slide">
          <img data-lazy-src="https://lipsum.app/id/1/300x200" />
        </div>
        <div class="carousel__slide">
          <img data-lazy-src="https://lipsum.app/id/2/300x200" />
        </div>
        <div class="carousel__slide">
          <img data-lazy-src="https://lipsum.app/id/3/300x200" />
        </div>
        <div class="carousel__slide">
          <img data-lazy-src="https://lipsum.app/id/4/300x200" />
        </div>
        <div class="carousel__slide">
          <img data-lazy-src="https://lipsum.app/id/5/300x200" />
        </div>
      </div>`,
    });

    let nodes = [...instance.$track.querySelectorAll("[data-lazy-src]")];

    expect(nodes.length).to.equal(5);

    expect(nodes[0].src).to.equal("https://lipsum.app/id/1/300x200");
    expect(nodes[1].src).to.equal("https://lipsum.app/id/2/300x200");
    expect(nodes[2].src).to.equal("");
    expect(nodes[3].src).to.equal("");
    expect(nodes[4].src).to.equal("https://lipsum.app/id/5/300x200");

    destroyInstance(instance);
  });
});
