import { Base } from "../src/shared/Base/Base.js";

const expect = chai.expect;

describe("Base", function () {
  describe("Options", function () {
    it("accepts primitive value", function () {
      const bus = new Base({
        prop: 1,
      });

      expect(bus.option("prop")).to.equal(1);
    });

    it("accepts object", function () {
      const obj = {
        a: 1,
      };

      const bus = new Base({
        prop: obj,
      });

      obj.a = 2;

      expect(bus.option("prop")).to.be.deep.equal({ a: 1 });
    });

    it("accepts nested objects", function () {
      const bus = new Base({
        a: {
          b: {
            c: "d",
          },
        },
      });

      expect(bus.option("a.b.c")).to.be.equal("d");
    });

    it("accepts function", function () {
      const bus = new Base({
        prop: () => {
          return "a";
        },
      });

      expect(bus.option("prop")).to.be.equal("a");
    });
  });

  describe("Translate", function () {
    it("translates string", function () {
      const bus = new Base({
        l10n: {
          BEEP: "boop",
        },
      });

      expect(bus.localize("some {{BEEP}} ipsum")).to.be.equal("some boop ipsum");
    });

    it("translates string with parameters", function () {
      const bus = new Base({
        l10n: {
          BEEP: "be %d and %d",
        },
      });

      expect(bus.localize("lorem {{BEEP}} times", [["%d", 2]])).to.be.equal("lorem be 2 and 2 times");
    });

    it("translates multiple strings with multiple parameters", function () {
      const bus = new Base({
        l10n: {
          BEEP: "beep %a and %a",
          BOOP: "boop %b and %b",
        },
      });

      expect(
        bus.localize("{{BEEP}}; {{BOOP}}", [
          ["%a", 2],
          ["%b", 3],
        ])
      ).to.be.equal("beep 2 and 2; boop 3 and 3");
    });
  });

  describe("Events", function () {
    it("subscribes to an event", function () {
      const bus = new Base();

      bus.on("test", function () {});

      expect(bus.events.test.length).to.equal(1);
    });

    it("subscribes to an event that emits only once", function () {
      const bus = new Base();

      bus.once("test", function () {});

      expect(bus.events.test.length).to.equal(1);

      bus.trigger("test");

      expect(bus.events.test.length).to.equal(0);
    });

    it("emits an event", function () {
      const bus = new Base();

      let didPop = false;

      bus.on("pop", function () {
        didPop = true;
      });

      bus.trigger("pop");

      expect(didPop).to.be.true;
    });

    it("emits an event only once when required", function () {
      let ticks = 0;

      function onPop() {
        ticks++;
      }

      let bus = new Base();

      bus.once("pop", onPop);

      bus.trigger("pop");
      bus.trigger("pop");

      expect(ticks).to.equal(1);
    });

    it("subscribes to multiple events", function () {
      const bus = new Base();

      let ticks = 0;

      bus.on("pop1 pop2", function () {
        ticks++;
      });

      bus.trigger("pop1");
      bus.trigger("pop2");

      expect(ticks).to.equal(2);
    });

    it("subscribes to multiple events that emits only once", function () {
      const bus = new Base();

      let ticks = 0;

      bus.once("pop1 pop2", function () {
        ticks++;
      });

      bus.trigger("pop1");
      bus.trigger("pop2");

      bus.trigger("pop1");
      bus.trigger("pop2");

      expect(ticks).to.equal(2);
    });

    it("prefills multiple events", function () {
      let ticks = 0;

      function onPop() {
        ticks++;
      }

      const bus = new Base({
        once: {
          "pop1 pop2": onPop,
        },
      });

      bus.trigger("pop1");
      bus.trigger("pop2");

      expect(ticks).to.equal(2);
    });

    it("passes context as first argument to listener", function () {
      class Bus extends Base {}

      const bus = new Bus();

      let result;

      function onPop(ctx) {
        result = ctx;
      }

      bus.on("pop", onPop);
      bus.trigger("pop");

      expect(result).to.equal(bus);
    });

    it("passes all arguments to event listener", function () {
      const bus = new Base();

      let result = "";

      function onPop(ctx, a, b) {
        result += a;
        result += b;
      }

      bus.on("pop", onPop);
      bus.trigger("pop", "a", "b");

      expect(result).to.equal("ab");
    });

    it("does not allow same listener to be added", function () {
      const bus = new Base();

      let ticks = 0;

      const onPop = function () {
        ticks++;
      };

      bus.on("pop", onPop);
      bus.on("pop", onPop);

      const _onPop = onPop;

      bus.on("pop", _onPop);

      bus.trigger("pop");

      expect(ticks).to.equal(1);
    });

    it("removes listener with .off() (attached using `one`)", function () {
      const bus = new Base();

      let ticks = 0;

      const onPop = function () {
        ticks++;
      };

      bus.on("pop", onPop);
      bus.trigger("pop");
      bus.off("pop", onPop);
      bus.trigger("pop");

      expect(ticks).to.equal(1);
    });

    it("removes listener with .off() (attached using `once`)", function () {
      const bus = new Base();

      let ticks = 0;

      const onPop = function () {
        ticks++;
      };

      // This should pop
      bus.once("pop", onPop);

      bus.trigger("pop");

      expect(ticks).to.equal(1);

      // This should NOT pop
      bus.once("pop", onPop);
      bus.off("pop", onPop);

      bus.trigger("pop");

      expect(ticks).to.equal(1);
    });

    it("prevents .off() to interfere with other listeners", function () {
      const bus = new Base();
      const arr = [];

      let ticks = 0;

      function onPopA() {
        ticks++;
        arr.push("a");

        if (ticks == 2) {
          bus.off("pop", onPopA);
        }
      }

      function onPopB() {
        arr.push("b");
      }

      bus.on("pop", onPopA);
      bus.on("pop", onPopB);

      bus.trigger("pop"); // a,b
      bus.trigger("pop"); // a,b - remove onPopA
      bus.trigger("pop"); // b

      expect(arr.join(",")).to.equal("a,b,a,b,b");
    });

    it("stops emitting if listener returns false", function () {
      const bus = new Base();
      const arr = [];

      let ticks = 0;

      function onPopA() {
        ticks++;

        arr.push("a");

        if (ticks == 2) {
          return false;
        }
      }

      function onPopB() {
        arr.push("b");
      }

      bus.on("pop", onPopA);
      bus.on("pop", onPopB);

      const rez1 = bus.trigger("pop"); // a,b
      const rez2 = bus.trigger("pop"); // a
      const rez3 = bus.trigger("pop"); // a,b

      expect(arr.join(",")).to.equal("a,b,a,a,b");

      expect(rez1).to.be.true;
      expect(rez2).to.be.false;
      expect(rez3).to.be.true;
    });

    it("handles trigger with no listeners", function () {
      const bus = new Base();

      expect(function () {
        bus.trigger("pop", [1, 2, 3]);
      }).to.not.throw();

      function onPop() {}

      bus.on("pop", onPop);
      bus.off("pop", onPop);

      expect(function () {
        bus.trigger("pop", [1, 2, 3]);
      }).to.not.throw();

      bus.on("pop", onPop);
      bus.trigger("pop", [1, 2, 3]);
      bus.off("pop", onPop);

      expect(function () {
        bus.trigger("pop", [1, 2, 3]);
      }).to.not.throw();
    });

    it("prefills initial events", function () {
      let ticks = 0;

      const onPop = function () {
        ticks++;
      };

      const bus = new Base({
        on: {
          pop: onPop,
        },
      });

      bus.trigger("pop");

      expect(ticks).to.equal(1);
    });

    it("should invoke wildcard (`*`) handlers", function () {
      const bus = new Base();
      const arr = [];

      bus.on("*", function (name, ctx, arg) {
        arr.push(`${name}:${arg}`);
      });

      bus.trigger("popA", 1);
      bus.trigger("popB", 2);

      expect(arr.join(";")).to.equal("popA:1;popB:2");
    });
  });
});
