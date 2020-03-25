const runEsm = require("../run-esm");
const { readFileSync } = require("fs");
const { assert } = require("@sinonjs/referee");
const debug = require("debug")("test.js");

describe("run-esm module", () => {
  afterEach(async () => {
    // wait for browser to clean up
    await new Promise((resolve) => setTimeout(resolve, 1500));
  });

  it("should exit cleanly if nothing throws", async () => {
    await runEsm({
      bundlePath: `${__dirname}/example-module.mjs`,
      testScriptSource: `
            import myModule from "./example-module.mjs";

            myModule(); // works
            `,
    });
  });

  it("should reject the returned promise on uncaught errors", async () => {
    const p = runEsm({
      bundlePath: `${__dirname}/example-module.mjs`,
      testScriptSource: `
            import myModule from "./example-module.mjs";

            if(myModule() != 142) throw new Error("Something wrong"); // will throw
            `,
    });

    await p
      .then(
        () => {
          throw new Error("Should have failed");
        },
        (err) => {
          debug("p failed as expected", err);
        }
      )
      .then(() => {});
  });
});
