import { Fancybox } from "../dist/fancybox.esm.js";

const expect = chai.expect;

const htmlMarkup = `
  <p>
    <a id="trigger__html-modal" href="#html-modal" data-fancybox>
      Click me
    </a>
  </p>
  <div id="html-modal__wrap">
    <div id="html-modal" style="display:none;">
      <p>Lorem ipsum dolor sit amet</p>
      <p><input type="text" value="" /></p>
    </div>
  </div>
`;

const htmlGalleryMarkup = `
  <p>
    <a id="trigger__html-modal-a" href="#html-modal-a" data-fancybox="html-gallery">
      Click me
    </a>
    <a id="trigger__html-modal-b" href="#html-modal-b" data-fancybox="html-gallery">
      Click me
    </a>
  </p>
  <div id="html-modal__wrap">
    <div id="html-modal-a" style="display:none;">
      <p>Lorem ipsum dolor sit amet</p>
      <p><input type="text" value="" /></p>
    </div>
    <div id="html-modal-b" style="display:none;">
      <p>Vestibulum lobortis ultricies ipsum</p>
      <p><input type="text" value="" /></p>
    </div>
  </div>
`;

const imageMarkup = `
  <style>body {font: 18px normal monospace;}</style>
  <p>
    <a href="./assets/img1_b.jpg" data-fancybox data-caption="Lorem ipsum dolor sit amet">
      <img src="./assets/img1_s.jpg" />
    </a>
  </p>
`;

const imageGalleryMarkup = `
  <p>
    <a href="./assets/img1_b.jpg" data-fancybox="gallery">
      <img src="./assets/img1_s.jpg" />
    </a>
    <a href="./assets/img2_b.jpg" data-fancybox="gallery">
      <img src="./assets/img2_s.jpg" />
    </a>
    <a href="#" data-src="./assets/img3_b.jpg" data-fancybox="gallery">
      <img src="./assets/img3_s.jpg" />
    </a>
  </p>
`;

const image_width = 900;
const image_height = 600;
const image_ratio = image_width / image_height;

let padding_x, padding_y;

if (window.innerWidth > 1024) {
  padding_x = 100 * 2;
  padding_y = 64 * 2;
} else {
  padding_x = 8 * 2;
  padding_y = 48 + 8;
}

const getResizedImageWidth = (container_width, container_height) => {
  const container_ratio = container_width / container_height;

  let resized_width, resized_height;

  if (image_ratio > container_ratio) {
    resized_width = container_width;
    resized_height = resized_width / image_ratio;
  } else {
    resized_height = container_height;
    resized_width = resized_height * image_ratio;
  }

  return [resized_width, resized_height];
};

function createSandbox(content) {
  const sandbox = document.createElement("div");
  sandbox.style.cssText = "position:fixed;top:0;left:0;width:200px;overflow:visible;";
  sandbox.innerHTML = content;
  document.body.appendChild(sandbox);

  return sandbox;
}

function delay(time = 500) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

describe("Fancybox", function () {
  it("can be started using API", function () {
    const instance = new Fancybox([
      {
        type: "html",
        src: "Lorem ipsum dolor sit amet",
      },
    ]);

    expect(instance).to.be.an.instanceof(Fancybox);

    instance.close();
  });

  it("returns instance using `Fancybox.getInstance()`", function () {
    const instance = new Fancybox([
      {
        type: "html",
        src: "Lorem ipsum dolor sit amet",
      },
    ]);

    expect(instance).to.be.an.instanceof(Fancybox);

    expect(Fancybox.getInstance()).to.deep.equal(instance);

    instance.close();

    expect(Fancybox.getInstance()).to.be.null;
  });

  it("automatically adds click event to elements that have `data-fancybox` attribute", async function () {
    const sandbox = createSandbox(htmlMarkup);
    const trigger = document.getElementById("trigger__html-modal");

    trigger.click();

    const instance = Fancybox.getInstance();

    expect(instance).to.be.to.be.an("object");

    instance.close();

    await delay(500);

    sandbox.parentNode.removeChild(sandbox);
  });

  it("does not start if already started from the same trigger element", async function () {
    const sandbox = createSandbox(htmlGalleryMarkup);
    const triggerA = document.getElementById("trigger__html-modal-a");
    const triggerB = document.getElementById("trigger__html-modal-b");

    Fancybox.bind("[data-fancybox]", {
      animated: false,
      showClass: false,
      hideClass: false,
    });

    triggerA.click();

    const ID1 = Fancybox.getInstance().id;

    await delay(100);

    triggerB.click();

    const ID2 = Fancybox.getInstance().id;

    expect(ID2).to.be.equal(ID1);

    Fancybox.getInstance().close();

    sandbox.parentNode.removeChild(sandbox);
  });

  it("can be customized using API", async function () {
    const sandbox = createSandbox(htmlMarkup);
    const trigger = document.getElementById("trigger__html-modal");

    Fancybox.bind("#trigger__html-modal", {
      showClass: false,
      hideClass: false,
      l10n: {
        CLOSE: "Schließen",
      },
    });

    trigger.click();

    const instance = Fancybox.getInstance();
    const opts = instance.options;

    expect(opts.showClass).to.be.false;
    expect(opts.hideClass).to.be.false;
    expect(instance.getSlide().$el.querySelector(".is-close").getAttribute("title")).to.be.equal("Schließen");

    instance.close();

    expect(Fancybox.getInstance()).to.be.null;

    sandbox.parentNode.removeChild(sandbox);
  });

  it("can be customized using HTML5 data attributes", async function () {
    const sandbox = createSandbox(htmlMarkup);
    const trigger = document.getElementById("trigger__html-modal");

    trigger.setAttribute("data-show-class", "false");
    trigger.setAttribute("data-hide-class", "false");
    trigger.setAttribute("data-l10n", '{"CLOSE": "Schließen"}');

    trigger.click();

    const instance = Fancybox.getInstance();
    const opts = instance.options;

    expect(opts.showClass).to.be.false;
    expect(opts.hideClass).to.be.false;
    expect(instance.getSlide().$el.querySelector(".is-close").getAttribute("title")).to.be.equal("Schließen");

    instance.close();

    sandbox.parentNode.removeChild(sandbox);
  });

  it("places DOM element back after closing", async function () {
    const sandbox = createSandbox(htmlMarkup);
    const trigger = document.getElementById("trigger__html-modal");

    const wrap = document.getElementById("html-modal__wrap");
    const node = document.getElementById("html-modal");

    Fancybox.bind("#trigger__html-modal", {
      showClass: false,
      hideClass: false,
    });

    expect(node.parentNode === wrap).to.be.true;

    for (let i = 0; i < 3; i++) {
      trigger.click();

      const instance = Fancybox.getInstance();

      expect(instance).to.be.to.be.an("object");

      expect(node.parentNode === instance.getSlide().$el).to.be.true;

      instance.close();

      expect(node.parentNode === wrap).to.be.true;
    }

    sandbox.parentNode.removeChild(sandbox);
  });

  it("can clone DOM elements", async function () {
    const sandbox = createSandbox(htmlMarkup);
    const trigger = document.getElementById("trigger__html-modal");

    Fancybox.bind("#trigger__html-modal", {
      animated: false,
      showClass: false,
      hideClass: false,
      type: "clone",
    });

    trigger.click();

    const instance = Fancybox.getInstance();

    expect(instance.getSlide().type).to.be.equal("clone");

    instance.close();

    sandbox.parentNode.removeChild(sandbox);
  });

  it("updates state after closing", async function () {
    const instance = new Fancybox(
      [
        {
          type: "html",
          src: "Lorem ipsum dolor sit amet",
        },
      ],
      {
        showClass: false,
      }
    );

    instance.close();

    expect(instance.state).to.be.equal("closing");

    await delay(500);

    expect(instance.state).to.be.equal("destroy");
  });

  it("sets focus on container by default", async function () {
    const instance = new Fancybox(
      [
        {
          type: "html",
          src: "Lorem ipsum dolor sit amet",
        },
      ],
      {
        showClass: false,
        hideClass: false,
      }
    );

    expect(document.activeElement.classList.contains("fancybox__container")).to.be.true;

    instance.close();
  });

  it("sets focus on first focusable element", async function () {
    const instance = new Fancybox([
      {
        type: "html",
        src: '<div id="html-modal"><p>Lorem ipsum dolor sit amet</p><p><input id="html-modal__input" type="text" value="" /></p></div>',
      },
    ]);

    await delay(300);

    const input = document.getElementById("html-modal__input");

    expect(input).to.be.instanceOf(HTMLElement);
    expect(document.activeElement.id === "html-modal__input").to.be.true;

    instance.close();
  });

  it("sets focus on element having `autofocus` attribute", async function () {
    const instance = new Fancybox([
      {
        type: "html",
        src: `<div id="html-modal">
    <p>Lorem ipsum dolor sit amet</p>
    <p><input id="html-modal__input-a" type="text" value="" /></p>
    <p><input autofocus id="html-modal__input-b" type="text" value="" /></p>
  </div>`,
      },
    ]);

    await delay(500);

    const input = document.getElementById("html-modal__input-b");

    expect(input).to.be.instanceOf(HTMLElement);
    expect(document.activeElement).to.be.equal(input);

    instance.close();
  });

  it("places focus back after closing", async function () {
    const sandbox = createSandbox(htmlMarkup);
    const trigger = document.getElementById("trigger__html-modal");

    trigger.click();

    await delay(300);

    expect(document.activeElement.tagName).to.equal("INPUT");

    Fancybox.getInstance().close();

    await delay(500);

    expect(document.activeElement).to.be.equal(trigger);

    sandbox.parentNode.removeChild(sandbox);
  });

  it("can handle HTML element gallery", async function () {
    const sandbox = createSandbox(htmlGalleryMarkup);

    const triggerA = document.getElementById("trigger__html-modal-a");
    const triggerB = document.getElementById("trigger__html-modal-b");

    Fancybox.bind("[data-fancybox]", {
      animated: false,
      showClass: false,
      hideClass: false,
    });

    for (let i = 0; i < 2; i++) {
      triggerA.click();

      const slides = [
        { $trigger: triggerA, $thumb: null, thumb: null, src: "#html-modal-a", type: "inline", caption: "" },
        { $trigger: triggerB, $thumb: null, thumb: null, src: "#html-modal-b", type: "inline", caption: "" },
      ];

      const instance = Fancybox.getInstance();

      expect(instance.items).to.deep.equal(slides);

      instance.next();

      await delay(200);

      instance.next();

      await delay(200);

      instance.close();
    }

    const wrap = document.getElementById("html-modal__wrap");

    expect(document.getElementById("html-modal-a").parentNode === wrap).to.be.true;
    expect(document.getElementById("html-modal-b").parentNode === wrap).to.be.true;

    sandbox.parentNode.removeChild(sandbox);
  });

  it("allows to customize element gallery items individually", async function () {
    const sandbox = createSandbox(htmlGalleryMarkup);
    const triggerA = document.getElementById("trigger__html-modal-a");
    const triggerB = document.getElementById("trigger__html-modal-b");

    triggerB.setAttribute("data-type", "clone");
    triggerB.setAttribute("data-show-class", "false");

    const items = [
      { $trigger: triggerA, $thumb: null, thumb: null, src: "#html-modal-a", type: "inline", caption: "" },
      {
        showClass: false,
        $trigger: triggerB,
        $thumb: null,
        thumb: null,
        src: "#html-modal-b",
        type: "clone",
        caption: "",
      },
    ];

    triggerA.click();

    let instance = Fancybox.getInstance();

    expect(instance.items).to.deep.equal(items);

    instance.close();

    triggerB.click();

    instance = Fancybox.getInstance();

    expect(instance.items).to.deep.equal(items);

    instance.close();

    sandbox.parentNode.removeChild(sandbox);
  });

  it("emits events", async function () {
    const sandbox = createSandbox(htmlGalleryMarkup);

    const eventList = [];

    Fancybox.bind('[data-fancybox="html-gallery"]', {
      showClass: false,
      hideClass: false,
      infinite: false,

      preload: 0,

      on: {
        reveal: (fancybox, slide) => {
          eventList.push(`reveal #${slide.index}`);
        },

        done: (fancybox, slide) => {
          eventList.push(`done #${slide.index}`);
        },

        closing: () => {
          eventList.push("closing");
        },

        destroy: () => {
          eventList.push("destroy");
        },

        "Carousel.init": () => {
          eventList.push(`init`);
        },
        "Carousel.ready": () => {
          eventList.push(`ready`);
        },
        "Carousel.change": (fancybox, carousel, page) => {
          eventList.push(`change #${page}`);
        },
        "Carousel.settle": () => {
          eventList.push(`settle`);
        },
        "Carousel.selectSlide": (fancybox, carousel, slide) => {
          eventList.push(`selectSlide #${slide.index}`);
        },
        "Carousel.unselectSlide": (fancybox, carousel, slide) => {
          eventList.push(`unselectSlide #${slide.index}`);
        },
      },
    });

    sandbox.querySelector("a").click();

    const instance = Fancybox.getInstance();

    instance.next();

    await delay(1500);

    instance.close();

    expect(eventList.join("|")).to.equal(
      "init|selectSlide #0|ready|reveal #0|done #0|change #1|reveal #1|done #1|unselectSlide #0|selectSlide #1|settle|closing|destroy"
    );

    sandbox.parentNode.removeChild(sandbox);
  });

  it("handles image gallery", async function () {
    const sandbox = createSandbox(imageGalleryMarkup);
    const triggers = sandbox.querySelectorAll("a");

    const url = location.href.replace("context.html", "").replace(location.search, "");

    const items = [
      {
        $trigger: triggers[0],
        $thumb: triggers[0].querySelector("img"),
        src: "./assets/img1_b.jpg",
        type: "image",
        thumb: url + "assets/img1_s.jpg",
        caption: "",
      },
      {
        $trigger: triggers[1],
        $thumb: triggers[1].querySelector("img"),
        src: "./assets/img2_b.jpg",
        type: "image",
        thumb: url + "assets/img2_s.jpg",
        caption: "",
      },
      {
        $trigger: triggers[2],
        $thumb: triggers[2].querySelector("img"),
        src: "./assets/img3_b.jpg",
        type: "image",
        thumb: url + "assets/img3_s.jpg",
        caption: "",
      },
    ];

    expect(new URL(document.URL).hash).to.be.equal("");

    triggers[0].click();

    const instance = Fancybox.getInstance();

    await delay(300);

    expect(new URL(document.URL).hash).to.be.equal("#gallery-1");

    expect(instance.items).to.deep.equal(items);

    instance.next();

    await delay(300);

    expect(new URL(document.URL).hash).to.be.equal("#gallery-2");

    instance.close();

    await delay(300);

    expect(new URL(document.URL).hash).to.be.equal("");

    sandbox.parentNode.removeChild(sandbox);
  });

  it("automatically resizes images", async function () {
    const sandbox = createSandbox(imageMarkup);
    const trigger = sandbox.querySelector("a");

    Fancybox.bind("[data-fancybox]", {
      animated: false,
      showClass: false,
      hideClass: false,
      Image: {
        zoom: false,
      },
    });

    trigger.click();

    await delay(350);

    const instance = Fancybox.getInstance();

    let container_width, container_height;

    //* #1
    container_width = 450;
    container_height = 450;

    instance.$container.setAttribute(
      "style",
      `width:${container_width + padding_x}px;height:${container_height + padding_y}px;padding:0;`
    );

    await delay(350);

    const [resizedWidth1, resizedHeight1] = getResizedImageWidth(container_width, container_height);

    expect(instance.getSlide().$image.clientWidth).to.be.closeTo(resizedWidth1, 1);
    expect(instance.getSlide().$image.clientHeight).to.be.closeTo(resizedHeight1, 1);

    //* #2
    container_width = 300;
    container_height = 300;

    instance.$container.setAttribute(
      "style",
      `width:${container_width + padding_x}px;height:${container_height + padding_y}px;padding:0;`
    );

    await delay(350);

    const [resizedWidth2, resizedHeight2] = getResizedImageWidth(container_width, container_height);

    expect(instance.getSlide().$image.clientWidth).to.be.closeTo(resizedWidth2, 1);
    expect(instance.getSlide().$image.clientHeight).to.be.closeTo(resizedHeight2, 1);

    instance.close();

    sandbox.parentNode.removeChild(sandbox);
  });

  it("resizes iframe to match content dimensions", async function () {
    const instance = new Fancybox(
      [
        {
          type: "iframe",
          src: "./assets/iframe.html",
        },
      ],
      {
        showClass: false,
        hideClass: false,
        animated: false,
        ScrollLock: false,
      }
    );

    expect(instance.getSlide().type).to.be.equal("iframe");
    expect(instance.getSlide().$iframe).to.be.an.instanceof(HTMLIFrameElement);

    instance.$container.setAttribute("style", "width:800px;height:600px;padding:0;color:red;");

    await delay();

    const slide_padding = 36 * 2;

    expect(instance.getSlide().$iframe.clientWidth).to.be.closeTo(800 - padding_x - slide_padding, 1);
    expect(instance.getSlide().$iframe.clientHeight).to.be.closeTo(250, 1);

    instance.close();
  });

  it("resizes iframe after reload", async function () {
    const instance = new Fancybox(
      [
        {
          type: "iframe",
          src: "./assets/iframe.html",
        },
      ],
      {
        showClass: false,
        hideClass: false,
        animated: false,
        ScrollLock: false,
      }
    );

    instance.$container.setAttribute("style", "width:800px;height:600px;padding:0;");

    await delay(500);

    const slide_padding = 36 * 2;

    expect(instance.getSlide().$iframe.clientWidth).to.be.closeTo(800 - padding_x - slide_padding, 1);
    expect(instance.getSlide().$iframe.clientHeight).to.be.closeTo(250, 1);

    instance.getSlide().$iframe.src = instance.getSlide().$iframe.src + "?grow";

    await delay(500);

    expect(instance.getSlide().$iframe.clientWidth).to.be.closeTo(800 - padding_x - slide_padding, 1);
    expect(instance.getSlide().$iframe.clientHeight).to.be.closeTo(350, 1);

    instance.close();
  });

  it("can disable iframe autosize", async function () {
    const instance = new Fancybox(
      [
        {
          type: "iframe",
          src: "./assets/iframe.html",
          autoSize: false,
        },
      ],
      {
        showClass: false,
        hideClass: false,
        animated: false,
        ScrollLock: false,
      }
    );

    instance.$container.setAttribute("style", "width:800px;height:600px;padding:0;");

    await delay(500);

    const slide_padding = 36 * 2;

    expect(instance.getSlide().$iframe.clientWidth).to.be.closeTo(800 - padding_x - slide_padding, 1);
    expect(instance.getSlide().$iframe.clientHeight).to.be.closeTo((600 - padding_y) * 0.8 - slide_padding, 1);

    instance.close();
  });

  it("can display video with custom dimensions", async function () {
    Fancybox.show([
      {
        src: "https://www.youtube.com/watch?v=DLX62G4lc44",
        type: "video",
        width: 300,
        height: 200,
      },
    ]);

    await delay(300);

    const rect = Fancybox.getInstance().getSlide().$content.getBoundingClientRect();

    expect(rect.width).to.be.equal(300);
    expect(rect.height).to.be.equal(200);

    Fancybox.getInstance().close();
  });

  it("can display iframe with custom dimensions", async function () {
    Fancybox.show(
      [
        {
          src: "https://www.w3.org/",
          type: "iframe",
          width: 300,
          height: 200,
          preload: false,
        },
      ],
      {
        animated: false,
        showClass: false,
        hideClass: false,
      }
    );

    const rect = Fancybox.getInstance().getSlide().$content.getBoundingClientRect();

    expect(rect.width).to.be.equal(300);
    expect(rect.height).to.be.equal(200);

    Fancybox.getInstance().close();
  });

  it("can load HTML content using ajax", async function () {
    const instance = new Fancybox([
      {
        type: "ajax",
        src: "./assets/ajax.html",
      },
    ]);

    await delay(300);

    instance.$container.setAttribute("style", "width:800px;height:600px;padding:0;");

    await delay(300);

    const slide_padding = 36 * 2;

    expect(instance.getSlide().$content.clientWidth).to.be.closeTo(300 + slide_padding, 10);
    expect(instance.getSlide().$content.clientHeight).to.be.closeTo(500 + slide_padding, 10);

    instance.close();
  });

  it("correctly restores URL hash after closing", async function () {
    const sandbox = createSandbox(imageGalleryMarkup);
    const triggers = sandbox.querySelectorAll("a");

    var url = new URL(document.URL);

    url.hash = "#aaa";
    document.location.href = url.href;

    // Gallery
    // ====
    await delay(100);

    triggers[0].click();

    const instance = Fancybox.getInstance();

    await delay(300);

    expect(new URL(document.URL).hash).to.be.equal("#gallery-1");

    instance.next();

    await delay(300);

    expect(new URL(document.URL).hash).to.be.equal("#gallery-2");

    instance.close();

    await delay(300);

    expect(new URL(document.URL).hash).to.be.equal("#aaa");

    // Single
    // ====
    Fancybox.show([{ src: "<p>Lorem ipsum dolor sit amet</p>", type: "html" }]);

    await delay(300);

    Fancybox.close();

    await delay(300);

    expect(new URL(document.URL).hash).to.be.equal("#aaa");

    history.replaceState({}, document.title, window.location.href.split("#")[0]);

    sandbox.parentNode.removeChild(sandbox);
  });
});
