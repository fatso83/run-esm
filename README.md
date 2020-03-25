# run-esm
> Simply runs a ECMAScript Module in Chrome to see that it does not throw

## Why?
Quite a few project build actual ECMAScript Modules that are supposed
to work natively (meaning not transpiled to ES5). This is a simple
way of ensuring that these packages run in Chrome.


## Usage
See examples in `test`


```
it("should exit cleanly if nothing throws", async () => {
  await runEsm({
    bundlePath: `${__dirname}/example-module.mjs`,
    testScriptSource: `
          import myModule from "./example-module.mjs";

          myModule(); // works
          `,
  });
});
```
