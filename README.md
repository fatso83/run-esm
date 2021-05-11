# run-esm
> Simply runs a ECMAScript Module in Chrome to see that it does not throw

## Why?
Quite a few project build actual ECMAScript Modules that are supposed to work natively (meaning not transpiled to ES5). This is simply a way of ensuring that these packages run in Chrome. You can choose to just load them or try running some additional script excercising the exported API - that's up to you.

You _could_ try running them in Node using something like `node -r esm`, of course, but that introduces additional middleware that might or might not do the same as the Chrome runtime. You would also need to handle DOM APIs using something like JSDOM, introducing additional complexity for something quite simple. 


## Usage
See examples in [`test/`](https://github.com/fatso83/run-esm/blob/master/test/test.js). The import path will always be relative to root, i.e. (`/${filename}`).

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
